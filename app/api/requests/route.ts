import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { requestSchema } from '@/lib/validations/request'
import { runBriefAnalysis } from '@/lib/ai/analyze-brief'
import { logError } from '@/lib/logger'

// En az iş yüklü tasarımcıyı bul ve ata (2 sorgu — N+1 yok)
async function assignToLeastBusyDesigner(
  organizationId: string
): Promise<string | null> {
  try {
    const admin = createAdminClient()

    const { data: designers } = await admin
      .from('users')
      .select('id, name')
      .eq('organization_id', organizationId)
      .eq('role', 'designer')
      .eq('status', 'active')

    if (!designers || designers.length === 0) {
      return null
    }

    const designerIds = designers.map((d: { id: string }) => d.id)

    // Tüm aktif talepleri tek sorguda çek, JS'te say
    const { data: activeRequests } = await admin
      .from('requests')
      .select('assigned_to')
      .in('assigned_to', designerIds)
      .in('status', ['new', 'brief_review', 'design', 'revision'])

    const countMap: Record<string, number> = Object.fromEntries(designerIds.map((id: string) => [id, 0]))
    for (const req of activeRequests ?? []) {
      if (req.assigned_to) countMap[req.assigned_to] = (countMap[req.assigned_to] ?? 0) + 1
    }

    const leastBusy = designers.reduce(
      (prev: { id: string; name: string }, curr: { id: string; name: string }) =>
        (countMap[curr.id] ?? 0) < (countMap[prev.id] ?? 0) ? curr : prev
    )

    return leastBusy.id
  } catch (error) {
    logError('[assignToLeastBusyDesigner] Error:', error)
    return null
  }
}

export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const assignedTo = searchParams.get('assigned_to')
    const page = Math.max(1, Number.parseInt(searchParams.get('page') ?? '1', 10) || 1)
    const pageSize = Math.min(
      100,
      Math.max(1, Number.parseInt(searchParams.get('pageSize') ?? '25', 10) || 25)
    )
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1

    let query = supabase
      .from('requests')
      .select(`
        *,
        creator:users!requests_created_by_fkey(id, name, avatar_url),
        assignee:users!requests_assigned_to_fkey(id, name, avatar_url),
        brand:brands(id, name, primary_color)
      `, { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (status) {
      const statuses = status.split(',')
      query = query.in('status', statuses)
    }

    if (assignedTo) {
      query = query.eq('assigned_to', assignedTo)
    }

    const { data, error, count } = await query
    if (error) throw error

    return NextResponse.json({
      data,
      total: count ?? 0,
      page,
      pageSize,
      totalPages: Math.ceil((count ?? 0) / pageSize),
    })
  } catch (err: unknown) {
    logError('[GET /api/requests]', err)
    return NextResponse.json({ error: 'Talepler alınamadı' }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

    const { data: currentUser } = await supabase
      .from('users')
      .select('id, organization_id, role')
      .eq('id', authUser.id)
      .single()

    if (!currentUser) return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })

    if (currentUser.role === 'designer') {
      return NextResponse.json({ error: 'Tasarımcılar talep oluşturamaz' }, { status: 403 })
    }

    // Plan limiti kontrolü
    const { data: org } = await supabase
      .from('organizations')
      .select('monthly_request_limit, plan')
      .eq('id', currentUser.organization_id)
      .single()

    if (org && org.plan === 'free') {
      const startOfMonth = new Date()
      startOfMonth.setDate(1)
      startOfMonth.setHours(0, 0, 0, 0)

      const { count } = await supabase
        .from('requests')
        .select('id', { count: 'exact', head: true })
        .eq('organization_id', currentUser.organization_id)
        .gte('created_at', startOfMonth.toISOString())

      if ((count ?? 0) >= (org.monthly_request_limit ?? 10)) {
        return NextResponse.json(
          { error: 'Aylık talep limitine ulaştınız. Pro plana geçin.' },
          { status: 402 }
        )
      }
    }

    const body = await request.json()
    const parsed = requestSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    // Otomatik tasarımcı ataması
    const assignedDesignerId = await assignToLeastBusyDesigner(
      currentUser.organization_id
    )

    const { data: newRequest, error } = await supabase
      .from('requests')
      .insert({
        ...parsed.data,
        organization_id: currentUser.organization_id,
        created_by: currentUser.id,
        deadline: parsed.data.deadline || null,
        brand_id: parsed.data.brand_id || null,
        assigned_to: assignedDesignerId,
      })
      .select()
      .single()

    if (error) throw error

    // Bildirim: DB trigger (trigger_notify_designer_on_new_request) otomatik halleder.
    // assigned_to set edilmişse sadece o tasarımcıya, NULL ise tüm tasarımcılara bildirim gider.

    // AI brief analizi tetikle (async — bloklama yok)
    runBriefAnalysis(newRequest.id, currentUser.id).catch(err =>
      logError('[AI brief analysis]', err)
    )

    return NextResponse.json(newRequest, { status: 201 })
  } catch (err: unknown) {
    logError('[POST /api/requests]', err)
    return NextResponse.json({ error: 'Talep oluşturulamadı' }, { status: 500 })
  }
}
