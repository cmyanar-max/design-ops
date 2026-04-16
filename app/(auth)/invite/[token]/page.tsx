'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const acceptSchema = z.object({
  name: z.string().min(2, 'Ad en az 2 karakter olmalı'),
  password: z.string().min(8, 'Şifre en az 8 karakter olmalı'),
})

type AcceptForm = z.infer<typeof acceptSchema>

interface InviteInfo {
  email: string
  organization_name: string
  role: string
}

export default function InvitePage() {
  const { token } = useParams<{ token: string }>()
  const router = useRouter()
  const [invite, setInvite] = useState<InviteInfo | null>(null)
  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)

  const { register, handleSubmit, formState: { errors } } = useForm<AcceptForm>({
    resolver: zodResolver(acceptSchema),
  })

  useEffect(() => {
    const fetchInvite = async () => {
      try {
        const res = await fetch(`/api/invitations/${token}`)
        if (!res.ok) throw new Error('Davet bulunamadı veya süresi dolmuş')
        const data = await res.json()
        setInvite(data)
      } catch (err: unknown) {
        toast.error(err instanceof Error ? err.message : 'Davet geçersiz')
      } finally {
        setFetching(false)
      }
    }
    fetchInvite()
  }, [token])

  const onSubmit = async (values: AcceptForm) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/invitations/${token}/accept`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })

      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error || 'Davet kabul edilemedi')
      }

      toast.success('Hesabınız oluşturuldu! Giriş yapabilirsiniz.')
      router.push('/login')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return (
      <div className="space-y-4 text-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto" />
        <p className="text-sm text-muted-foreground">Davet bilgileri yükleniyor...</p>
      </div>
    )
  }

  if (!invite) {
    return (
      <div className="space-y-4 text-center">
        <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
          <svg className="w-6 h-6 text-destructive" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h2 className="font-bold text-xl">Davet Geçersiz</h2>
        <p className="text-sm text-muted-foreground">
          Bu davet bağlantısı geçersiz veya süresi dolmuş.
        </p>
      </div>
    )
  }

  const roleLabels: Record<string, string> = {
    admin: 'Yönetici',
    designer: 'Tasarımcı',
    client: 'Proje Yönetici',
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Daveti Kabul Et</h1>
        <p className="text-sm text-muted-foreground">
          <strong>{invite.organization_name}</strong> sizi{' '}
          <strong>{roleLabels[invite.role] ?? invite.role}</strong> olarak davet etti.
          ({invite.email})
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="name">Ad Soyad</Label>
          <Input id="name" placeholder="Ahmet Yılmaz" {...register('name')} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="password">Şifre Oluştur</Label>
          <Input id="password" type="password" placeholder="En az 8 karakter" {...register('password')} />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? 'Hesap oluşturuluyor...' : 'Hesabı Oluştur ve Katıl'}
        </Button>
      </form>
    </div>
  )
}
