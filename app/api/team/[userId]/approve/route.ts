import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params

  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

    // Onaylayan kişi admin mi?
    const { data: currentUser } = await supabase
      .from('users')
      .select('id, role, organization_id')
      .eq('id', authUser.id)
      .single()

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Yalnızca admin onaylayabilir' }, { status: 403 })
    }

    const adminClient = createAdminClient()

    // Onaylanacak kullanıcıyı çek (org kısıtlaması yok — pending_approval'da org_id null olabilir)
    const { data: targetUser, error: fetchErr } = await adminClient
      .from('users')
      .select('id, name, email, status, organization_id, role')
      .eq('id', userId)
      .single()

    if (fetchErr || !targetUser) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    // Path A: Davet ile gelmiş kullanıcı (invited, aynı org)
    if (targetUser.status === 'invited') {
      if (targetUser.organization_id !== currentUser.organization_id) {
        return NextResponse.json({ error: 'Kullanıcı bu organizasyona ait değil' }, { status: 403 })
      }

      const { error: updateErr } = await adminClient
        .from('users')
        .update({ status: 'active' })
        .eq('id', userId)

      if (updateErr) throw updateErr

      await adminClient.from('notifications').insert({
        user_id: userId,
        organization_id: currentUser.organization_id,
        type: 'account_approved',
        title: 'Hesabınız onaylandı',
        body: 'Yönetici hesabınızı onayladı. Artık uygulamaya erişebilirsiniz.',
      })

      return NextResponse.json({ success: true })
    }

    // Path B: Katılım isteği ile gelmiş kullanıcı (pending_approval)
    if (targetUser.status === 'pending_approval') {
      // Bu admin'in org'una yönelik bir join_request var mı?
      const { data: joinReq, error: jrErr } = await adminClient
        .from('join_requests')
        .select('id, role')
        .eq('user_id', userId)
        .eq('org_id', currentUser.organization_id)
        .eq('status', 'pending')
        .single()

      if (jrErr || !joinReq) {
        return NextResponse.json({ error: 'Bu kullanıcının organizasyonunuza yönelik katılım isteği bulunamadı' }, { status: 404 })
      }

      // Kullanıcıyı aktif yap ve org ile rolü ata
      const { error: userUpdateErr } = await adminClient
        .from('users')
        .update({
          status: 'active',
          organization_id: currentUser.organization_id,
          role: joinReq.role,
        })
        .eq('id', userId)

      if (userUpdateErr) throw userUpdateErr

      // Katılım isteğini onayla
      const { error: jrUpdateErr } = await adminClient
        .from('join_requests')
        .update({ status: 'approved' })
        .eq('id', joinReq.id)

      if (jrUpdateErr) throw jrUpdateErr

      await adminClient.from('notifications').insert({
        user_id: userId,
        organization_id: currentUser.organization_id,
        type: 'account_approved',
        title: 'Katılım isteğiniz onaylandı',
        body: 'Yönetici katılım isteğinizi onayladı. Artık uygulamaya erişebilirsiniz.',
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Bu kullanıcı zaten aktif veya farklı bir durumda' }, { status: 409 })
  } catch (err: unknown) {
    console.error('[POST /api/team/[userId]/approve]', err)
    return NextResponse.json({ error: 'Onay işlemi başarısız' }, { status: 500 })
  }
}
