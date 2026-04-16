'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button, buttonVariants } from '@/components/ui/button'
import { Badge } from '@/components/ui/base-badge'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Notification } from '@/types/database'
import { formatDistanceToNow } from 'date-fns'
import { tr } from 'date-fns/locale'

interface NotificationBellProps {
  userId: string
  variant?: 'topbar' | 'sidebar'
  isCollapsed?: boolean
  isActive?: boolean
}

export default function NotificationBell({ userId, variant = 'topbar', isCollapsed = false, isActive = false }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [open, setOpen] = useState(false)
  const supabase = createClient()

  const unreadCount = notifications.filter(n => !n.read_at).length

  const fetchNotifications = async () => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20)

    if (data) setNotifications(data)
  }

  const markAllRead = async () => {
    await fetch('/api/notifications/mark-read', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) })
    setNotifications(prev => prev.map(n => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })))
  }

  const markOneRead = async (notificationId: string) => {
    await fetch('/api/notifications/mark-read', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ notificationId }),
    })
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, read_at: n.read_at ?? new Date().toISOString() } : n))
  }

  const getNotificationHref = (n: Notification): string | null => {
    const data = n.data as Record<string, string> | null
    if (data?.request_id) return `/requests/${data.request_id}`
    return null
  }

  useEffect(() => {
    fetchNotifications()

    // Realtime subscription
    const channel = supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, () => {
        // Realtime event geldiğinde tüm listeyi yenile (payload.new yerine)
        fetchNotifications()
      })
      .subscribe()

    // Realtime güvenilmez olduğunda fallback: her 15 saniyede bir yenile
    const poll = setInterval(fetchNotifications, 15000)

    return () => {
      supabase.removeChannel(channel)
      clearInterval(poll)
    }
  }, [userId]) // eslint-disable-line react-hooks/exhaustive-deps

  const notificationTypeLabels: Record<string, string> = {
    request_assigned: 'Talep Atandı',
    status_changed: 'Durum Değişti',
    comment_added: 'Yeni Yorum',
    revision_requested: 'Revizyon İstendi',
    approved: 'Onaylandı',
    mention: 'Bahsedildiniz',
    deadline_reminder: 'Yaklaşan Tarih',
  }

  if (variant === 'sidebar') {
    return (
      <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) fetchNotifications() }}>
        <PopoverTrigger className={`
            w-full flex items-center space-x-2.5 px-3 py-2.5 rounded-md text-left transition-all duration-200 group relative
            ${isActive ? 'bg-secondary text-primary' : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'}
            ${isCollapsed ? 'justify-center px-2' : ''}
          `}>
            <div className="flex items-center justify-center min-w-[24px] relative">
              <svg className={`h-[18px] w-[18px] flex-shrink-0 ${isActive ? 'text-primary' : 'text-slate-500 group-hover:text-slate-700'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 h-4 w-4 flex items-center justify-center rounded-full bg-primary text-primary-foreground text-[10px] font-medium">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </div>

            {!isCollapsed && (
              <div className="flex items-center justify-between w-full">
                <span className={`text-sm ${isActive ? 'font-medium' : 'font-normal'}`}>Bildirimler</span>
                {unreadCount > 0 && (
                  <span className={`px-1.5 py-0.5 text-xs font-medium rounded-full ${isActive ? 'bg-primary/10 text-primary' : 'bg-slate-100 text-slate-600'}`}>
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
            )}

            {/* Tooltip for collapsed state */}
            {isCollapsed && (
              <div className="absolute left-full ml-2 px-2 py-1 bg-slate-800 text-white text-xs rounded opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50">
                Bildirimler
                {unreadCount > 0 && (
                  <span className="ml-1.5 px-1 py-0.5 bg-slate-700 rounded-full text-[10px]">{unreadCount}</span>
                )}
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 -translate-x-1 w-1.5 h-1.5 bg-slate-800 rotate-45" />
              </div>
            )}
        </PopoverTrigger>
        <PopoverContent side="right" align="start" sideOffset={8} className="w-80 p-0">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-semibold text-sm">Bildirimler</h3>
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="text-xs h-6" onClick={markAllRead}>
                Tümünü okundu işaretle
              </Button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="flex items-center justify-center text-sm text-muted-foreground py-8">
                Bildirim yok
              </div>
            ) : (
              <div className="divide-y">
                {notifications.map((n) => {
                  const href = getNotificationHref(n)
                  const content = (
                    <div className="flex items-start gap-2">
                      {!n.read_at && (
                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-muted-foreground">
                          {notificationTypeLabels[n.type] ?? n.type}
                        </p>
                        <p className="text-sm font-medium">{n.title}</p>
                        {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: tr })}
                        </p>
                      </div>
                    </div>
                  )
                  const className = `block px-4 py-3 hover:bg-muted/50 transition-colors ${!n.read_at ? 'bg-primary/5' : ''} ${href ? 'cursor-pointer' : ''}`
                  return href ? (
                    <Link key={n.id} href={href} className={className} onClick={() => { if (!n.read_at) markOneRead(n.id); setOpen(false) }}>
                      {content}
                    </Link>
                  ) : (
                    <div key={n.id} className={className}>
                      {content}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          <div className="px-4 py-2 border-t">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className={buttonVariants({ variant: 'ghost', size: 'sm' }) + ' w-full text-xs'}
            >
              Tüm bildirimleri gör
            </Link>
          </div>
        </PopoverContent>
      </Popover>
    )
  }

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) fetchNotifications() }}>
      <PopoverTrigger className="relative inline-flex items-center justify-center h-8 w-8 rounded-lg hover:bg-muted transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {unreadCount > 0 && (
            <Badge variant="destructive" size="xs" shape="circle" className="absolute -top-1 -right-1">
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="flex items-center justify-between px-4 py-3 border-b">
          <h3 className="font-semibold text-sm">Bildirimler</h3>
          {unreadCount > 0 && (
            <Button variant="ghost" size="sm" className="text-xs h-6" onClick={markAllRead}>
              Tümünü okundu işaretle
            </Button>
          )}
        </div>

        <div className="max-h-80 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex items-center justify-center text-sm text-muted-foreground py-8">
              Bildirim yok
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((n) => {
                const href = getNotificationHref(n)
                const content = (
                  <div className="flex items-start gap-2">
                    {!n.read_at && (
                      <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-muted-foreground">
                        {notificationTypeLabels[n.type] ?? n.type}
                      </p>
                      <p className="text-sm font-medium">{n.title}</p>
                      {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: tr })}
                      </p>
                    </div>
                  </div>
                )
                const className = `block px-4 py-3 hover:bg-muted/50 transition-colors ${!n.read_at ? 'bg-primary/5' : ''} ${href ? 'cursor-pointer' : ''}`
                return href ? (
                  <Link key={n.id} href={href} className={className} onClick={() => { if (!n.read_at) markOneRead(n.id); setOpen(false) }}>
                    {content}
                  </Link>
                ) : (
                  <div key={n.id} className={className}>
                    {content}
                  </div>
                )
              })}
            </div>
          )}
        </div>

        <div className="px-4 py-2 border-t">
          <Link
            href="/notifications"
            onClick={() => setOpen(false)}
            className={buttonVariants({ variant: 'ghost', size: 'sm' }) + ' w-full text-xs'}
          >
            Tüm bildirimleri gör
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  )
}
