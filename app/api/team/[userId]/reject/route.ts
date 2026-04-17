import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logError } from '@/lib/logger'

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  const { userId } = await params

  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

    // Reddeden kişi admin mi?
    const { data: currentUser } = await supabase
      .from('users')
      .select('id, role, organization_id')
      .eq('id', authUser.id)
      .single()

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Yalnızca admin reddedebilir' }, { status: 403 })
    }

    const adminClient = createAdminClient()

    // Reddedilecek kullanıcıyı çek
    const { data: targetUser, error: fetchErr } = await adminClient
      .from('users')
      .select('id, name, email, status, organization_id, role')
      .eq('id', userId)
      .single()

    if (fetchErr || !targetUser) {
      return NextResponse.json({ error: 'Kullanıcı bulunamadı' }, { status: 404 })
    }

    // Path A: Davet ile gelmiş kullanıcı (invited)
    if (targetUser.status === 'invited') {
      if (targetUser.organization_id !== currentUser.organization_id) {
        return NextResponse.json({ error: 'Kullanıcı bu organizasyona ait değil' }, { status: 403 })
      }

      // Kullanıcı kaydını sil
      const { error: deleteErr } = await adminClient
        .from('users')
        .delete()
        .eq('id', userId)

      if (deleteErr) throw deleteErr

      await adminClient.from('notifications').insert({
        user_id: userId,
        organization_id: currentUser.organization_id,
        type: 'account_rejected',
        title: 'Davetiniz reddedildi',
        body: 'Yönetici davetinizi reddetti.',
      })

      return NextResponse.json({ success: true })
    }

    // Path B: Katılım isteği ile gelmiş kullanıcı (pending_approval)
    if (targetUser.status === 'pending_approval') {
      // Bu admin'in org'una yönelik bir join_request var mı?
      const { data: joinReq, error: jrErr } = await adminClient
        .from('join_requests')
        .select('id')
        .eq('user_id', userId)
        .eq('org_id', currentUser.organization_id)
        .eq('status', 'pending')
        .single()

      if (jrErr || !joinReq) {
        return NextResponse.json({ error: 'Bu kullanıcının organizasyonunuza yönelik katılım isteği bulunamadı' }, { status: 404 })
      }

      // Katılım isteğini reddet
      const { error: jrUpdateErr } = await adminClient
        .from('join_requests')
        .update({ status: 'rejected' })
        .eq('id', joinReq.id)

      if (jrUpdateErr) throw jrUpdateErr

      await adminClient.from('notifications').insert({
        user_id: userId,
        organization_id: currentUser.organization_id,
        type: 'request_rejected',
        title: 'Katılım isteğiniz reddedildi',
        body: 'Yönetici katılım isteğinizi reddetti.',
      })

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Bu kullanıcı reddedilemez' }, { status: 409 })
  } catch (err: unknown) {
    logError('[POST /api/team/[userId]/reject]', err)
    return NextResponse.json({ error: 'Red işlemi başarısız' }, { status: 500 })
  }
}
