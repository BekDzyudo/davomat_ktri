import { useEffect, useMemo, useState } from 'react'
import { getMissedLessons } from '../api/reports'
import Alert from '../components/form/Alert'
import Icon from '../components/Icon'
import PageHeader from '../components/PageHeader'
import EmptyState from '../components/table/EmptyState'
import FilterSelect from '../components/table/FilterSelect'
import Pagination from '../components/table/Pagination'
import SearchInput from '../components/table/SearchInput'
import { useTableQuery } from '../hooks/useTableQuery'

// Chegara — SABABSIZ qoldirilgan paralar soni. Ro'yxatga shundan KO'P
// qoldirgan talaba tushadi (9 → 10 va undan ortiq).
const THRESHOLD_OPTIONS = [
  { value: '3', label: "3 paradan ko'p" },
  { value: '5', label: "5 paradan ko'p" },
  { value: '9', label: "9 paradan ko'p" },
  { value: '15', label: "15 paradan ko'p" },
  { value: '20', label: "20 paradan ko'p" },
]

const DEFAULT_THRESHOLD = '9'

const filterRow = (row, query) =>
  row.student_name.toLowerCase().includes(query) || (row.group_name ?? '').toLowerCase().includes(query)

function initials(fullName) {
  return fullName
    .split(' ')
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
}

