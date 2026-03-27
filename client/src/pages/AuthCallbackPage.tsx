import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { setStoredToken } from '../lib/auth'

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

  return (
    <div className="page page--centered">
      <p className="text-muted text-muted--flush">Signing in…</p>
    </div>
  )
}
