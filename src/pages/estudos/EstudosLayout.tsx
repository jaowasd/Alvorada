import { Outlet } from 'react-router-dom'
import { EstudosSubNav } from '@/components/estudos/EstudosSubNav'

/**
 * Layout das rotas /app/estudos/*. Diferente de FinancasLayout, não há efeito
 * colateral por visita: nada precisa ser gerado sob demanda aqui.
 */
export function EstudosLayout() {
  return (
    <div>
      <EstudosSubNav />
      <Outlet />
    </div>
  )
}
