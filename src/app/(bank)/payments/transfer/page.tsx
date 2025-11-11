import { prisma } from '@/lib/prisma';
import { getUserFromCookies } from '@/lib/auth';
import { PageHeader } from '@/components/PageHeader';
import TransferForm from './TransferForm';
import { EmptyState } from '@/components/EmptyState';

export default async function TransferPage() {
  const user = await getUserFromCookies();
  if (!user) return null;
  const accounts = await prisma.account.findMany({ where: { userId: user.id }, orderBy: { name: 'asc' } });
  if (accounts.length < 2) {
    return (
      <div>
        <PageHeader title="Transfers" description="Move money across your accounts" />
        <EmptyState title="Add another account" description="You need at least two accounts for transfers." />
      </div>
    );
  }
  return (
    <div>
      <PageHeader title="Transfers" description="Same-user account transfers" />
      <TransferForm accounts={accounts.map((acc) => ({ id: acc.id, name: acc.name }))} />
    </div>
  );
}
