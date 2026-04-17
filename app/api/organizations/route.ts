import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { logError } from '@/lib/logger'

const schema = z.object({
  name: z.string().min(2, 'En az 2 karakter olmalı').max(80, 'En fazla 80 karakter olabilir').trim(),
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
    const { name } = parsed.data

    const adminClient = createAdminClient()

    // Kullanıcının zaten bir kaydı var mı? (daha önce org oluşturmuş olabilir)
    const { data: existingUser } = await adminClient
      .from('users')
      .select('id, organization_id, status')
      .eq('id', user.id)
      .single()

    if (existingUser?.organization_id) {
      const { data: existingOrg } = await adminClient
        .from('organizations')
        .select('*')
        .eq('id', existingUser.organization_id)
        .single()
      return NextResponse.json(existingOrg, { status: 200 })
    }

    // Slug: isimden türet, sonuna kısa kullanıcı id'si ekle (benzersizlik)
    const slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '') + '-' + user.id.slice(0, 8)

    const { data: org, error: orgError } = await adminClient
      .from('organizations')
      .insert({ name, slug })
      .select()
      .single()

    if (orgError) throw orgError

    // Kullanıcıyı admin + active olarak ekle
    const { error: userError } = await adminClient
      .from('users')
      .upsert({
        id: user.id,
        organization_id: org.id,
        name: user.user_metadata?.name ?? user.email?.split('@')[0] ?? 'Kullanıcı',
        email: user.email!,
        role: 'admin',
        status: 'active',
        onboarding_completed: true,
      }, { onConflict: 'id' })

    if (userError) throw userError

    return NextResponse.json(org, { status: 201 })
  } catch (err: unknown) {
    logError('[POST /api/organizations]', err)
    return NextResponse.json({ error: 'Organizasyon oluşturulamadı' }, { status: 500 })
  }
}
