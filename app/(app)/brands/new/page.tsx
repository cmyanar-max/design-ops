'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export default function NewBrandPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '',
    primary_color: '#000000',
    secondary_color: '',
    accent_color: '',
    font_primary: '',
    font_secondary: '',
    tone_of_voice: '',
    target_audience: '',
    guidelines_text: '',
  })

  const set = (key: string, value: string) => setForm(f => ({ ...f, [key]: value }))

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Marka adı zorunlu'); return }
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Giriş gerekli')

      const { data: currentUser } = await supabase
        .from('users')
        .select('organization_id, role')
        .eq('id', user.id)
        .single()

      if (!currentUser || currentUser.role !== 'admin') {
        throw new Error('Yalnızca admin marka ekleyebilir')
      }

      const { error } = await supabase.from('brands').insert({
        organization_id: currentUser.organization_id,
        name: form.name.trim(),
        primary_color: form.primary_color || null,
        secondary_color: form.secondary_color || null,
        accent_color: form.accent_color || null,
        font_primary: form.font_primary || null,
        font_secondary: form.font_secondary || null,
        tone_of_voice: form.tone_of_voice || null,
        target_audience: form.target_audience || null,
        guidelines_text: form.guidelines_text || null,
        created_by: user.id,
      })

      if (error) throw error
      toast.success('Marka oluşturuldu')
      router.push('/brands')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <button onClick={() => router.back()} className="text-muted-foreground hover:text-foreground">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h1 className="font-heading text-2xl font-bold tracking-tight">Yeni Marka</h1>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pt-2 pb-0 px-6">
            <CardTitle className="text-base">Temel Bilgiler</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Marka Adı *</Label>
              <Input id="name" value={form.name} onChange={e => set('name', e.target.value)} placeholder="Örn: Acme Corp" />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="primary_color">Ana Renk</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  id="primary_color"
                  value={form.primary_color}
                  onChange={e => set('primary_color', e.target.value)}
                  className="w-10 h-10 rounded border border-border cursor-pointer"
                />
                <Input value={form.primary_color} onChange={e => set('primary_color', e.target.value)} placeholder="#000000" className="flex-1" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="secondary_color">İkincil Renk</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  id="secondary_color"
                  value={form.secondary_color || '#ffffff'}
                  onChange={e => set('secondary_color', e.target.value)}
                  className="w-10 h-10 rounded border border-border cursor-pointer"
                />
                <Input value={form.secondary_color} onChange={e => set('secondary_color', e.target.value)} placeholder="#ffffff" className="flex-1" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="accent_color">Vurgu Rengi</Label>
              <div className="flex gap-2 items-center">
                <input
                  type="color"
                  id="accent_color"
                  value={form.accent_color || '#0000ff'}
                  onChange={e => set('accent_color', e.target.value)}
                  className="w-10 h-10 rounded border border-border cursor-pointer"
                />
                <Input value={form.accent_color} onChange={e => set('accent_color', e.target.value)} placeholder="#0000ff" className="flex-1" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="font_primary">Ana Yazı Tipi</Label>
                <Input id="font_primary" value={form.font_primary} onChange={e => set('font_primary', e.target.value)} placeholder="Örn: Inter" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="font_secondary">İkincil Yazı Tipi</Label>
                <Input id="font_secondary" value={form.font_secondary} onChange={e => set('font_secondary', e.target.value)} placeholder="Örn: Georgia" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pt-2 pb-0 px-6">
            <CardTitle className="text-base">AI Bağlamı</CardTitle>
          </CardHeader>
          <CardContent className="px-6 pb-6 space-y-4">
            <p className="text-xs text-muted-foreground">Bu bilgiler AI tasarım önerilerinde kullanılır.</p>
            <div className="grid gap-2">
              <Label htmlFor="tone_of_voice">Ses Tonu</Label>
              <Input id="tone_of_voice" value={form.tone_of_voice} onChange={e => set('tone_of_voice', e.target.value)} placeholder="Örn: Profesyonel, samimi, yenilikçi" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="target_audience">Hedef Kitle</Label>
              <Input id="target_audience" value={form.target_audience} onChange={e => set('target_audience', e.target.value)} placeholder="Örn: 25-45 yaş arası profesyoneller" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="guidelines_text">Marka Rehberi (Metin)</Label>
              <Textarea
                id="guidelines_text"
                value={form.guidelines_text}
                onChange={e => set('guidelines_text', e.target.value)}
                placeholder="Markanın değerleri, tasarım kuralları, kullanım yasakları vb."
                rows={7}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={() => router.back()} size="lg">İptal</Button>
        <Button onClick={handleSave} disabled={loading || !form.name.trim()} size="lg">
          {loading ? 'Kaydediliyor...' : 'Markayı Kaydet'}
        </Button>
      </div>
    </div>
  )
}
