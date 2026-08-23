import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import { LandingPage } from '@/pages/LandingPage'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { CadastroPage } from '@/pages/CadastroPage'
import { LoginPage } from '@/pages/LoginPage'
import { RecuperarSenhaPage } from '@/pages/RecuperarSenhaPage'
import { RedefinirSenhaPage } from '@/pages/RedefinirSenhaPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { RotinaPage } from '@/pages/RotinaPage'
import { TarefasPage } from '@/pages/TarefasPage'
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
              <AppShell>
                <Outlet />
              </AppShell>
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="rotina" element={<RotinaPage />} />
          <Route path="tarefas" element={<TarefasPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  )
}
