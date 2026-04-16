import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const MAX_RENAMES = 2

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

    const { data: dbUser } = await adminClient
      .from('users')
      .select('id, role, organization_id')
      .eq('id', user.id)
      .single()

    if (!dbUser || dbUser.role !== 'admin' || !dbUser.organization_id) {
      return NextResponse.json({ error: 'Yalnızca yöneticiler organizasyon adını değiştirebilir' }, { status: 403 })
    }

    const { data: org, error: orgErr } = await adminClient
      .from('organizations')
      .select('id, name, name_change_count')
      .eq('id', dbUser.organization_id)
      .single()

    if (orgErr || !org) {
      return NextResponse.json({ error: 'Organizasyon bulunamadı' }, { status: 404 })
    }

    const currentCount = org.name_change_count ?? 0

    if (org.name.trim().toLowerCase() === name.toLowerCase()) {
      return NextResponse.json({ error: 'Yeni ad mevcut adla aynı' }, { status: 400 })
    }

    if (currentCount >= MAX_RENAMES) {
      return NextResponse.json(
        {
          error: 'Organizasyon adı değişim hakkınız doldu. Daha fazla değişiklik için lütfen DesignOps ekibiyle iletişime geçin.',
          limitReached: true,
        },
        { status: 403 },
      )
    }

    const { data: updated, error: updErr } = await adminClient
      .from('organizations')
      .update({ name, name_change_count: currentCount + 1 })
      .eq('id', org.id)
      .select('id, name, name_change_count')
      .single()

    if (updErr) throw updErr

    return NextResponse.json({
      success: true,
      organization: updated,
      remaining: MAX_RENAMES - (updated.name_change_count ?? 0),
    })
  } catch (err) {
    console.error('[POST /api/organizations/rename]', err)
    return NextResponse.json({ error: 'Organizasyon adı güncellenemedi' }, { status: 500 })
  }
}
