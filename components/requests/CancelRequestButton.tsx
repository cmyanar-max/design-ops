'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface CancelRequestButtonProps {
  requestId: string
}

export default function CancelRequestButton({ requestId }: CancelRequestButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCancel = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/requests/${requestId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      })

      if (!res.ok) throw new Error('İptal işlemi başarısız')

      toast.success('Talep iptal edildi')
      router.refresh()
    } catch {
      toast.error('Talep iptal edilemedi')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger className={cn(
        'inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3',
        'border border-destructive/40 text-destructive bg-transparent',
        'hover:bg-destructive hover:text-white hover:border-destructive transition-colors'
      )}>
        Talebi İptal Et
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Talebi iptal etmek istediğinizden emin misiniz?</AlertDialogTitle>
          <AlertDialogDescription>
            Bu işlem geri alınamaz. Talep iptal edildiğinde tasarım süreci durdurulacaktır.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Vazgeç</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleCancel}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'İptal ediliyor...' : 'Evet, iptal et'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
