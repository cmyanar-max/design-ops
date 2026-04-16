import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createAdminClient } from '@/lib/supabase/server'

const registerSchema = z.object({
  name: z.string().min(2).max(100),
  email: z.string().email(),
  role: z.enum(['designer', 'client']),
})

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Kimlik doğrulaması gerekli' }, { status: 401 })
    }

    const body = await request.json()
    const parsed = registerSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json({ error: 'Geçersiz kayıt verisi' }, { status: 400 })
    }

    const { name, email, role } = parsed.data
    const userId = authUser.id
    const adminClient = createAdminClient()

    // Tek organizasyonu çek (ilk oluşturulan)
    const { data: org, error: orgError } = await adminClient
      .from('organizations')
      .select('id')
      .order('created_at', { ascending: true })
      .limit(1)
      .single()

    if (orgError || !org) {
      return NextResponse.json(
        { error: 'Henüz bir organizasyon kurulmamış. Lütfen yöneticinizle iletişime geçin.' },
        { status: 404 }
      )
    }

    // Kullanıcıyı 'invited' statüsüyle organizasyona ekle
    const { error: userError } = await adminClient.from('users').insert({
      id: userId,
      organization_id: org.id,
      name,
      email,
      role,
      status: 'invited',
      onboarding_completed: true,
    })

    if (userError) {
      if (userError.code === '23505') {
        return NextResponse.json(
          { error: 'Bu e-posta adresi zaten kayıtlı. Lütfen giriş yapın.' },
          { status: 409 }
        )
      }
      throw userError
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (err: unknown) {
    console.error('[POST /api/auth/register]', err)
    return NextResponse.json({ error: 'Kayıt tamamlanamadı' }, { status: 500 })
  }
}
