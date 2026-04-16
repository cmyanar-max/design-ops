import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()
    if (!authUser) return NextResponse.json({ error: 'Yetkisiz' }, { status: 401 })

    const body = await request.json().catch(() => ({}))
    const notificationId = body?.notificationId as string | undefined

    if (notificationId) {
      // Tek bildirim okundu işaretle
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('id', notificationId)
        .eq('user_id', authUser.id)
        .is('read_at', null)

      if (error) throw error
    } else {
      // Tümünü okundu işaretle
      const { error } = await supabase
        .from('notifications')
        .update({ read_at: new Date().toISOString() })
        .eq('user_id', authUser.id)
        .is('read_at', null)

      if (error) throw error
    }

    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    console.error('[POST /api/notifications/mark-read]', err)
    return NextResponse.json({ error: 'Bildirimler güncellenemedi' }, { status: 500 })
  }
}
