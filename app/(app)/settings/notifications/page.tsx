'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface NotifPrefs {
  email: boolean
  in_app: boolean
  request_assigned: boolean
  status_changed: boolean
  comment_added: boolean
  revision_requested: boolean
  approved: boolean
  deadline_reminder: boolean
}

const DEFAULT_PREFS: NotifPrefs = {
  email: true,
  in_app: true,
  request_assigned: true,
  status_changed: true,
  comment_added: true,
  revision_requested: true,
  approved: true,
  deadline_reminder: true,
}

const PREF_LABELS: { key: keyof NotifPrefs; label: string; description: string }[] = [
  { key: 'email', label: 'E-posta Bildirimleri', description: 'Tüm bildirimleri e-posta ile al' },
  { key: 'in_app', label: 'Uygulama İçi', description: 'Zil ikonunda bildirim göster' },
  { key: 'request_assigned', label: 'Talep Atandı', description: 'Sana bir talep atandığında' },
  { key: 'status_changed', label: 'Durum Değişikliği', description: 'Talebin durumu güncellendiğinde' },
  { key: 'comment_added', label: 'Yeni Yorum', description: 'Takip ettiğin talebe yorum eklendiğinde' },
  { key: 'revision_requested', label: 'Revizyon İstendi', description: 'Proje Yönetici revizyon talep ettiğinde' },
  { key: 'approved', label: 'Onaylandı', description: 'Tasarım onaylandığında' },
  { key: 'deadline_reminder', label: 'Son Gün Hatırlatma', description: 'Teslim tarihinden 1 gün önce' },
]

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-primary' : 'bg-muted-foreground/30'
      }`}
    >
      <span className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
    </button>
  )
}

export default function NotificationSettingsPage() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [userId, setUserId] = useState<string | null>(null)
  const [prefs, setPrefs] = useState<NotifPrefs>(DEFAULT_PREFS)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }
      setUserId(user.id)
      const { data } = await supabase
        .from('users')
        .select('notification_prefs')
        .eq('id', user.id)
        .single()
      if (data?.notification_prefs) {
        setPrefs({ ...DEFAULT_PREFS, ...(data.notification_prefs as Partial<NotifPrefs>) })
      }
    }
    load()
  }, [router, supabase])

  const handleSave = async () => {
    if (!userId) return
    setLoading(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({ notification_prefs: prefs })
        .eq('id', userId)
      if (error) throw error
      toast.success('Bildirim tercihleri kaydedildi')
    } catch {
      toast.error('Kaydedilemedi')
    } finally {
      setLoading(false)
    }
  }

  const set = (key: keyof NotifPrefs, value: boolean) => {
    setPrefs(p => ({ ...p, [key]: value }))
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/settings" className="text-muted-foreground hover:text-foreground">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold">Bildirim Tercihleri</h1>
      </div>

      <Card>
        <CardHeader className="pt-2 pb-0 px-6">
          <CardTitle className="text-base">Bildirim Kanalları</CardTitle>
          <CardDescription className="text-xs">Hangi kanallardan bildirim almak istediğinizi seçin</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-6 space-y-5">
          {PREF_LABELS.slice(0, 2).map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <Toggle checked={prefs[key]} onChange={v => set(key, v)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pt-2 pb-0 px-6">
          <CardTitle className="text-base">Bildirim Türleri</CardTitle>
          <CardDescription className="text-xs">Hangi olaylarda bildirim almak istediğinizi seçin</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-6 space-y-5">
          {PREF_LABELS.slice(2).map(({ key, label, description }) => (
            <div key={key} className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
              </div>
              <Toggle checked={prefs[key]} onChange={v => set(key, v)} />
            </div>
          ))}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={handleSave} disabled={loading}>
          {loading ? 'Kaydediliyor...' : 'Tercihleri Kaydet'}
        </Button>
      </div>
    </div>
  )
}
