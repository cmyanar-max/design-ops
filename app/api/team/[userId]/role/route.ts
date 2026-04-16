import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params

  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

    const { data: currentUser } = await supabase
      .from('users')
      .select('id, role, organization_id')
      .eq('id', authUser.id)
      .single()

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Yalnızca admin rol değiştirebilir' }, { status: 403 })
    }

    if (currentUser.id === userId) {
      return NextResponse.json({ error: 'Kendi rolünüzü değiştiremezsiniz' }, { status: 400 })
    }

    const body = await request.json()
    const { role } = body as { role: string }

    if (!['admin', 'designer', 'client'].includes(role)) {
      return NextResponse.json({ error: 'Geçersiz rol' }, { status: 400 })
    }

    const adminClient = createAdminClient()

    const { data: targetUser, error: fetchErr } = await adminClient
      .from('users')
      .select('id, organization_id')
      .eq('id', userId)
      .eq('organization_id', currentUser.organization_id)
      .single()

    if (fetchErr || !targetUser) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    const { error: updateErr } = await adminClient
      .from('users')
      .update({ role })
      .eq('id', userId)

    if (updateErr) throw updateErr

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('[PATCH /api/team/[userId]/role]', err)
    return NextResponse.json({ error: 'Rol güncellenemedi' }, { status: 500 })
  }
}
