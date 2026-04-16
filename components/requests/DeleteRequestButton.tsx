'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
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

interface DeleteRequestButtonProps {
  requestId: string
  isAdmin?: boolean
}

export default function DeleteRequestButton({ requestId, isAdmin = false }: DeleteRequestButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleDelete = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/requests/${requestId}`, {
        method: 'DELETE',
      })

      if (!res.ok) {
        const body = await res.json()
        throw new Error(body.error ?? 'Silme işlemi başarısız')
      }

      toast.success('Talep silindi')
      router.push('/requests')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Talep silinemedi')
      setLoading(false)
    }
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
        {isAdmin ? 'Talebi Sil' : 'İptal Edilen Talebi Sil'}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Talebi kalıcı olarak silmek istiyor musunuz?</AlertDialogTitle>
          <AlertDialogDescription>
            Bu işlem geri alınamaz. Talep ve tüm ilgili veriler (yorumlar, dosyalar) kalıcı olarak silinecektir.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Vazgeç</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Siliniyor...' : 'Evet, kalıcı olarak sil'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
