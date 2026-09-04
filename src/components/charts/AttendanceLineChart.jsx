import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

const tickStyle = { fill: 'var(--color-base-content)', fontSize: 12, fillOpacity: 0.55 }

export default function AttendanceLineChart({ data, dataKey = 'value', xKey = 'label', height = 260 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="attendanceLineFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-primary)" stopOpacity={0.35} />
            <stop offset="100%" stopColor="var(--color-primary)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--color-base-300)" vertical={false} />
        <XAxis
          dataKey={xKey}
          tick={tickStyle}
          axisLine={{ stroke: 'var(--color-base-300)' }}
          tickLine={false}
        />
        <YAxis tick={tickStyle} axisLine={false} tickLine={false} width={40} unit="%" />
        <Tooltip
          contentStyle={{
            background: 'var(--color-base-100)',
            border: '1px solid var(--color-base-300)',
            borderRadius: '0.75rem',
            fontSize: '0.8rem',
            boxShadow: '0 8px 24px -8px rgb(0 0 0 / 0.15)',
          }}
          labelStyle={{ color: 'var(--color-base-content)', fontWeight: 600 }}
          formatter={(value) => [`${value}%`, 'Davomat']}
        />
        <Area
          type="monotone"
          dataKey={dataKey}
          stroke="var(--color-primary)"
          strokeWidth={3}
          fill="url(#attendanceLineFill)"
          dot={{ r: 4, fill: 'var(--color-primary)', strokeWidth: 2, stroke: 'var(--color-base-100)' }}
          activeDot={{ r: 6, strokeWidth: 2, stroke: 'var(--color-base-100)' }}
        />
      </AreaChart>
    </ResponsiveContainer>
  )
}
