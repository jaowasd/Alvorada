import { Suspense, lazy } from 'react'
import { BrowserRouter, Outlet, Route, Routes } from 'react-router-dom'
import { AppShell } from '@/components/AppShell'
import { LandingPage } from '@/pages/LandingPage'
import { ProtectedRoute } from '@/routes/ProtectedRoute'
import { PublicOnlyRoute } from '@/routes/PublicOnlyRoute'

const CadastroPage = lazy(() =>
  import('@/pages/CadastroPage').then((m) => ({ default: m.CadastroPage })),
)
const LoginPage = lazy(() =>
  import('@/pages/LoginPage').then((m) => ({ default: m.LoginPage })),
)
const RecuperarSenhaPage = lazy(() =>
  import('@/pages/RecuperarSenhaPage').then((m) => ({
    default: m.RecuperarSenhaPage,
  })),
)
const RedefinirSenhaPage = lazy(() =>
  import('@/pages/RedefinirSenhaPage').then((m) => ({
    default: m.RedefinirSenhaPage,
  })),
)
const DashboardPage = lazy(() =>
  import('@/pages/DashboardPage').then((m) => ({ default: m.DashboardPage })),
)
const RotinaPage = lazy(() =>
  import('@/pages/RotinaPage').then((m) => ({ default: m.RotinaPage })),
)
const HabitosPage = lazy(() =>
  import('@/pages/HabitosPage').then((m) => ({ default: m.HabitosPage })),
)
const TarefasPage = lazy(() =>
  import('@/pages/TarefasPage').then((m) => ({ default: m.TarefasPage })),
)
const TransacoesPage = lazy(() =>
  import('@/pages/financas/TransacoesPage').then((m) => ({
    default: m.TransacoesPage,
  })),
)
const ContasPage = lazy(() =>
  import('@/pages/financas/ContasPage').then((m) => ({
    default: m.ContasPage,
  })),
)
const ContasDaCasaPage = lazy(() =>
  import('@/pages/financas/ContasDaCasaPage').then((m) => ({
    default: m.ContasDaCasaPage,
  })),
)
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
      <p className="text-sm text-[var(--color-text-muted)]">Carregando…</p>
    </div>
  )
}

export function AppRouter() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
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
            <Route path="habitos" element={<HabitosPage />} />
            <Route path="tarefas" element={<TarefasPage />} />
            <Route path="financas/transacoes" element={<TransacoesPage />} />
            <Route path="financas/contas" element={<ContasPage />} />
            <Route
              path="financas/contas-da-casa"
              element={<ContasDaCasaPage />}
            />
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
