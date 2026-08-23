import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { LandingPage } from '@/pages/LandingPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { CadastroPage } from '@/pages/CadastroPage'
import { LoginPage } from '@/pages/LoginPage'
import { RecuperarSenhaPage } from '@/pages/RecuperarSenhaPage'
import { RedefinirSenhaPage } from '@/pages/RedefinirSenhaPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { PublicOnlyRoute } from '@/routes/PublicOnlyRoute'

export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route
          path="/cadastro"
          element={
            <PublicOnlyRoute>
              <CadastroPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route path="/recuperar-senha" element={<RecuperarSenhaPage />} />
        <Route path="/redefinir-senha" element={<RedefinirSenhaPage />} />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
