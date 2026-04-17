import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { logError } from '@/lib/logger'

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
      logError('check-email error:', error instanceof Error ? error.message : 'unknown')
      return NextResponse.json({ error: 'Kontrol başarısız' }, { status: 500 })
    }

    return NextResponse.json({ exists: !!data })
  } catch (err) {
    logError('check-email exception:', err instanceof Error ? err.message : 'unknown')
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}
