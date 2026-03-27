import { useEffect, type CSSProperties } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { setStoredToken } from '../lib/auth'

const shell: CSSProperties = {
  flex: 1,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '1.5rem',
  color: '#666',
  fontSize: '0.875rem',
}

export function AuthCallbackPage() {
  const [params] = useSearchParams()
  const navigate = useNavigate()

  useEffect(() => {
    const token = params.get('token')
    if (token) {
      setStoredToken(token)
      navigate('/', { replace: true })
      return
    }

    navigate('/login', { replace: true })
  }, [params, navigate])

  return <div style={shell}>Signing in…</div>
}
