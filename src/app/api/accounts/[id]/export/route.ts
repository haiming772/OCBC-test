import { NextResponse, type NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const accountId = Number(params.id);
  const account = await prisma.account.findFirst({ where: { id: accountId, userId: user.id } });
  if (!account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  const url = new URL(request.url);
  const type = url.searchParams.get('type');
  const from = url.searchParams.get('from');
  const to = url.searchParams.get('to');

  const where: Prisma.TransactionWhereInput = { accountId };
  if (type === 'CREDIT' || type === 'DEBIT') {
    where.type = type;
  }
  if (from || to) {
    where.createdAt = {};
    if (from) where.createdAt.gte = new Date(from);
    if (to) where.createdAt.lte = new Date(to);
  }

  const txns = await prisma.transaction.findMany({ where, orderBy: { createdAt: 'desc' } });

  const rows = [
    ['Date', 'Type', 'Payee', 'Note', 'Amount'],
    ...txns.map((txn) => [
      txn.createdAt.toISOString(),
      txn.type,
      txn.payee,
      txn.note || '',
      txn.amount.toString()
    ])
  ];

  const csv = rows.map((row) => row.map((col) => `"${col.replace(/"/g, '""')}"`).join(',')).join('\n');

  return new NextResponse(csv, {
    headers: {
      'content-type': 'text/csv',
      'content-disposition': `attachment; filename=account-${account.id}.csv`
    }
  });
}
