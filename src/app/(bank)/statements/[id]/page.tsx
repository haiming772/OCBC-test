import { notFound } from 'next/navigation';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { getUserFromCookies } from '@/lib/auth';
import { PageHeader } from '@/components/PageHeader';
import { Card } from '@/components/Card';
import { formatCurrency } from '@/lib/money';

export default async function StatementDetail({ params }: { params: { id: string } }) {
  const user = await getUserFromCookies();
  if (!user) return null;
  const statement = await prisma.statement.findFirst({
    where: { id: Number(params.id), userId: user.id }
  });
  if (!statement) {
    notFound();
  }

  return (
    <div>
      <PageHeader
        title={`Statement ${statement.month}/${statement.year}`}
        description="Summary preview"
        actions={
          <Link href={statement.fileUrl} className="btn-primary" data-testid="btn-download-pdf">
            Download PDF
          </Link>
        }
      />
      <div className="grid gap-4 md:grid-cols-2">
        <Card title="Opening balance">
          <p className="text-2xl font-semibold">{formatCurrency(statement.openingBalance.toString())}</p>
        </Card>
        <Card title="Closing balance">
          <p className="text-2xl font-semibold">{formatCurrency(statement.closingBalance.toString())}</p>
        </Card>
        <Card title="Total credits">
          <p className="text-2xl font-semibold text-emerald-600">{formatCurrency(statement.totalCredits.toString())}</p>
        </Card>
        <Card title="Total debits">
          <p className="text-2xl font-semibold text-rose-600">{formatCurrency(statement.totalDebits.toString())}</p>
        </Card>
      </div>
      <div className="mt-8 rounded-2xl border border-gray-200 bg-white/80 p-6">
        <p className="text-sm text-gray-600">
          This is a simplified preview. Download the PDF for the full, paginated record including transaction level
          details, regulatory wording, and disclaimers.
        </p>
      </div>
    </div>
  );
}