export default function MissedLessons() {
  const [threshold, setThreshold] = useState(DEFAULT_THRESHOLD)
  const [data, setData] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')

  // DIQQAT: effekt tanasida `setIsLoading(true)` ATAYLAB chaqirilmaydi —
  // React'ning `set-state-in-effect` qoidasi (eslint) bunga yo'l qo'ymaydi,
  // chunki u kaskadli render'ga olib keladi. Shu sabab chegara o'zgarganda
  // spinner qayta ko'rinmaydi: yangi ma'lumot kelguncha eskisi turaveradi
  // (`Reports.jsx`da ham xuddi shunday).
  useEffect(() => {
    let cancelled = false
    getMissedLessons({ threshold })
      .then((res) => {
        if (cancelled) return
        setData(res)
        setLoadError('')
      })
      .catch((err) => {
        if (!cancelled) setLoadError(err.message ?? "Ro'yxatni yuklab bo'lmadi")
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [threshold])

  const students = useMemo(() => data?.students ?? [], [data])
  const { query, setQuery, page, setPage, totalPages, pageItems, totalItems, pageSize } = useTableQuery(
    students,
    { filterFn: filterRow },
  )

  const totalUnexcused = students.reduce((sum, row) => sum + row.unexcused, 0)
  const worst = students.length ? students[0].unexcused : 0

  return (
    <div>
      <PageHeader
        title="Dars qoldirganlar"
        description={`Sababsiz ${data?.threshold ?? Number(threshold)} paradan ko'p dars qoldirgan talabalar${
          data?.academic_year ? ` — ${data.academic_year} o'quv yili` : ''
        }`}
        icon="alertTriangle"
      />

      <div className="overflow-hidden rounded-3xl border border-base-300 bg-base-100 shadow-sm">
        <div className="grid grid-cols-1 border-b border-base-300 bg-base-200/45 sm:grid-cols-3">
          <div className="border-b border-base-300 p-4 sm:border-b-0 sm:border-r sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <span className="text-[11px] font-bold uppercase tracking-wide text-base-content/50">Ro'yxatdagi talabalar</span>
              <span className={`flex size-8 items-center justify-center rounded-xl ${students.length ? 'bg-error/10 text-error' : 'bg-success/10 text-success'}`}>
                <Icon name={students.length ? 'alertTriangle' : 'check'} className="size-4" />
              </span>
            </div>
            <p className={`mt-2 text-2xl font-black ${students.length ? 'text-error' : 'text-success'}`}>
              {students.length}
            </p>
            <p className="mt-1 text-xs text-base-content/50">Chegaradan oshgan</p>
          </div>
          <div className="border-b border-base-300 p-4 sm:border-b-0 sm:border-r sm:p-5">
            <span className="text-[11px] font-bold uppercase tracking-wide text-base-content/50">Jami sababsiz</span>
            <p className="mt-2 text-2xl font-black text-base-content">{totalUnexcused}</p>
            <p className="mt-1 text-xs text-base-content/50">Qoldirilgan para</p>
          </div>
          <div className="p-4 sm:p-5">
            <span className="text-[11px] font-bold uppercase tracking-wide text-base-content/50">Eng ko'p qoldirgan</span>
            <p className="mt-2 text-2xl font-black text-base-content">{worst}</p>
            <p className="mt-1 text-xs text-base-content/50">Bitta talaba bo'yicha</p>
          </div>
        </div>

        <div className="border-b border-base-300 p-4 sm:p-5">
          <div className="mb-4 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-base font-black text-base-content sm:text-lg">Qoldirilgan darslar ro'yxati</h2>
              <p className="mt-1 text-xs text-base-content/50 sm:text-sm">
                Sababsiz qoldirilgan paralar bo'yicha kamayish tartibida
              </p>
            </div>
            <span className="text-xs font-semibold text-base-content/45">{totalItems} ta natija</span>
          </div>
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <SearchInput value={query} onChange={setQuery} placeholder="F.I.Sh yoki guruh bo'yicha qidirish" />
            <FilterSelect
              value={threshold}
              onChange={setThreshold}
              className="w-full sm:w-44"
              options={THRESHOLD_OPTIONS}
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
          // Bo'sh ro'yxat bu yerda YAXSHI xabar — xatolik emas, shuning uchun
          // qidiruv natijasi yo'qligidan alohida ajratiladi.
          query ? (
            <EmptyState message="Qidiruv bo'yicha hech narsa topilmadi" />
          ) : (
            <div className="flex flex-col items-center gap-2 py-12 text-center">
              <span className="flex size-12 items-center justify-center rounded-2xl bg-success/10 text-success">
                <Icon name="check" className="size-6" />
              </span>
              <p className="text-sm font-semibold text-base-content">
                Chegaradan ko'p dars qoldirgan talaba yo'q
              </p>
              <p className="text-xs text-base-content/50">
                {data?.academic_year} o'quv yilida sababsiz {data?.threshold} paradan ko'p qoldirgan talaba topilmadi
              </p>
            </div>
          )
        ) : (
          <div className="overflow-x-auto px-4 sm:px-5">
            <table className="table min-w-170">
              <thead>
                <tr className="border-b border-base-300 text-[10px] uppercase tracking-wider text-base-content/45">
                  <th className="w-12 pb-3">#</th>
                  <th className="pb-3">Talaba</th>
                  <th className="pb-3 text-right">Sababsiz</th>
                  <th className="pb-3 text-right">Sababli</th>
                  <th className="pb-3 text-right">Jami qoldirgan</th>
                  <th className="w-44 pb-3 text-right">Davomat foizi</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((row, index) => (
                  <tr
                    key={row.student_id}
                    className="group border-b border-base-200 transition-colors hover:bg-error/[0.035]"
                  >
                    <td className="text-xs font-semibold text-base-content/35">{(page - 1) * pageSize + index + 1}</td>
                    <td>
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-error/10 text-xs font-black text-error">
                          {initials(row.student_name)}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-base-content">{row.student_name}</p>
                          <p className="mt-0.5 truncate text-[11px] text-base-content/50">
                            {row.group_name}
                            {row.phone ? ` · ${row.phone}` : ''}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="text-right">
                      <span className="rounded-lg bg-error/10 px-2 py-1 font-black tabular-nums text-error">
                        {row.unexcused}
                      </span>
                    </td>
                    <td className="text-right font-medium tabular-nums text-base-content/70">
                      {row.excused || '—'}
                    </td>
                    <td className="text-right font-bold tabular-nums text-base-content">{row.total_missed}</td>
                    <td>
                      <div className="flex items-center justify-end gap-3">
                        <div className="h-2 w-20 overflow-hidden rounded-full bg-base-300">
                          <div
                            className="h-full rounded-full bg-error"
                            style={{ width: `${Math.min(Number(row.attendance_percent) || 0, 100)}%` }}
                          />
                        </div>
                        <span className="w-12 text-right font-bold tabular-nums text-error">
                          {row.attendance_percent}%
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
