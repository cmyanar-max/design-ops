import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Supabase join sorgularının döndürdüğü veriyi uygulama arayüzlerine cast eder.
 * TypeScript'in Supabase join sonuçlarını otomatik çıkaramamasından kaynaklanır.
 * Kalıcı çözüm için: `supabase gen types typescript` komutuyla tip üretimi yapın.
 */
export function castRows<T>(data: unknown[] | null | undefined): T[] {
  return (data ?? []) as T[]
}

export function castRow<T>(data: unknown | null | undefined): T | null {
  return (data ?? null) as T | null
}

export function getInitials(name: string | null | undefined): string {
  if (!name?.trim()) return '?'
  return name
    .trim()
    .split(/\s+/)
    .map(n => n[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase()
}
