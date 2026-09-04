import { useEffect, useState } from 'react'
import { listGroups } from '../api/groups'
import { downloadBlob, exportExcel, exportPdf, getSummary } from '../api/reports'
import Alert from '../components/form/Alert'
import Button from '../components/form/Button'
import GroupChipRow from '../components/GroupChipRow'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/table/EmptyState'
import FilterSelect from '../components/table/FilterSelect'
import Pagination from '../components/table/Pagination'
import SearchInput from '../components/table/SearchInput'
import { useTableQuery } from '../hooks/useTableQuery'
import { usePersistedGroupId } from '../hooks/usePersistedGroupId'
import { addDays } from '../utils/date'

const RANGE_OPTIONS = [
  { value: 'day', label: '1 kun', days: 1 },
  { value: 'month', label: '1 oy', days: 30 },
  { value: 'year', label: '1 yil', days: 365 },
]

function rangeDates(rangeKey) {
  const today = new Date()
  const range = RANGE_OPTIONS.find((r) => r.value === rangeKey) ?? RANGE_OPTIONS[1]
  const from = addDays(today, -range.days)
  const iso = (d) => d.toISOString().slice(0, 10)
  return { dateFrom: iso(from), dateTo: iso(today) }
}

const filterRow = (row, query) => row.fullName.toLowerCase().includes(query)

export default function Reports() {
  const [groups, setGroups] = useState([])
  const [groupId, setGroupId, resolveGroupId] = usePersistedGroupId('reports')
  const [range, setRange] = useState('month')
  const [rows, setRows] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [isExporting, setIsExporting] = useState(false)
  const [exportError, setExportError] = useState('')

  useEffect(() => {
    let cancelled = false
    listGroups()
      .then((data) => {
        if (cancelled) return
        setGroups(data)
        resolveGroupId(data)
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message ?? "Ma'lumotlarni yuklab bo'lmadi")
      })
    return () => {
      cancelled = true
    }
  }, [resolveGroupId])

  useEffect(() => {
    if (!groupId) return
    let cancelled = false
    const { dateFrom, dateTo } = rangeDates(range)
    getSummary({ group: groupId, dateFrom, dateTo })
      .then((res) => {
        if (cancelled) return
        const perStudent = res?.per_student ?? []
        setRows(
          perStudent.map((r) => ({
            id: r.student_id,
            fullName: r.student_name,
            totalSessions: r.total,
            present: r.by_status?.keldi ?? 0,
            rate: r.attendance_percent,
            isLow: r.is_low,
          })),
        )
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message ?? "Ma'lumotlarni yuklab bo'lmadi")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [groupId, range])

  const { query, setQuery, page, setPage, totalPages, pageItems, totalItems, pageSize } =
    useTableQuery(rows, { filterFn: filterRow })

  const group = groups.find((g) => g.id === groupId)

  const handleExport = async (kind) => {
    setExportError('')
    setIsExporting(true)
    try {
      const { dateFrom, dateTo } = rangeDates(range)
      const params = { group: groupId, dateFrom, dateTo }
      const blob = kind === 'excel' ? await exportExcel(params) : await exportPdf(params)
      const ext = kind === 'excel' ? 'xlsx' : 'pdf'
      downloadBlob(blob, `hisobot-${group?.name ?? 'guruh'}-${range}.${ext}`)
    } catch (err) {
      setExportError(err.message ?? 'Yuklab olishda xatolik yuz berdi')
    } finally {
      setIsExporting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Hisobotlar"
        icon="chart"
        actions={
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              onClick={() => handleExport('excel')}
              disabled={isExporting || !groupId}
              className="border-success/40 text-success hover:border-success hover:bg-success/10"
            >
              <Icon name="fileSpreadsheet" className="size-4" />
              Excel yuklab olish
            </Button>
            <Button
              variant="outline"
              onClick={() => handleExport('pdf')}
              disabled={isExporting || !groupId}
              className="border-error/40 text-error hover:border-error hover:bg-error/10"
            >
              <Icon name="fileText" className="size-4" />
              PDF yuklab olish
            </Button>
          </div>
        }
      />

      <GroupChipRow groups={groups} selectedGroupId={groupId} onChange={setGroupId} />

      {exportError && (
        <div className="mb-4">
          <Alert variant="error">{exportError}</Alert>
        </div>
      )}

      <div className="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center">
          <SearchInput value={query} onChange={setQuery} placeholder="F.I.Sh bo'yicha qidirish" />
          <FilterSelect
            value={range}
            onChange={setRange}
            className="w-full sm:w-36"
            options={RANGE_OPTIONS.map((r) => ({ value: r.value, label: r.label }))}
          />
        </div>

        {loadError ? (
          <Alert variant="error">{loadError}</Alert>
        ) : isLoading ? (
          <div className="flex justify-center py-10">
            <span className="loading loading-spinner loading-lg text-primary" />
          </div>
        ) : pageItems.length === 0 ? (
          <EmptyState message="Hech narsa topilmadi" />
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="text-xs uppercase text-base-content/50">
                  <th className="w-10">#</th>
                  <th>F.I.Sh</th>
                  <th className="text-right">Jami darslar</th>
                  <th className="text-right">Kelgan</th>
                  <th className="text-right">Davomat foizi</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((row, index) => (
                  <tr key={row.id} className={row.isLow ? 'bg-error/10' : ''}>
                    <td className="text-base-content/40">{(page - 1) * pageSize + index + 1}</td>
                    <td className="font-medium text-base-content">{row.fullName}</td>
                    <td className="text-right text-base-content/70">{row.totalSessions}</td>
                    <td className="text-right text-base-content/70">{row.present}</td>
                    <td className="text-right">
                      <span className={row.isLow ? 'font-semibold text-error' : 'text-base-content'}>
                        {row.rate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          page={page}
          totalPages={totalPages}
          onChange={setPage}
          totalItems={totalItems}
          pageSize={pageSize}
        />
      </div>
    </div>
  )
}
