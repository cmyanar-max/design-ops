'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getInitials } from '@/lib/utils'
import { STATUSES, PRIORITIES, REQUEST_TYPES } from '@/lib/validations/request'
import { Badge } from '@/components/ui/badge-1'
import BulkDeleteButton from './BulkDeleteButton'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/animated-table-rows'
import { Trash2 } from 'lucide-react'

export interface RequestRow {
  id: string
  title: string
  status: string
  priority: string
  deadline: string | null
  request_type: string
  created_at: string
  ai_brief_score: number | null
  tags: string[]
  creator: { id: string; name: string; avatar_url: string | null } | null
  assignee: { id: string; name: string; avatar_url: string | null } | null
}

interface RequestsListProps {
  initialRequests: RequestRow[]
  orgId: string
  isAdmin?: boolean
}

export default function RequestsList({ initialRequests, orgId, isAdmin = false }: RequestsListProps) {
  const [requests, setRequests] = useState<RequestRow[]>(initialRequests)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const channel = supabase
      .channel(`requests-list:${orgId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'requests',
          filter: `organization_id=eq.${orgId}`,
        },
        async (payload) => {
          const newId = (payload.new as { id: string }).id
          const { data } = await supabase
            .from('requests')
            .select(`
              id, title, status, priority, deadline, request_type, created_at, ai_brief_score, tags,
              creator:users!requests_created_by_fkey(id, name, avatar_url),
              assignee:users!requests_assigned_to_fkey(id, name, avatar_url)
            `)
            .eq('id', newId)
            .single()
          if (data) {
            const row = data as unknown as RequestRow
            setRequests(prev => [row, ...prev])
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'requests',
          filter: `organization_id=eq.${orgId}`,
        },
        (payload) => {
          const updated = payload.new as {
            id: string
            status: string
            priority: string
            deadline: string | null
            ai_brief_score: number | null
            tags: string[]
          }

          setRequests(prev =>
            prev.map(r =>
              r.id === updated.id
                ? {
                    ...r,
                    status: updated.status,
                    priority: updated.priority,
                    deadline: updated.deadline,
                    ai_brief_score: updated.ai_brief_score,
                    tags: updated.tags ?? r.tags,
                  }
                : r
            )
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [orgId]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const toggleSelectAll = useCallback(() => {
    setSelectedIds(prev => {
      if (prev.size === requests.length) {
        return new Set()
      }
      return new Set(requests.map(r => r.id))
    })
  }, [requests])

  const handleBulkDeleteSuccess = useCallback((deletedIds: string[]) => {
    setRequests(prev => prev.filter(r => !deletedIds.includes(r.id)))
    setSelectedIds(new Set())
    window.dispatchEvent(
      new CustomEvent('requests-bulk-deleted', { detail: { count: deletedIds.length } })
    )
    router.refresh()
  }, [router])

  const selectedRequests = requests.filter(r => selectedIds.has(r.id))

  if (!requests.length) {
    return (
      <div className="text-center py-16 space-y-3">
        <p className="text-5xl">📋</p>
        <p className="font-medium">Henüz talep yok</p>
        <p className="text-sm text-muted-foreground">İlk tasarım talebinizi oluşturun</p>
        <Link
          href="/requests/new"
          className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 mt-2"
        >
          Yeni Talep Oluştur
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Animated Table */}
      <div className="border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[40px]">
                <input
                  type="checkbox"
                  checked={selectedIds.size === requests.length && requests.length > 0}
                  onChange={toggleSelectAll}
                  className="h-4 w-4 rounded border-gray-300 accent-primary cursor-pointer"
                />
              </TableHead>
              <TableHead className="w-[100px] text-center">Ai Puanı</TableHead>
              <TableHead>Talep Başlığı</TableHead>
              <TableHead className="hidden sm:table-cell w-[100px] text-center">Tür</TableHead>
              <TableHead className="hidden md:table-cell w-[80px] text-center">Öncelik</TableHead>
              <TableHead className="hidden lg:table-cell w-[100px] text-center">Durum</TableHead>
              <TableHead className="hidden xl:table-cell w-[110px] text-center">Talep Tarihi</TableHead>
              <TableHead className="hidden xl:table-cell w-[110px] text-center">Deadline</TableHead>
              <TableHead className="w-[50px] text-center">Atanan</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            <AnimatePresence>
              {requests.map((req, index) => {
                const status = STATUSES.find(s => s.value === req.status)
                const priority = PRIORITIES.find(p => p.value === req.priority)
                const requestType = REQUEST_TYPES.find(t => t.value === req.request_type)
                const assignee = req.assignee as { name: string; avatar_url: string | null } | null
                const isOverdue =
                  req.deadline &&
                  new Date(req.deadline) < new Date() &&
                  !['completed', 'cancelled', 'archived'].includes(req.status)
                const isSelected = selectedIds.has(req.id)

                return (
                  <motion.tr
                    key={req.id}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    className={`border-b transition-colors ${
                      isSelected
                        ? 'bg-primary/10 hover:bg-primary/15'
                        : 'hover:bg-muted/50'
                    }`}
                  >
                    {/* Checkbox */}
                    <TableCell className="text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => toggleSelect(req.id)}
                        className="h-4 w-4 rounded border-gray-300 accent-primary cursor-pointer"
                      />
                    </TableCell>

                    {/* AI Score */}
                    <TableCell className="text-center">
                      {req.ai_brief_score !== null ? (
                        <div className="text-center">
                          <div
                            className={`text-xs font-bold ${
                              req.ai_brief_score >= 70
                                ? 'text-green-600'
                                : req.ai_brief_score >= 40
                                ? 'text-yellow-600'
                                : 'text-red-600'
                            }`}
                          >
                            {Math.round(req.ai_brief_score)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>

                    {/* Title + Tags */}
                    <TableCell>
                      <Link href={`/requests/${req.id}`} className="hover:underline">
                        <div className="font-medium text-sm truncate hover:text-primary">
                          {req.title}
                        </div>
                      </Link>
                    </TableCell>

                    {/* Type */}
                    <TableCell className="hidden sm:table-cell text-xs text-muted-foreground text-center">
                      {requestType?.label}
                    </TableCell>

                    {/* Priority */}
                    <TableCell className="hidden md:table-cell text-center">
                      {priority && (
                        <Badge variant={priority.variant} size="sm">
                          {priority.label}
                        </Badge>
                      )}
                    </TableCell>

                    {/* Status */}
                    <TableCell className="hidden lg:table-cell text-center">
                      {status && (
                        <Badge variant={status.variant} size="sm">
                          {status.label}
                        </Badge>
                      )}
                    </TableCell>

                    {/* Created Date */}
                    <TableCell className="hidden xl:table-cell text-xs text-muted-foreground whitespace-nowrap text-center">
                      {new Date(req.created_at).toLocaleDateString('tr-TR', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </TableCell>

                    {/* Deadline */}
                    <TableCell className="hidden xl:table-cell text-xs whitespace-nowrap text-center">
                      {req.deadline ? (
                        <span
                          className={
                            isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'
                          }
                        >
                          {isOverdue ? '⚠ ' : ''}
                          {new Date(req.deadline).toLocaleDateString('tr-TR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                          })}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>

                    {/* Assignee */}
                    <TableCell className="text-center">
                      {assignee ? (
                        <Avatar className="w-7 h-7 mx-auto">
                          <AvatarImage src={assignee.avatar_url ?? undefined} />
                          <AvatarFallback className="text-xs">{getInitials(assignee.name)}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-7 h-7 mx-auto rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center">
                          <span className="text-xs text-muted-foreground/50">?</span>
                        </div>
                      )}
                    </TableCell>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* Seçili talepler için silme butonu */}
      {selectedIds.size > 0 && (
        <div className="flex items-center gap-3 pt-1">
          <span className="text-sm text-muted-foreground">{selectedIds.size} talep seçildi</span>
          <BulkDeleteButton
            selectedRequests={selectedRequests}
            onSuccess={handleBulkDeleteSuccess}
            onClear={() => setSelectedIds(new Set())}
            isAdmin={isAdmin}
          />
        </div>
      )}
    </div>
  )
}
