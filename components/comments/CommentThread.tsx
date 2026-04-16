'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/base-badge'
import { toast } from 'sonner'
import { CommentWithUser } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'
import { cn, getInitials } from '@/lib/utils'

interface CommentThreadProps {
  requestId: string
  currentUserId: string
  isDesignerOrAdmin: boolean
}

export default function CommentThread({ requestId, currentUserId, isDesignerOrAdmin }: CommentThreadProps) {
  const [comments, setComments] = useState<CommentWithUser[]>([])
  const [loading, setLoading] = useState(true)
  const [realtimeError, setRealtimeError] = useState(false)
  const [body, setBody] = useState('')
  const [isInternal, setIsInternal] = useState(false)
  const [commentType, setCommentType] = useState<'general' | 'revision_request' | 'approval'>('general')
  const [submitting, setSubmitting] = useState(false)
  const [replyTo, setReplyTo] = useState<string | null>(null)
  const supabase = createClient()

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select(`
        *,
        author:users(id, name, avatar_url, role)
      `)
      .eq('request_id', requestId)
      .is('parent_id', null)
      .order('created_at', { ascending: true })

    if (data) setComments(data as CommentWithUser[])
    setLoading(false)
  }

  useEffect(() => {
    fetchComments()

    const channel = supabase
      .channel(`comments:${requestId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'comments',
        filter: `request_id=eq.${requestId}`,
      }, () => { fetchComments() })
      .subscribe((status) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          setRealtimeError(true)
        } else if (status === 'SUBSCRIBED') {
          setRealtimeError(false)
        }
      })

    return () => { supabase.removeChannel(channel) }
  }, [requestId]) // eslint-disable-line react-hooks/exhaustive-deps

  const submitComment = async () => {
    if (!body.trim()) return
    setSubmitting(true)
    try {
      const { error } = await supabase.from('comments').insert({
        request_id: requestId,
        user_id: currentUserId,
        body: body.trim(),
        is_internal: isInternal,
        comment_type: commentType,
        parent_id: replyTo,
      })
      if (error) throw error
      setBody('')
      setReplyTo(null)
      setIsInternal(false)
      setCommentType('general')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Yorum gönderilemedi')
    } finally {
      setSubmitting(false)
    }
  }

  const resolveComment = async (commentId: string, resolved: boolean) => {
    const { error } = await supabase
      .from('comments')
      .update({ is_resolved: resolved, resolved_at: resolved ? new Date().toISOString() : null, resolved_by: resolved ? currentUserId : null })
      .eq('id', commentId)

    if (!error) {
      setComments(prev => prev.map(c => c.id === commentId ? { ...c, is_resolved: resolved } : c))
    }
  }

  if (loading) {
    return (
      <div className="space-y-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-muted shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-muted rounded w-24" />
              <div className="h-12 bg-muted rounded" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {realtimeError && (
        <div className="flex items-center gap-2 text-xs bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-amber-700">
          <svg className="w-3.5 h-3.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          Canlı güncelleme bağlantısı kesildi. Sayfayı yenileyerek yeni yorumları görebilirsiniz.
        </div>
      )}

      {/* Yorum listesi */}
      <div className="space-y-4">
        {comments.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">
            Henüz yorum yok. İlk yorumu siz yapın!
          </p>
        )}
        {comments.map(comment => (
          <CommentItem
            key={comment.id}
            comment={comment}
            currentUserId={currentUserId}
            isDesignerOrAdmin={isDesignerOrAdmin}
            onReply={() => setReplyTo(comment.id)}
            onResolve={resolveComment}
          />
        ))}
      </div>

      {/* Yorum formu */}
      <div className="border border-border rounded-lg p-3 space-y-3">
        {replyTo && (
          <div className="flex items-center justify-between text-sm bg-muted rounded px-2 py-1">
            <span className="text-muted-foreground">Yoruma yanıt veriyorsunuz</span>
            <button onClick={() => setReplyTo(null)} className="text-muted-foreground hover:text-foreground">×</button>
          </div>
        )}

        <Textarea
          placeholder={isInternal ? 'İç not (yalnızca ekip görür)...' : 'Yorum yazın...'}
          value={body}
          onChange={e => setBody(e.target.value)}
          rows={3}
          className={cn('text-sm', isInternal && 'bg-yellow-50 border-yellow-200')}
        />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Yorum tipi */}
            <select
              value={commentType}
              onChange={e => setCommentType(e.target.value as 'general' | 'revision_request')}
              className="text-xs border border-border rounded px-2 py-1 bg-background"
            >
              <option value="general">Genel Yorum</option>
              <option value="revision_request">Revizyon İsteği</option>
              {isDesignerOrAdmin && <option value="approval">Onay</option>}
            </select>

            {/* İç not toggle (yalnızca designer/admin) */}
            {isDesignerOrAdmin && (
              <button
                type="button"
                onClick={() => setIsInternal(!isInternal)}
                className={cn(
                  'text-xs px-2 py-1 rounded border transition-colors',
                  isInternal
                    ? 'bg-yellow-100 border-yellow-300 text-yellow-700'
                    : 'border-border text-muted-foreground hover:text-foreground'
                )}
              >
                🔒 {isInternal ? 'İç Not' : 'Herkese Açık'}
              </button>
            )}
          </div>

          <Button size="sm" onClick={submitComment} disabled={!body.trim() || submitting}>
            {submitting ? 'Gönderiliyor...' : 'Gönder'}
          </Button>
        </div>
      </div>
    </div>
  )
}

function CommentItem({ comment, currentUserId, isDesignerOrAdmin, onReply, onResolve }: {
  comment: CommentWithUser
  currentUserId: string
  isDesignerOrAdmin: boolean
  onReply: () => void
  onResolve: (id: string, resolved: boolean) => void
}) {
  const author = comment.author as { id: string; name: string; avatar_url: string | null; role: string }

  const commentTypeVariant: Record<string, { variant: 'warning' | 'success' | 'destructive' | 'info', appearance: 'light' }> = {
    revision_request: { variant: 'warning', appearance: 'light' },
    approval: { variant: 'success', appearance: 'light' },
    rejection: { variant: 'destructive', appearance: 'light' },
    ai_suggestion: { variant: 'info', appearance: 'light' },
  }

  const commentTypeLabels: Record<string, string> = {
    revision_request: 'Revizyon İsteği',
    approval: 'Onay',
    rejection: 'Red',
    ai_suggestion: '🤖 AI Önerisi',
  }

  return (
    <div className={cn(
      'flex gap-3',
      comment.is_internal && 'bg-yellow-50/50 rounded-lg p-2 border border-yellow-100',
      comment.is_resolved && 'opacity-60'
    )}>
      <Avatar className="w-8 h-8 shrink-0">
        <AvatarImage src={author?.avatar_url ?? undefined} />
        <AvatarFallback className="text-xs">{getInitials(author?.name)}</AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{author?.name}</span>
          {comment.is_internal && (
            <Badge variant="warning" appearance="light" size="sm">İç Not</Badge>
          )}
          {comment.comment_type !== 'general' && commentTypeVariant[comment.comment_type] && (
            <Badge {...commentTypeVariant[comment.comment_type]} size="sm">
              {commentTypeLabels[comment.comment_type]}
            </Badge>
          )}
          {comment.is_resolved && (
            <Badge variant="success" appearance="light" size="sm">✓ Çözüldü</Badge>
          )}
          <span className="text-xs text-muted-foreground ml-auto">
            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: tr })}
          </span>
        </div>

        <p className="text-sm mt-1 whitespace-pre-wrap">{comment.body}</p>

        <div className="flex items-center gap-3 mt-2">
          <button onClick={onReply} className="text-xs text-muted-foreground hover:text-foreground">
            Yanıtla
          </button>
          {isDesignerOrAdmin && comment.comment_type === 'revision_request' && (
            <button
              onClick={() => onResolve(comment.id, !comment.is_resolved)}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              {comment.is_resolved ? 'Çözümü Geri Al' : 'Çözüldü Olarak İşaretle'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
