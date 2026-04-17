import { z } from 'zod'

export const requestSchema = z.object({
  title: z.string().min(3, 'Başlık en az 3 karakter olmalı').max(200),
  description: z.string().min(10, 'Açıklama en az 10 karakter olmalı').max(5000),
  request_type: z.enum([
    'social_post', 'banner', 'logo', 'video', 'presentation',
    'email_template', 'brochure', 'infographic', 'other',
  ]),
  priority: z.enum(['low', 'medium', 'high', 'urgent']),
  deadline: z.string().optional(),
  brand_id: z.string().uuid().optional(),
  tags: z.array(z.string()),
  estimated_hours: z.number().positive().optional(),
})

export type RequestFormValues = z.infer<typeof requestSchema>

export const REQUEST_TYPES = [
  { value: 'social_post', label: 'Sosyal Medya Görseli' },
  { value: 'banner', label: 'Banner / Afiş' },
  { value: 'logo', label: 'Logo Tasarımı' },
  { value: 'video', label: 'Video / Animasyon' },
  { value: 'presentation', label: 'Sunum' },
  { value: 'email_template', label: 'E-posta Şablonu' },
  { value: 'brochure', label: 'Broşür / Katalog' },
  { value: 'infographic', label: 'İnfografik' },
  { value: 'other', label: 'Diğer' },
] as const

export const PRIORITIES = [
  { value: 'low', label: 'Düşük', variant: 'gray-subtle' },
  { value: 'medium', label: 'Orta', variant: 'blue' },
  { value: 'high', label: 'Yüksek', variant: 'amber' },
  { value: 'urgent', label: 'Acil', variant: 'red' },
] as const

export const STATUSES = [
  { value: 'new', label: 'Yeni', variant: 'gray-subtle' },
  { value: 'brief_review', label: 'Brief İnceleme', variant: 'amber-subtle' },
  { value: 'design', label: 'Tasarımda', variant: 'blue' },
  { value: 'revision', label: 'Revizyon', variant: 'amber' },
  { value: 'approval', label: 'Onay Bekliyor', variant: 'purple' },
  { value: 'completed', label: 'Tamamlandı', variant: 'green' },
  { value: 'archived', label: 'Arşivlendi', variant: 'gray-subtle' },
  { value: 'cancelled', label: 'İptal', variant: 'red-subtle' },
] as const
