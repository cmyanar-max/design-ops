'use client'

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { REQUEST_TYPES } from '@/lib/validations/request'

interface RequestsByTypeChartProps {
  data: { type: string; count: number }[]
}

export default function RequestsByTypeChart({ data }: RequestsByTypeChartProps) {
  const chartData = data.map(d => ({
    name: REQUEST_TYPES.find(t => t.value === d.type)?.label ?? d.type,
    count: d.count,
  }))

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: -20 }}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
        <XAxis
          dataKey="name"
          tick={{ fontSize: 11 }}
          tickLine={false}
          axisLine={false}
        />
        <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} allowDecimals={false} />
        <Tooltip
          contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid var(--border)' }}
          cursor={{ fill: 'var(--muted)' }}
        />
        <Bar dataKey="count" fill="var(--chart-1)" radius={[4, 4, 0, 0]} name="Talep Sayısı" />
      </BarChart>
    </ResponsiveContainer>
  )
}
