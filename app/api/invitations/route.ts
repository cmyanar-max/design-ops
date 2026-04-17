import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { sendInviteEmail } from '@/lib/email'
import { logError } from '@/lib/logger'

const inviteSchema = z.object({
  email: z.string().email(),
  role: z.enum(['admin', 'designer', 'client']),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

    const { data: currentUser } = await supabase
      .from('users')
      .select('id, name, organization_id, role')
      .eq('id', authUser.id)
      .single()

    if (!currentUser || currentUser.role !== 'admin') {
      return NextResponse.json({ error: 'Yalnızca admin davet gönderebilir' }, { status: 403 })
    }

    const body = await request.json()
    const parsed = inviteSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { email, role } = parsed.data
    const adminClient = createAdminClient()

    const { data: org } = await adminClient
      .from('organizations')
      .select('name')
      .eq('id', currentUser.organization_id)
      .single()

    // Zaten üye mi kontrol et
    const { data: existingUser } = await adminClient
      .from('users')
      .select('id')
      .eq('email', email)
      .eq('organization_id', currentUser.organization_id)
      .single()

    if (existingUser) {
      return NextResponse.json({ error: 'Bu kullanıcı zaten üye' }, { status: 409 })
    }

    // Davet oluştur
    const { data: invitation, error } = await adminClient
      .from('invitations')
      .insert({
        organization_id: currentUser.organization_id,
        email,
        role,
        invited_by: currentUser.id,
      })
      .select()
      .single()

    if (error) throw error

    const inviteUrl = `${process.env.NEXT_PUBLIC_APP_URL}/invite/${invitation.token}`

    await sendInviteEmail({
      to: email,
      inviteUrl,
      organizationName: org?.name ?? 'DesignOps',
      role,
      invitedByName: currentUser.name,
    })

    return NextResponse.json({ invitation, inviteUrl }, { status: 201 })
  } catch (err: unknown) {
    logError('[POST /api/invitations]', err)
    return NextResponse.json({ error: 'Davet gönderilemedi' }, { status: 500 })
  }
}
