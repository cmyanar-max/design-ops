import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { getAIClient, MODELS, withRetry } from '@/lib/ai/client'
import { buildRevisionTranslationPrompt, RevisionTranslationResult } from '@/lib/ai/prompts/revision-translation'
import { checkRateLimit } from '@/lib/rateLimit'
import { logError } from '@/lib/logger'

const schema = z.object({
  requestId: z.string().uuid(),
  commentBody: z.string().min(5).max(2000),
})

export async function POST(request: Request) {
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
    if (!parsed.success) return NextResponse.json({ error: 'Geçersiz istek' }, { status: 400 })

    const { requestId, commentBody } = parsed.data
    const adminClient = createAdminClient()

    const { data: req } = await adminClient
      .from('requests')
      .select('title, description, request_type, organization_id')
      .eq('id', requestId)
      .single()

    if (!req) return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 })

    const briefContext = `Başlık: ${req.title}\nTür: ${req.request_type}\nBrief: ${req.description ?? 'Belirtilmemiş'}`
    const prompt = buildRevisionTranslationPrompt(commentBody, briefContext)

    const client = getAIClient()
    const aiResponse = await withRetry(() =>
      client.chat.completions.create({
        model: MODELS.fast,
        messages: [
          { role: 'system', content: 'Sen bir tasarım proje yöneticisisin. Müşteri yorumlarını tasarımcı için net görev listelerine çevirirsin. Yanıtını her zaman geçerli JSON formatında ver.' },
          { role: 'user', content: prompt },
        ],
      })
    )

    const responseText = aiResponse.choices[0].message.content ?? ''
    let result: RevisionTranslationResult
    try {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      result = JSON.parse(jsonMatch?.[0] ?? responseText)
    } catch {
      return NextResponse.json({ error: 'AI yanıtı işlenemedi' }, { status: 500 })
    }

    // AI önerisini comment olarak ekle
    await adminClient.from('comments').insert({
      request_id: requestId,
      user_id: authUser.id,
      body: `**AI Revizyon Özeti:**\n${result.summary}\n\n**Görevler:**\n${result.tasks.map(t => `• ${t}`).join('\n')}\n\n⏱ Tahmini süre: ${result.estimated_time}`,
      comment_type: 'ai_suggestion',
      is_internal: true,
      ai_generated: true,
    })

    return NextResponse.json(result)
  } catch (err: unknown) {
    logError('[POST /api/ai/revision-translate]', err)
    return NextResponse.json({ error: 'AI çevirisi başarısız' }, { status: 500 })
  }
}
