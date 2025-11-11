import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getUserFromCookies } from '@/lib/auth';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/Card';
import { formatCurrency } from '@/lib/money';

export default async function StatementsPage() {
  const user = await getUserFromCookies();
  if (!user) return null;
  const statements = await prisma.statement.findMany({
    where: { userId: user.id },
    orderBy: [{ year: 'desc' }, { month: 'desc' }]
  });

  return (
    <div>
      <PageHeader title="Statements" description="Download your PDF statements" />
      <div className="grid gap-4 md:grid-cols-2">
        {statements.map((statement) => (
          <Card
            key={statement.id}
            title={`Statement ${statement.month}/${statement.year}`}
            description={`Closing balance ${formatCurrency(statement.closingBalance.toString())}`}
            actions={
              <div className="flex gap-2">
                <Link
                  href={`/statements/${statement.id}`}
                  className="btn-ghost text-[color:var(--ocbc-red)]"
                  data-testid={`link-statement-${statement.id}`}
                >
                  View
                </Link>
                <Link
                  href={statement.fileUrl}
                  className="btn-secondary"
                  data-testid={`btn-statement-download-${statement.id}`}
                >
                  Download
                </Link>
              </div>
            }
          >
            <p className="text-sm text-gray-600">
              Credits {formatCurrency(statement.totalCredits.toString())} � Debits {formatCurrency(statement.totalDebits.toString())}
            </p>
          </Card>
        ))}
      </div>
    </div>
  );
}
