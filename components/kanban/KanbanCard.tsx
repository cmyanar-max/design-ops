'use client'

import Link from 'next/link'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge-1'
import { RequestWithUser } from '@/types/database'
import { PRIORITIES, REQUEST_TYPES } from '@/lib/validations/request'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'

interface KanbanCardProps {
  request: RequestWithUser
  isDragging?: boolean
  readOnly?: boolean
}

export default function KanbanCard({ request, isDragging = false, readOnly = false }: KanbanCardProps) {
  const {
    attributes, listeners, setNodeRef, transform, transition, isDragging: isSortableDragging
  } = useSortable({ id: request.id, disabled: readOnly })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const priority = PRIORITIES.find(p => p.value === request.priority)
  const requestType = REQUEST_TYPES.find(t => t.value === request.request_type)

  const isOverdue = request.deadline && new Date(request.deadline) < new Date() &&
    !['completed', 'cancelled', 'archived'].includes(request.status)

  const assignee = request.assignee as { id: string; name: string; avatar_url: string | null } | null
  const creator = request.creator as { id: string; name: string; avatar_url: string | null }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...(readOnly ? {} : attributes)}
      {...(readOnly ? {} : listeners)}
      className={cn(
        'bg-card border border-border rounded-lg p-3 transition-all',
        readOnly ? 'cursor-default' : 'cursor-grab active:cursor-grabbing select-none hover:border-primary/50 hover:shadow-sm',
        (isSortableDragging || isDragging) && 'opacity-50 shadow-lg border-primary',
        isOverdue && 'border-l-2 border-l-destructive'
      )}
    >
      <Link href={`/requests/${request.id}`} onClick={e => e.stopPropagation()}>
        {/* Tür + Öncelik */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="text-xs text-muted-foreground">{requestType?.label}</span>
          {priority && (
            <Badge variant={priority.variant} size="xs">{priority.label}</Badge>
          )}
        </div>

        {/* Başlık */}
        <p className="text-sm font-medium line-clamp-2 mb-2">{request.title}</p>

        {/* Etiketler */}
        {request.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {request.tags.slice(0, 2).map(tag => (
              <Badge key={tag} variant="gray-subtle" size="xs">{tag}</Badge>
            ))}
            {request.tags.length > 2 && (
              <span className="text-xs text-muted-foreground">+{request.tags.length - 2}</span>
            )}
          </div>
        )}

        {/* AI Skoru */}
        {request.ai_brief_score !== null && (
          <div className="flex items-center gap-1 mb-2">
            <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  'h-full rounded-full',
                  request.ai_brief_score >= 70 ? 'bg-green-500' :
                  request.ai_brief_score >= 40 ? 'bg-yellow-500' : 'bg-red-500'
                )}
                style={{ width: `${request.ai_brief_score}%` }}
              />
            </div>
            <span className="text-xs text-muted-foreground">{Math.round(request.ai_brief_score as number)}%</span>
          </div>
        )}

        {/* Alt: Tarih + Atanan */}
        <div className="flex items-center justify-between mt-2">
          <div className="text-xs text-muted-foreground">
            {request.deadline ? (
              <span className={isOverdue ? 'text-destructive font-medium' : ''}>
                {isOverdue ? '⚠ ' : ''}
                {new Date(request.deadline).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
              </span>
            ) : (
              <span>{formatDistanceToNow(new Date(request.created_at), { locale: tr, addSuffix: true })}</span>
            )}
          </div>

          <div className="flex items-center gap-1">
            {assignee ? (
              <Avatar className="w-5 h-5">
                <AvatarImage src={assignee.avatar_url ?? undefined} />
                <AvatarFallback className="text-xs">
                  {assignee.name[0]}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div className="w-5 h-5 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                <span className="text-xs text-muted-foreground">?</span>
              </div>
            )}
          </div>
        </div>
      </Link>
    </div>
  )
}
