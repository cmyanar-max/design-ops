'use client'

import dynamic from 'next/dynamic'
import { RequestWithUser } from '@/types/database'

const KanbanBoard = dynamic(
  () => import('@/components/kanban/KanbanBoard'),
  {
    loading: () => (
      <div className="grid h-full min-h-[420px] grid-cols-1 gap-4 md:grid-cols-3 xl:grid-cols-6">
        {Array.from({ length: 6 }).map((_, index) => (
          <div key={index} className="rounded-xl border bg-muted/40 p-4">
            <div className="mb-4 h-5 w-24 animate-pulse rounded bg-muted" />
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((__, cardIndex) => (
                <div key={cardIndex} className="h-24 animate-pulse rounded-lg bg-muted" />
              ))}
            </div>
          </div>
        ))}
      </div>
    ),
  }
)

interface LazyKanbanBoardProps {
  initialRequests: RequestWithUser[]
  orgId: string
  readOnly?: boolean
}

export default function LazyKanbanBoard(props: LazyKanbanBoardProps) {
  return <KanbanBoard {...props} />
}
