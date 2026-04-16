export interface RevisionTranslationResult {
  summary: string           // Kısa özet
  tasks: string[]           // Tasarımcı için somut görev listesi
  priority: 'low' | 'medium' | 'high'
  estimated_time: string    // Tahmini süre
}

export function buildRevisionTranslationPrompt(clientComment: string, briefContext: string): string {
  return `Sen bir tasarım proje yöneticisisin. Aşağıdaki müşteri yorumunu tasarımcı için net görev listesine çevir:

Proje Bağlamı:
${briefContext}

Müşteri Yorumu:
${clientComment}

Yanıtı JSON formatında ver:
{
  "summary": "<2-3 cümle özet>",
  "tasks": ["<görev 1>", "<görev 2>", "<görev 3>"],
  "priority": "<low|medium|high>",
  "estimated_time": "<tahmini süre, ör: 2-3 saat>"
}`
}
