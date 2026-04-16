'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { NeonButton } from '@/components/ui/neon-button'
import { toast } from 'sonner'

export default function RejectUserButton({ userId, userName }: { userId: string; userName: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleReject = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/team/${userId}/reject`, { method: 'POST' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Red başarısız')
      }
      toast.success(`${userName} reddedildi`)
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <NeonButton
      size="sm"
      onClick={handleReject}
      disabled={loading}
      variant="destructive-solid"
    >
      {loading ? 'Reddediliyor...' : 'Reddet'}
    </NeonButton>
  )
}
