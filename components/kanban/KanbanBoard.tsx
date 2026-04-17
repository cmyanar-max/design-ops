'use client'

import { useState, useCallback, useEffect, useRef } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  pointerWithin,
  closestCenter,
  type CollisionDetection,
} from '@dnd-kit/core'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import KanbanColumn from './KanbanColumn'
import KanbanCard from './KanbanCard'
import { RequestWithUser, RequestStatus } from '@/types/database'
import { STATUSES } from '@/lib/validations/request'

const KANBAN_COLUMNS: RequestStatus[] = [
  'new', 'brief_review', 'design', 'revision', 'approval', 'completed'
]

interface KanbanBoardProps {
  initialRequests: RequestWithUser[]
  orgId: string
  readOnly?: boolean
}

type RealtimeStatus = 'connecting' | 'connected' | 'disconnected'

export default function KanbanBoard({ initialRequests, orgId, readOnly = false }: KanbanBoardProps) {
  const [requests, setRequests] = useState<RequestWithUser[]>(initialRequests)
  const [activeRequest, setActiveRequest] = useState<RequestWithUser | null>(null)
  const [realtimeStatus, setRealtimeStatus] = useState<RealtimeStatus>('connecting')
  const supabase = createClient()
  // Drag sırasında gelen Realtime güncellemelerini erteleme için ref
  const isDraggingRef = useRef(false)
  const pendingUpdatesRef = useRef<Array<() => void>>([])

  // readOnly modda sensör yok → drag başlatılamaz
  const sensors = useSensors(
    ...(readOnly ? [] : [useSensor(PointerSensor, { activationConstraint: { distance: 8 } })])
  )

  // Önce pointerWithin (pointer kolona girdi mi?), yoksa closestCenter fallback
  const collisionDetection: CollisionDetection = (args) => {
    const pointerCollisions = pointerWithin(args)
    if (pointerCollisions.length > 0) return pointerCollisions
    return closestCenter(args)
  }

  const getColumnRequests = useCallback(
    (status: RequestStatus) => requests.filter(r => r.status === status),
    [requests]
  )

  // Realtime aboneliği
  useEffect(() => {
    const channel = supabase
      .channel(`kanban:${orgId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'requests',
          filter: `organization_id=eq.${orgId}`,
        },
        (payload) => {
          const updated = payload.new as { id: string; status: string; title: string; priority: string; deadline: string | null; assigned_to: string | null; ai_brief_score: number | null; tags: string[] }

          const applyUpdate = () => {
            setRequests(prev => {
              const exists = prev.find(r => r.id === updated.id)
              if (!exists) return prev
              // Sadece değişen alanları güncelle, join verisini koru
              return prev.map(r =>
                r.id === updated.id
                  ? {
                      ...r,
                      status: updated.status as RequestStatus,
                      priority: updated.priority as RequestWithUser['priority'],
                      deadline: updated.deadline,
                      ai_brief_score: updated.ai_brief_score,
                      tags: updated.tags ?? r.tags,
                    }
                  : r
              )
            })
          }

          // Drag aktifken güncellemeyi ertele
          if (isDraggingRef.current) {
            pendingUpdatesRef.current.push(applyUpdate)
          } else {
            applyUpdate()
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'requests',
          filter: `organization_id=eq.${orgId}`,
        },
        async (payload) => {
          const newRow = payload.new as { id: string; status: string }

          // Kanban dışı statüsleri (archived/cancelled) gösterme
          if (['archived', 'cancelled'].includes(newRow.status)) return

          // Join verisini almak için tekrar fetch et
          const { data } = await supabase
            .from('requests')
            .select(`
              *,
              creator:users!requests_created_by_fkey(id, name, avatar_url),
              assignee:users!requests_assigned_to_fkey(id, name, avatar_url),
              brand:brands(id, name, primary_color)
            `)
            .eq('id', newRow.id)
            .single()

          if (data) {
            setRequests(prev => {
              if (prev.find(r => r.id === data.id)) return prev // zaten var
              return [data as unknown as RequestWithUser, ...prev]
            })
            toast.info(`Yeni talep: "${(data as { title: string }).title}"`)
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'DELETE',
          schema: 'public',
          table: 'requests',
          filter: `organization_id=eq.${orgId}`,
        },
        (payload) => {
          const deleted = payload.old as { id: string }
          setRequests(prev => prev.filter(r => r.id !== deleted.id))
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') setRealtimeStatus('connected')
        else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') setRealtimeStatus('disconnected')
      })

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orgId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleDragStart = (event: DragStartEvent) => {
    isDraggingRef.current = true
    const req = requests.find(r => r.id === event.active.id)
    if (req) setActiveRequest(req)
  }

  const handleDragEnd = async (event: DragEndEvent) => {
    isDraggingRef.current = false
    const { active, over } = event
    setActiveRequest(null)

    // Ertelenen Realtime güncellemelerini uygula
    pendingUpdatesRef.current.forEach(fn => fn())
    pendingUpdatesRef.current = []

    if (!over) return

    const requestId = active.id as string

    // over.id; sütun statüsü (örn. 'design') veya bir kartın UUID'si olabilir.
    // Kart UUID'si geliyorsa o kartın statüsünü hedef sütun olarak kullan.
    let newStatus: RequestStatus
    if (KANBAN_COLUMNS.includes(over.id as RequestStatus)) {
      newStatus = over.id as RequestStatus
    } else {
      const overCard = requests.find(r => r.id === over.id)
      if (!overCard) return
      newStatus = overCard.status
    }

    const currentRequest = requests.find(r => r.id === requestId)
    if (!currentRequest || currentRequest.status === newStatus) return

    // Optimistic update
    setRequests(prev =>
      prev.map(r => r.id === requestId ? { ...r, status: newStatus } : r)
    )

    try {
      const res = await fetch(`/api/requests/${requestId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!res.ok) throw new Error('Durum güncellenemedi')

      const statusLabel = STATUSES.find(s => s.value === newStatus)?.label ?? newStatus
      toast.success(`"${statusLabel}" kolonuna taşındı`)
    } catch {
      // Hata → geri al
      setRequests(prev =>
        prev.map(r => r.id === requestId ? { ...r, status: currentRequest.status } : r)
      )
      toast.error('Durum güncellenemedi')
    }
  }

  const statusDot = {
    connecting: 'bg-yellow-400 animate-pulse',
    connected: 'bg-green-500',
    disconnected: 'bg-red-400',
  }[realtimeStatus]

  const statusLabel = {
    connecting: 'Bağlanıyor...',
    connected: 'Canlı',
    disconnected: 'Bağlantı kesildi',
  }[realtimeStatus]

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Realtime durum göstergesi */}
      <div className="flex items-center gap-1.5 px-1 shrink-0">
        <div className={`w-2 h-2 rounded-full ${statusDot}`} />
        <span className="text-xs text-muted-foreground">{statusLabel}</span>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={collisionDetection}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 flex-1 overflow-x-auto pb-4">
          {KANBAN_COLUMNS.map(status => {
            const colInfo = STATUSES.find(s => s.value === status)!
            return (
              <KanbanColumn
                key={status}
                status={status}
                label={colInfo.label}
                variant={colInfo.variant}
                requests={getColumnRequests(status)}
                canDrop={!readOnly}
                readOnly={readOnly}
              />
            )
          })}
        </div>

        {!readOnly && (
          <DragOverlay>
            {activeRequest && (
              <div className="rotate-2 opacity-90 shadow-xl">
                <KanbanCard request={activeRequest} isDragging />
              </div>
            )}
          </DragOverlay>
        )}
      </DndContext>
    </div>
  )
}
