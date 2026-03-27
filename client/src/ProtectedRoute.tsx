import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { getStoredToken } from './lib/auth'

type Props = {
  children: ReactNode
}

export function ProtectedRoute({ children }: Readonly<Props>) {
  if (!getStoredToken()) {
    return <Navigate to="/login" replace />
  }
  return <>{children}</>
}
