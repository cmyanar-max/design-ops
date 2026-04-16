import { createClient } from '@/lib/supabase/server'
import { RequestStatus, RequestWithUser } from '@/types/database'

export async function getRequests(filters?: {
  status?: RequestStatus | RequestStatus[]
  assignedTo?: string
  createdBy?: string
  limit?: number
}) {
  const supabase = await createClient()

  let query = supabase
    .from('requests')
    .select(`
      *,
      creator:users!requests_created_by_fkey(id, name, avatar_url),
      assignee:users!requests_assigned_to_fkey(id, name, avatar_url),
      brand:brands(id, name, primary_color)
    `)
    .order('created_at', { ascending: false })

  if (filters?.status) {
    if (Array.isArray(filters.status)) {
      query = query.in('status', filters.status)
    } else {
      query = query.eq('status', filters.status)
    }
  }

  if (filters?.assignedTo) {
    query = query.eq('assigned_to', filters.assignedTo)
  }

  if (filters?.createdBy) {
    query = query.eq('created_by', filters.createdBy)
  }

  if (filters?.limit) {
    query = query.limit(filters.limit)
  }

  const { data, error } = await query

  if (error) throw error
  return data as RequestWithUser[]
}

export async function getRequest(id: string) {
  const supabase = await createClient()

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

  if (error) throw error
  return data
}

export async function getRequestStatusHistory(requestId: string) {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('request_status_history')
    .select(`*, changed_by_user:users(id, name, avatar_url)`)
    .eq('request_id', requestId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data
}
