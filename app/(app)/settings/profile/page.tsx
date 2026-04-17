'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { toast } from 'sonner'

interface ProfileData {
  id: string
  name: string
  email: string
  phone: string | null
  timezone: string
  locale: string
  avatar_url: string | null
  title: string | null
}

export default function ProfileSettingsPage() {
  const router = useRouter()
  const [supabase] = useState(() => createClient())
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [form, setForm] = useState({ name: '', title: '', phone: '', timezone: 'Europe/Istanbul', locale: 'tr' })

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      // title kolonu migration sonrası gelir; önce onunla dene, hata varsa olmadan çek
      let userData: ProfileData | null = null
      const { data: d1, error: e1 } = await supabase
        .from('users')
        .select('id, name, email, phone, timezone, locale, avatar_url, title')
        .eq('id', user.id)
        .single()
      if (!e1 && d1) {
        userData = d1 as ProfileData
      } else {
        const { data: d2 } = await supabase
          .from('users')
          .select('id, name, email, phone, timezone, locale, avatar_url')
          .eq('id', user.id)
          .single()
        userData = d2 as ProfileData | null
      }

      if (userData) {
        setProfile(userData)
        setForm({
          name: userData.name,
          title: userData.title ?? '',
          phone: userData.phone ?? '',
          timezone: userData.timezone ?? 'Europe/Istanbul',
          locale: userData.locale ?? 'tr',
        })
      }
    }
    load()
  }, [router, supabase])

  const handleSave = async () => {
    if (!profile) return
    setLoading(true)
    try {
      const { error } = await supabase
        .from('users')
        .update({
          name: form.name.trim(),
          title: form.title.trim() || null,
          phone: form.phone.trim() || null,
          timezone: form.timezone,
          locale: form.locale,
        })
        .eq('id', profile.id)
      if (error) throw error
      toast.success('Profil güncellendi')
      router.refresh()
    } catch {
      toast.error('Profil güncellenemedi')
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAccount = async () => {
    setDeleting(true)
    try {
      const response = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      })

      const data = await response.json()

      if (!response.ok) {
        toast.error(data.error || 'Hesap silinirken bir hata oluştu')
        return
      }

      toast.success('Hesap başarıyla silindi')
      // Oturumu kapat ve login sayfasına yönlendir
      await supabase.auth.signOut()
      router.push('/login')
    } catch {
      toast.error('Hesap silinirken bir hata oluştu')
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (!profile) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="h-8 w-48 bg-muted rounded animate-pulse mb-6" />
        <Card><CardContent className="pt-6 space-y-4">
          {[1,2,3,4].map(i => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}
        </CardContent></Card>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/settings" className="text-muted-foreground hover:text-foreground">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold">Profil Ayarları</h1>
      </div>

      <Card>
        <CardHeader className="pt-2 pb-0 px-6">
          <CardTitle className="text-base">Kişisel Bilgiler</CardTitle>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-6 space-y-5">
          {/* Avatar */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xl font-bold shrink-0">
              {form.name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase() || '?'}
            </div>
            <div>
              <p className="text-sm font-medium">Profil Fotoğrafı</p>
              <p className="text-xs text-muted-foreground">Avatar yükleme yakında gelecek</p>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="title">Unvan</Label>
            <Input
              id="title"
              value={form.title}
              onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
              placeholder="Örn: Kıdemli Tasarım Müdürü"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="name">Ad Soyad</Label>
            <Input
              id="name"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Ad Soyad"
            />
          </div>

          <div className="grid gap-2">
            <Label>E-posta</Label>
            <Input value={profile.email} disabled className="opacity-60" />
            <p className="text-xs text-muted-foreground">E-posta değişiklikleri sadece admin yetkisindedir. Lütfen adminiz ile iletişime geçin.</p>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Telefon (opsiyonel)</Label>
            <Input
              id="phone"
              value={form.phone}
              onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
              placeholder="+90 555 000 00 00"
            />
          </div>

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Zaman Dilimi</Label>
              <Select value={form.timezone} onValueChange={v => v && setForm(f => ({ ...f, timezone: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Europe/Istanbul">İstanbul (UTC+3)</SelectItem>
                  <SelectItem value="Europe/Ankara">Ankara (UTC+3)</SelectItem>
                  <SelectItem value="Europe/London">Londra (UTC+0/+1)</SelectItem>
                  <SelectItem value="Europe/Paris">Paris (UTC+1/+2)</SelectItem>
                  <SelectItem value="Europe/Berlin">Berlin (UTC+1/+2)</SelectItem>
                  <SelectItem value="Europe/Amsterdam">Amsterdam (UTC+1/+2)</SelectItem>
                  <SelectItem value="Europe/Rome">Roma (UTC+1/+2)</SelectItem>
                  <SelectItem value="Europe/Madrid">Madrid (UTC+1/+2)</SelectItem>
                  <SelectItem value="Europe/Stockholm">Stockholm (UTC+1/+2)</SelectItem>
                  <SelectItem value="Europe/Warsaw">Varşova (UTC+1/+2)</SelectItem>
                  <SelectItem value="Europe/Athens">Atina (UTC+2/+3)</SelectItem>
                  <SelectItem value="Europe/Bucharest">Bükreş (UTC+2/+3)</SelectItem>
                  <SelectItem value="Europe/Kiev">Kyiv (UTC+2/+3)</SelectItem>
                  <SelectItem value="Europe/Moscow">Moskova (UTC+3)</SelectItem>
                  <SelectItem value="Asia/Dubai">Dubai (UTC+4)</SelectItem>
                  <SelectItem value="Asia/Karachi">Karaçi (UTC+5)</SelectItem>
                  <SelectItem value="Asia/Kolkata">Hindistan (UTC+5:30)</SelectItem>
                  <SelectItem value="Asia/Dhaka">Dakka (UTC+6)</SelectItem>
                  <SelectItem value="Asia/Bangkok">Bangkok (UTC+7)</SelectItem>
                  <SelectItem value="Asia/Singapore">Singapur (UTC+8)</SelectItem>
                  <SelectItem value="Asia/Shanghai">Şanghay (UTC+8)</SelectItem>
                  <SelectItem value="Asia/Tokyo">Tokyo (UTC+9)</SelectItem>
                  <SelectItem value="Asia/Seoul">Seul (UTC+9)</SelectItem>
                  <SelectItem value="Australia/Sydney">Sidney (UTC+10/+11)</SelectItem>
                  <SelectItem value="Pacific/Auckland">Auckland (UTC+12/+13)</SelectItem>
                  <SelectItem value="America/New_York">New York (UTC-5/-4)</SelectItem>
                  <SelectItem value="America/Chicago">Chicago (UTC-6/-5)</SelectItem>
                  <SelectItem value="America/Denver">Denver (UTC-7/-6)</SelectItem>
                  <SelectItem value="America/Los_Angeles">Los Angeles (UTC-8/-7)</SelectItem>
                  <SelectItem value="America/Anchorage">Anchorage (UTC-9/-8)</SelectItem>
                  <SelectItem value="America/Sao_Paulo">São Paulo (UTC-3)</SelectItem>
                  <SelectItem value="America/Mexico_City">Meksiko (UTC-6/-5)</SelectItem>
                  <SelectItem value="America/Toronto">Toronto (UTC-5/-4)</SelectItem>
                  <SelectItem value="America/Vancouver">Vancouver (UTC-8/-7)</SelectItem>
                  <SelectItem value="Africa/Cairo">Kahire (UTC+2/+3)</SelectItem>
                  <SelectItem value="Africa/Johannesburg">Johannesburg (UTC+2)</SelectItem>
                  <SelectItem value="Africa/Lagos">Lagos (UTC+1)</SelectItem>
                  <SelectItem value="UTC">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Dil</Label>
              <Select value={form.locale} onValueChange={v => v && setForm(f => ({ ...f, locale: v }))}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tr">Türkçe</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button onClick={handleSave} disabled={loading || !form.name.trim()}>
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </Button>
          </div>

          {/* Hesabı Sil Butonu */}
          <div className="pt-6 border-t mt-3">
            <div className="space-y-3">
              <div>
                <p className="text-sm font-medium text-destructive">Hesabı Sil</p>
                <p className="text-xs text-muted-foreground mt-1">Bu işlem geri alınamaz. Hesabınız ve tüm verileriniz kalıcı olarak silinecektir.</p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowDeleteDialog(true)}
                disabled={deleting}
              >
                {deleting ? 'Siliniyor...' : 'Hesabı Kalıcı Olarak Sil'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Hesap Silme Onay Diyaloğu */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hesabı Kalıcı Olarak Sil?</AlertDialogTitle>
            <AlertDialogDescription>
              Bu işlem geri alınamaz. Lütfen emin olduğunuzdan sonra devam edin.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Silinecek bilgiler:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Profil bilgileri ve ayarlar</li>
              <li>Tüm projeler ve istekler</li>
              <li>Tüm dosyalar ve açıklamalar</li>
              <li>Ekip üyeliği bilgileri</li>
            </ul>
          </div>
          <div className="flex gap-3 justify-end">
            <AlertDialogCancel disabled={deleting}>İptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? 'Siliniyor...' : 'Evet, Sil'}
            </AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
