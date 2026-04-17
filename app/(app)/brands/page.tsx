import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Brand {
  id: string
  name: string
  primary_color: string | null
  secondary_color: string | null
  font_primary: string | null
  logo_url: string | null
  tone_of_voice: string | null
  guidelines_text: string | null
  created_at: string
}

export default async function BrandsPage() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) redirect('/login')

  const { data: currentUser } = await supabase
    .from('users')
    .select('id, role, organization_id')
    .eq('id', authUser.id)
    .single() as { data: { id: string; role: string; organization_id: string } | null }

  if (!currentUser) redirect('/onboarding')

  const { data: rawBrands } = await supabase
    .from('brands')
    .select('id, name, primary_color, secondary_color, font_primary, logo_url, tone_of_voice, guidelines_text, created_at')
    .eq('organization_id', currentUser.organization_id)
    .order('created_at', { ascending: true })

  const brands = (rawBrands ?? []) as Brand[]
  const canManageBrands = currentUser.role === 'admin' || currentUser.role === 'client'

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Marka Kütüphanesi</h1>
          <p className="text-sm text-muted-foreground">{brands.length} marka</p>
        </div>
        {canManageBrands && (
          <Link href="/brands/new">
            <Button size="lg">+ Yeni Marka</Button>
          </Link>
        )}
      </div>

      {brands.length === 0 ? (
        <div className="text-center py-16 space-y-3">
          <p className="text-5xl">🎨</p>
          <p className="font-medium">Henüz marka yok</p>
          <p className="text-sm text-muted-foreground">
            Marka kütüphanesi AI önerilerinde kullanılır. Logo, renk ve yazı tipi bilgilerini ekleyin.
          </p>
          {canManageBrands && (
            <Link href="/brands/new">
              <Button className="mt-2">İlk Markayı Ekle</Button>
            </Link>
          )}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {brands.map(brand => (
            <Link key={brand.id} href={`/brands/${brand.id}`}>
              <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
                <CardHeader className="pb-4 pt-4 px-4">
                  <div className="flex items-center gap-3">
                    {/* Renk önizleme */}
                    <div className="flex gap-1.5 shrink-0">
                      {brand.primary_color && (
                        <div
                          className="w-6 h-6 rounded-full border border-border"
                          style={{ backgroundColor: brand.primary_color }}
                          title={`Ana renk: ${brand.primary_color}`}
                        />
                      )}
                      {brand.secondary_color && (
                        <div
                          className="w-6 h-6 rounded-full border border-border"
                          style={{ backgroundColor: brand.secondary_color }}
                          title={`İkincil renk: ${brand.secondary_color}`}
                        />
                      )}
                      {!brand.primary_color && !brand.secondary_color && (
                        <div className="w-6 h-6 rounded-full bg-muted border border-border" />
                      )}
                    </div>
                    <CardTitle className="text-base truncate">{brand.name}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="px-4 pb-4 space-y-1.5">
                  {brand.font_primary && (
                    <p className="text-xs text-muted-foreground">
                      <span className="font-medium">Yazı tipi:</span> {brand.font_primary}
                    </p>
                  )}
                  {brand.tone_of_voice && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      <span className="font-medium">Ton:</span> {brand.tone_of_voice}
                    </p>
                  )}
                  {brand.guidelines_text && (
                    <p className="text-xs text-muted-foreground line-clamp-2">{brand.guidelines_text}</p>
                  )}
                  <p className="text-xs text-muted-foreground pt-0.5 border-t border-border/50 mt-2 pt-2">
                    {new Date(brand.created_at).toLocaleDateString('tr-TR')}
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
