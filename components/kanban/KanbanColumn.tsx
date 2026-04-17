'use client'

import { memo } from 'react'
import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { cn } from '@/lib/utils'
import KanbanCard from './KanbanCard'
import { RequestWithUser, RequestStatus } from '@/types/database'
import { Badge, type BadgeVariant } from '@/components/ui/badge-1'

interface KanbanColumnProps {
  status: RequestStatus
  label: string
  variant: BadgeVariant
  requests: RequestWithUser[]
  canDrop?: boolean
  readOnly?: boolean
}

function KanbanColumn({ status, label, variant, requests, canDrop = true, readOnly = false }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status, disabled: !canDrop })

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'flex flex-col w-72 shrink-0 rounded-xl border border-border bg-muted/40 transition-colors',
        isOver && 'border-primary bg-primary/5'
      )}
    >
      {/* Kolon başlığı */}
      <div className="flex items-center justify-between px-3 h-12 border-b border-border">
        <div className="flex items-center gap-2">
          <Badge variant={variant} size="sm">{label}</Badge>
        </div>
        <span className="text-xs font-medium text-muted-foreground bg-background px-1.5 rounded h-6 leading-6 flex items-center justify-center">
          {requests.length}
        </span>
      </div>

      {/* Kartlar */}
      <SortableContext items={requests.map(r => r.id)} strategy={verticalListSortingStrategy}>
        <div className="flex-1 p-2 space-y-2 overflow-y-auto min-h-20">
          {requests.length === 0 && (
            <div className={cn(
              'flex items-center justify-center h-16 rounded-lg border-2 border-dashed text-xs text-muted-foreground',
              isOver ? 'border-primary text-primary' : 'border-border'
            )}>
              {isOver ? 'Buraya bırak' : 'Boş'}
            </div>
          )}
          {requests.map(req => (
            <KanbanCard key={req.id} request={req} readOnly={readOnly} />
          ))}
        </div>
      </SortableContext>
    </div>
  )
}

export default memo(KanbanColumn)
