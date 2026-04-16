'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Building2 } from 'lucide-react'

const ROLE_LABELS: Record<string, string> = {
  designer: 'Tasarımcı',
  client: 'Proje Yöneticisi',
}

export default function JoinPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createClient()

  const role = searchParams.get('role') ?? 'designer'

  const [orgName, setOrgName] = useState('')
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.replace('/login')
        return
      }

      const { data: existing } = await supabase
        .from('users')
        .select('id, status')
        .eq('id', user.id)
        .single()

      if (existing?.status === 'pending_approval') {
        router.replace('/pending')
        return
      }
      if (existing?.status === 'active') {
        router.replace('/dashboard')
        return
      }

      setChecking(false)
    }
    check()
  }, [router, supabase])

  const handleRequestToJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = orgName.trim()
    if (!trimmed || trimmed.length < 2) {
      setError('Organizasyon adı en az 2 karakter olmalı')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await fetch('/api/join-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orgName: trimmed, role }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (res.status === 404) {
          setError('Organizasyon bulunamadı. Lütfen adı kontrol edip yeniden girin.')
          setOrgName('')
          const input = document.getElementById('orgName') as HTMLInputElement | null
          input?.focus()
          return
        }
        setError(data.error ?? 'Katılım isteği gönderilemedi')
        return
      }

      router.push('/pending')
    } catch {
      setError('Beklenmeyen bir hata oluştu. Lütfen tekrar deneyin.')
    } finally {
      setLoading(false)
    }
  }

  if (checking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-white px-6 sm:px-8">
      <div className="w-full max-w-sm flex flex-col">
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-semibold text-gray-900">Organizasyona Katıl</h2>
          <p className="text-sm text-gray-500/90 mt-3">
            <span className="font-medium text-gray-700">{ROLE_LABELS[role] ?? role}</span> olarak katılmak
            istediğiniz organizasyonu bulalım
          </p>
        </div>

        {/* Seçenek 1: Davet linki */}
        <div className="w-full bg-gray-50 border border-dashed border-gray-300/70 rounded-2xl px-6 py-4 mb-4">
          <div className="flex items-start gap-3">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
            <div>
              <p className="text-sm font-medium text-gray-800">Davet Linki ile Katıl</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Yöneticinizden davet e-postası aldıysanız, o e-postadaki linke tıklayarak doğrudan katılabilirsiniz.
              </p>
            </div>
          </div>
        </div>

        {/* Seçenek 2: Katılım isteği */}
        <div className="w-full bg-white border border-gray-300/60 rounded-2xl px-6 py-4 mb-4">
          <div className="flex items-start gap-3 mb-4">
            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
            <div>
              <p className="text-sm font-medium text-gray-800">Katılım İsteği Gönder</p>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Organizasyon adını girin; yönetici onayladıktan sonra erişim sağlarsınız.
              </p>
            </div>
          </div>

          <form onSubmit={handleRequestToJoin}>
            <div className="flex items-center w-full bg-white border border-gray-300/60 h-12 rounded-full overflow-hidden pl-6 gap-3 mb-3 pr-3">
              <Building2 className="w-4 h-4 text-gray-600 shrink-0" />
              <input
                id="orgName"
                type="text"
                placeholder="örn. Acme Design Studio"
                value={orgName}
                onChange={e => {
                  setOrgName(e.target.value)
                  setError(null)
                }}
                disabled={loading}
                autoFocus
                className="bg-transparent text-gray-700 placeholder-gray-500/80 outline-none text-sm w-full h-full"
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 mb-3 px-1">{error}</p>
            )}

            <button
              type="submit"
              disabled={loading || orgName.trim().length < 2}
              className="w-full h-11 rounded-full text-white bg-primary hover:opacity-90 disabled:opacity-40 transition-opacity font-medium text-sm"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Gönderiliyor…
                </span>
              ) : (
                'Katılım İsteği Gönder'
              )}
            </button>
          </form>
        </div>

        <button
          type="button"
          onClick={() => router.back()}
          disabled={loading}
          className="text-xs text-gray-500 hover:text-gray-700 transition-colors text-center"
        >
          ← Geri
        </button>
      </div>
    </div>
  )
}
