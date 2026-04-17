import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getAIClient, MODELS, withRetry } from '@/lib/ai/client'
import { buildDesignSuggestionPrompt, DesignSuggestionResult } from '@/lib/ai/prompts/design-suggestion'
import { checkRateLimit } from '@/lib/rateLimit'
import { logError } from '@/lib/logger'

const schema = z.object({ requestId: z.string().uuid() })

export async function POST(request: Request) {
  const startTime = Date.now()

  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

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

    const { requestId } = parsed.data
    const adminClient = createAdminClient()

    // Talebi çek
    const { data: req } = await adminClient
      .from('requests')
      .select('*, brand:brands(*)')
      .eq('id', requestId)
      .single()

    if (!req) return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 })

    // AI kredi kontrolü
    const { data: hasCredit } = await adminClient.rpc('check_and_consume_ai_credit', {
      p_org_id: req.organization_id,
    })
    if (!hasCredit) return NextResponse.json({ error: 'AI kredi limitine ulaşıldı' }, { status: 402 })

    const prompt = buildDesignSuggestionPrompt(
      req.title,
      req.description ?? '',
      req.request_type,
      req.brand ?? null
    )

    const client = getAIClient()
    const aiResponse = await withRetry(() =>
      client.chat.completions.create({
        model: MODELS.smart,
        messages: [
          { role: 'system', content: 'Sen deneyimli bir UI/UX ve grafik tasarım uzmanısın. Verilen brief için somut, uygulanabilir tasarım önerileri sun. Yanıtını her zaman geçerli JSON formatında ver.' },
          { role: 'user', content: prompt },
        ],
      })
    )

    const latency = Date.now() - startTime
    const responseText = aiResponse.choices[0].message.content ?? ''

    let result: DesignSuggestionResult
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      result = JSON.parse(jsonMatch?.[0] ?? responseText)
    } catch {
      return NextResponse.json({ error: 'AI yanıtı işlenemedi' }, { status: 500 })
    }

    // Kullanım logla
    await adminClient.from('ai_requests').insert({
      organization_id: req.organization_id,
      user_id: authUser.id,
      request_id: requestId,
      feature: 'design_suggestion',
      model: MODELS.smart,
      prompt_tokens: 0,
      completion_tokens: 0,
      total_tokens: 0,
      latency_ms: latency,
      status: 'success',
    })

    return NextResponse.json(result)
  } catch (err: unknown) {
    logError('[POST /api/ai/design-suggestion]', err)
    return NextResponse.json({ error: 'AI önerisi alınamadı' }, { status: 500 })
  }
}
