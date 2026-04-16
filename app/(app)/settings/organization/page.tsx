'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { NeonButton } from '@/components/ui/neon-button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const MAX_RENAMES = 2

interface OrgData {
  id: string
  name: string
  name_change_count: number
}

export default function OrganizationSettingsPage() {
  const router = useRouter()
  const supabase = createClient()
  const [loading, setLoading] = useState(false)
  const [org, setOrg] = useState<OrgData | null>(null)
  const [name, setName] = useState('')

  useEffect(() => {
    const load = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: me } = await supabase
        .from('users')
        .select('role, organization_id')
        .eq('id', user.id)
        .single()

      if (!me || me.role !== 'admin' || !me.organization_id) {
        router.replace('/settings')
        return
      }

      const { data: orgRow } = await supabase
        .from('organizations')
        .select('id, name, name_change_count')
        .eq('id', me.organization_id)
        .single()

      if (orgRow) {
        setOrg(orgRow as OrgData)
        setName(orgRow.name)
      }
    }
    load()
  }, [router, supabase])

  const remaining = org ? MAX_RENAMES - (org.name_change_count ?? 0) : MAX_RENAMES
  const limitReached = remaining <= 0
  const isDirty = org ? name.trim() !== org.name.trim() : false

  const handleSave = async () => {
    if (!org) return
    const trimmed = name.trim()
    if (trimmed.length < 2) {
      toast.error('Organizasyon adı en az 2 karakter olmalı')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/organizations/rename', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) {
        toast.error(data.error ?? 'Güncelleme başarısız')
        return
      }
      toast.success('Organizasyon adı güncellendi')
      setOrg(data.organization)
      setName(data.organization.name)
      router.refresh()
    } catch {
      toast.error('Beklenmeyen bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (!org) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="h-8 w-56 bg-muted rounded animate-pulse mb-6" />
        <Card><CardContent className="pt-6 space-y-4">
          {[1, 2, 3].map(i => <div key={i} className="h-10 bg-muted rounded animate-pulse" />)}
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
        <h1 className="text-2xl font-bold">Organizasyon Ayarları</h1>
      </div>

      <Card>
        <CardHeader className="pt-2 pb-0 px-6">
          <CardTitle className="text-base">Organizasyon Adı</CardTitle>
          <CardDescription>
            Organizasyon adınızı en fazla {MAX_RENAMES} kez değiştirebilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-6 space-y-5">
          <div className="grid gap-2">
            <Label htmlFor="orgName">Ad</Label>
            <Input
              id="orgName"
              value={name}
              onChange={e => setName(e.target.value)}
              disabled={limitReached || loading}
              placeholder="Organizasyon adı"
            />
          </div>

          {!limitReached ? (
            <p className="text-xs text-muted-foreground">
              Kalan değişiklik hakkı: <span className="font-medium text-foreground">{remaining}</span> / {MAX_RENAMES}
            </p>
          ) : (
            <div className="rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              Organizasyon adı değişim hakkınız doldu. Daha fazla değişiklik için lütfen{' '}
              <span className="font-semibold">DesignOps ekibiyle</span> iletişime geçin.
            </div>
          )}

          <div className="flex justify-end pt-2">
            <NeonButton
              onClick={handleSave}
              disabled={loading || limitReached || !isDirty || name.trim().length < 2}
              variant="solid"
              size="default"
            >
              {loading ? 'Kaydediliyor...' : 'Kaydet'}
            </NeonButton>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
