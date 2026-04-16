import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { castRows } from '@/lib/utils'

interface RecentRequest {
  id: string
  title: string
  status: string
  priority: string
  request_type: string
  deadline: string | null
  created_at: string
  ai_brief_score: number | null
  tags: string[]
  creator: { name: string } | null
  assignee: { name: string; avatar_url: string | null } | null
}
import { getDashboardStatsByPeriod, getRequestsByType, getDesignerWorkload } from '@/lib/supabase/queries/analytics'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import RequestsByTypeChart from '@/components/dashboard/RequestsByTypeChart'
import PeriodSelector from '@/components/dashboard/PeriodSelector'
import { StatsCards } from '@/components/ui/stats-cards'
import Link from 'next/link'
import { STATUSES, PRIORITIES, REQUEST_TYPES } from '@/lib/validations/request'
import { Badge } from '@/components/ui/base-badge'
import { getInitials } from '@/lib/utils'
import { Suspense } from 'react'

const PERIOD_DAYS: Record<string, number> = {
  daily: 1,
  weekly: 7,
  monthly: 30,
  yearly: 365,
  all: 0,
}

const PERIOD_LABELS: Record<string, string> = {
  daily: 'Bugün',
  weekly: 'Son 7 Gün',
  monthly: 'Son 30 Gün',
  yearly: 'Son 365 Gün',
  all: 'Tüm Zamanlar',
}

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>
}) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: currentUser } = await supabase
    .from('users')
    .select('id, role, organization_id')
    .eq('id', authUser.id)
    .single() as { data: { id: string; role: string; organization_id: string } | null }

  if (!currentUser) {
    redirect('/requests')
  }

  const orgId = currentUser.organization_id
  const resolvedParams = await searchParams
  const period = resolvedParams?.period ?? 'monthly'
  const days = PERIOD_DAYS[period] ?? 30

  const [stats, byType, workload, recentRequests] = await Promise.all([
    getDashboardStatsByPeriod(orgId, days).catch(() => null),
    getRequestsByType(orgId, days === 0 ? 365 : days).catch(() => []),
    getDesignerWorkload(orgId).catch(() => []),
    supabase
      .from('requests')
      .select(`
        id, title, status, priority, request_type, deadline, created_at, ai_brief_score, tags,
        creator:users!requests_created_by_fkey(name),
        assignee:users!requests_assigned_to_fkey(name, avatar_url)
      `)
      .order('created_at', { ascending: false })
      .limit(8)
      .then(({ data }) => castRows<RecentRequest>(data)),
  ])

  const statCards = stats ? [
    { label: 'Toplam Talep', value: stats.total_requests },
    { label: 'Aktif Tasarım', value: stats.active_designs },
    { label: 'Onay Bekleyen', value: stats.pending_approvals },
    { label: 'Tamamlanan', value: stats.completed },
  ] : []

  const periodLabel = PERIOD_LABELS[period] ?? 'Son 30 Gün'

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="font-heading text-2xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-sm">{periodLabel} özeti</p>
        </div>
        <Suspense fallback={<div className="h-9 w-64 bg-muted rounded-lg animate-pulse" />}>
          <PeriodSelector />
        </Suspense>
      </div>

      {/* Stats Kartları */}
      {statCards.length > 0 && <StatsCards cards={statCards} />}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Talep Tipi Grafiği */}
        <Card className="lg:col-span-2">
          <CardHeader className="pt-2 pb-0 px-6">
            <CardTitle className="text-base">Talep Tipi Dağılımı ({periodLabel})</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {byType.length > 0 ? (
              <RequestsByTypeChart data={byType} />
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">Henüz talep yok</p>
            )}
          </CardContent>
        </Card>

        {/* Designer İş Yükü */}
        <Card>
          <CardHeader className="pt-2 pb-0 px-6">
            <CardTitle className="text-base">Designer İş Yükü</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6">
            {workload.length === 0 ? (
              <p className="text-sm text-muted-foreground">Designer bulunmuyor</p>
            ) : (
              <div className="space-y-3">
                {workload.map(w => (
                  <div key={w.user_id} className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{w.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {w.completed} tamamlandı
                      </p>
                    </div>
                    <div className="text-right ml-4 flex items-baseline gap-1">
                      <div className="text-sm font-bold">{w.active}</div>
                      <div className="text-xs text-muted-foreground">aktif</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Son Talepler */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between pb-0 pt-2 px-6">
          <CardTitle className="text-base">Son Talepler</CardTitle>
          <Link href="/requests" className="text-xs text-primary hover:underline">
            Tümünü gör →
          </Link>
        </CardHeader>
        <CardContent className="px-6 pb-6">
          <div className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/30 text-xs text-muted-foreground">
                  <th className="w-[50px] px-4 py-2.5 text-center font-medium">AI</th>
                  <th className="px-4 py-2.5 text-left font-medium">Talep Başlığı</th>
                  <th className="hidden sm:table-cell px-4 py-2.5 text-center font-medium w-[100px]">Tür</th>
                  <th className="hidden md:table-cell px-4 py-2.5 text-center font-medium w-[90px]">Öncelik</th>
                  <th className="hidden lg:table-cell px-4 py-2.5 text-center font-medium w-[110px]">Durum</th>
                  <th className="hidden xl:table-cell px-4 py-2.5 text-center font-medium w-[110px]">Talep Tarihi</th>
                  <th className="hidden xl:table-cell px-4 py-2.5 text-center font-medium w-[110px]">Deadline</th>
                  <th className="px-4 py-2.5 text-center font-medium w-[50px]">Atanan</th>
                </tr>
              </thead>
              <tbody>
                {recentRequests.map((req) => {
                  const status = STATUSES.find(s => s.value === req.status)
                  const priority = PRIORITIES.find(p => p.value === req.priority)
                  const requestType = REQUEST_TYPES.find(t => t.value === req.request_type)
                  const assignee = req.assignee as { name: string; avatar_url: string | null } | null
                  const isOverdue =
                    req.deadline &&
                    new Date(req.deadline) < new Date() &&
                    !['completed', 'cancelled', 'archived'].includes(req.status)
                  return (
                    <tr key={req.id} className="border-b last:border-0 hover:bg-muted/50 transition-colors">
                      {/* AI Score */}
                      <td className="px-4 py-3 text-center">
                        {req.ai_brief_score !== null ? (
                          <span className={`text-xs font-bold ${
                            req.ai_brief_score >= 70 ? 'text-green-600' :
                            req.ai_brief_score >= 40 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {Math.round(req.ai_brief_score)}
                          </span>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </td>

                      {/* Başlık + Tags */}
                      <td className="px-4 py-3">
                        <Link href={`/requests/${req.id}`} className="hover:underline">
                          <div className="font-medium truncate hover:text-primary max-w-[220px]">{req.title}</div>
                        </Link>
                      </td>

                      {/* Tür */}
                      <td className="hidden sm:table-cell px-4 py-3 text-xs text-muted-foreground text-center">
                        {requestType?.label ?? '-'}
                      </td>

                      {/* Öncelik */}
                      <td className="hidden md:table-cell px-4 py-3 text-center">
                        {priority && (
                          <Badge variant={priority.variant} appearance={priority.appearance} size="sm">
                            {priority.label}
                          </Badge>
                        )}
                      </td>

                      {/* Durum */}
                      <td className="hidden lg:table-cell px-4 py-3 text-center">
                        {status && (
                          <Badge variant={status.variant} appearance={status.appearance} size="sm">
                            {status.label}
                          </Badge>
                        )}
                      </td>

                      {/* Tarih */}
                      <td className="hidden xl:table-cell px-4 py-3 text-xs text-muted-foreground whitespace-nowrap text-center">
                        {new Date(req.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </td>

                      {/* Deadline */}
                      <td className="hidden xl:table-cell px-4 py-3 text-xs whitespace-nowrap text-center">
                        {req.deadline ? (
                          <span className={isOverdue ? 'text-destructive font-medium' : 'text-muted-foreground'}>
                            {isOverdue ? '⚠ ' : ''}
                            {new Date(req.deadline).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>

                      {/* Atanan */}
                      <td className="px-4 py-3 text-center">
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
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
