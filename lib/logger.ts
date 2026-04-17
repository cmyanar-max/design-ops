const isDevelopment = process.env.NODE_ENV !== 'production'

export function logError(message: string, error?: unknown) {
  if (!isDevelopment) return
  console.error(message, error)
}

export function logWarn(message: string, details?: unknown) {
  if (!isDevelopment) return
  console.warn(message, details)
}

export function logInfo(message: string, details?: unknown) {
  if (!isDevelopment) return
  console.info(message, details)
}
