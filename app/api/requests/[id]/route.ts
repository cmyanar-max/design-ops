import { NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'
import { requestSchema } from '@/lib/validations/request'

type Params = Promise<{ id: string }>

export async function GET(_req: Request, { params }: { params: Params }) {
  const { id } = await params
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

    const { data, error } = await supabase
      .from('requests')
      .select(`
        *,
        creator:users!requests_created_by_fkey(id, name, avatar_url, email),
        assignee:users!requests_assigned_to_fkey(id, name, avatar_url, email),
        brand:brands(*)
      `)
      .eq('id', id)
      .single()

    if (error) return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 })

    return NextResponse.json(data)
  } catch (err: unknown) {
    console.error('[GET /api/requests/[id]]', err)
    return NextResponse.json({ error: 'Sunucu hatası' }, { status: 500 })
  }
}

export async function DELETE(_req: Request, { params }: { params: Params }) {
  const { id } = await params
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

    // Talebi çek
    const { data: req } = await supabase
      .from('requests')
      .select('id, status, created_by, organization_id')
      .eq('id', id)
      .single()

    if (!req) return NextResponse.json({ error: 'Talep bulunamadı' }, { status: 404 })

    // Kullanıcının rolünü kontrol et
    const { data: currentUser } = await supabase
      .from('users')
      .select('role')
      .eq('id', authUser.id)
      .single() as { data: { role: string } | null }

    const isCreator = req.created_by === authUser.id
    const isAdmin = currentUser?.role === 'admin'

    // Admin, herhangi bir talebi silebilir
    // Normal kullanıcılar, sadece kendi iptal edilmiş taleplerini silebilir
    if (isAdmin) {
      // Admin tüm talepreri silebilir
    } else if (!isCreator || req.status !== 'cancelled') {
      return NextResponse.json({ error: 'Bu talebi silme yetkiniz yok' }, { status: 403 })
    }

    // RLS sadece admin'e izin verdiğinden, izin kontrolleri yukarıda
    // uygulama katmanında yapıldıktan sonra admin client ile siliyoruz.
    const adminSupabase = createAdminClient()
    const { error } = await adminSupabase.from('requests').delete().eq('id', id)
    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('[DELETE /api/requests/[id]]', err)
    return NextResponse.json({ error: 'Talep silinemedi' }, { status: 500 })
  }
}

export async function PATCH(request: Request, { params }: { params: Params }) {
  const { id } = await params
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

    const body = await request.json()
    const parsed = requestSchema.partial().safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('requests')
      .update(parsed.data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json(data)
  } catch (err: unknown) {
    console.error('[PATCH /api/requests/[id]]', err)
    return NextResponse.json({ error: 'Talep güncellenemedi' }, { status: 500 })
  }
}
