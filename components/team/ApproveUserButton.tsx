'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { NeonButton } from '@/components/ui/neon-button'
import { toast } from 'sonner'

export default function ApproveUserButton({ userId, userName }: { userId: string; userName: string }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleApprove = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/team/${userId}/approve`, { method: 'POST' })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Onay başarısız')
      }
      toast.success(`${userName} onaylandı`)
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <NeonButton size="sm" onClick={handleApprove} disabled={loading}>
      {loading ? 'Onaylanıyor...' : 'Onayla'}
    </NeonButton>
  )
}
