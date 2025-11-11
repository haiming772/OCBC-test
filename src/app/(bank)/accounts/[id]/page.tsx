import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getUserFromCookies } from '@/lib/auth';
import { PageHeader } from '@/components/PageHeader';
import { Table } from '@/components/Table';
import { formatCurrency } from '@/lib/money';

const formatter = new Intl.DateTimeFormat('en-SG', { dateStyle: 'medium' });

export default async function AccountDetailPage({
  params,
  searchParams
}: {
  params: { id: string };
  searchParams: { page?: string; type?: string; from?: string; to?: string };
}) {
  const user = await getUserFromCookies();
  if (!user) return null;

  const account = await prisma.account.findFirst({ where: { id: Number(params.id), userId: user.id } });
  if (!account) {
    notFound();
  }

  const page = Math.max(Number(searchParams.page) || 1, 1);
  const type = searchParams.type === 'CREDIT' || searchParams.type === 'DEBIT' ? searchParams.type : 'all';
  const from = searchParams.from;
  const to = searchParams.to;
  const where: Prisma.TransactionWhereInput = { accountId: account.id };
  if (type !== 'all') {
    where.type = type as 'CREDIT' | 'DEBIT';
  }
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  const take = 10;
  const skip = (page - 1) * take;
  const [transactions, total] = await Promise.all([
    prisma.transaction.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take }),
    prisma.transaction.count({ where })
  ]);

  const totalPages = Math.max(Math.ceil(total / take), 1);
  const paramsObj = new URLSearchParams();
  if (type !== 'all') paramsObj.set('type', type);
  if (from) paramsObj.set('from', from);
  if (to) paramsObj.set('to', to);
  const baseParams = Object.fromEntries(paramsObj.entries());
  const exportQuery = paramsObj.toString();

  return (
    <div>
      <PageHeader
        title={account.name}
        description={`Account ${account.number}`}
        actions={
          <Link
            href={
              exportQuery
                ? `/api/accounts/${account.id}/export?${exportQuery}`
                : `/api/accounts/${account.id}/export`
            }
            className="btn-secondary"
            data-testid="btn-export-csv"
          >
            Export CSV
          </Link>
        }
      />
      <div className="mb-6 rounded-xl border border-gray-200 bg-white/70 p-6">
        <p className="text-sm uppercase text-gray-500">Available balance</p>
        <p className="text-4xl font-semibold text-gray-900">{formatCurrency(account.balance.toString())}</p>
      </div>

      <form className="mb-6 grid gap-4 rounded-xl border border-gray-200 bg-white/70 p-4 md:grid-cols-4" method="get">
        <label className="text-sm text-gray-600">
          Type
          <select
            name="type"
            defaultValue={type}
            data-testid="filter-type"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          >
            <option value="all">All</option>
            <option value="CREDIT">Credit</option>
            <option value="DEBIT">Debit</option>
          </select>
        </label>
        <label className="text-sm text-gray-600">
          From
          <input
            type="date"
            name="from"
            defaultValue={from}
            data-testid="filter-from"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>
        <label className="text-sm text-gray-600">
          To
          <input
            type="date"
            name="to"
            defaultValue={to}
            data-testid="filter-to"
            className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
          />
        </label>
        <div className="flex items-end gap-2">
          <button type="submit" className="btn-primary w-full" data-testid="btn-filter-apply">
            Apply
          </button>
          <Link href={`/accounts/${account.id}`} className="btn-ghost" data-testid="btn-filter-reset">
            Reset
          </Link>
        </div>
      </form>

      <Table
        caption="Account transactions"
        headers={[
          { key: 'date', label: 'Date' },
          { key: 'type', label: 'Type' },
          { key: 'payee', label: 'Payee' },
          { key: 'note', label: 'Note' },
          { key: 'amount', label: 'Amount', align: 'right' }
        ]}
      >
        {transactions.map((txn) => (
          <tr key={txn.id}>
            <td className="px-4 py-3 text-gray-600">{formatter.format(txn.createdAt)}</td>
            <td className="px-4 py-3">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                  txn.type === 'CREDIT' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
                }`}
              >
                {txn.type}
              </span>
            </td>
            <td className="px-4 py-3 text-gray-900">{txn.payee}</td>
            <td className="px-4 py-3 text-gray-500">{txn.note || '-'}</td>
            <td className="px-4 py-3 text-right font-semibold">
              {txn.type === 'DEBIT' ? '-' : '+'}
              {formatCurrency(txn.amount.toString())}
            </td>
          </tr>
        ))}
      </Table>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Link
            href={`/accounts/${account.id}?${new URLSearchParams({
              ...baseParams,
              page: String(Math.max(page - 1, 1))
            }).toString()}`}
            aria-disabled={page === 1}
            className={`btn-ghost ${page === 1 ? 'pointer-events-none opacity-40' : ''}`}
            data-testid="btn-pagination-prev"
          >
            Previous
          </Link>
          <Link
            href={`/accounts/${account.id}?${new URLSearchParams({
              ...baseParams,
              page: String(Math.min(page + 1, totalPages))
            }).toString()}`}
            aria-disabled={page === totalPages}
            className={`btn-ghost ${page === totalPages ? 'pointer-events-none opacity-40' : ''}`}
            data-testid="btn-pagination-next"
          >
            Next
          </Link>
        </div>
      </div>
    </div>
  );
}
