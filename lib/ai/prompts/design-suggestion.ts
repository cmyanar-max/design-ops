import { Brand } from '@/types/database'

export interface DesignSuggestionResult {
  layout: string[]          // Layout önerileri
  color_palette: {          // Renk paleti
    primary: string
    secondary: string
    accent: string
    background: string
    rationale: string
  }
  typography: {             // Font önerileri
    heading: string
    body: string
    rationale: string
  }
  mood: string[]            // Moodboard anahtar kelimeleri (Unsplash arama terimleri)
  dos: string[]             // Yapılması gerekenler
  donts: string[]           // Yapılmaması gerekenler
}

export function buildDesignSuggestionPrompt(
  title: string,
  description: string,
  requestType: string,
  brand?: Brand | null
): string {
  const brandContext = brand
    ? `\nMarka: ${brand.name}, Ton: ${brand.tone_of_voice ?? 'belirtilmemiş'}, Hedef: ${brand.target_audience ?? 'belirtilmemiş'}, Ana Renk: ${brand.primary_color ?? 'yok'}`
    : ''

  return `Sen deneyimli bir UI/UX ve grafik tasarım uzmanısın. Aşağıdaki brief için tasarım önerileri sun:

Başlık: ${title}
Tür: ${requestType}${brandContext}
Brief: ${description}

Yanıtı şu JSON formatında ver:
{
  "layout": ["<layout önerisi 1>", "<layout önerisi 2>", "<layout önerisi 3>"],
  "color_palette": {
    "primary": "<hex kodu>",
    "secondary": "<hex kodu>",
    "accent": "<hex kodu>",
    "background": "<hex kodu>",
    "rationale": "<neden bu renkler>"
  },
  "typography": {
    "heading": "<font adı>",
    "body": "<font adı>",
    "rationale": "<neden bu fontlar>"
  },
  "mood": ["<kelime1>", "<kelime2>", "<kelime3>"],
  "dos": ["<yapılması gereken 1>", "<yapılması gereken 2>"],
  "donts": ["<yapılmaması gereken 1>", "<yapılmaması gereken 2>"]
}`
}
