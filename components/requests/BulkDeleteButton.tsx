'use client'

import { useState } from 'react'
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
import type { RequestRow } from './RequestsList'

interface BulkDeleteButtonProps {
  selectedRequests: RequestRow[]
  onSuccess: (deletedIds: string[]) => void
  onClear: () => void
  isAdmin?: boolean
}

export default function BulkDeleteButton({ selectedRequests, onSuccess, onClear, isAdmin = false }: BulkDeleteButtonProps) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)

  const cancelledRequests = selectedRequests.filter(r => r.status === 'cancelled')
  const nonCancelledRequests = selectedRequests.filter(r => r.status !== 'cancelled')

  // Admin can delete all, others can only delete cancelled
  const deletableRequests = isAdmin ? selectedRequests : cancelledRequests
  const undeletableRequests = isAdmin ? [] : nonCancelledRequests

  const handleDelete = async (ids: string[]) => {
    setLoading(true)
    try {
      const results = await Promise.all(
        ids.map(id =>
          fetch(`/api/requests/${id}`, { method: 'DELETE' }).then(async res => {
            if (!res.ok) {
              const body = await res.json()
              return { id, error: body.error ?? 'Silme başarısız' }
            }
            return { id, error: null }
          })
        )
      )

      const deleted = results.filter(r => !r.error).map(r => r.id)
      const failed = results.filter(r => r.error)

      if (deleted.length > 0) {
        toast.success(`${deleted.length} talep silindi`)
        onSuccess(deleted)
      }

      if (failed.length > 0) {
        toast.error(`${failed.length} talep silinemedi`)
      }

      setOpen(false)
    } catch {
      toast.error('Silme işlemi sırasında bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  // Admin can delete all, show confirmation
  if (isAdmin) {
    if (deletableRequests.length === 0) {
      return (
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 border border-destructive text-destructive bg-transparent hover:bg-destructive/10 transition-colors">
            Talebi Kaldır
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Talep yok</AlertDialogTitle>
              <AlertDialogDescription>Silinecek talep yok.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Kapat</AlertDialogCancel>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )
    }

    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 border border-destructive text-destructive bg-transparent hover:bg-destructive/10 transition-colors">
          Talebi Kaldır
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {deletableRequests.length} talebi kalıcı olarak silmek istiyor musunuz?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Seçili talepler ve tüm ilgili veriler (yorumlar, dosyalar) kalıcı olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDelete(deletableRequests.map(r => r.id))}
              disabled={loading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {loading ? 'Siliniyor...' : `Evet, ${deletableRequests.length} talebi sil`}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  // Non-admin: Senaryo C: Hiçbiri iptal edilmemiş
  if (undeletableRequests.length === selectedRequests.length) {
    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 border border-destructive text-destructive bg-transparent hover:bg-destructive/10 transition-colors">
          Talebi Kaldır
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Talepler iptal edilmemiş</AlertDialogTitle>
            <AlertDialogDescription>
              Seçili taleplerin hiçbiri iptal edilmemiş durumda. Talepleri kaldırabilmek için önce iptal etmeniz gerekmektedir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Tamam</AlertDialogCancel>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  // Non-admin: Senaryo B: Bazıları iptal edilmemiş
  if (undeletableRequests.length > 0) {
    return (
      <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 border border-destructive text-destructive bg-transparent hover:bg-destructive/10 transition-colors">
          Talebi Kaldır
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Bazı talepler iptal edilmemiş</AlertDialogTitle>
            <AlertDialogDescription>
              Seçili {selectedRequests.length} talepten {undeletableRequests.length} tanesi henüz iptal edilmemiş.
              Talepleri kaldırabilmek için önce iptal etmeniz gerekmektedir.
              {cancelledRequests.length > 0 && (
                <> Yalnızca iptal edilmiş {cancelledRequests.length} talep silinebilir.</>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Vazgeç</AlertDialogCancel>
            {cancelledRequests.length > 0 && (
              <AlertDialogAction
                onClick={() => handleDelete(cancelledRequests.map(r => r.id))}
                disabled={loading}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                {loading ? 'Siliniyor...' : `Sadece iptal edilmişleri sil (${cancelledRequests.length})`}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    )
  }

  // Non-admin: Senaryo A: Tümü iptal edilmiş
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger className="inline-flex items-center justify-center rounded-md text-sm font-medium h-8 px-3 border border-destructive text-destructive bg-transparent hover:bg-destructive/10 transition-colors">
        Talebi Kaldır
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {selectedRequests.length} talebi kalıcı olarak silmek istiyor musunuz?
          </AlertDialogTitle>
          <AlertDialogDescription>
            Bu işlem geri alınamaz. Seçili talepler ve tüm ilgili veriler (yorumlar, dosyalar) kalıcı olarak silinecektir.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Vazgeç</AlertDialogCancel>
          <AlertDialogAction
            onClick={() => handleDelete(selectedRequests.map(r => r.id))}
            disabled={loading}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {loading ? 'Siliniyor...' : `Evet, ${selectedRequests.length} talebi sil`}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
