import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'E-posta gerekli' }, { status: 400 })
    }

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json({ error: 'Sunucu yapılandırması eksik' }, { status: 500 })
    }

    const admin = createAdminClient()

    const { data, error } = await admin
      .from('users')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .limit(1)
      .maybeSingle()

    if (error) {
      console.error('check-email error:', error)
      return NextResponse.json({ error: 'Kontrol başarısız' }, { status: 500 })
    }

    return NextResponse.json({ exists: !!data })
  } catch (err) {
    console.error('check-email exception:', err)
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}
