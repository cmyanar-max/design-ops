import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const schema = z.object({
  orgName: z.string().min(2, 'Organizasyon adı en az 2 karakter olmalı').trim(),
  role: z.enum(['designer', 'client'], { message: 'Geçersiz rol' }),
})

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Yetkisiz erişim' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Geçersiz istek' },
        { status: 400 },
      )
    }
    const { orgName, role } = parsed.data

    const adminClient = createAdminClient()

    // Organizasyonu isme göre bul (tam eşleşme, büyük/küçük harf duyarsız)
    const { data: org } = await adminClient
      .from('organizations')
      .select('id, name')
      .ilike('name', orgName)
      .limit(1)
      .single()

    if (!org) {
      return NextResponse.json({ error: 'Organizasyon bulunamadı' }, { status: 404 })
    }

    // Mevcut kullanıcı kaydını kontrol et
    const { data: existingUser } = await adminClient
      .from('users')
      .select('id, status, organization_id')
      .eq('id', user.id)
      .single()

    if (existingUser) {
      if (existingUser.status === 'active') {
        return NextResponse.json({ error: 'Zaten bu organizasyonun üyesisiniz' }, { status: 409 })
      }
      if (existingUser.status === 'pending_approval') {
        return NextResponse.json({ error: 'Zaten bekleyen bir katılım isteğiniz var' }, { status: 409 })
      }
    }

    // Kullanıcı kaydını oluştur veya güncelle (pending_approval, org_id=null)
    const { error: upsertErr } = await adminClient
      .from('users')
      .upsert({
        id: user.id,
        organization_id: null,
        name: user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'Kullanıcı',
        email: user.email!,
        role,
        status: 'pending_approval',
        onboarding_completed: true,
      }, { onConflict: 'id' })

    if (upsertErr) throw upsertErr

    // Katılım isteği oluştur
    const { error: reqErr } = await adminClient
      .from('join_requests')
      .insert({
        user_id: user.id,
        org_id: org.id,
        role,
        status: 'pending',
      })

    if (reqErr) {
      // UNIQUE(user_id, org_id) ihlali — zaten istek var
      if (reqErr.code === '23505') {
        return NextResponse.json({ error: 'Bu organizasyon için zaten katılım isteğiniz var' }, { status: 409 })
      }
      throw reqErr
    }

    // Organizasyon yöneticilerine bildirim gönder
    const { data: admins } = await adminClient
      .from('users')
      .select('id')
      .eq('organization_id', org.id)
      .eq('role', 'admin')
      .eq('status', 'active')

    if (admins && admins.length > 0) {
      const requesterName =
        user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'Bir kullanıcı'
      const roleLabel = role === 'designer' ? 'Tasarımcı' : 'Proje Yöneticisi'

      const notifications = admins.map(a => ({
        organization_id: org.id,
        user_id: a.id,
        type: 'join_request',
        title: 'Yeni katılım isteği',
        body: `${requesterName} (${roleLabel}) organizasyonunuza katılmak istiyor.`,
        data: { user_id: user.id, role, org_id: org.id },
      }))

      await adminClient.from('notifications').insert(notifications)
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err: unknown) {
    console.error('[POST /api/join-requests]', err)
    return NextResponse.json({ error: 'Katılım isteği gönderilemedi' }, { status: 500 })
  }
}
