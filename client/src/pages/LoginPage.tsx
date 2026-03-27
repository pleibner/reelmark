import { googleSignInUrl } from '../lib/auth'

export function LoginPage() {
  return (
    <div className="page page--centered">
      <a href={googleSignInUrl()} className="btn-cta">
        Continue with Google
      </a>
    </div>
  )
}
