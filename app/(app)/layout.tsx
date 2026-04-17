import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ModernSidebar } from '@/components/ui/modern-side-bar'
import AppTopbar from '@/components/layout/AppTopbar'
import { Toaster } from '@/components/ui/sonner'
import QueryProvider from '@/components/QueryProvider'

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user: authUser } } = await supabase.auth.getUser()

  if (!authUser) {
    redirect('/login')
  }

  const { data: currentUser } = await supabase
    .from('users')
    .select('*, organization:organizations(*)')
    .eq('id', authUser.id)
    .single()

  if (!currentUser) {
    // Org zaten kurulduysa bu kullanıcının buraya erişim hakkı yok
    const { count } = await supabase
      .from('organizations')
      .select('id', { count: 'exact', head: true })

    if (count && count > 0) {
      redirect('/login?error=unregistered')
    } else {
      redirect('/onboarding/role')
    }
  }

  if (currentUser.status === 'invited' || currentUser.status === 'pending_approval') {
    redirect('/pending')
  }

  if (currentUser.status === 'suspended' || currentUser.status === 'deactivated') {
    redirect('/login')
  }

  return (
    <QueryProvider>
      <div className="flex h-screen overflow-hidden bg-white" suppressHydrationWarning>
        <ModernSidebar user={currentUser} />
        <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
          <AppTopbar user={currentUser} />
          <main className="flex-1 overflow-y-auto pt-16 md:pt-0">
            {children}
          </main>
        </div>
      </div>
      <Toaster richColors position="top-right" />
    </QueryProvider>
  )
}
