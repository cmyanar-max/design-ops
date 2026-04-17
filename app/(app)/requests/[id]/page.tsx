import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { castRow, castRows } from '@/lib/utils'
import { Request } from '@/types/database'
import { PRIORITIES, REQUEST_TYPES, STATUSES, RequestFormValues } from '@/lib/validations/request'
import { Badge } from '@/components/ui/badge-1'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import CancelRequestButton from '@/components/requests/CancelRequestButton'
import DeleteRequestButton from '@/components/requests/DeleteRequestButton'
import EditRequestSheet from '@/components/requests/EditRequestSheet'
import CommentThread from '@/components/comments/CommentThread'
import FileList from '@/components/files/FileList'
import BriefAIPanel from '@/components/ai/BriefAIPanel'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

type Params = Promise<{ id: string }>

export default async function RequestDetailPage({ params }: { params: Params }) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const [{ data: currentUser }, { data: rawRequest }] = await Promise.all([
    supabase
      .from('users')
      .select('id, role, organization_id')
      .eq('id', authUser.id)
      .single(),
    supabase
      .from('requests')
      .select(`
        *,
        creator:users!requests_created_by_fkey(id, name, avatar_url, email),
        assignee:users!requests_assigned_to_fkey(id, name, avatar_url, email),
        brand:brands(id, name, primary_color, secondary_color, font_primary, font_secondary, tone_of_voice, target_audience)
      `)
      .eq('id', id)
      .single(),
  ])

  type RequestDetail = Request & {
    creator: { id: string; name: string; avatar_url: string | null; email: string }
    assignee: { id: string; name: string; avatar_url: string | null } | null
    brand: { id: string; name: string; primary_color: string | null; secondary_color: string | null; font_primary: string | null; font_secondary: string | null; tone_of_voice: string | null; target_audience: string | null } | null
  }
  const request = castRow<RequestDetail>(rawRequest)

  if (!request) notFound()

  const priority = PRIORITIES.find(p => p.value === request.priority)
  const status = STATUSES.find(s => s.value === request.status)
  const requestType = REQUEST_TYPES.find(t => t.value === request.request_type)

  const isDesignerOrAdmin = currentUser?.role === 'admin' || currentUser?.role === 'designer'
  const isClient = currentUser?.role === 'client'
  const isAdmin = currentUser?.role === 'admin'
  const isCancellable = isClient && request.creator.id === authUser.id && !['cancelled', 'completed', 'archived'].includes(request.status)
  const isDeletable = isAdmin || (request.status === 'cancelled' && isClient && request.creator.id === authUser.id)
  const isEditable = request.creator.id === authUser.id &&
    ['new', 'brief_review'].includes(request.status)
  const creator = request.creator
  const assignee = request.assignee

  return (
    <div className="flex flex-col md:flex-row md:h-full">
      {/* Ana içerik */}
      <div className="flex-1 min-w-0 md:overflow-y-auto">
        <div className="max-w-3xl mx-auto p-6 space-y-6">
          {/* Başlık */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-4">
              <h1 className="text-2xl font-bold">{request.title}</h1>
              <div className="flex items-center gap-2 shrink-0">
                {priority && (
                  <Badge variant={priority.variant}>{priority.label}</Badge>
                )}
                {status && (
                  <Badge variant={status.variant}>{status.label}</Badge>
                )}
                {isEditable && (
                  <EditRequestSheet
                    requestId={id}
                    defaultValues={{
                      title: request.title,
                      description: request.description ?? '',
                      request_type: request.request_type as RequestFormValues['request_type'],
                      priority: request.priority as RequestFormValues['priority'],
                      deadline: request.deadline,
                      tags: request.tags,
                      estimated_hours: request.estimated_hours,
                    }}
                  />
                )}
                {isCancellable && (
                  <CancelRequestButton requestId={id} />
                )}
                {isDeletable && (
                  <DeleteRequestButton requestId={id} isAdmin={isAdmin} />
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              <span>{requestType?.label}</span>
              {request.deadline && (
                <span>
                  Son tarih:{' '}
                  <strong className={new Date(request.deadline) < new Date() ? 'text-destructive' : 'text-foreground'}>
                    {new Date(request.deadline).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </strong>
                </span>
              )}
              <span>
                Talep eden:{' '}
                <span className="font-medium text-foreground">{creator.name}</span>
              </span>
              {assignee && (
                <span className="flex items-center gap-1">
                  Atanan:
                  <Avatar className="w-5 h-5 inline-flex">
                    <AvatarImage src={assignee.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs">{assignee.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">{assignee.name}</span>
                </span>
              )}
            </div>

            {request.tags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {request.tags.map(tag => (
                  <Badge key={tag} variant="gray-subtle">{tag}</Badge>
                ))}
              </div>
            )}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="brief">
            <TabsList>
              <TabsTrigger value="brief">Brief</TabsTrigger>
              <TabsTrigger value="comments">Yorumlar</TabsTrigger>
              <TabsTrigger value="files">Dosyalar</TabsTrigger>
              <TabsTrigger value="activity">Aktivite</TabsTrigger>
            </TabsList>

            <TabsContent value="brief" className="mt-4 space-y-5">
              {/* Açıklama */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Açıklama / Brief</p>
                {request.description ? (
                  <p className="whitespace-pre-wrap text-sm leading-relaxed text-foreground bg-muted/40 rounded-lg p-4 border border-border">
                    {request.description}
                  </p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">Brief henüz girilmemiş.</p>
                )}
              </div>

              {/* Meta grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
                  <p className="text-xs text-muted-foreground">Tasarım Türü</p>
                  <p className="text-sm font-medium">{requestType?.label ?? '—'}</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
                  <p className="text-xs text-muted-foreground">Öncelik</p>
                  {priority ? (
                    <Badge variant={priority.variant} size="sm">{priority.label}</Badge>
                  ) : <p className="text-sm font-medium">—</p>}
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
                  <p className="text-xs text-muted-foreground">Son Tarih</p>
                  {request.deadline ? (
                    <p className={`text-sm font-medium ${new Date(request.deadline) < new Date() && !['completed','cancelled','archived'].includes(request.status) ? 'text-destructive' : ''}`}>
                      {new Date(request.deadline).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  ) : <p className="text-sm text-muted-foreground">Belirtilmemiş</p>}
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
                  <p className="text-xs text-muted-foreground">Tahmini Süre</p>
                  <p className="text-sm font-medium">
                    {request.estimated_hours != null ? `${request.estimated_hours} saat` : '—'}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
                  <p className="text-xs text-muted-foreground">Revizyon Sayısı</p>
                  <p className="text-sm font-medium">{request.revision_count}</p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3 space-y-1">
                  <p className="text-xs text-muted-foreground">Oluşturuldu</p>
                  <p className="text-sm font-medium">
                    {new Date(request.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              </div>

              {/* Talep eden */}
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Talep Eden</p>
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 p-3">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={creator.avatar_url ?? undefined} />
                    <AvatarFallback className="text-xs">{creator.name[0]}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{creator.name}</p>
                    <p className="text-xs text-muted-foreground">{creator.email}</p>
                  </div>
                </div>
              </div>

              {/* Marka bilgileri */}
              {request.brand && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Marka</p>
                  <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      {request.brand.primary_color && (
                        <div
                          className="w-5 h-5 rounded-full border border-border shrink-0"
                          style={{ backgroundColor: request.brand.primary_color }}
                        />
                      )}
                      <p className="text-sm font-semibold">{request.brand.name}</p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-xs">
                      {request.brand.primary_color && (
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Ana Renk</p>
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: request.brand.primary_color }} />
                            <code className="font-mono">{request.brand.primary_color}</code>
                          </div>
                        </div>
                      )}
                      {request.brand.secondary_color && (
                        <div className="space-y-1">
                          <p className="text-muted-foreground">İkincil Renk</p>
                          <div className="flex items-center gap-1.5">
                            <div className="w-4 h-4 rounded border border-border" style={{ backgroundColor: request.brand.secondary_color }} />
                            <code className="font-mono">{request.brand.secondary_color}</code>
                          </div>
                        </div>
                      )}
                      {request.brand.font_primary && (
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Ana Font</p>
                          <p className="font-medium">{request.brand.font_primary}</p>
                        </div>
                      )}
                      {request.brand.font_secondary && (
                        <div className="space-y-1">
                          <p className="text-muted-foreground">İkincil Font</p>
                          <p className="font-medium">{request.brand.font_secondary}</p>
                        </div>
                      )}
                      {request.brand.target_audience && (
                        <div className="space-y-1 col-span-2">
                          <p className="text-muted-foreground">Hedef Kitle</p>
                          <p className="font-medium">{request.brand.target_audience}</p>
                        </div>
                      )}
                      {request.brand.tone_of_voice && (
                        <div className="space-y-1 col-span-2">
                          <p className="text-muted-foreground">Ses Tonu</p>
                          <p className="font-medium">{request.brand.tone_of_voice}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Etiketler */}
              {request.tags.length > 0 && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Etiketler</p>
                  <div className="flex flex-wrap gap-1.5">
                    {request.tags.map(tag => (
                      <Badge key={tag} variant="gray-subtle">{tag}</Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Zaman çizelgesi */}
              {(request.started_at || request.submitted_for_approval_at || request.completed_at) && (
                <div className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Zaman Çizelgesi</p>
                  <div className="space-y-1 text-sm">
                    {request.started_at && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Tasarıma başlandı</span>
                        <span className="font-medium text-foreground">
                          {new Date(request.started_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    )}
                    {request.submitted_for_approval_at && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Onaya sunuldu</span>
                        <span className="font-medium text-foreground">
                          {new Date(request.submitted_for_approval_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    )}
                    {request.completed_at && (
                      <div className="flex justify-between text-muted-foreground">
                        <span>Tamamlandı</span>
                        <span className="font-medium text-foreground">
                          {new Date(request.completed_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="comments" className="mt-4">
              <CommentThread
                requestId={id}
                currentUserId={authUser.id}
                isDesignerOrAdmin={isDesignerOrAdmin ?? false}
              />
            </TabsContent>

            <TabsContent value="files" className="mt-4">
              <FileList
                requestId={id}
                canUpload={true}
              />
            </TabsContent>

            <TabsContent value="activity" className="mt-4">
              <RequestActivityTab requestId={id} />
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Sağ panel */}
      <div className="w-full md:w-72 shrink-0 border-t md:border-t-0 md:border-l border-border md:overflow-y-auto">
        <div className="p-6 space-y-4">
          {/* AI Brief Panel — herkes görür */}
          <BriefAIPanel
            score={request.ai_brief_score}
            suggestions={request.ai_brief_suggestions as Parameters<typeof BriefAIPanel>[0]['suggestions']}
            requestId={id}
          />
        </div>
      </div>
    </div>
  )
}

async function RequestActivityTab({ requestId }: { requestId: string }) {
  const supabase = await createClient()
  const { data: rawHistory } = await supabase
    .from('request_status_history')
    .select(`*, changed_by_user:users(id, name, avatar_url)`)
    .eq('request_id', requestId)
    .order('created_at', { ascending: false })

  type HistoryRow = { id: string; from_status: string | null; to_status: string; note: string | null; created_at: string; changed_by_user: { name: string; avatar_url: string | null } | null }
  const history = castRows<HistoryRow>(rawHistory)

  if (!history.length) {
    return <p className="text-sm text-muted-foreground">Henüz aktivite yok.</p>
  }

  const statusLabels: Record<string, string> = {
    new: 'Yeni', brief_review: 'Brief İnceleme', design: 'Tasarımda',
    revision: 'Revizyon', approval: 'Onay Bekliyor', completed: 'Tamamlandı',
    archived: 'Arşivlendi', cancelled: 'İptal',
  }

  return (
    <div className="space-y-3">
      {history.map((h) => {
        const user = h.changed_by_user
        return (
          <div key={h.id} className="flex gap-3 text-sm">
            <Avatar className="w-6 h-6 shrink-0 mt-0.5">
              <AvatarImage src={user?.avatar_url ?? undefined} />
              <AvatarFallback className="text-xs">{user?.name?.[0] ?? '?'}</AvatarFallback>
            </Avatar>
            <div>
              <span className="font-medium">{user?.name}</span>
              {' '}durumu{' '}
              <Badge variant="gray-subtle" size="sm">{statusLabels[h.from_status ?? ''] ?? h.from_status}</Badge>
              {' → '}
              <Badge variant="gray-subtle" size="sm">{statusLabels[h.to_status] ?? h.to_status}</Badge>
              {' olarak değiştirdi'}
              {h.note && <p className="text-muted-foreground mt-0.5">{h.note}</p>}
              <p className="text-xs text-muted-foreground mt-0.5">
                {new Date(h.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
