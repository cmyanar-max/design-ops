import { NextRequest, NextResponse } from 'next/server'
import { createClient, createAdminClient } from '@/lib/supabase/server'

export async function POST(_request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user: authUser } } = await supabase.auth.getUser()

    if (!authUser) {
      return NextResponse.json({ error: 'Kimlik doğrulaması gerekli' }, { status: 401 })
    }

    const userId = authUser.id

    // Tüm DB temizliğini tek bir atomik RPC içinde yap
    const { error: rpcError } = await supabase.rpc('delete_own_account')
    if (rpcError) {
      console.error('[delete_own_account RPC]', rpcError)
      return NextResponse.json({ error: 'Hesap silinemedi' }, { status: 500 })
    }

    // DB temizlendi; auth kaydını adminClient ile kaldır
    const adminClient = createAdminClient()
    const { error: authDeleteError } = await adminClient.auth.admin.deleteUser(userId)
    if (authDeleteError) {
      console.error('[deleteUser auth]', authDeleteError)
      return NextResponse.json({ error: 'Hesap silinemedi' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Hesap başarıyla silindi' })
  } catch (error) {
    console.error('[POST /api/account/delete]', error)
    return NextResponse.json({ error: 'Bir hata oluştu' }, { status: 500 })
  }
}
