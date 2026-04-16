import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createAdminClient } from '@/lib/supabase/server'

const acceptSchema = z.object({
  name: z.string().min(2),
  password: z.string().min(8),
})

export async function POST(
  request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params

  try {
    const body = await request.json()
    const parsed = acceptSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { name, password } = parsed.data
    const adminClient = createAdminClient()

    // Daveti bul
    const { data: invitation, error: invErr } = await adminClient
      .from('invitations')
      .select('*, organization:organizations(id, name)')
      .eq('token', token)
      .is('accepted_at', null)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (invErr || !invitation) {
      return NextResponse.json({ error: 'Davet geçersiz veya süresi dolmuş' }, { status: 404 })
    }

    // Supabase Auth'da kullanıcı oluştur
    const { data: authData, error: authErr } = await adminClient.auth.admin.createUser({
      email: invitation.email,
      password,
      email_confirm: true,
      user_metadata: { name },
    })

    if (authErr) throw authErr

    const org = invitation.organization as { id: string; name: string }

    // Kullanıcıyı users tablosuna ekle — admin onayı bekleniyor
    const { error: userErr } = await adminClient
      .from('users')
      .insert({
        id: authData.user.id,
        organization_id: org.id,
        name,
        email: invitation.email,
        role: invitation.role,
        status: 'invited',
        onboarding_completed: true,
      })

    if (userErr) throw userErr

    // Daveti kabul edildi olarak işaretle
    await adminClient
      .from('invitations')
      .update({ accepted_at: new Date().toISOString() })
      .eq('token', token)

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err: unknown) {
    console.error('[POST /api/invitations/[token]/accept]', err)
    return NextResponse.json({ error: 'Hesap oluşturulamadı' }, { status: 500 })
  }
}
