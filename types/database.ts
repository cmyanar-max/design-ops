// Supabase veritabanı tip tanımları
// Gerçek projede: supabase gen types typescript --project-id <id> > types/database.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type UserRole = 'admin' | 'designer' | 'client'
export type UserStatus = 'active' | 'invited' | 'suspended' | 'deactivated'
export type OrgPlan = 'free' | 'pro' | 'enterprise'
export type SubscriptionStatus = 'trialing' | 'active' | 'past_due' | 'canceled' | 'incomplete'
export type RequestType =
  | 'social_post'
  | 'banner'
  | 'logo'
  | 'video'
  | 'presentation'
  | 'email_template'
  | 'brochure'
  | 'infographic'
  | 'other'
export type RequestStatus =
  | 'new'
  | 'brief_review'
  | 'design'
  | 'revision'
  | 'approval'
  | 'completed'
  | 'archived'
  | 'cancelled'
export type RequestPriority = 'low' | 'medium' | 'high' | 'urgent'
export type CommentType = 'general' | 'revision_request' | 'approval' | 'rejection' | 'ai_suggestion'
export type FileType =
  | 'logo'
  | 'image'
  | 'pdf'
  | 'font'
  | 'guideline'
  | 'design_output'
  | 'ai_generated'
  | 'other'
export type NotificationType =
  | 'request_assigned'
  | 'status_changed'
  | 'comment_added'
  | 'revision_requested'
  | 'approved'
  | 'mention'
  | 'deadline_reminder'
export type AIFeature =
  | 'brief_analysis'
  | 'design_suggestion'
  | 'moodboard'
  | 'revision_suggestion'
  | 'brand_check'
export type AuditAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'status_changed'
  | 'assigned'
  | 'file_uploaded'
  | 'login'
  | 'invited'

