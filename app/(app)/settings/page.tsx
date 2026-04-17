import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import Link from 'next/link'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: currentUser } = await supabase
    .from('users')
    .select('id, name, email, role, avatar_url, timezone, locale, notification_prefs')
    .eq('id', authUser.id)
    .single() as { data: { id: string; name: string; email: string; role: string; avatar_url: string | null; timezone: string; locale: string; notification_prefs: Record<string, boolean> } | null }

  if (!currentUser) redirect('/onboarding')

  const sections = [
    {
      href: '/settings/profile',
      title: 'Profil',
      description: 'Ad, e-posta, avatar ve zaman dilimi ayarları',
      icon: '👤',
    },
    {
      href: '/settings/notifications',
      title: 'Bildirimler',
      description: 'E-posta ve uygulama içi bildirim tercihlerinizi yönetin',
      icon: '🔔',
    },
    ...(currentUser.role === 'admin' ? [
      {
        href: '/settings/organization',
        title: 'Organizasyon Ayarları',
        description: 'Organizasyon adı ve genel ayarlar',
        icon: '🏢',
      },
      {
        href: '/settings/billing',
        title: 'Abonelik',
        description: 'Plan, fatura ve ödeme yönetimi',
        icon: '💳',
      },
    ] : []),
  ]

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Ayarlar</h1>
        <p className="text-sm text-muted-foreground">Hesap ve uygulama tercihlerinizi yönetin</p>
      </div>

      <div className="grid gap-3">
        {sections.map(section => (
          <Link key={section.href} href={section.href}>
            <Card className="hover:border-primary/50 transition-colors cursor-pointer">
              <CardHeader className="py-4 px-5 flex flex-row items-center gap-4">
                <span className="text-2xl shrink-0">{section.icon}</span>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-base">{section.title}</CardTitle>
                  <CardDescription className="text-xs mt-0.5">{section.description}</CardDescription>
                </div>
                <svg className="w-4 h-4 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
