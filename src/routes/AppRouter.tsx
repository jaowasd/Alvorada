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
const CalendarioPage = lazy(() =>
  import('@/pages/CalendarioPage').then((m) => ({
    default: m.CalendarioPage,
  })),
)
const EstatisticasPage = lazy(() =>
  import('@/pages/EstatisticasPage').then((m) => ({
    default: m.EstatisticasPage,
  })),
)
const HabitosPage = lazy(() =>
  import('@/pages/HabitosPage').then((m) => ({ default: m.HabitosPage })),
)
const TarefasPage = lazy(() =>
  import('@/pages/TarefasPage').then((m) => ({ default: m.TarefasPage })),
)
const MetasPage = lazy(() =>
  import('@/pages/MetasPage').then((m) => ({ default: m.MetasPage })),
)
const DiarioPage = lazy(() =>
  import('@/pages/DiarioPage').then((m) => ({ default: m.DiarioPage })),
)
const PerfilPage = lazy(() =>
  import('@/pages/PerfilPage').then((m) => ({ default: m.PerfilPage })),
)
const ConfiguracoesPage = lazy(() =>
  import('@/pages/ConfiguracoesPage').then((m) => ({
    default: m.ConfiguracoesPage,
  })),
)
const PremiumPage = lazy(() =>
  import('@/pages/PremiumPage').then((m) => ({ default: m.PremiumPage })),
)
const EstudosLayout = lazy(() =>
  import('@/pages/estudos/EstudosLayout').then((m) => ({
    default: m.EstudosLayout,
  })),
)
const EstudosVisaoGeralPage = lazy(() =>
  import('@/pages/estudos/EstudosVisaoGeralPage').then((m) => ({
    default: m.EstudosVisaoGeralPage,
  })),
)
const MateriasPage = lazy(() =>
  import('@/pages/estudos/MateriasPage').then((m) => ({
    default: m.MateriasPage,
  })),
)
const SessoesPage = lazy(() =>
  import('@/pages/estudos/SessoesPage').then((m) => ({
    default: m.SessoesPage,
  })),
)
const ProvasPage = lazy(() =>
  import('@/pages/estudos/ProvasPage').then((m) => ({
    default: m.ProvasPage,
  })),
)
const FinancasLayout = lazy(() =>
  import('@/pages/financas/FinancasLayout').then((m) => ({
    default: m.FinancasLayout,
  })),
)
const FinancasDashboardPage = lazy(() =>
  import('@/pages/financas/FinancasDashboardPage').then((m) => ({
    default: m.FinancasDashboardPage,
  })),
)
const TransacoesPage = lazy(() =>
  import('@/pages/financas/TransacoesPage').then((m) => ({
    default: m.TransacoesPage,
  })),
)
const RelatoriosPage = lazy(() =>
  import('@/pages/financas/RelatoriosPage').then((m) => ({
    default: m.RelatoriosPage,
  })),
)
const OrcamentosPage = lazy(() =>
  import('@/pages/financas/OrcamentosPage').then((m) => ({
    default: m.OrcamentosPage,
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
const FinanceConfiguracoesPage = lazy(() =>
  import('@/pages/financas/ConfiguracoesPage').then((m) => ({
    default: m.ConfiguracoesPage,
  })),
)
const SharedRoutinePage = lazy(() =>
  import('@/pages/SharedRoutinePage').then((m) => ({
    default: m.SharedRoutinePage,
  })),
)
const NotFoundPage = lazy(() =>
  import('@/pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })),
)

function PageFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[var(--color-bg)]">
      <p
        role="status"
        aria-live="polite"
        className="text-sm text-[var(--color-text-muted)]"
      >
        Carregando…
      </p>
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
          <Route path="/rotina/:token" element={<SharedRoutinePage />} />
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
            <Route path="calendario" element={<CalendarioPage />} />
            <Route path="estatisticas" element={<EstatisticasPage />} />
            <Route path="rotina" element={<RotinaPage />} />
            <Route path="habitos" element={<HabitosPage />} />
            <Route path="metas" element={<MetasPage />} />
            <Route path="tarefas" element={<TarefasPage />} />
            <Route path="diario" element={<DiarioPage />} />
            <Route path="estudos" element={<EstudosLayout />}>
              <Route index element={<EstudosVisaoGeralPage />} />
              <Route path="materias" element={<MateriasPage />} />
              <Route path="sessoes" element={<SessoesPage />} />
              <Route path="provas" element={<ProvasPage />} />
            </Route>
            <Route path="perfil" element={<PerfilPage />} />
            <Route path="premium" element={<PremiumPage />} />
            <Route path="configuracoes" element={<ConfiguracoesPage />} />
            <Route path="financas" element={<FinancasLayout />}>
              <Route index element={<FinancasDashboardPage />} />
              <Route path="transacoes" element={<TransacoesPage />} />
              <Route path="contas" element={<ContasPage />} />
              <Route path="contas-da-casa" element={<ContasDaCasaPage />} />
              <Route path="relatorios" element={<RelatoriosPage />} />
              <Route path="orcamentos" element={<OrcamentosPage />} />
              <Route
                path="configuracoes"
                element={<FinanceConfiguracoesPage />}
              />
            </Route>
          </Route>
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}
