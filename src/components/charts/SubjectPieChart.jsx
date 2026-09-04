import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts'
import { CHART_PALETTE } from '../../utils/colors'

// Eslatma: recharts <Legend/> komponenti ResponsiveContainer bilan birga
// ishlatilganda konteyner o'lchamini noto'g'ri hisoblab qo'yadigan xato
// bor edi (SVG 8x8px'ga "muzlab qolardi"). Shu sababli o'z legendimizni
// yasadik — bu ham dizaynga to'liq mos keladi.
export default function SubjectPieChart({ data, height = 220 }) {
  const total = data.reduce((sum, d) => sum + d.value, 0)

  return (
    <div>
      <ResponsiveContainer width="100%" height={height}>
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="50%"
            innerRadius={62}
            outerRadius={96}
            paddingAngle={3}
            cornerRadius={6}
            stroke="none"
          >
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={entry.color ?? CHART_PALETTE[index % CHART_PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              background: 'var(--color-base-100)',
              border: '1px solid var(--color-base-300)',
              borderRadius: '0.75rem',
              fontSize: '0.8rem',
              boxShadow: '0 8px 24px -8px rgb(0 0 0 / 0.15)',
            }}
            formatter={(value) => [`${value}%`, 'Davomat']}
          />
        </PieChart>
      </ResponsiveContainer>

      <ul className="mt-3 flex flex-wrap justify-center gap-x-4 gap-y-1.5">
        {data.map((entry, index) => (
          <li key={entry.name} className="flex items-center gap-1.5 text-xs text-base-content/70">
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color ?? CHART_PALETTE[index % CHART_PALETTE.length] }}
            />
            <span className="truncate font-medium">{entry.name}</span>
            {total > 0 && (
              <span className="text-base-content/40">{Math.round((entry.value / total) * 100)}%</span>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}
