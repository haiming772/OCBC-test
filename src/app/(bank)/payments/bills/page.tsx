import { prisma } from '@/lib/prisma';
import { getUserFromCookies } from '@/lib/auth';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import BillsForm from './BillsForm';

export default async function BillsPage() {
  const user = await getUserFromCookies();
  if (!user) return null;
  const accounts = await prisma.account.findMany({ where: { userId: user.id }, orderBy: { name: 'asc' } });
  if (accounts.length === 0) {
    return (
      <div>
        <PageHeader title="Bill Pay" description="Pay trusted billers securely" />
        <EmptyState title="No accounts available" description="Add an account to continue." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Bill Pay" description="Pay trusted billers securely" />
      <BillsForm accounts={accounts.map((acc) => ({ id: acc.id, name: acc.name }))} />
    </div>
  );
}
