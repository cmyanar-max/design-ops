import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { runBriefAnalysis } from '@/lib/ai/analyze-brief'
import { checkRateLimit } from '@/lib/rateLimit'
import { logError } from '@/lib/logger'

const schema = z.object({ requestId: z.string().uuid() })

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) {
      return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })
    }

    const { allowed, retryAfter } = checkRateLimit(authUser.id)
    if (!allowed) {
      return NextResponse.json(
        { error: 'Çok fazla istek gönderildi, lütfen bekleyin' },
        { status: 429, headers: { 'Retry-After': String(retryAfter) } }
      )
    }

    const body = await request.json()
    const parsed = schema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 })
    }

    const result = await runBriefAnalysis(parsed.data.requestId, authUser.id)

    if (!result) {
      return NextResponse.json({ error: 'AI analizi tamamlanamadı' }, { status: 500 })
    }

    return NextResponse.json(result)
  } catch (err: unknown) {
    logError('[POST /api/ai/analyze-brief]', err)
    return NextResponse.json({ error: 'AI analizi başarısız' }, { status: 500 })
  }
}
