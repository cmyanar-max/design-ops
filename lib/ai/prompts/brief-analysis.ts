import { Brand } from '@/types/database'

export const BRIEF_ANALYSIS_SYSTEM = `Sen deneyimli bir kreatif direktörsün. Tasarım brief'lerini analiz ederek:
1. Brief'in ne kadar eksiksiz ve netleştirilmiş olduğunu değerlendirirsin (0-100 puan)
2. Eksik veya belirsiz alanlara dikkat çekersin
3. Brief'i güçlendirecek somut öneriler sunarın
4. Tasarımcıya ya da proje yöneticisine işi görsel açıdan güçlendirmek için yardımcı olacak ipuçları verirsin.

Yanıtını MUTLAKA aşağıdaki JSON formatında ver:`

export interface BriefAnalysisResult {
  score: number              // 0-100 kalite skoru
  summary: string            // 2-3 cümle genel değerlendirme
  missing: string[]          // Eksik bilgiler
  suggestions: string[]      // İyileştirme önerileri (maks. 5)
  strengths: string[]        // Brief'in güçlü yönleri
  design_hints: string[]     // Tasarımcıya özel ipuçları
}

export function buildBriefAnalysisPrompt(
  title: string,
  description: string,
  requestType: string,
  brand?: Brand | null
): string {
  const brandContext = brand
    ? `\n\nMarka Bilgileri:\n- Marka adı: ${brand.name}\n- Ton: ${brand.tone_of_voice ?? 'Belirtilmemiş'}\n- Hedef kitle: ${brand.target_audience ?? 'Belirtilmemiş'}\n- Ana renk: ${brand.primary_color ?? 'Belirtilmemiş'}\n- Ana font: ${brand.font_primary ?? 'Belirtilmemiş'}`
    : ''

  const requestTypeLabels: Record<string, string> = {
    social_post: 'Sosyal Medya Görseli',
    banner: 'Banner / Afiş',
    logo: 'Logo Tasarımı',
    video: 'Video / Animasyon',
    presentation: 'Sunum',
    email_template: 'E-posta Şablonu',
    brochure: 'Broşür / Katalog',
    infographic: 'İnfografik',
    other: 'Diğer',
  }

  return `Aşağıdaki tasarım brief'ini analiz et ve JSON formatında yanıt ver:

Talep Başlığı: ${title}
Tasarım Türü: ${requestTypeLabels[requestType] ?? requestType}${brandContext}

Brief İçeriği:
${description}

Yanıtını şu JSON şemasıyla ver:
{
  "score": <0-100 arası puan>,
  "summary": "<genel değerlendirme>",
  "missing": ["<eksik bilgi 1>", "<eksik bilgi 2>"],
  "suggestions": ["<öneri 1>", "<öneri 2>", "<öneri 3>"],
  "strengths": ["<güçlü yön 1>", "<güçlü yön 2>"],
  "design_hints": ["<tasarımcı ipucu 1>", "<tasarımcı ipucu 2>"]
}`
}
