import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { castRows } from '@/lib/utils'
import Link from 'next/link'
import { Badge } from '@/components/ui/base-badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface ArchivedRequest {
  id: string
  title: string
  status: string
  request_type: string
  created_at: string
  completed_at: string | null
  cancelled_at: string | null
  revision_count: number
  creator: { name: string } | null
  assignee: { name: string; avatar_url: string | null } | null
}

const REQUEST_TYPE_LABELS: Record<string, string> = {
  social_post: 'Sosyal Medya',
  banner: 'Banner',
  logo: 'Logo',
  video: 'Video',
  presentation: 'Sunum',
  email_template: 'E-posta Şablonu',
  brochure: 'Broşür',
  infographic: 'İnfografik',
  other: 'Diğer',
}

export default async function ArchivePage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>
}) {
  const params = await searchParams
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: currentUser } = await supabase
    .from('users')
    .select('id, role, organization_id')
    .eq('id', authUser.id)
    .single() as { data: { id: string; role: string; organization_id: string } | null }

  if (!currentUser) redirect('/onboarding')

  let query = supabase
    .from('requests')
    .select(`
      id, title, status, request_type, created_at, completed_at, cancelled_at, revision_count,
      creator:users!requests_created_by_fkey(name),
      assignee:users!requests_assigned_to_fkey(name, avatar_url)
    `)
    .in('status', ['completed', 'archived', 'cancelled'])
    .order('created_at', { ascending: false })
    .limit(100)

  if (params.status === 'cancelled') {
    query = query.eq('status', 'cancelled')
  } else if (params.status === 'archived') {
    query = query.eq('status', 'archived')
  } else if (params.status === 'completed') {
    query = query.eq('status', 'completed')
  }

  if (currentUser.role === 'client') {
    query = query.eq('created_by', currentUser.id)
  }

  const { data: rawRequests } = await query
  const requests = castRows<ArchivedRequest>(rawRequests)

  const tabs = [
    { label: 'Tümü', value: undefined },
    { label: 'Tamamlanan', value: 'completed' },
    { label: 'Arşivlenen', value: 'archived' },
    { label: 'İptal Edilen', value: 'cancelled' },
  ]

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Arşiv</h1>
        <p className="text-sm text-muted-foreground">{requests.length} kayıt</p>
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap gap-2">
        {tabs.map(tab => (
          <Link
            key={tab.label}
            href={tab.value ? `/archive?status=${tab.value}` : '/archive'}
          >
            <Badge
              variant={params.status === tab.value || (!params.status && !tab.value) ? 'primary' : 'outline'}
              size="lg"
              shape="circle"
              className="cursor-pointer px-3"
            >
              {tab.label}
            </Badge>
          </Link>
        ))}
      </div>

      {requests.length === 0 ? (
        <div className="text-center py-16 space-y-2">
          <p className="text-4xl">🗄</p>
          <p className="font-medium">Arşiv boş</p>
          <p className="text-sm text-muted-foreground">Tamamlanan ve iptal edilen talepler burada görünür</p>
        </div>
      ) : (
        <div className="space-y-2">
          {requests.map(req => {
            const assignee = req.assignee as { name: string; avatar_url: string | null } | null
            const endDate = req.completed_at ?? req.cancelled_at
            return (
              <Link
                key={req.id}
                href={`/requests/${req.id}`}
                className="flex items-center gap-4 p-4 border border-border rounded-lg hover:bg-muted/30 transition-all opacity-80 hover:opacity-100"
              >
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{req.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-muted-foreground">
                      {REQUEST_TYPE_LABELS[req.request_type] ?? req.request_type}
                    </span>
                    {req.revision_count > 0 && (
                      <span className="text-xs text-muted-foreground">· {req.revision_count} revizyon</span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                    req.status === 'completed' ? 'bg-green-100 text-green-700' :
                    req.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {req.status === 'completed' ? 'Tamamlandı' : req.status === 'cancelled' ? 'İptal' : 'Arşiv'}
                  </span>

                  {endDate && (
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {new Date(endDate).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                  )}

                  {assignee ? (
                    <Avatar className="w-7 h-7 shrink-0">
                      <AvatarImage src={assignee.avatar_url ?? undefined} />
                      <AvatarFallback className="text-xs">{assignee.name[0]}</AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="w-7 h-7 shrink-0" />
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
