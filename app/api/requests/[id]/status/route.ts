import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const statusSchema = z.object({
  status: z.enum(['new', 'brief_review', 'design', 'revision', 'approval', 'completed', 'archived', 'cancelled']),
  note: z.string().optional(),
})

type Params = Promise<{ id: string }>

export async function POST(request: Request, { params }: { params: Params }) {
  const { id } = await params
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

    const body = await request.json()
    const parsed = statusSchema.safeParse(body)
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 })
    }

    // Postgres fonksiyonu ile status geçişini yap (history + bildirim dahil)
    const { error } = await supabase.rpc('transition_request_status', {
      p_request_id: id,
      p_new_status: parsed.data.status,
      p_note: parsed.data.note,
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('[POST /api/requests/[id]/status]', err)
    return NextResponse.json({ error: 'Durum güncellenemedi' }, { status: 500 })
  }
}
