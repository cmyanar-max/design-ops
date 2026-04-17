'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import { cn, getInitials } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge-1'
import { User } from '@/types/database'

interface AppSidebarProps {
  user: User & { organization?: { name: string; plan: string } | null }
}


function NavItem({ href, icon, label, badge }: {
  href: string
  icon: React.ReactNode
  label: string
  badge?: number
}) {
  const pathname = usePathname()
  const isActive = pathname === href || (href !== '/dashboard' && pathname.startsWith(href))

  return (
    <Link
      href={href}
      className={cn(
        'flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-150 overflow-hidden',
        isActive
          ? 'sidebar-nav-active bg-sidebar-accent text-sidebar-primary pl-5'
          : 'text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/60'
      )}
    >
      <span className="w-4 h-4 shrink-0">{icon}</span>
      <span className="flex-1">{label}</span>
      {badge !== undefined && badge > 0 && (
        <Badge
          variant={isActive ? 'blue' : 'pill'}
          size="xs"
          className={cn(
            isActive
              ? 'bg-sidebar-primary/20 text-sidebar-primary border-sidebar-primary/30'
              : 'border-sidebar-border text-sidebar-foreground/50'
          )}
        >
          {badge > 99 ? '99+' : badge}
        </Badge>
      )}
    </Link>
  )
}

const Icons = {
  dashboard: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    </svg>
  ),
  requests: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
    </svg>
  ),
  kanban: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
    </svg>
  ),
  brands: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
    </svg>
  ),
  team: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
    </svg>
  ),
  archive: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
    </svg>
  ),
  settings: (
    <svg fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
}

export default function AppSidebar({ user }: AppSidebarProps) {
  const isAdmin = user.role === 'admin'
  const isClient = user.role === 'client'

  const initials = getInitials(user.name)

  return (
    <aside className="w-56 shrink-0 border-r border-sidebar-border flex flex-col h-full bg-sidebar">
      {/* Logo */}
      <div className="px-4 h-12 border-b border-sidebar-border flex items-center">
        <Image
          src="/do_logo.svg"
          alt="DesignOps Logo"
          width={110}
          height={24}
          priority
          className="h-6 w-auto"
        />
      </div>

      {/* Navigasyon */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        <NavItem href="/dashboard" icon={Icons.dashboard} label="Dashboard" />
        <NavItem href="/requests" icon={Icons.requests} label={isClient ? 'Taleplerim' : 'Talepler'} />
        <NavItem href="/kanban" icon={Icons.kanban} label="Kanban Board" />
        {!isClient && (
          <NavItem href="/brands" icon={Icons.brands} label="Markalar" />
        )}
        {(isAdmin || isClient) && (
          <NavItem href="/team" icon={Icons.team} label="Ekip" />
        )}
        {!isClient && (
          <NavItem href="/archive" icon={Icons.archive} label="Arşiv" />
        )}

        <div className="pt-2 border-t border-sidebar-border mt-2">
          <NavItem href="/settings" icon={Icons.settings} label="Ayarlar" />
        </div>
      </nav>

      {/* Kullanıcı bilgisi */}
      <div className="p-3 border-t border-sidebar-border">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-sidebar-accent/60 transition-colors cursor-pointer">
          <Avatar className="w-7 h-7">
            <AvatarImage src={user.avatar_url ?? undefined} />
            <AvatarFallback className="text-xs bg-sidebar-primary/20 text-sidebar-primary">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium truncate text-sidebar-foreground">{user.name}</p>
            <p className="text-xs text-sidebar-foreground/50 capitalize">{
              user.role === 'admin' ? 'Yönetici' :
              user.role === 'designer' ? 'Tasarımcı' : 'Proje Yönetici'
            }</p>
          </div>
        </div>
      </div>
    </aside>
  )
}
