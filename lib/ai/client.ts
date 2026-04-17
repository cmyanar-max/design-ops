import OpenAI from 'openai'

let _client: OpenAI | null = null

export function getAIClient(): OpenAI {
  if (!_client) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error('GROQ_API_KEY environment variable is not set')
    }
    _client = new OpenAI({
      apiKey: process.env.GROQ_API_KEY,
      baseURL: 'https://api.groq.com/openai/v1',
    })
  }
  return _client
}

export const MODELS = {
  smart: 'llama-3.3-70b-versatile' as const,
  fast: 'llama-3.1-8b-instant',
}

// Groq API için exponential backoff retry — 429 ve 503 hatalarında yeniden dener
export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
): Promise<T> {
  let lastError: unknown
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      return await fn()
    } catch (err: unknown) {
      lastError = err
      const status = (err as { status?: number })?.status
      if (status !== 429 && status !== 503) throw err
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, 1000 * 2 ** attempt))
      }
    }
  }
  throw lastError
}
