'use client'

import dynamic from 'next/dynamic'

const RequestsByTypeChart = dynamic(
  () => import('@/components/dashboard/RequestsByTypeChart'),
  {
    loading: () => (
      <div className="h-[200px] w-full animate-pulse rounded-lg bg-muted" />
    ),
  }
)

interface LazyRequestsByTypeChartProps {
  data: { type: string; count: number }[]
}

export default function LazyRequestsByTypeChart({ data }: LazyRequestsByTypeChartProps) {
  return <RequestsByTypeChart data={data} />
}
