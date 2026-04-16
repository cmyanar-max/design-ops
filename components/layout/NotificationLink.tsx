'use client'

import Link from 'next/link'

interface NotificationLinkProps {
  notificationId: string
  href: string
  className: string
  isRead: boolean
  children: React.ReactNode
}

export default function NotificationLink({ notificationId, href, className, isRead, children }: NotificationLinkProps) {
  const handleClick = () => {
    if (!isRead) {
      fetch('/api/notifications/mark-read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId }),
      })
    }
  }

  return (
    <Link href={href} className={className} onClick={handleClick}>
      {children}
    </Link>
  )
}
