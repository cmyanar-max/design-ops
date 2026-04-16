'use client'

import { useRouter, useSearchParams } from 'next/navigation'

const PERIODS = [
  { label: 'Günlük', value: 'daily' },
  { label: 'Haftalık', value: 'weekly' },
  { label: 'Aylık', value: 'monthly' },
  { label: 'Yıllık', value: 'yearly' },
  { label: 'Tümü', value: 'all' },
]

export default function PeriodSelector() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const current = searchParams.get('period') ?? 'monthly'

  const select = (value: string) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('period', value)
    router.replace(`/dashboard?${params.toString()}`)
  }

  return (
    <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
      {PERIODS.map(p => (
        <button
          key={p.value}
          onClick={() => select(p.value)}
          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
            current === p.value
              ? 'bg-background text-foreground shadow-sm'
              : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
