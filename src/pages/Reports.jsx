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
  const averageRate = rows.length
    ? Math.round(rows.reduce((sum, row) => sum + Number(row.rate || 0), 0) / rows.length)
    : 0
  const totalSessions = rows.reduce((sum, row) => sum + row.totalSessions, 0)
  const totalPresent = rows.reduce((sum, row) => sum + row.present, 0)
  const lowAttendanceCount = rows.filter((row) => row.isLow).length

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

      <div className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-sm">
        <div className="grid grid-cols-2 border-b border-base-300 bg-base-200/45 sm:grid-cols-4">
          <div className="border-b border-r border-base-300 p-4 sm:border-b-0 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-base-content/50">O'rtacha davomat</span>
              <span className="flex size-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon name="chart" className="size-4" />
              </span>
            </div>
            <p className="mt-2 text-2xl font-black text-base-content">{averageRate}%</p>
            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-base-300">
              <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${averageRate}%` }} />
            </div>
          </div>
          <div className="border-b border-base-300 p-4 sm:border-b-0 sm:border-r sm:p-5">
            <span className="text-[11px] font-bold uppercase tracking-wide text-base-content/50">Talabalar</span>
            <p className="mt-2 text-2xl font-black text-base-content">{rows.length}</p>
            <p className="mt-1 text-xs text-base-content/50">Hisobotdagi talabalar</p>
          </div>
          <div className="border-r border-base-300 p-4 sm:p-5">
            <span className="text-[11px] font-bold uppercase tracking-wide text-base-content/50">Qatnashuvlar</span>
            <p className="mt-2 text-2xl font-black text-base-content">{totalPresent}</p>
            <p className="mt-1 text-xs text-base-content/50">{totalSessions} ta jami darsdan</p>
          </div>
          <div className="p-4 sm:p-5">
            <span className="text-[11px] font-bold uppercase tracking-wide text-base-content/50">E'tibor kerak</span>
            <p className={`mt-2 text-2xl font-black ${lowAttendanceCount ? 'text-error' : 'text-success'}`}>
              {lowAttendanceCount}
            </p>
            <p className="mt-1 text-xs text-base-content/50">Davomati past talabalar</p>
          </div>
        </div>

        <div className="border-b border-base-300 p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-black text-base-content sm:text-lg">Talabalar davomat jadvali</h2>
              <p className="mt-1 text-xs text-base-content/50 sm:text-sm">
                {group?.name ?? 'Guruh'} uchun tanlangan davr natijalari
              </p>
            </div>
            <span className="text-xs font-semibold text-base-content/45">{totalItems} ta natija</span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput value={query} onChange={setQuery} placeholder="F.I.Sh bo'yicha qidirish" />
            <FilterSelect
              value={range}
              onChange={setRange}
              className="w-full sm:w-36"
              options={RANGE_OPTIONS.map((r) => ({ value: r.value, label: r.label }))}
            />
          </div>
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
          <div className="overflow-x-auto px-4 sm:px-5">
            <table className="table min-w-170">
              <thead>
                <tr className="border-b border-base-300 text-[10px] uppercase tracking-wider text-base-content/45">
                  <th className="w-12 pb-3">#</th>
                  <th className="pb-3">Talaba</th>
                  <th className="pb-3 text-right">Jami darslar</th>
                  <th className="pb-3 text-right">Kelgan</th>
                  <th className="w-52 pb-3 text-right">Davomat foizi</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((row, index) => (
                  <tr
                    key={row.id}
                    className="group border-b border-base-200 transition-colors hover:bg-primary/[0.035]"
                  >
                    <td className="text-xs font-semibold text-base-content/35">{(page - 1) * pageSize + index + 1}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className={`flex size-9 shrink-0 items-center justify-center rounded-xl text-xs font-black ${row.isLow ? 'bg-error/10 text-error' : 'bg-primary/10 text-primary'}`}>
                          {row.fullName
                            .split(' ')
                            .slice(0, 2)
                            .map((part) => part[0])
                            .join('')}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-base-content">{row.fullName}</p>
                          {row.isLow && <p className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-error">E'tibor kerak</p>}
                        </div>
                      </div>
                    </td>
                    <td className="text-right font-medium tabular-nums text-base-content/70">{row.totalSessions}</td>
                    <td className="text-right font-medium tabular-nums text-base-content/70">{row.present}</td>
                    <td>
                      <div className="flex items-center justify-end gap-3">
                        <div className="h-2 w-24 overflow-hidden rounded-full bg-base-300">
                          <div
                            className={`h-full rounded-full ${row.isLow ? 'bg-error' : 'bg-success'}`}
                            style={{ width: `${Math.min(Number(row.rate) || 0, 100)}%` }}
                          />
                        </div>
                        <span className={`w-12 text-right font-bold tabular-nums ${row.isLow ? 'text-error' : 'text-base-content'}`}>
                          {row.rate}%
                        </span>
                      </div>
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
