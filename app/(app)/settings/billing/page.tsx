import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge-1'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const PLAN_LABELS: Record<string, string> = {
  free: 'Ücretsiz',
  pro: 'Pro',
  enterprise: 'Kurumsal',
}

const STATUS_LABELS: Record<string, string> = {
  trialing: 'Deneme Süresi',
  active: 'Aktif',
  past_due: 'Ödeme Gecikmiş',
  canceled: 'İptal Edildi',
  incomplete: 'Tamamlanmadı',
}

const STATUS_VARIANT: Record<string, { variant: 'amber-subtle' | 'green' | 'red-subtle' | 'pill' }> = {
  trialing: { variant: 'amber-subtle' },
  active: { variant: 'green' },
  past_due: { variant: 'red-subtle' },
  canceled: { variant: 'pill' },
  incomplete: { variant: 'red-subtle' },
}

const PLAN_FEATURES: Record<string, string[]> = {
  free: ['Aylık 10 talep', '1 GB depolama', '50 AI kredisi', '3 ekip üyesi'],
  pro: ['Aylık 100 talep', '20 GB depolama', '500 AI kredisi', 'Sınırsız ekip üyesi', 'Öncelikli destek'],
  enterprise: ['Sınırsız talep', 'Sınırsız depolama', 'Sınırsız AI kredisi', 'Sınırsız ekip üyesi', 'Özel destek', 'SLA garantisi'],
}

export default async function BillingPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: currentUser } = await supabase
    .from('users')
    .select('id, role, organization_id')
    .eq('id', authUser.id)
    .single() as { data: { id: string; role: string; organization_id: string } | null }

  if (!currentUser || currentUser.role !== 'admin') redirect('/settings')

  const { data: org } = await supabase
    .from('organizations')
    .select('name, plan, subscription_status, trial_ends_at, monthly_request_limit, storage_limit_gb, ai_credits_limit, ai_credits_used')
    .eq('id', currentUser.organization_id)
    .single() as {
      data: {
        name: string
        plan: string
        subscription_status: string
        trial_ends_at: string | null
        monthly_request_limit: number
        storage_limit_gb: number
        ai_credits_limit: number
        ai_credits_used: number
      } | null
    }

  if (!org) redirect('/settings')

  const trialEndsAt = org.trial_ends_at ? new Date(org.trial_ends_at) : null
  const now = new Date()
  const trialDaysLeft = trialEndsAt
    ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
    : null
  const aiCreditsPercent = org.ai_credits_limit > 0
    ? Math.round((org.ai_credits_used / org.ai_credits_limit) * 100)
    : 0

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3">
        <Link href="/settings" className="text-muted-foreground hover:text-foreground">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
        <h1 className="text-2xl font-bold">Abonelik</h1>
      </div>

      {/* Mevcut plan */}
      <Card>
        <CardHeader className="pt-2 pb-0 px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Mevcut Plan</CardTitle>
            <Badge {...(STATUS_VARIANT[org.subscription_status] ?? { variant: 'outline' })}>
              {STATUS_LABELS[org.subscription_status] ?? org.subscription_status}
            </Badge>
          </div>
          <CardDescription className="text-xs">{org.name}</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-6 space-y-4">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">{PLAN_LABELS[org.plan] ?? org.plan}</span>
            {org.plan === 'free' && (
              <span className="text-sm text-muted-foreground">plan</span>
            )}
            {org.plan === 'pro' && (
              <span className="text-sm text-muted-foreground">/ ay</span>
            )}
          </div>

          {org.subscription_status === 'trialing' && trialDaysLeft !== null && (
            <div className="flex items-center gap-2 text-sm bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
              <svg className="w-4 h-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-amber-700">
                Deneme süreniz <strong>{trialDaysLeft} gün</strong> sonra bitiyor
                {trialEndsAt && ` (${trialEndsAt.toLocaleDateString('tr-TR')})`}
              </span>
            </div>
          )}

          {org.subscription_status === 'past_due' && (
            <div className="flex items-center gap-2 text-sm bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <svg className="w-4 h-4 text-red-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span className="text-red-700">
                Ödeme gecikmiş. Lütfen ödeme yöntemini güncelleyin.
              </span>
            </div>
          )}

          <ul className="space-y-1.5">
            {(PLAN_FEATURES[org.plan] ?? []).map(feature => (
              <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
                <svg className="w-4 h-4 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                {feature}
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Kullanım */}
      <Card>
        <CardHeader className="pt-2 pb-0 px-6">
          <CardTitle className="text-base">Kullanım</CardTitle>
          <CardDescription className="text-xs">Bu ayki kota kullanımı</CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 pt-6 space-y-5">
          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span>AI Kredileri</span>
              <span className="text-muted-foreground">
                {org.ai_credits_used} / {org.ai_credits_limit}
              </span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${aiCreditsPercent >= 90 ? 'bg-destructive' : aiCreditsPercent >= 70 ? 'bg-amber-500' : 'bg-primary'}`}
                style={{ width: `${Math.min(aiCreditsPercent, 100)}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground">{aiCreditsPercent}% kullanıldı</p>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span>Aylık Talep Limiti</span>
              <span className="text-muted-foreground">{org.monthly_request_limit} talep/ay</span>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between text-sm">
              <span>Depolama</span>
              <span className="text-muted-foreground">{org.storage_limit_gb} GB</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Plan yükseltme */}
      {org.plan === 'free' && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="px-6 pb-6 pt-6 space-y-3">
            <div>
              <p className="font-semibold text-sm">Pro plana geçin</p>
              <p className="text-xs text-muted-foreground mt-0.5">
                Aylık 100 talep, 20 GB depolama ve 500 AI kredisine erişin.
              </p>
            </div>
            <a
              href="mailto:sales@designops.app?subject=Pro Plan"
              className="inline-block"
            >
              <Button>
                Satış ekibiyle iletişime geçin
              </Button>
            </a>
          </CardContent>
        </Card>
      )}

      {org.plan !== 'free' && org.subscription_status === 'active' && (
        <Card>
          <CardContent className="px-6 pb-6 pt-6 space-y-3">
            <p className="text-sm font-medium">Abonelik Yönetimi</p>
            <p className="text-xs text-muted-foreground">
              Fatura geçmişi, ödeme yöntemi ve abonelik iptali için destek ekibiyle iletişime geçin.
            </p>
            <a
              href="mailto:billing@designops.app"
              className="inline-block"
            >
              <Button variant="ghost">
                Fatura desteği
              </Button>
            </a>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
