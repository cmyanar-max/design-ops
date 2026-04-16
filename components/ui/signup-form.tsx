'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react'

const signupSchema = z.object({
  name: z.string().min(2, 'Ad en az 2 karakter olmalı'),
  email: z.string().email('Geçerli bir e-posta girin'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı'),
})

type SignupFormType = z.infer<typeof signupSchema>

export default function SignupForm() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const supabase = createClient()

  const { register, handleSubmit, formState: { errors } } = useForm<SignupFormType>({
    resolver: zodResolver(signupSchema),
  })

  const onSubmit = async (values: SignupFormType) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.auth.signUp({
        email: values.email,
        password: values.password,
        options: {
          data: { name: values.name },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
        },
      })

      if (error) throw error
      if (!data.user) throw new Error('Kullanıcı oluşturulamadı')

      router.push('/onboarding/role')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Kayıt sırasında hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-white px-6 sm:px-8">
      <form onSubmit={handleSubmit(onSubmit)} className="w-full max-w-sm flex flex-col">
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-semibold text-gray-900">Hesap Oluştur</h2>
          <p className="text-sm text-gray-500/90 mt-3">
            Hesabınızı oluşturun, sonraki adımda rolünüzü belirleyeceksiniz
          </p>
        </div>

        {/* Name Input */}
        <div className="flex items-center w-full bg-white border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6 gap-3 mb-4">
          <User className="w-4 h-4 text-gray-600" />
          <input
            type="text"
            placeholder="Ad Soyad"
            className="bg-transparent text-gray-700 placeholder-gray-500/80 outline-none text-sm w-full h-full"
            {...register('name')}
            required
          />
        </div>
        {errors.name && <p className="text-xs text-red-500 mb-3">{errors.name.message}</p>}

        {/* Email Input */}
        <div className="flex items-center w-full bg-white border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6 gap-3 mb-4">
          <Mail className="w-4 h-4 text-gray-600" />
          <input
            type="email"
            placeholder="E-posta adresiniz"
            className="bg-transparent text-gray-700 placeholder-gray-500/80 outline-none text-sm w-full h-full"
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
            placeholder="Şifre (en az 8 karakter)"
            className="bg-transparent text-gray-700 placeholder-gray-500/80 outline-none text-sm w-full h-full"
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
        {errors.password && <p className="text-xs text-red-500 mb-6">{errors.password.message}</p>}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-11 rounded-full text-white bg-primary hover:opacity-90 disabled:opacity-70 transition-opacity font-medium mb-4"
        >
          {loading ? 'Oluşturuluyor...' : 'Hesap Oluştur'}
        </button>

        {/* Login Link */}
        <p className="text-gray-600/90 text-sm text-center mb-3">
          Zaten hesabınız var mı?{' '}
          <Link href="/login" className="text-primary hover:opacity-80 font-medium transition-opacity">
            Giriş yapın
          </Link>
        </p>

        {/* Terms & Privacy */}
        <p className="text-gray-500/90 text-xs text-center">
          Kaydolarak{' '}
          <Link href="/terms" className="text-primary hover:opacity-80 transition-opacity">Kullanım Şartları</Link>
          {' '}ve{' '}
          <Link href="/privacy" className="text-primary hover:opacity-80 transition-opacity">Gizlilik Politikası</Link>
          {'\'nı kabul etmiş olursunuz.'}
        </p>

        {/* Back to Home */}
        <div className="mt-2 text-center">
          <Link href="/" className="text-xs text-gray-500 hover:text-gray-700 transition-colors">
            ← Ana Sayfaya Dön
          </Link>
        </div>
      </form>
    </div>
  )
}
