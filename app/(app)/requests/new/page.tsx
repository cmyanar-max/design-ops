'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { requestSchema, RequestFormValues, REQUEST_TYPES, PRIORITIES } from '@/lib/validations/request'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/base-badge'
import { toast } from 'sonner'
import { Brand } from '@/types/database'
import { createClient } from '@/lib/supabase/client'

export default function NewRequestPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [brands, setBrands] = useState<Brand[]>([])
  const [tagInput, setTagInput] = useState('')
  const supabase = createClient()

  const { register, handleSubmit, watch, setValue, getValues, formState: { errors } } = useForm<RequestFormValues>({
    resolver: zodResolver(requestSchema),
    defaultValues: { priority: 'medium', tags: [] },
  })

  const tags = watch('tags')

  useEffect(() => {
    supabase.from('brands').select('id, name, primary_color').then(({ data }) => {
      if (data) setBrands(data as Brand[])
    })
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const addTag = () => {
    const t = tagInput.trim().toLowerCase()
    if (t && !tags.includes(t)) {
      setValue('tags', [...tags, t])
    }
    setTagInput('')
  }

  const removeTag = (tag: string) => {
    setValue('tags', tags.filter(t => t !== tag))
  }

  const onSubmit = async (values: RequestFormValues) => {
    setLoading(true)
    try {
      const res = await fetch('/api/requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Talep oluşturulamadı')
      }

      const newRequest = await res.json()
      toast.success('Talep oluşturuldu! AI brief analizi yapılıyor...')
      router.push(`/requests/${newRequest.id}`)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Yeni Tasarım Talebi</h1>
        <p className="text-muted-foreground text-sm mt-1">
          Brief'i ne kadar detaylı doldurursanız, AI o kadar iyi öneri üretir.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Temel Bilgiler */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Temel Bilgiler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Talep Başlığı *</Label>
              <Input
                id="title"
                placeholder="ör. Instagram kampanya görseli — Yaz İndirimi"
                {...register('title')}
              />
              {errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tasarım Türü *</Label>
                <Select onValueChange={(v) => setValue('request_type', v as RequestFormValues['request_type'])}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seçin..." />
                  </SelectTrigger>
                  <SelectContent>
                    {REQUEST_TYPES.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.request_type && <p className="text-xs text-destructive">{errors.request_type.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Öncelik</Label>
                <Select
                  defaultValue="medium"
                  onValueChange={(v) => setValue('priority', v as RequestFormValues['priority'])}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITIES.map(p => (
                      <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deadline">Son Tarih</Label>
                <Input id="deadline" type="date" {...register('deadline')} />
              </div>

              {brands.length > 0 && (
                <div className="space-y-2">
                  <Label>Marka</Label>
                  <Select onValueChange={(v) => setValue('brand_id', v as string)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Seçin..." />
                    </SelectTrigger>
                    <SelectContent>
                      {brands.map(b => (
                        <SelectItem key={b.id} value={b.id}>{b.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Brief */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Brief (Tasarım Açıklaması)</CardTitle>
            <CardDescription>
              Hedef kitle, kullanım yeri, istenilen his/ton, referanslar ve teknik gereksinimler
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="description">Açıklama *</Label>
              <Textarea
                id="description"
                rows={8}
                placeholder={`Örnek:
• Hedef kitle: 18-35 yaş, kadın
• Kullanım: Instagram feed (1080x1080px) ve story (1080x1920px)
• Ton: Eğlenceli, enerjik, yaz temalı
• Renkler: Marka renklerimiz + canlı mercan ve sarı
• Metin: "Yaz İndirimi %40'a kadar" başlığı + CTA butonu
• Referans: [bağlantı] stiline yakın ama daha minimal`}
                {...register('description')}
              />
              {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
            </div>

            {/* Etiketler */}
            <div className="space-y-2">
              <Label>Etiketler</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Etiket ekle..."
                  value={tagInput}
                  onChange={e => setTagInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addTag() } }}
                />
                <Button type="button" variant="outline" onClick={addTag}>Ekle</Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {tags.map(tag => (
                    <Badge key={tag} variant="secondary" appearance="light" size="sm" className="gap-1">
                      {tag}
                      <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive">×</button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={() => router.back()}>
            İptal
          </Button>
          <Button type="submit" disabled={loading} className="flex-1">
            {loading ? 'Oluşturuluyor...' : 'Talep Oluştur'}
          </Button>
        </div>
      </form>
    </div>
  )
}
