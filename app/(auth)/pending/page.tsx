'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Clock } from 'lucide-react'

export default function PendingApprovalPage() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-white px-6 sm:px-8">
      <div className="w-full max-w-sm flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-amber-100 flex items-center justify-center mb-6">
          <Clock className="w-6 h-6 text-amber-600" />
        </div>

        <h2 className="text-4xl font-semibold text-gray-900 mb-3">Onay Bekleniyor</h2>
        <p className="text-sm text-gray-500/90 leading-relaxed mb-2">
          Hesabınız başarıyla oluşturuldu. Organizasyon yöneticisi hesabınızı
          onayladıktan sonra uygulamaya erişebileceksiniz.
        </p>
        <p className="text-sm text-gray-500/90 mb-6">
          Onay tamamlandığında e-posta ile bilgilendirileceksiniz.
        </p>

        <div className="w-full bg-amber-50 border border-amber-200/80 rounded-2xl px-6 py-4 text-left mb-6">
          <p className="text-xs font-medium text-amber-700 mb-2">Sonraki adımlar</p>
          <ol className="space-y-1.5">
            {[
              'Yönetici hesabınızı onaylayacak',
              'Onay e-postası alacaksınız',
              'Giriş yaparak uygulamaya erişebileceksiniz',
            ].map((step, i) => (
              <li key={i} className="flex items-center gap-2 text-xs text-amber-600">
                <span className="w-4 h-4 rounded-full bg-amber-200 text-amber-700 text-[10px] font-bold flex items-center justify-center shrink-0">
                  {i + 1}
                </span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <button
          type="button"
          onClick={handleSignOut}
          className="w-full h-11 rounded-full text-gray-700 bg-white border border-gray-300/60 hover:border-gray-400/60 transition-colors font-medium text-sm"
        >
          Çıkış Yap
        </button>
      </div>
    </div>
  )
}
