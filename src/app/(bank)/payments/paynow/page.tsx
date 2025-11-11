import { prisma } from '@/lib/prisma';
import { getUserFromCookies } from '@/lib/auth';
import { PageHeader } from '@/components/PageHeader';
import { EmptyState } from '@/components/EmptyState';
import PayNowForm from './PayNowForm';

export default async function PayNowPage() {
  const user = await getUserFromCookies();
  if (!user) return null;

  const [accounts, payees] = await Promise.all([
    prisma.account.findMany({ where: { userId: user.id }, orderBy: { name: 'asc' } }),
    prisma.payee.findMany({ where: { userId: user.id }, orderBy: { name: 'asc' } })
  ]);

  if (accounts.length === 0) {
    return (
      <div>
        <PageHeader title="PayNow" description="Instant transfer via mobile or NRIC" />
        <EmptyState title="No available accounts" description="Add an account before sending PayNow transfers." />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="PayNow" description="Instant transfer via mobile or NRIC" />
      <PayNowForm
        accounts={accounts.map((acc) => ({ id: acc.id, name: acc.name }))}
        payees={payees.map((p) => ({ id: p.id, name: p.name, alias: p.alias }))}
      />
    </div>
  );
}
