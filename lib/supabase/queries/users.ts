import { createClient } from '@/lib/supabase/server'

export async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()
  if (!authUser) return null

  const { data, error } = await supabase
    .from('users')
    .select('*, organization:organizations(*)')
    .eq('id', authUser.id)
    .single()

  if (error) return null
  return data
}

export async function getOrgMembers(orgId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('organization_id', orgId)
    .eq('status', 'active')
    .order('name')

  if (error) throw error
  return data
}

export async function getDesigners(orgId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('users')
    .select('id, name, avatar_url, email')
    .eq('organization_id', orgId)
    .eq('role', 'designer')
    .eq('status', 'active')
    .order('name')

  if (error) throw error
  return data
}
