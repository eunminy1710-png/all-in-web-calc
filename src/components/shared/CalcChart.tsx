'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
} from 'recharts'

interface LineData {
  type: 'line'
  data: Record<string, string | number>[]
  xKey: string
  lines: { key: string; label: string; color: string }[]
}

interface PieData {
  type: 'pie'
  data: { name: string; value: number; color: string }[]
}

type CalcChartProps = LineData | PieData

export default function CalcChart(props: CalcChartProps) {
  if (props.type === 'line') {
    return (
      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={props.data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
          <XAxis dataKey={props.xKey} tick={{ fontSize: 11 }} />
          <YAxis
            tick={{ fontSize: 11 }}
            width={60}
            tickFormatter={(v: number) => `${(v / 10000).toFixed(0)}만`}
          />
          <Tooltip formatter={(v) => `${Number(v).toLocaleString()}원`} />
          {props.lines.map((l) => (
            <Line
              key={l.key}
              type="monotone"
              dataKey={l.key}
              name={l.label}
              stroke={l.color}
              dot={false}
              strokeWidth={2}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    )
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={props.data}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={80}
          label={({ name, percent }) =>
            `${name ?? ''} ${((percent ?? 0) * 100).toFixed(0)}%`
          }
        >
          {props.data.map((entry, i) => (
            <Cell key={i} fill={entry.color} />
          ))}
        </Pie>
        <Legend />
        <Tooltip formatter={(v) => Number(v).toLocaleString()} />
      </PieChart>
    </ResponsiveContainer>
  )
}