export interface Database {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          slug: string
          logo_url: string | null
          plan: OrgPlan
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: SubscriptionStatus
          trial_ends_at: string | null
          monthly_request_limit: number
          storage_limit_gb: number
          ai_credits_limit: number
          ai_credits_used: number
          settings: Json
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['organizations']['Row']> & { name: string; slug: string }
        Update: Partial<Database['public']['Tables']['organizations']['Row']>
      }
      users: {
        Row: {
          id: string
          organization_id: string
          name: string
          email: string
          role: UserRole
          avatar_url: string | null
          phone: string | null
          timezone: string
          locale: string
          status: UserStatus
          notification_prefs: Json
          onboarding_completed: boolean
          last_login_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['users']['Row']> & {
          id: string
          organization_id: string
          name: string
          email: string
          role: UserRole
        }
        Update: Partial<Database['public']['Tables']['users']['Row']>
      }
      invitations: {
        Row: {
          id: string
          organization_id: string
          email: string
          role: UserRole
          invited_by: string
          token: string
          accepted_at: string | null
          expires_at: string
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['invitations']['Row'], 'id' | 'token' | 'created_at'>
        Update: Partial<Database['public']['Tables']['invitations']['Row']>
      }
      brands: {
        Row: {
          id: string
          organization_id: string
          name: string
          primary_color: string | null
          secondary_color: string | null
          accent_color: string | null
          font_primary: string | null
          font_secondary: string | null
          logo_url: string | null
          brand_guidelines_url: string | null
          tone_of_voice: string | null
          target_audience: string | null
          guidelines_text: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['brands']['Row']> & { organization_id: string; name: string }
        Update: Partial<Database['public']['Tables']['brands']['Row']>
      }
      requests: {
        Row: {
          id: string
          organization_id: string
          brand_id: string | null
          title: string
          description: string | null
          request_type: RequestType
          status: RequestStatus
          priority: RequestPriority
          deadline: string | null
          estimated_hours: number | null
          actual_hours: number | null
          revision_count: number
          ai_brief_score: number | null
          ai_brief_suggestions: Json | null
          tags: string[]
          created_by: string
          assigned_to: string | null
          approved_by: string | null
          started_at: string | null
          submitted_for_approval_at: string | null
          approved_at: string | null
          completed_at: string | null
          cancelled_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['requests']['Row']> & {
          organization_id: string
          title: string
          request_type: RequestType
          created_by: string
        }
        Update: Partial<Database['public']['Tables']['requests']['Row']>
      }
      request_status_history: {
        Row: {
          id: string
          request_id: string
          from_status: string | null
          to_status: string
          changed_by: string
          note: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['request_status_history']['Row'], 'id' | 'created_at'>
        Update: never
      }
      comments: {
        Row: {
          id: string
          request_id: string
          parent_id: string | null
          user_id: string
          body: string
          comment_type: CommentType
          is_internal: boolean
          is_resolved: boolean
          resolved_at: string | null
          resolved_by: string | null
          ai_generated: boolean
          created_at: string
          updated_at: string
        }
        Insert: Partial<Database['public']['Tables']['comments']['Row']> & {
          request_id: string
          user_id: string
          body: string
        }
        Update: Partial<Database['public']['Tables']['comments']['Row']>
      }
      files: {
        Row: {
          id: string
          organization_id: string
          request_id: string
          uploaded_by: string
          filename: string
          storage_path: string
          file_url: string | null
          mime_type: string | null
          file_size: number | null
          file_type: FileType
          version: number
          parent_file_id: string | null
          is_final: boolean
          ai_generated: boolean
          description: string | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['files']['Row']> & {
          organization_id: string
          request_id: string
          uploaded_by: string
          filename: string
          storage_path: string
          file_type: FileType
        }
        Update: Partial<Database['public']['Tables']['files']['Row']>
      }
      notifications: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          type: NotificationType
          title: string
          body: string | null
          data: Json
          read_at: string | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['notifications']['Row']> & {
          organization_id: string
          user_id: string
          type: NotificationType
          title: string
        }
        Update: Partial<Database['public']['Tables']['notifications']['Row']>
      }
      ai_requests: {
        Row: {
          id: string
          organization_id: string
          user_id: string
          request_id: string | null
          feature: AIFeature
          model: string
          prompt_tokens: number | null
          completion_tokens: number | null
          total_tokens: number | null
          latency_ms: number | null
          status: 'success' | 'error' | 'rate_limited'
          error_message: string | null
          feedback: -1 | 1 | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['ai_requests']['Row']> & {
          organization_id: string
          user_id: string
          feature: AIFeature
          model: string
        }
        Update: Partial<Database['public']['Tables']['ai_requests']['Row']>
      }
      time_logs: {
        Row: {
          id: string
          request_id: string
          user_id: string
          hours: number
          description: string | null
          logged_at: string
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['time_logs']['Row']> & {
          request_id: string
          user_id: string
          hours: number
        }
        Update: Partial<Database['public']['Tables']['time_logs']['Row']>
      }
      audit_logs: {
        Row: {
          id: string
          organization_id: string
          user_id: string | null
          action: AuditAction
          resource_type: string
          resource_id: string
          old_data: Json | null
          new_data: Json | null
          ip_address: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: Partial<Database['public']['Tables']['audit_logs']['Row']> & {
          organization_id: string
          action: AuditAction
          resource_type: string
          resource_id: string
        }
        Update: never
      }
    }
    Functions: {
      get_dashboard_stats: { Args: { p_org_id: string }; Returns: Json }
      get_requests_by_type: { Args: { p_org_id: string; p_days?: number }; Returns: Json }
      get_designer_workload: { Args: { p_org_id: string }; Returns: Json }
      get_avg_delivery_time: { Args: { p_org_id: string }; Returns: number }
      transition_request_status: { Args: { p_request_id: string; p_new_status: string; p_note?: string }; Returns: void }
      check_and_consume_ai_credit: { Args: { p_org_id: string }; Returns: boolean }
    }
  }
}

// Kısa isimli tipler (kullanım kolaylığı)
export type Organization = Database['public']['Tables']['organizations']['Row']
export type User = Database['public']['Tables']['users']['Row']
export type Invitation = Database['public']['Tables']['invitations']['Row']
export type Brand = Database['public']['Tables']['brands']['Row']
export type Request = Database['public']['Tables']['requests']['Row']
export type RequestStatusHistory = Database['public']['Tables']['request_status_history']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type File = Database['public']['Tables']['files']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type AIRequest = Database['public']['Tables']['ai_requests']['Row']
export type TimeLog = Database['public']['Tables']['time_logs']['Row']

// İlişkili (join) tipler
export type RequestWithUser = Request & {
  creator: Pick<User, 'id' | 'name' | 'avatar_url'>
  assignee: Pick<User, 'id' | 'name' | 'avatar_url'> | null
  brand: Pick<Brand, 'id' | 'name' | 'primary_color'> | null
}

export type CommentWithUser = Comment & {
  author: Pick<User, 'id' | 'name' | 'avatar_url' | 'role'>
  replies?: CommentWithUser[]
}
