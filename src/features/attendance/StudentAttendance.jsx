import { useEffect, useState } from 'react'
import { listAttendanceForStudent } from '../../api/attendance'
import { listSchedule } from '../../api/schedule'
import { listStudents } from '../../api/students'
import StatCard from '../../components/charts/StatCard'
import Alert from '../../components/form/Alert'
import Icon from '../../components/Icon'
import { useAuth } from '../../context/useAuth'
import { ATTENDANCE_STATUSES } from '../../data/attendanceStatuses'
import { getRateTone } from '../../utils/attendanceRate'
import { formatDate } from '../../utils/date'
import { getAttendanceRate } from '../../utils/mockStudentHistory'

const STATUS_BY_KEY = Object.fromEntries(ATTENDANCE_STATUSES.map((s) => [s.key, s]))

const BADGE_TONE = {
  keldi: 'bg-success/10 text-success',
  kelmadi: 'bg-error/10 text-error',
  kech_qoldi: 'bg-warning/10 text-warning',
  sababli: 'bg-info/10 text-info',
}

export default function StudentAttendance() {
  const { currentUser } = useAuth()
  const [history, setHistory] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [noProfile, setNoProfile] = useState(false)

  useEffect(() => {
    let cancelled = false
    Promise.all([listStudents(), listSchedule()])
      .then(async ([students, lessons]) => {
        const own = students.find((s) => s.userId === currentUser.id)
        if (!own) {
          if (!cancelled) setNoProfile(true)
          return
        }
        const scheduleSubjectName = (scheduleId) =>
          lessons.find((l) => l.id === scheduleId)?.subjectName ?? '—'

        const records = await listAttendanceForStudent(own.id)
        if (cancelled) return
        setHistory(
          records
            .map((r) => ({
              id: r.id,
              date: r.date,
              subjectName: scheduleSubjectName(r.scheduleId),
              status: r.status,
            }))
            .sort((a, b) => new Date(b.date) - new Date(a.date)),
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
  }, [currentUser.id])

  const rate = getAttendanceRate(history)

  if (loadError) return <Alert variant="error">{loadError}</Alert>

  if (isLoading) {
    return (
      <div className="flex justify-center py-16">
        <span className="loading loading-spinner loading-lg text-primary" />
      </div>
    )
  }

  if (noProfile) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-box border border-dashed border-base-300 bg-base-100 py-16 text-center text-base-content/70">
        <Icon name="badgeCheck" className="size-8" />
        <p className="text-sm">Sizning tinglovchi profilingiz topilmadi</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <StatCard
        icon="badgeCheck"
        label="Umumiy davomat foizi"
        value={`${rate}%`}
        tone={getRateTone(rate)}
        sublabel={`${history.length} ta darsdan hisoblangan`}
      />

      <div className="rounded-box border border-base-300 bg-base-100 p-4 shadow-sm sm:p-6">
        {history.length === 0 ? (
          <p className="py-8 text-center text-sm text-base-content/50">Hali davomat yozuvi yo'q</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="text-xs uppercase text-base-content/50">
                  <th className="w-10">#</th>
                  <th>Sana</th>
                  <th>Modul</th>
                  <th>Holat</th>
                </tr>
              </thead>
              <tbody>
                {history.map((entry, index) => {
                  const status = STATUS_BY_KEY[entry.status]
                  return (
                    <tr key={entry.id}>
                      <td className="text-base-content/40">{index + 1}</td>
                      <td className="text-base-content/70">{formatDate(entry.date)}</td>
                      <td className="font-medium text-base-content">{entry.subjectName}</td>
                      <td>
                        <span
                          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${BADGE_TONE[entry.status]}`}
                        >
                          <Icon name={status.icon} className="size-3.5" />
                          {status.label}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
