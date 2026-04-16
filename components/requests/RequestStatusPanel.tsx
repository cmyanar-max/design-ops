'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from 'sonner'
import { Request } from '@/types/database'
import { STATUSES } from '@/lib/validations/request'

type RequestStatus = 'new' | 'brief_review' | 'design' | 'revision' | 'approval' | 'completed' | 'archived' | 'cancelled'

interface RequestStatusPanelProps {
  request: Request & { assignee?: { id: string; name: string } | null }
  currentUserId: string
  isDesignerOrAdmin: boolean
}

const STATUS_TRANSITIONS: Record<RequestStatus, RequestStatus[]> = {
  new: ['brief_review', 'cancelled'],
  brief_review: ['design', 'new', 'cancelled'],
  design: ['revision', 'approval', 'cancelled'],
  revision: ['design', 'approval'],
  approval: ['completed', 'revision'],
  completed: ['archived'],
  archived: [],
  cancelled: [],
}

export default function RequestStatusPanel({ request, currentUserId, isDesignerOrAdmin }: RequestStatusPanelProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [note, setNote] = useState('')
  const [selectedStatus, setSelectedStatus] = useState<RequestStatus | ''>('')

  const currentStatus = request.status as RequestStatus
  const availableTransitions = STATUS_TRANSITIONS[currentStatus] ?? []
  const canChangeStatus = isDesignerOrAdmin || request.created_by === currentUserId

  if (!canChangeStatus || availableTransitions.length === 0) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Durum</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground">
            {STATUSES.find(s => s.value === currentStatus)?.label ?? currentStatus}
          </div>
        </CardContent>
      </Card>
    )
  }

  const handleStatusChange = async () => {
    if (!selectedStatus) return
    setLoading(true)
    try {
      const res = await fetch(`/api/requests/${request.id}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedStatus, note: note || undefined }),
      })
      if (!res.ok) throw new Error('Durum güncellenemedi')
      toast.success('Durum güncellendi')
      setNote('')
      setSelectedStatus('')
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Durum Güncelle</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <Select value={selectedStatus} onValueChange={(v) => setSelectedStatus(v as RequestStatus)}>
          <SelectTrigger className="h-8 text-sm">
            <SelectValue placeholder="Yeni durum seçin..." />
          </SelectTrigger>
          <SelectContent>
            {availableTransitions.map(s => {
              const info = STATUSES.find(st => st.value === s)!
              return (
                <SelectItem key={s} value={s}>{info.label}</SelectItem>
              )
            })}
          </SelectContent>
        </Select>

        {selectedStatus && (
          <Textarea
            placeholder="Not ekle (opsiyonel)..."
            value={note}
            onChange={e => setNote(e.target.value)}
            rows={2}
            className="text-sm"
          />
        )}

        <Button
          size="sm"
          className="w-full"
          disabled={!selectedStatus || loading}
          onClick={handleStatusChange}
        >
          {loading ? 'Güncelleniyor...' : 'Güncelle'}
        </Button>
      </CardContent>
    </Card>
  )
}
