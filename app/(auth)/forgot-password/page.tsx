'use client'

import { useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback?next=/settings/profile`,
      })
      if (error) throw error
      setSent(true)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="space-y-4 text-center">
        <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-bold text-xl">E-posta gönderildi</h2>
        <p className="text-sm text-muted-foreground">
          <strong>{email}</strong> adresine şifre sıfırlama bağlantısı gönderdik.
          Gelen kutunuzu kontrol edin.
        </p>
        <Link href="/login" className="text-sm text-primary hover:underline block">
          Giriş sayfasına dön
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Şifremi Sıfırla</h1>
        <p className="text-sm text-muted-foreground">
          E-posta adresinizi girin, sıfırlama bağlantısı gönderelim.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">E-posta</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="ahmet@sirket.com"
            required
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading || !email}>
          {loading ? 'Gönderiliyor...' : 'Sıfırlama Bağlantısı Gönder'}
        </Button>
      </form>

      <p className="text-center text-sm text-muted-foreground">
        <Link href="/login" className="text-primary hover:underline">
          ← Giriş sayfasına dön
        </Link>
      </p>
    </div>
  )
}
