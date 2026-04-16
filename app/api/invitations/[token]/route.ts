import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ token: string }> }
) {
  const { token } = await params
  const adminClient = createAdminClient()

  const { data: invitation, error } = await adminClient
    .from('invitations')
    .select('*, organization:organizations(name)')
    .eq('token', token)
    .is('accepted_at', null)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (error || !invitation) {
    return NextResponse.json({ error: 'Davet bulunamadı veya süresi dolmuş' }, { status: 404 })
  }

  return NextResponse.json({
    email: invitation.email,
    role: invitation.role,
    organization_name: (invitation.organization as { name: string })?.name,
  })
}
