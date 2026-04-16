'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

type Role = 'admin' | 'designer' | 'client'

const ROLES: { value: Role; title: string; description: string }[] = [
  {
    value: 'admin',
    title: 'Yönetici',
    description: 'Yeni bir organizasyon kuracağım',
  },
  {
    value: 'designer',
    title: 'Tasarımcı',
    description: 'Mevcut bir ekibe tasarımcı olarak katılacağım',
  },
  {
    value: 'client',
    title: 'Proje Yöneticisi',
    description: 'Mevcut bir ekibe proje yöneticisi olarak katılacağım',
  },
]

export default function OnboardingRolePage() {
  const router = useRouter()
  const supabase = createClient()
  const [selected, setSelected] = useState<Role | null>(null)
  const [loading, setLoading] = useState(false)
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    let active = true
    supabase.auth.getUser().then(({ data }) => {
      if (!active) return
      if (!data.user) {
        router.replace('/login')
        return
      }
      setChecking(false)
    })
    return () => {
      active = false
    }
  }, [router, supabase])

  const handleContinue = () => {
    if (!selected) return
    setLoading(true)
    if (selected === 'admin') {
      router.push('/onboarding/create-organization')
    } else {
      router.push(`/onboarding/join?role=${selected}`)
    }
  }

  if (checking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-white">
        <p className="text-sm text-gray-500">Yükleniyor...</p>
      </div>
    )
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-white px-6 sm:px-8">
      <div className="w-full max-w-sm flex flex-col">
        <div className="mb-8 text-center">
          <h2 className="text-4xl font-semibold text-gray-900">Rolünüzü Seçin</h2>
          <p className="text-sm text-gray-500/90 mt-3">
            Rolünüze göre onboarding adımlarınızı belirleyeceğiz
          </p>
        </div>

        <div className="flex flex-col gap-3 mb-6">
          {ROLES.map(role => {
            const isActive = selected === role.value
            return (
              <button
                key={role.value}
                type="button"
                onClick={() => setSelected(role.value)}
                className={`flex items-center justify-between w-full bg-white border h-14 rounded-full px-6 gap-3 transition-colors text-left ${
                  isActive
                    ? 'border-primary ring-2 ring-primary/20'
                    : 'border-gray-300/60 hover:border-gray-400/60'
                }`}
              >
                <div className="flex flex-col">
                  <span className={`text-sm font-medium ${isActive ? 'text-gray-900' : 'text-gray-700'}`}>
                    {role.title}
                  </span>
                  <span className="text-xs text-gray-500/80">{role.description}</span>
                </div>
                <div
                  className={`h-4 w-4 rounded-full border-2 shrink-0 transition-colors ${
                    isActive ? 'border-primary bg-primary' : 'border-gray-300'
                  }`}
                />
              </button>
            )
          })}
        </div>

        <button
          type="button"
          disabled={!selected || loading}
          onClick={handleContinue}
          className="w-full h-11 rounded-full text-white bg-primary hover:opacity-90 disabled:opacity-40 transition-opacity font-medium"
        >
          {loading ? 'Yönlendiriliyor...' : 'Devam Et →'}
        </button>
      </div>
    </div>
  )
}
