import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { castRows } from '@/lib/utils'
import MarkAllReadButton from '@/components/layout/MarkAllReadButton'
import NotificationLink from '@/components/layout/NotificationLink'

interface Notification {
  id: string
  type: string
  title: string
  body: string | null
  data: Record<string, string>
  read_at: string | null
  created_at: string
}

const TYPE_ICONS: Record<string, string> = {
  request_assigned: '📋',
  status_changed: '🔄',
  comment_added: '💬',
  revision_requested: '✏️',
  approved: '✅',
  mention: '@',
  deadline_reminder: '⏰',
  join_request: '👤',
  account_approved: '✓',
}

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: rawNotifs } = await supabase
    .from('notifications')
    .select('id, type, title, body, data, read_at, created_at')
    .eq('user_id', authUser.id)
    .order('created_at', { ascending: false })
    .limit(50)

  const notifications = castRows<Notification>(rawNotifs)
  const unreadCount = notifications.filter(n => !n.read_at).length

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Bildirimler</h1>
          <p className="text-sm text-muted-foreground">
            {unreadCount > 0 ? `${unreadCount} okunmamış` : 'Tümü okundu'}
          </p>
        </div>
        {unreadCount > 0 && <MarkAllReadButton userId={authUser.id} />}
      </div>

      {notifications.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <p className="text-4xl">🔔</p>
          <p className="font-medium">Henüz bildirim yok</p>
          <p className="text-sm text-muted-foreground">Talep güncellemeleri ve yorumlar burada görünür</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(notif => {
            const requestId = notif.data?.request_id
            const isClickable = requestId || notif.type === 'join_request'
            const itemClass = `flex items-start gap-3 p-4 rounded-lg border transition-colors ${
              notif.read_at
                ? 'border-border bg-background opacity-70'
                : 'border-primary/20 bg-primary/5'
            } ${isClickable ? 'hover:bg-muted/50 cursor-pointer' : ''}`
            const inner = (
              <>
                <span className="text-lg shrink-0 mt-0.5">{TYPE_ICONS[notif.type] ?? '🔔'}</span>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${notif.read_at ? '' : 'font-semibold'}`}>{notif.title}</p>
                  {notif.body && (
                    <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{notif.body}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {new Date(notif.created_at).toLocaleString('tr-TR', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {!notif.read_at && (
                  <div className="w-2 h-2 rounded-full bg-primary shrink-0 mt-1.5" />
                )}
              </>
            )

            const href = (() => {
              if (requestId) return `/requests/${requestId}`
              if (notif.type === 'join_request') return '/team'
              return null
            })()

            return href ? (
              <NotificationLink key={notif.id} notificationId={notif.id} href={href} className={itemClass} isRead={!!notif.read_at}>
                {inner}
              </NotificationLink>
            ) : (
              <div key={notif.id} className={itemClass}>
                {inner}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
