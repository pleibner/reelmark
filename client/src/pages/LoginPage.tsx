import type { CSSProperties } from 'react'
import { googleSignInUrl } from '../lib/auth'

const shell: CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1.5rem',
}

const cta: CSSProperties = {
  display: 'inline-block',
  border: '1px solid #ccc',
  background: '#fff',
  color: '#111',
  font: 'inherit',
  fontSize: '0.9375rem',
  padding: '0.75rem 1.5rem',
  borderRadius: '6px',
  cursor: 'pointer',
  textAlign: 'center',
  textDecoration: 'none',
}

export function LoginPage() {
  return (
    <div style={shell}>
      <a href={googleSignInUrl()} style={cta}>
        Continue with Google
      </a>
    </div>
  )
}
