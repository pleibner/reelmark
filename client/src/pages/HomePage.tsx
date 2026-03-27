import type { CSSProperties } from 'react'

const shell: CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1.5rem',
}

const heading: CSSProperties = {
  margin: 0,
  fontSize: '1.25rem',
  fontWeight: 500,
  color: '#111',
  letterSpacing: '-0.02em',
}

export function HomePage() {
  return (
    <div style={shell}>
      <h1 style={heading}>Welcome</h1>
    </div>
  )
}
