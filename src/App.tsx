import { QueryClientProvider } from '@tanstack/react-query'
import { AuthProvider } from '@/context/AuthProvider'
import { queryClient } from '@/lib/queryClient'
import { AppRouter } from '@/routes/AppRouter'

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
