'use client'

import { useState, useEffect } from 'react'

interface RequestsCountProps {
  initialCount: number
}

export default function RequestsCount({ initialCount }: RequestsCountProps) {
  const [count, setCount] = useState(initialCount)

  useEffect(() => {
    const handleDeleted = (e: Event) => {
      const detail = (e as CustomEvent<{ count: number }>).detail
      setCount(prev => Math.max(0, prev - detail.count))
    }

    window.addEventListener('requests-bulk-deleted', handleDeleted)
    return () => window.removeEventListener('requests-bulk-deleted', handleDeleted)
  }, [])

  return (
    <p className="text-sm text-muted-foreground">
      {count} talep
    </p>
  )
}
