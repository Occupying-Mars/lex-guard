'use client'

import { Pie, PieChart, Cell, ResponsiveContainer, Tooltip } from 'recharts'

type SeverityDatum = { name: string; value: number }

type SeverityChartProps = {
  data: SeverityDatum[]
}

const COLORS = ['#dc2626', '#f97316', '#facc15', '#3b82f6']

export default function SeverityChart({ data }: SeverityChartProps) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" outerRadius={90}>
            {data.map((_, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  )
}
