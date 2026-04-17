import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge-1'
import { Button } from '@/components/ui/button'
import { buttonVariants } from '@/components/ui/button'
import { STATUSES } from '@/lib/validations/request'
import RequestsList, { RequestRow } from '@/components/requests/RequestsList'
import RequestsCount from '@/components/requests/RequestsCount'
import { castRows } from '@/lib/utils'

const PAGE_SIZE = 25

export default async function RequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; type?: string; page?: string }>
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

  const page = Math.max(1, parseInt(params.page ?? '1', 10))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  let query = supabase
    .from('requests')
    .select(`
      id, title, status, priority, deadline, request_type, created_at, ai_brief_score, tags,
      creator:users!requests_created_by_fkey(id, name, avatar_url),
      assignee:users!requests_assigned_to_fkey(id, name, avatar_url)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to)

  if (currentUser.role === 'client') {
    query = query.eq('created_by', currentUser.id)
  }

  if (params.status) {
    query = query.eq('status', params.status)
  }

  const { data: rawRequests, count } = await query
  const requests = castRows<RequestRow>(rawRequests)
  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  const buildHref = (p: number) => {
    const qs = new URLSearchParams()
    if (params.status) qs.set('status', params.status)
    if (p > 1) qs.set('page', String(p))
    return `/requests${qs.toString() ? `?${qs}` : ''}`
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Başlık + Yeni Talep */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">
            {currentUser.role === 'client' ? 'Taleplerim' : 'Tasarım Talepleri'}
          </h1>
          <RequestsCount initialCount={count ?? 0} />
        </div>
        {currentUser.role !== 'designer' && (
          <Link href="/requests/new">
            <Button size="lg">+ Yeni Talep</Button>
          </Link>
        )}
      </div>

      {/* Filtreler */}
      <div className="flex flex-wrap gap-2">
        <Link href="/requests">
          <Badge
            variant={!params.status ? 'blue' : 'pill'}
            size="md"
            className="cursor-pointer"
          >
            Tümü
          </Badge>
        </Link>
        {STATUSES.filter(s => !['archived', 'cancelled'].includes(s.value)).map(s => (
          <Link key={s.value} href={`/requests?status=${s.value}`}>
            <Badge
              variant={params.status === s.value ? s.variant : 'pill'}
              size="md"
              className="cursor-pointer"
            >
              {s.label}
            </Badge>
          </Link>
        ))}
      </div>

      {/* Talep Listesi — Realtime durumu takip eder */}
      <RequestsList
        initialRequests={requests}
        orgId={currentUser.organization_id}
        isAdmin={currentUser.role === 'admin'}
      />

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-2">
          {page > 1 && (
            <Link href={buildHref(page - 1)} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              ← Önceki
            </Link>
          )}
          <span className="text-sm text-muted-foreground px-2">
            {page} / {totalPages}
          </span>
          {page < totalPages && (
            <Link href={buildHref(page + 1)} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
              Sonraki →
            </Link>
          )}
        </div>
      )}
    </div>
  )
}
