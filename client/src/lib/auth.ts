export const AUTH_TOKEN_KEY = 'reelmark_token'

export function getStoredToken(): string | null {
  return localStorage.getItem(AUTH_TOKEN_KEY)
}

export function setStoredToken(token: string): void {
  localStorage.setItem(AUTH_TOKEN_KEY, token)
}

export function clearStoredToken(): void {
  localStorage.removeItem(AUTH_TOKEN_KEY)
}

export function getApiBase(): string {
  return import.meta.env.VITE_API_URL ?? 'http://localhost:3000'
}

export function googleSignInUrl(): string {
  return `${getApiBase()}/auth/google`
}

type JwtPayload = {
  handle?: string
}

function parseJwtPayload(token: string): JwtPayload | null {
  const parts = token.split('.')
  if (parts.length !== 3 || !parts[1]) {
    return null
  }
  try {
    const segment = parts[1].replaceAll('-', '+').replaceAll('_', '/')
    const padded = segment + '='.repeat((4 - (segment.length % 4)) % 4)
    const json = atob(padded)
    return JSON.parse(json) as JwtPayload
  } catch {
    return null
  }
}

/** Handle from stored JWT (for routes); not cryptographically verified. */
export function getViewerHandle(): string | null {
  const token = getStoredToken()
  if (!token) return null
  const payload = parseJwtPayload(token)
  const handle = payload?.handle
  return typeof handle === 'string' && handle.length > 0 ? handle : null
}
