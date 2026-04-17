const WINDOW_MS = 60_000
const MAX_REQUESTS = 10

const store = new Map<string, { count: number; resetAt: number }>()

export function checkRateLimit(userId: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now()
  const entry = store.get(userId)

  if (!entry || now > entry.resetAt) {
    store.set(userId, { count: 1, resetAt: now + WINDOW_MS })
    return { allowed: true, retryAfter: 0 }
  }

  if (entry.count >= MAX_REQUESTS) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }

  entry.count++
  return { allowed: true, retryAfter: 0 }
}
