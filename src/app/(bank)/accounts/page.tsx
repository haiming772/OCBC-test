import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getUserFromCookies } from '@/lib/auth';
import { PageHeader } from '@/components/PageHeader';
import { Table } from '@/components/Table';
import { EmptyState } from '@/components/EmptyState';
import { formatCurrency } from '@/lib/money';

function mask(number: string) {
  return number.replace(/\d(?=.{4})/g, '�');
}

export default async function AccountsPage() {
  const user = await getUserFromCookies();
  if (!user) return null;
  const accounts = await prisma.account.findMany({ where: { userId: user.id }, orderBy: { name: 'asc' } });

  return (
    <div>
      <PageHeader title="Accounts" description="Balances and account numbers" />
      {accounts.length === 0 ? (
        <EmptyState title="No accounts" description="Add an account via support." />
      ) : (
        <Table
          caption="List of bank accounts"
          headers={[
            { key: 'name', label: 'Account' },
            { key: 'number', label: 'Number' },
            { key: 'balance', label: 'Balance', align: 'right' },
            { key: 'link', label: 'Details' }
          ]}
        >
          {accounts.map((acc) => (
            <tr key={acc.id}>
              <td className="px-4 py-3 text-gray-900">{acc.name}</td>
              <td className="px-4 py-3 text-gray-600">{mask(acc.number)}</td>
              <td className="px-4 py-3 text-right font-semibold">{formatCurrency(acc.balance.toString())}</td>
              <td className="px-4 py-3">
                <Link
                  href={`/accounts/${acc.id}`}
                  className="text-sm font-semibold text-[color:var(--ocbc-red)]"
                  data-testid={`link-accounts-${acc.id}`}
                >
                  View
                </Link>
              </td>
            </tr>
          ))}
        </Table>
      )}
    </div>
  );
}
