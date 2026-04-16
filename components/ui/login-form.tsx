'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Mail, Lock, Eye, EyeOff } from 'lucide-react'

const loginSchema = z.object({
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(1, 'Şifre gerekli'),
})

type LoginFormType = z.infer<typeof loginSchema>

export default function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (searchParams.get('error') === 'unregistered') {
      toast.error('Hesabınız henüz kayıtlı değil. Lütfen kayıt formunu tamamlayın.')
    }
  }, [searchParams])

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormType>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (values: LoginFormType) => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        let exists = true
        try {
          const res = await fetch('/api/auth/check-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: values.email }),
          })
          if (res.ok) {
            const data = await res.json()
            exists = !!data.exists
          }
        } catch {}

        toast.error(exists ? 'Geçersiz Kullanıcı Adı Veya Şifre' : 'Kullanıcı Bulunamadı')
        return
      }

      toast.success('Başarıyla Giriş Yapıldı')
      router.push('/dashboard')
      router.refresh()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative h-screen w-full overflow-hidden bg-white">
      <div className="absolute inset-0 flex items-center justify-center px-6 sm:px-8 z-10">
        <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm flex flex-col">
          <div className="mb-8 text-center">
            <h2 className="text-4xl font-semibold text-gray-900">Giriş Yap</h2>
            <p className="text-sm text-gray-500/90 mt-3">
              Hoş geldiniz! Hesabınıza giriş yapın.
            </p>
          </div>


          {/* Email Input */}
          <div className="flex items-center w-full bg-white border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6 gap-3 mb-4">
            <Mail className="w-4 h-4 text-gray-600" />
            <input
              type="email"
              placeholder="E-posta adresiniz"
              className="bg-white text-gray-700 placeholder-gray-500/80 outline-none text-sm w-full h-full"
              {...register('email')}
              required
            />
          </div>
          {errors.email && <p className="text-xs text-red-500 mb-3">{errors.email.message}</p>}

          {/* Password Input */}
          <div className="flex items-center w-full bg-white border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6 gap-3 mb-6 pr-3">
            <Lock className="w-4 h-4 text-gray-600" />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Şifre"
              className="bg-white text-gray-700 placeholder-gray-500/80 outline-none text-sm w-full h-full"
              {...register('password')}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-gray-600 hover:text-gray-900 transition-colors flex-shrink-0"
              aria-label={showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-xs text-red-500 mb-3">{errors.password.message}</p>}

          {/* Remember & Forgot */}
          <div className="w-full flex items-center justify-between mb-6 text-gray-600">
            <div className="flex items-center gap-2">
              <input
                className="w-4 h-4 rounded bg-white border border-gray-300/60 cursor-pointer accent-primary"
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <label className="text-sm cursor-pointer" htmlFor="remember">Beni hatırla</label>
            </div>
            <Link href="/forgot-password" className="text-sm hover:text-primary transition-colors">
              Şifremi unuttum
            </Link>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full h-11 rounded-full text-white bg-primary hover:opacity-90 disabled:opacity-70 transition-opacity font-medium mb-4"
          >
            {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>

          {/* Sign Up Link */}
          <p className="text-gray-600/90 text-sm text-center mb-3">
            Hesabınız yok mu?{' '}
            <Link href="/signup" className="text-primary hover:opacity-80 font-medium transition-opacity">
              Kaydol
            </Link>
          </p>

          {/* Back to Home */}
          <div className="text-center">
            <Link href="/" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
              ← Ana Sayfaya Dön
            </Link>
          </div>
        </form>
      </div>
    </div>
  )
}
