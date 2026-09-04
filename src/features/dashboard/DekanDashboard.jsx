import { useEffect, useState } from 'react'
import { listGroups } from '../../api/groups'
import { getSummary } from '../../api/reports'
import AttendanceRateBadge from '../../components/AttendanceRateBadge'
import Alert from '../../components/form/Alert'
import Icon from '../../components/Icon'
import { useAuth } from '../../context/useAuth'

export default function DekanDashboard({ data }) {
  const { currentUser } = useAuth()
  const [groups, setGroups] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [expandedId, setExpandedId] = useState(null)
  const [groupSummaries, setGroupSummaries] = useState({})

  useEffect(() => {
    let cancelled = false
    listGroups()
      .then((all) => {
        if (!cancelled) setGroups(all.filter((g) => g.faculty === currentUser.faculty))
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
  }, [currentUser.faculty])

  const toggleGroup = (groupId) => {
    const next = expandedId === groupId ? null : groupId
    setExpandedId(next)
    if (next && !groupSummaries[next]) {
      getSummary({ group: next })
        .then((res) => setGroupSummaries((prev) => ({ ...prev, [next]: res })))
        .catch(() => {})
    }
  }

  const lowRateById = Object.fromEntries(
    (data?.low_attendance_groups ?? []).map((g) => [g.group_id, g.attendance_percent]),
  )

  if (loadError) return <Alert variant="error">{loadError}</Alert>

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  if (groups.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-box border border-dashed border-base-300 bg-base-100 py-16 text-center text-base-content/70">
        <Icon name="group" className="size-8" />
        <p className="text-sm">Fakultetingizga tegishli guruhlar topilmadi</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {groups.map((group) => {
        const isExpanded = expandedId === group.id
        const summary = groupSummaries[group.id]
        const rate = summary?.summary?.attendance_percent ?? lowRateById[group.id] ?? 0
        const perStudent = summary?.per_student ?? []

        return (
          <div
            key={group.id}
            className="overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-sm"
          >
            <button
              type="button"
              onClick={() => toggleGroup(group.id)}
              className="flex w-full items-center justify-between gap-3 p-4 text-left transition-colors duration-200 hover:bg-base-200/50"
            >
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-box bg-primary/10 text-primary">
                  <Icon name="group" className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="truncate font-semibold text-base-content">{group.name}</p>
                  <p className="truncate text-sm text-base-content/60">
                    {group.direction} · {group.course}-kurs
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-3">
                <AttendanceRateBadge rate={rate} />
                <Icon
                  name="chevronDown"
                  className={`size-4 text-base-content/60 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                />
              </div>
            </button>

            {isExpanded && (
              <div className="border-t border-base-300 p-4">
                {!summary ? (
                  <div className="flex justify-center py-4">
                    <span className="loading loading-spinner loading-sm text-primary" />
                  </div>
                ) : perStudent.length === 0 ? (
                  <p className="text-sm text-base-content/50">Bu guruhda tinglovchilar topilmadi</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table table-sm">
                      <thead>
                        <tr className="text-xs uppercase text-base-content/50">
                          <th className="w-10">#</th>
                          <th>F.I.Sh</th>
                          <th className="text-right">Davomat foizi</th>
                        </tr>
                      </thead>
                      <tbody>
                        {perStudent.map((row, index) => (
                          <tr key={row.student_id}>
                            <td className="text-base-content/40">{index + 1}</td>
                            <td className="text-base-content">{row.student_name}</td>
                            <td className="text-right">
                              <AttendanceRateBadge rate={row.attendance_percent} />
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
