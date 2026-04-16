import { redirect, notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'

export default async function BrandDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: currentUser } = await supabase
    .from('users')
    .select('id, role, organization_id')
    .eq('id', authUser.id)
    .single() as { data: { id: string; role: string; organization_id: string } | null }

  if (!currentUser) redirect('/onboarding')

  const { data: brand } = await supabase
    .from('brands')
    .select('*')
    .eq('id', id)
    .eq('organization_id', currentUser.organization_id)
    .single()

  if (!brand) notFound()

  const isAdmin = currentUser.role === 'admin'

  const colorFields = [
    { label: 'Ana Renk', value: brand.primary_color },
    { label: 'İkincil Renk', value: brand.secondary_color },
    { label: 'Vurgu Rengi', value: brand.accent_color },
  ].filter(f => f.value)

  return (
    <div className="p-6 space-y-6 max-w-3xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/brands" className="text-muted-foreground hover:text-foreground">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <h1 className="text-2xl font-bold">{brand.name}</h1>
        </div>
        {isAdmin && (
          <Link href={`/brands/${id}/edit`} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
            Düzenle
          </Link>
        )}
      </div>

      {/* Renkler */}
      {colorFields.length > 0 && (
        <Card>
          <CardHeader><CardTitle className="text-base">Renkler</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-4">
              {colorFields.map(({ label, value }) => (
                <div key={label} className="flex items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-lg border border-border shadow-sm"
                    style={{ backgroundColor: value! }}
                  />
                  <div>
                    <p className="text-xs font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground font-mono">{value}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Yazı Tipleri */}
      {(brand.font_primary || brand.font_secondary) && (
        <Card>
          <CardHeader><CardTitle className="text-base">Yazı Tipleri</CardTitle></CardHeader>
          <CardContent className="space-y-2">
            {brand.font_primary && (
              <div>
                <p className="text-xs text-muted-foreground">Ana</p>
                <p className="text-lg font-medium" style={{ fontFamily: brand.font_primary }}>{brand.font_primary}</p>
              </div>
            )}
            {brand.font_secondary && (
              <div>
                <p className="text-xs text-muted-foreground">İkincil</p>
                <p className="text-lg" style={{ fontFamily: brand.font_secondary }}>{brand.font_secondary}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* AI Bağlamı */}
      {(brand.tone_of_voice || brand.target_audience || brand.guidelines_text) && (
        <Card>
          <CardHeader><CardTitle className="text-base">AI Bağlamı</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {brand.tone_of_voice && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">Ses Tonu</p>
                <p className="text-sm">{brand.tone_of_voice}</p>
              </div>
            )}
            {brand.target_audience && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">Hedef Kitle</p>
                <p className="text-sm">{brand.target_audience}</p>
              </div>
            )}
            {brand.guidelines_text && (
              <div>
                <p className="text-xs font-medium text-muted-foreground mb-0.5">Marka Rehberi</p>
                <p className="text-sm whitespace-pre-wrap">{brand.guidelines_text}</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      <p className="text-xs text-muted-foreground text-right">
        Oluşturulma: {new Date(brand.created_at).toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })}
      </p>
    </div>
  )
}
