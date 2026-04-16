import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import KanbanBoard from '@/components/kanban/KanbanBoard'
import { RequestWithUser } from '@/types/database'

export default async function KanbanPage() {
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
  const readOnly = isClient || isAdmin

  const { data: requests } = await supabase
    .from('requests')
    .select(`
      *,
      creator:users!requests_created_by_fkey(id, name, avatar_url),
      assignee:users!requests_assigned_to_fkey(id, name, avatar_url),
      brand:brands(id, name, primary_color)
    `)
    .not('status', 'in', '("archived","cancelled")')
    .order('created_at', { ascending: false })

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-6 shrink-0">
        <div>
          <h1 className="text-2xl font-bold">Kanban Board</h1>
          <p className="text-sm text-muted-foreground">
            {readOnly
              ? 'Taleplerinizdeki güncel iş akışını görüntüleyin'
              : 'Kartları sürükleyerek durumları güncelleyin'}
          </p>
        </div>
        <div className="text-sm text-muted-foreground">
          {requests?.length ?? 0} aktif talep
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-6">
        <KanbanBoard
          initialRequests={(requests ?? []) as RequestWithUser[]}
          orgId={currentUser.organization_id}
          readOnly={readOnly}
        />
      </div>
    </div>
  )
}
