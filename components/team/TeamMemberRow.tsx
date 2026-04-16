'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from 'sonner'
import { getInitials } from '@/lib/utils'
import { Badge } from '@/components/ui/base-badge'

const ROLE_LABELS: Record<string, string> = { admin: 'Yönetici', designer: 'Tasarımcı', client: 'Proje Yönetici' }
const ROLE_VARIANT: Record<string, { variant: 'info' | 'primary' | 'success', appearance: 'light' }> = {
  admin: { variant: 'info', appearance: 'light' },
  designer: { variant: 'primary', appearance: 'light' },
  client: { variant: 'success', appearance: 'light' },
}
const STATUS_VARIANT: Record<string, { variant: 'success' | 'warning' | 'destructive' | 'secondary', appearance: 'light' }> = {
  active: { variant: 'success', appearance: 'light' },
  invited: { variant: 'warning', appearance: 'light' },
  suspended: { variant: 'destructive', appearance: 'light' },
  deactivated: { variant: 'secondary', appearance: 'light' },
}
const STATUS_LABELS: Record<string, string> = {
  active: 'Aktif',
  invited: 'Davetli',
  suspended: 'Askıya alındı',
  deactivated: 'Deaktif',
}

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  status: string
  avatar_url: string | null
  last_login_at: string | null
}

interface TeamMemberRowProps {
  member: TeamMember
  currentUserId: string
}

export default function TeamMemberRow({ member, currentUserId }: TeamMemberRowProps) {
  const [role, setRole] = useState(member.role)
  const [updating, setUpdating] = useState(false)
  const router = useRouter()
  const isSelf = member.id === currentUserId

  const handleRoleChange = async (newRole: string | null) => {
    if (!newRole || newRole === role) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/team/${member.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Rol güncellenemedi')
      }
      setRole(newRole)
      toast.success(`${member.name} rolü güncellendi`)
      router.refresh()
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="flex items-center gap-4 px-4 py-3">
      <Avatar className="w-9 h-9 shrink-0">
        <AvatarImage src={member.avatar_url ?? undefined} />
        <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate leading-tight">
          {member.name}
          {isSelf && (
            <span className="ml-1.5 text-xs text-muted-foreground">(sen)</span>
          )}
        </p>
        <p className="text-xs text-muted-foreground truncate leading-tight">{member.email}</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        {isSelf ? (
          <Badge {...(ROLE_VARIANT[role] ?? { variant: 'secondary', appearance: 'light' })} size="sm">
            {ROLE_LABELS[role] ?? role}
          </Badge>
        ) : (
          <Select value={role} onValueChange={handleRoleChange} disabled={updating}>
            <SelectTrigger className="h-7 text-xs w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Yönetici</SelectItem>
              <SelectItem value="designer">Tasarımcı</SelectItem>
              <SelectItem value="client">Proje Yönetici</SelectItem>
            </SelectContent>
          </Select>
        )}
        <Badge {...(STATUS_VARIANT[member.status] ?? { variant: 'secondary', appearance: 'light' })} size="sm">
          {STATUS_LABELS[member.status] ?? member.status}
        </Badge>
      </div>
      <div className="text-xs text-muted-foreground hidden md:block w-28 text-right shrink-0">
        {member.last_login_at
          ? new Date(member.last_login_at).toLocaleDateString('tr-TR')
          : 'Giriş yok'}
      </div>
    </div>
  )
}
