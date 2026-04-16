'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function MarkAllReadButton({ userId }: { userId: string }) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleMarkAll = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, all: true }),
      })
      if (!res.ok) throw new Error()
      toast.success('Tümü okundu olarak işaretlendi')
      router.refresh()
    } catch {
      toast.error('İşlem başarısız')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button variant="outline" size="sm" onClick={handleMarkAll} disabled={loading}>
      {loading ? 'İşleniyor...' : 'Tümünü Okundu İşaretle'}
    </Button>
  )
}
