import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/context/AuthProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { queryClient } from '@/lib/queryClient'
import { AppRouter } from '@/routes/AppRouter'

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AppRouter />
        </AuthProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}

export default App
