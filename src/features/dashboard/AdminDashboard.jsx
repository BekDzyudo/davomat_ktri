import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getTimeseries } from '../../api/reports'
import AttendanceLineChart from '../../components/charts/AttendanceLineChart'
import StatCard from '../../components/charts/StatCard'
import SubjectPieChart from '../../components/charts/SubjectPieChart'
import Icon from '../../components/Icon'
import { ATTENDANCE_STATUSES } from '../../data/attendanceStatuses'
import { formatPeriodLabel } from '../../utils/date'
import GroupRankingTable from './GroupRankingTable'

function attendanceTrend(series) {
  if (series.length < 2) return null
  const last = series[series.length - 1]?.attendance_percent
  const prev = series[series.length - 2]?.attendance_percent
  if (last == null || prev == null) return null
  const diff = Math.round((last - prev) * 10) / 10
  if (diff === 0) return { direction: 'flat', text: "o'tgan oy bilan bir xil" }
  return {
    direction: diff > 0 ? 'up' : 'down',
    text: `${Math.abs(diff)}% o'tgan oyga nisbatan`,
  }
}

export default function AdminDashboard({ data }) {
  const [series, setSeries] = useState([])

  useEffect(() => {
    let cancelled = false
    getTimeseries({ granularity: 'month' })
      .then((res) => {
        if (!cancelled) setSeries(res?.series ?? [])
      })
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [])

  const summary = data?.summary ?? {}
  const totals = data?.totals ?? {}
  const lowGroups = data?.low_attendance_groups ?? []

  const lineData = series.map((s) => ({ label: formatPeriodLabel(s.period), value: s.attendance_percent }))
  const statusData = ATTENDANCE_STATUSES.map((s) => ({
    name: s.label,
    value: summary.by_status?.[s.key] ?? 0,
    color: s.chartColor,
  })).filter((s) => s.value > 0)
  const statusTotal = statusData.reduce((sum, s) => sum + s.value, 0)

  return (
    <div className="flex flex-col gap-4">
      <div className="relative z-10 -mt-14 grid grid-cols-2 gap-4 sm:grid-cols-4 sm:-mt-16">
        <StatCard
          icon="badgeCheck"
          label="Umumiy davomat"
          value={`${summary.attendance_percent ?? 0}%`}
          trend={attendanceTrend(series)}
          tone="primary"
        />
        <StatCard icon="group" label="Guruhlar" value={totals.groups ?? 0} tone="info" />
        <StatCard icon="users" label="Tinglovchilar" value={totals.students ?? 0} tone="success" />
        <StatCard icon="user" label="O'qituvchilar" value={totals.teachers ?? 0} tone="warning" />
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="min-w-0 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm lg:col-span-2">
          <h2 className="mb-4 text-sm font-semibold text-base-content">
            Oylik davomat statistikasi
          </h2>
          {lineData.length === 0 ? (
            <p className="py-8 text-center text-sm text-base-content/50">Ma'lumot yo'q</p>
          ) : (
            <AttendanceLineChart data={lineData} />
          )}
        </div>

        <div className="min-w-0 rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-base-content">Holatlar bo'yicha taqsimot</h2>
          {statusData.length === 0 ? (
            <p className="py-8 text-center text-sm text-base-content/50">Ma'lumot yo'q</p>
          ) : (
            <div className="relative">
              <SubjectPieChart data={statusData} />
              <div className="pointer-events-none absolute inset-x-0 top-0 flex h-55 flex-col items-center justify-center">
                <span className="text-2xl font-black text-base-content">{statusTotal > 0 ? '100%' : '0%'}</span>
                <span className="text-xs text-base-content/50">Jami holatlar</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-base-300 bg-base-100 p-5 shadow-sm">
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-base-content">Eng past davomatga ega guruhlar</h2>
          <Link
            to="/groups"
            className="group inline-flex shrink-0 items-center gap-1 text-xs font-semibold text-primary hover:underline"
          >
            Barchasini ko'rish
            <Icon
              name="chevronRight"
              className="size-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
        </div>
        {lowGroups.length === 0 ? (
          <p className="py-4 text-sm text-base-content/50">Ma'lumot yo'q</p>
        ) : (
          <GroupRankingTable
            data={lowGroups.map((g) => ({
              groupId: g.group_id,
              name: g.group_name,
              faculty: g.faculty_name,
              rate: g.attendance_percent,
            }))}
          />
        )}
      </div>
    </div>
  )
}
