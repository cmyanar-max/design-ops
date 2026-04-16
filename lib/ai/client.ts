import OpenAI from 'openai'

// Singleton — sadece server-side kullanılır (API key client'a gitmez)
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
