import type { CSSProperties } from 'react'
import { Navigate, Outlet, Route, Routes } from 'react-router-dom'
import { Navbar } from './Navbar'
import { ProtectedRoute } from './ProtectedRoute'
import { AuthCallbackPage } from './pages/AuthCallbackPage'
import { HomePage } from './pages/HomePage'
import { LoginPage } from './pages/LoginPage'
import { getStoredToken } from './lib/auth'

const appShell: CSSProperties = {
  minHeight: '100%',
  display: 'flex',
  flexDirection: 'column',
}

const main: CSSProperties = {
  flex: 1,
  display: 'flex',
  flexDirection: 'column',
  minHeight: 0,
}

function LoginRoute() {
  if (getStoredToken()) {
    return <Navigate to="/" replace />
  }
  return <LoginPage />
}

function AppLayout() {
  return (
    <div style={appShell}>
      <Navbar />
      <main style={main}>
        <Outlet />
      </main>
    </div>
  )
}

export function App() {
  return (
    <Routes>
      <Route element={<AppLayout />}>
        <Route path="/login" element={<LoginRoute />} />
        <Route path="/auth/callback" element={<AuthCallbackPage />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <HomePage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
