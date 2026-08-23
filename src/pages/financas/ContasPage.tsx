import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowRightLeft, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, MotionCard } from '@/components/ui/Card'
import { Modal } from '@/components/ui/Modal'
import { PageFade } from '@/components/ui/PageFade'
import { AccountForm } from '@/components/financas/AccountForm'
import { AccountItem } from '@/components/financas/AccountItem'
import { TransactionForm } from '@/components/financas/TransactionForm'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'
import {
  calculateAccountBalanceCents,
  calculateTotalBalanceCents,
} from '@/lib/financeBalance'
import { staggerContainer } from '@/lib/motion'
import { centsToBRL } from '@/lib/money'
import {
  archiveFinanceAccount,
  createFinanceAccount,
  fetchFinanceAccounts,
  updateFinanceAccount,
} from '@/lib/queries/financas/accounts'
import { fetchFinanceCategories } from '@/lib/queries/financas/categories'
import {
  createTransaction,
  fetchTransactions,
} from '@/lib/queries/financas/transactions'
import {
  toAccountInput,
  type AccountFormValues,
} from '@/lib/validation/financas/account'
import type { TransactionFormValues } from '@/lib/validation/financas/transaction'
import { toTransactionInput } from '@/lib/validation/financas/transaction'
import type {
  FinanceAccount,
  FinanceCategory,
  FinanceTransaction,
} from '@/types/database'

const EMPTY_ACCOUNTS: FinanceAccount[] = []
const EMPTY_TRANSACTIONS: FinanceTransaction[] = []
const EMPTY_CATEGORIES: FinanceCategory[] = []

export function ContasPage() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<FinanceAccount | null>(
    null,
  )
  const [transferModalOpen, setTransferModalOpen] = useState(false)

  const accountsQuery = useQuery({
    queryKey: ['financeAccounts', user?.id],
    queryFn: () => fetchFinanceAccounts(user!.id),
    enabled: !!user,
  })
  const transactionsQuery = useQuery({
    queryKey: ['financeTransactions', user?.id],
    queryFn: () => fetchTransactions(user!.id),
    enabled: !!user,
  })
  const categoriesQuery = useQuery({
    queryKey: ['financeCategories'],
    queryFn: fetchFinanceCategories,
    enabled: !!user,
  })

  const accounts = accountsQuery.data ?? EMPTY_ACCOUNTS
  const transactions = transactionsQuery.data ?? EMPTY_TRANSACTIONS
  const categories = categoriesQuery.data ?? EMPTY_CATEGORIES

  const totalBalance = useMemo(
    () => calculateTotalBalanceCents(accounts, transactions),
    [accounts, transactions],
  )

  const invalidateAccounts = () =>
    queryClient.invalidateQueries({ queryKey: ['financeAccounts', user?.id] })
  const invalidateTransactions = () =>
    queryClient.invalidateQueries({
      queryKey: ['financeTransactions', user?.id],
    })

  const createMutation = useMutation({
    mutationFn: (values: AccountFormValues) =>
      createFinanceAccount(user!.id, toAccountInput(values)),
    onSuccess: () => {
      invalidateAccounts()
      closeModal()
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, values }: { id: string; values: AccountFormValues }) =>
      updateFinanceAccount(id, toAccountInput(values)),
    onSuccess: () => {
      invalidateAccounts()
      closeModal()
    },
  })

  const archiveMutation = useMutation({
    mutationFn: (account: FinanceAccount) => archiveFinanceAccount(account.id),
    onSuccess: invalidateAccounts,
  })

  const transferMutation = useMutation({
    mutationFn: (values: TransactionFormValues) =>
      createTransaction(user!.id, toTransactionInput(values)),
    onSuccess: () => {
      invalidateTransactions()
      setTransferModalOpen(false)
    },
  })

  const closeModal = () => {
    setModalOpen(false)
    setEditingAccount(null)
  }

  const openCreateModal = () => {
    setEditingAccount(null)
    setModalOpen(true)
  }

  const openEditModal = (account: FinanceAccount) => {
    setEditingAccount(account)
    setModalOpen(true)
  }

  const handleArchive = (account: FinanceAccount) => {
    if (window.confirm(`Arquivar a conta "${account.name}"?`)) {
      archiveMutation.mutate(account)
    }
  }

  const handleFormSubmit = async (values: AccountFormValues) => {
    if (editingAccount) {
      await updateMutation.mutateAsync({ id: editingAccount.id, values })
    } else {
      await createMutation.mutateAsync(values)
    }
  }

  const isLoading = accountsQuery.isLoading || transactionsQuery.isLoading
  const isError = accountsQuery.isError || transactionsQuery.isError

  return (
    <PageFade className="mx-auto max-w-4xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-[var(--color-text)]">
            Contas
          </h1>
          <p className="text-sm text-[var(--color-text-muted)]">
            Bancos, carteiras, dinheiro físico e investimentos.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setTransferModalOpen(true)}
            className="gap-1.5"
            disabled={accounts.length < 2}
          >
            <ArrowRightLeft size={16} /> Transferir
          </Button>
          <Button onClick={openCreateModal} className="gap-1.5">
            <Plus size={16} /> Nova conta
          </Button>
        </div>
      </div>

      {!isLoading && !isError && (
        <Card className="mt-6 p-4">
          <p className="text-xs font-medium text-[var(--color-text-muted)]">
            Saldo total
          </p>
          <p
            className={cn(
              'font-heading mt-1 text-2xl font-bold tabular-nums',
              totalBalance < 0 ? 'text-error-500' : 'text-[var(--color-text)]',
            )}
          >
            {centsToBRL(totalBalance)}
          </p>
        </Card>
      )}

      <div className="mt-6">
        {isLoading && (
          <p className="text-sm text-[var(--color-text-muted)]">
            Carregando contas…
          </p>
        )}
        {isError && (
          <p className="text-error-500 text-sm">
            Não foi possível carregar suas contas. Tente novamente.
          </p>
        )}
        {accounts.length === 0 && !isLoading && !isError && (
          <MotionCard
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="p-8 text-center text-sm text-[var(--color-text-muted)]"
          >
            Nenhuma conta ainda. Crie a primeira para começar a registrar suas
            finanças.
          </MotionCard>
        )}
        {accounts.length > 0 && (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="show"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
          >
            {accounts.map((account) => (
              <AccountItem
                key={account.id}
                account={account}
                balanceCents={calculateAccountBalanceCents(
                  account,
                  transactions,
                )}
                onEdit={openEditModal}
                onArchive={handleArchive}
              />
            ))}
          </motion.div>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <Modal
            title={editingAccount ? 'Editar conta' : 'Nova conta'}
            onClose={closeModal}
          >
            <AccountForm
              initialAccount={editingAccount ?? undefined}
              onSubmit={handleFormSubmit}
              onCancel={closeModal}
            />
          </Modal>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {transferModalOpen && (
          <Modal
            title="Transferir entre contas"
            onClose={() => setTransferModalOpen(false)}
          >
            <TransactionForm
              accounts={accounts}
              categories={categories}
              defaultType="transfer"
              lockType
              onSubmit={async (values) => {
                await transferMutation.mutateAsync(values)
              }}
              onCancel={() => setTransferModalOpen(false)}
            />
          </Modal>
        )}
      </AnimatePresence>
    </PageFade>
  )
}
