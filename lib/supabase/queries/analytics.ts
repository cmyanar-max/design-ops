import { createClient } from '@/lib/supabase/server'

export async function getDashboardStats(orgId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_dashboard_stats', { p_org_id: orgId })
  if (error) throw error
  return data as {
    total_requests: number
    new_requests: number
    active_designs: number
    in_revision: number
    pending_approvals: number
    completed: number
    cancelled: number
    avg_delivery_days: number
    avg_revisions: number
  }
}

export async function getDashboardStatsByPeriod(orgId: string, days = 0) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_dashboard_stats_by_period', {
    p_org_id: orgId,
    p_days: days,
  })
  if (error) throw error
  return data as {
    total_requests: number
    new_requests: number
    active_designs: number
    in_revision: number
    pending_approvals: number
    completed: number
    cancelled: number
    total_revisions: number
    avg_delivery_days: number
    avg_revisions: number
  }
}

export async function getRequestsByType(orgId: string, days = 30) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_requests_by_type', {
    p_org_id: orgId,
    p_days: days,
  })
  if (error) throw error
  return (data ?? []) as { type: string; count: number }[]
}

export async function getDesignerWorkload(orgId: string) {
  const supabase = await createClient()
  const { data, error } = await supabase.rpc('get_designer_workload', { p_org_id: orgId })
  if (error) throw error
  return (data ?? []) as {
    user_id: string
    name: string
    avatar_url: string | null
    active: number
    completed: number
    total_hours: number
  }[]
}
