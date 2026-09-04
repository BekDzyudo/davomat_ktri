import AttendanceRateBadge from '../../components/AttendanceRateBadge'
import { getAccentColor } from '../../utils/colors'

export default function GroupRankingTable({ data }) {
  return (
    <div className="overflow-x-auto">
      <table className="table">
        <thead>
          <tr className="text-xs uppercase text-base-content/50">
            <th className="w-10">#</th>
            <th>Guruh</th>
            <th>Fakultet</th>
            <th className="text-right">Davomat foizi</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => {
            const accent = getAccentColor(row.groupId ?? row.name)
            return (
              <tr key={row.groupId}>
                <td className="text-base-content/40">{index + 1}</td>
                <td className="font-medium text-base-content">
                  <span className="flex items-center gap-2">
                    <span className={`size-2 shrink-0 rounded-full ${accent.solid}`} />
                    {row.name ?? '—'}
                  </span>
                </td>
                <td className="text-base-content/60">{row.faculty ?? '—'}</td>
                <td className="text-right">
                  <AttendanceRateBadge rate={row.rate} />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
