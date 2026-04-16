import { redirect } from 'next/navigation'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getInitials } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/base-badge'
import InviteTeamMember from '@/components/team/InviteTeamMember'
import ApproveUserButton from '@/components/team/ApproveUserButton'
import RejectUserButton from '@/components/team/RejectUserButton'
import TeamMemberRow from '@/components/team/TeamMemberRow'

interface TeamMember {
  id: string
  name: string
  email: string
  role: string
  status: string
  avatar_url: string | null
  last_login_at: string | null
  created_at: string
}

interface Invitation {
  id: string
  email: string
  role: string
  expires_at: string
  created_at: string
}

const ROLE_LABELS: Record<string, string> = { admin: 'Yönetici', designer: 'Tasarımcı', client: 'Proje Yönetici' }
const ROLE_VARIANT: Record<string, { variant: 'info' | 'primary' | 'success', appearance: 'light' }> = {
  admin: { variant: 'info', appearance: 'light' },
  designer: { variant: 'primary', appearance: 'light' },
  client: { variant: 'success', appearance: 'light' },
}

export default async function TeamPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: currentUser } = await supabase
    .from('users')
    .select('id, role, organization_id')
    .eq('id', authUser.id)
    .single() as { data: { id: string; role: string; organization_id: string } | null }

  if (!currentUser) redirect('/requests')

  const isAdmin = currentUser.role === 'admin'
  const isClient = currentUser.role === 'client'

  // Müşteri olmayan ve admin olmayan roller buraya erişemez
  if (!isAdmin && !isClient) redirect('/requests')

  const { data: members } = await supabase
    .from('users')
    .select('id, name, email, role, status, avatar_url, last_login_at, created_at')
    .eq('organization_id', currentUser.organization_id)
    .order('created_at', { ascending: true })

  const allMembers = (members ?? []) as TeamMember[]
  const activeMembers = allMembers.filter(m => m.status === 'active')

  // Katılım istekleri: isteyen kullanıcının organization_id'si NULL olduğu için
  // users tablosundaki RLS politikası admin'in onu görmesini engelliyor.
  // Bu yüzden yalnızca admin görünümünde service role ile çekiyoruz.
  interface JoinRequestRow {
    id: string
    user_id: string
    role: string
    created_at: string
  }
  interface JoinRequestUser {
    id: string
    name: string
    email: string
    avatar_url: string | null
  }

  let joinReqMembers: TeamMember[] = []
  if (isAdmin) {
    const adminClient = createAdminClient()
    const { data: rawJoinReqs } = await adminClient
      .from('join_requests')
      .select('id, user_id, role, created_at')
      .eq('org_id', currentUser.organization_id)
      .eq('status', 'pending')
      .order('created_at', { ascending: true })

    const joinReqRows = (rawJoinReqs ?? []) as JoinRequestRow[]
    const userIds = joinReqRows.map(jr => jr.user_id)

    const userMap = new Map<string, JoinRequestUser>()
    if (userIds.length > 0) {
      const { data: joinUsers } = await adminClient
        .from('users')
        .select('id, name, email, avatar_url')
        .in('id', userIds)
      for (const u of (joinUsers ?? []) as JoinRequestUser[]) {
        userMap.set(u.id, u)
      }
    }

    joinReqMembers = joinReqRows
      .map((jr): TeamMember | null => {
        const u = userMap.get(jr.user_id)
        if (!u) return null
        return {
          id: u.id,
          name: u.name,
          email: u.email,
          role: jr.role,
          status: 'pending_approval',
          avatar_url: u.avatar_url,
          last_login_at: null,
          created_at: jr.created_at,
        }
      })
      .filter((m): m is TeamMember => m !== null)
  }

  // Müşteri: sadece aktif üyeleri göster (salt okunur)
  if (isClient) {
    return (
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Ekibim</h1>
          <p className="text-sm text-muted-foreground">Çalıştığınız ekip üyeleri</p>
        </div>

        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-border">
              {activeMembers.map(member => (
                <div key={member.id} className="flex items-center gap-4 px-4 py-3">
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarImage src={member.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">
                      {member.name}
                      {member.id === authUser.id && (
                        <span className="ml-1.5 text-xs text-muted-foreground">(sen)</span>
                      )}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                  </div>
                  <Badge {...(ROLE_VARIANT[member.role] ?? { variant: 'secondary', appearance: 'light' })} size="sm">
                    {ROLE_LABELS[member.role] ?? member.role}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Admin görünümü
  // Onay bekleyenler: davet ile gelenler (invited) + katılım isteği gönderenler (pending_approval)
  const pendingApprovals = [
    ...allMembers.filter(m => m.status === 'invited'),
    ...joinReqMembers,
  ]
  const teamMembers = allMembers.filter(m => m.status !== 'invited' && m.status !== 'pending_approval')

  const [{ data: invitations }] = await Promise.all([
    supabase
      .from('invitations')
      .select('id, email, role, expires_at, created_at')
      .eq('organization_id', currentUser.organization_id)
      .is('accepted_at', null)
      .gte('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false }),
  ])

  const pendingInvites = (invitations ?? []) as Invitation[]

  const counts = { admin: 0, designer: 0, client: 0 }
  teamMembers.forEach(m => { if (m.role in counts) counts[m.role as keyof typeof counts]++ })

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Ekip Yönetimi</h1>
          <p className="text-sm text-muted-foreground">{teamMembers.length} üye</p>
        </div>
        <div className="ml-auto">
          <InviteTeamMember />
        </div>
      </div>

      {/* Onay bekleyen üyeler */}
      {pendingApprovals.length > 0 && (
        <Card className="border-amber-200 bg-amber-50/50">
          <CardHeader className="pt-2 pb-0 px-6">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base text-amber-800">Onay Bekleyenler</CardTitle>
              <span className="text-xs font-semibold bg-amber-200 text-amber-800 px-2 py-0.5 rounded-full">
                {pendingApprovals.length}
              </span>
            </div>
            <p className="text-xs text-amber-700">
              Bu kullanıcılar hesap oluşturdu, onayınızı bekliyor.
            </p>
          </CardHeader>
          <CardContent className="px-0 pt-3 pb-3">
            <div className="divide-y divide-amber-100">
              {pendingApprovals.map(member => (
                <div key={member.id} className="flex items-center gap-4 px-4 py-3">
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarImage src={member.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs">{getInitials(member.name)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{member.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{member.email}</p>
                  </div>
                  <Badge {...(ROLE_VARIANT[member.role] ?? { variant: 'secondary', appearance: 'light' })} size="sm">
                    {ROLE_LABELS[member.role] ?? member.role}
                  </Badge>
                  <div className="flex gap-2">
                    <ApproveUserButton userId={member.id} userName={member.name} />
                    <RejectUserButton userId={member.id} userName={member.name} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Özet kartları */}
      <div className="grid grid-cols-3 gap-4">
        {(Object.entries(counts) as [string, number][]).map(([role, count]) => (
          <Card key={role}>
            <CardContent className="py-4 flex flex-col items-center justify-center text-center">
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{ROLE_LABELS[role]}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Ekip listesi */}
      <div>
        <h2 className="font-heading text-2xl font-bold tracking-tight mb-3">Üyeler</h2>
        <Card>
        <CardContent className="px-0 py-0">
          <div className="divide-y divide-border">
            {teamMembers.map(member => (
              <TeamMemberRow
                key={member.id}
                member={member}
                currentUserId={authUser.id}
              />
            ))}
          </div>
        </CardContent>
        </Card>
      </div>

      {/* Bekleyen davetler */}
      {pendingInvites.length > 0 && (
        <Card>
          <CardHeader className="pt-2 pb-0 px-6">
            <CardTitle className="text-base">Bekleyen Davetler</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 pt-3">
            <div className="divide-y divide-border">
              {pendingInvites.map(invite => (
                <div key={invite.id} className="flex items-center gap-4 px-4 py-3">
                  <div className="w-9 h-9 rounded-full border-2 border-dashed border-muted-foreground/30 flex items-center justify-center shrink-0">
                    <svg className="w-4 h-4 text-muted-foreground/50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{invite.email}</p>
                    <p className="text-xs text-muted-foreground">
                      Son geçerlilik: {new Date(invite.expires_at).toLocaleDateString('tr-TR')}
                    </p>
                  </div>
                  <Badge {...(ROLE_VARIANT[invite.role] ?? { variant: 'secondary', appearance: 'light' })} size="sm">
                    {ROLE_LABELS[invite.role] ?? invite.role}
                  </Badge>
                  <Badge variant="warning" appearance="light" size="sm">Bekleniyor</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
