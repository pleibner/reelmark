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
