import { NextResponse, type NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { transferSchema } from '@/lib/z';

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const json = await request.json().catch(() => ({}));
  const parsed = transferSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { fromAccountId, toAccountId, amount, note } = parsed.data;
  const [from, to] = await Promise.all([
    prisma.account.findFirst({ where: { id: fromAccountId, userId: user.id } }),
    prisma.account.findFirst({ where: { id: toAccountId, userId: user.id } })
  ]);

  if (!from || !to) {
    return NextResponse.json({ error: 'Accounts not found' }, { status: 404 });
  }

  const decimalAmount = new Prisma.Decimal(amount.toFixed(2));
  const reference = `TR-${Date.now()}`;

  await prisma.$transaction([
    prisma.transaction.create({
      data: { accountId: fromAccountId, type: 'DEBIT', amount: decimalAmount, payee: to.name, note }
    }),
    prisma.transaction.create({
      data: { accountId: toAccountId, type: 'CREDIT', amount: decimalAmount, payee: from.name, note }
    }),
    prisma.account.update({ where: { id: fromAccountId }, data: { balance: { decrement: decimalAmount } } }),
    prisma.account.update({ where: { id: toAccountId }, data: { balance: { increment: decimalAmount } } })
  ]);

  return NextResponse.json({ reference }, { status: 201 });
}
