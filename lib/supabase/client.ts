import { createBrowserClient } from '@supabase/ssr'

// NOT: Gerçek Supabase projesinde: `supabase gen types typescript --project-id <id> > types/database.ts`
// Şimdilik untyped client kullanıyoruz; explicit tip castlerle güvenlik sağlıyoruz.
export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!url?.startsWith('http') || !key) {
    // Geliştirme ortamında gerçek Supabase bağlantısı yokken placeholder client
    return createBrowserClient(
      'https://placeholder.supabase.co',
      'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBsYWNlaG9sZGVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE2MDAwMDAwMDAsImV4cCI6OTk5OTk5OTk5OX0.placeholder'
    )
  }

  return createBrowserClient(url, key)
}
