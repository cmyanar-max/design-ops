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
  { value: 'low', label: 'Düşük', variant: 'secondary', appearance: 'default' },
  { value: 'medium', label: 'Orta', variant: 'primary', appearance: 'default' },
  { value: 'high', label: 'Yüksek', variant: 'warning', appearance: 'default' },
  { value: 'urgent', label: 'Acil', variant: 'destructive', appearance: 'default' },
] as const

export const STATUSES = [
  { value: 'new', label: 'Yeni', variant: 'secondary', appearance: 'default' },
  { value: 'brief_review', label: 'Brief İnceleme', variant: 'warning', appearance: 'default' },
  { value: 'design', label: 'Tasarımda', variant: 'primary', appearance: 'default' },
  { value: 'revision', label: 'Revizyon', variant: 'warning', appearance: 'default' },
  { value: 'approval', label: 'Onay Bekliyor', variant: 'info', appearance: 'default' },
  { value: 'completed', label: 'Tamamlandı', variant: 'success', appearance: 'default' },
  { value: 'archived', label: 'Arşivlendi', variant: 'secondary', appearance: 'default' },
  { value: 'cancelled', label: 'İptal', variant: 'destructive', appearance: 'default' },
] as const
