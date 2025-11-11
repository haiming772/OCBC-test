import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getUserFromCookies } from '@/lib/auth';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/Card';
import { Table } from '@/components/Table';
import { formatCurrency } from '@/lib/money';

function maskAccount(number: string) {
  return number.replace(/\d(?=.{4})/g, '\u2022');
}

export default async function DashboardPage() {
  const user = await getUserFromCookies();
  if (!user) {
    return null;
  }

  const accounts = await prisma.account.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'asc' }
  });

  const recentTxns = await prisma.transaction.findMany({
    where: { account: { userId: user.id } },
    include: { account: true },
    orderBy: { createdAt: 'desc' },
    take: 5
  });

  const totalBalance = accounts.reduce((sum, acc) => sum + Number(acc.balance), 0);

  return (
    <div>
      <PageHeader title="Your accounts" description="Latest balances and quick tasks" />
      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Total holdings" description="Across all accounts" className="lg:col-span-1">
          <p className="text-3xl font-semibold text-gray-900">{formatCurrency(totalBalance)}</p>
          <p className="text-sm text-gray-500">Updated in real time</p>
        </Card>
        <Card title="Quick actions" className="lg:col-span-2">
          <div className="flex flex-wrap gap-3">
            <Link href="/payments/paynow" className="btn-primary" data-testid="btn-paynow-quick">
              PayNow transfer
            </Link>
            <Link href="/payments/transfer" className="btn-secondary" data-testid="btn-transfer-quick">
              Account transfer
            </Link>
            <Link href="/payments/bills" className="btn-secondary" data-testid="btn-bill-quick">
              Bill payment
            </Link>
            <Link href="/statements" className="btn-ghost" data-testid="btn-statements-quick">
              View statements
            </Link>
          </div>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {accounts.map((account) => (
          <Card
            key={account.id}
            title={account.name}
            description={maskAccount(account.number)}
            actions={
              <Link
                href={`/accounts/${account.id}`}
                className="text-sm font-semibold text-[color:var(--ocbc-red)]"
                data-testid={`link-account-${account.id}`}
              >
                View details
              </Link>
            }
          >
            <p className="text-3xl font-semibold text-gray-900">{formatCurrency(account.balance.toString())}</p>
          </Card>
        ))}
      </div>

      <Card className="mt-8" title="Recent activity" description="Last five transactions">
        {recentTxns.length === 0 ? (
          <p className="text-sm text-gray-500">No activity yet.</p>
        ) : (
          <Table
            caption="Latest five transactions"
            headers={[
              { key: 'account', label: 'Account' },
              { key: 'type', label: 'Type' },
              { key: 'payee', label: 'Payee' },
              { key: 'amount', label: 'Amount', align: 'right' },
              { key: 'date', label: 'Date' }
            ]}
          >
            {recentTxns.map((txn) => (
              <tr key={txn.id}>
                <td className="px-4 py-3 text-gray-900">{txn.account.name}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                      txn.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                    }`}
                  >
                    {txn.type}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-700">{txn.payee}</td>
                <td className="px-4 py-3 text-right font-semibold text-gray-900">
                  {txn.type === 'DEBIT' ? '-' : '+'}
                  {formatCurrency(txn.amount.toString())}
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {new Intl.DateTimeFormat('en-SG', { dateStyle: 'medium' }).format(txn.createdAt)}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </Card>
    </div>
  );
}
