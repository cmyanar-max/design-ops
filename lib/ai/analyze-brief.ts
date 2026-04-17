/**
 * Server-side AI brief analiz fonksiyonu.
 * HTTP round-trip olmadan doğrudan çağrılabilir.
 */
import { createAdminClient } from '@/lib/supabase/server'
import { getAIClient, MODELS, withRetry } from '@/lib/ai/client'
import { logError, logWarn } from '@/lib/logger'
import {
  BRIEF_ANALYSIS_SYSTEM,
  buildBriefAnalysisPrompt,
  BriefAnalysisResult,
} from '@/lib/ai/prompts/brief-analysis'

export async function runBriefAnalysis(
  requestId: string,
  triggeredByUserId?: string
): Promise<BriefAnalysisResult | null> {
  const startTime = Date.now()
  const adminClient = createAdminClient()

  const { data: req, error: reqError } = await adminClient
    .from('requests')
    .select('*, brand:brands(*)')
    .eq('id', requestId)
    .single()

  if (reqError || !req) {
    logError('[runBriefAnalysis] Talep bulunamadı:', { requestId, reqError })
    return null
  }

  // AI kredi kontrolü
  const { data: hasCredit } = await adminClient.rpc('check_and_consume_ai_credit', {
    p_org_id: req.organization_id,
  })

  if (!hasCredit) {
    logWarn('[runBriefAnalysis] AI kredi limiti aşıldı, org:', req.organization_id)
    return null
  }

  const prompt = buildBriefAnalysisPrompt(
    req.title,
    req.description ?? '',
    req.request_type,
    req.brand ?? null
  )

  const client = getAIClient()
  const completion = await withRetry(() =>
    client.chat.completions.create({
      model: MODELS.fast,
      messages: [
        { role: 'system', content: BRIEF_ANALYSIS_SYSTEM },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    })
  )

  const latency = Date.now() - startTime
  const responseText = completion.choices[0]?.message?.content ?? ''

  let result: BriefAnalysisResult
  try {
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    result = JSON.parse(jsonMatch?.[0] ?? responseText)
  } catch {
    logError('[runBriefAnalysis] JSON parse hatası:', responseText)
    return null
  }

  await adminClient
    .from('requests')
    .update({
      ai_brief_score: result.score,
      ai_brief_suggestions: { ...result },
    })
    .eq('id', requestId)

  const userId = triggeredByUserId ?? req.created_by
  await adminClient.from('ai_requests').insert({
    organization_id: req.organization_id,
    user_id: userId,
    request_id: requestId,
    feature: 'brief_analysis',
    model: MODELS.fast,
    prompt_tokens: completion.usage?.prompt_tokens ?? 0,
    completion_tokens: completion.usage?.completion_tokens ?? 0,
    total_tokens: completion.usage?.total_tokens ?? 0,
    latency_ms: latency,
    status: 'success',
  })

  return result
}
