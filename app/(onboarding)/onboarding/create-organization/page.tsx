'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function CreateOrganizationPage() {
  const router = useRouter()
  const supabase = createClient()

  const [orgName, setOrgName] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Auth + mevcut kullanıcı kontrolü
  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }

      // Zaten kullanıcı kaydı varsa dashboard'a yönlendir
      const { data: existing } = await supabase
        .from('users')
        .select('id, status')
        .eq('id', user.id)
        .single()

      if (existing) {
        router.replace('/dashboard')
        return
      }

      setChecking(false)
    }
    check()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = orgName.trim()
    if (!trimmed || trimmed.length < 2) {
      setError('Organizasyon adı en az 2 karakter olmalı')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/organizations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error ?? 'Organizasyon oluşturulamadı')
        return
      }

      router.push('/dashboard')
    } catch {
      setError('Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/30 p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-bold">Organizasyonunuzu oluşturun</h1>
          <p className="text-sm text-muted-foreground">
            Çalışma alanınız için bir isim belirleyin
          </p>
        </div>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Organizasyon Bilgileri</CardTitle>
            <CardDescription className="text-xs">
              Bu isim ekibiniz tarafından görünecek. İstediğiniz zaman değiştirebilirsiniz.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="orgName">Organizasyon Adı</Label>
                <Input
                  id="orgName"
                  placeholder="örn. Acme Design Studio"
                  value={orgName}
                  onChange={e => setOrgName(e.target.value)}
                  disabled={loading}
                  autoFocus
                  maxLength={80}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <div className="flex gap-3 pt-1">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => router.back()}
                  disabled={loading}
                >
                  Geri
                </Button>
                <Button
                  type="submit"
                  className="flex-1"
                  disabled={loading || orgName.trim().length < 2}
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Oluşturuluyor…
                    </span>
                  ) : (
                    'Oluştur ve Devam Et'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
