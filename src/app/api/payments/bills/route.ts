import { NextResponse, type NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { billPaySchema } from '@/lib/z';

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const json = await request.json().catch(() => ({}));
  const parsed = billPaySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { accountId, biller, reference, amount } = parsed.data;
  const account = await prisma.account.findFirst({ where: { id: accountId, userId: user.id } });
  if (!account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }

  const decimalAmount = new Prisma.Decimal(amount.toFixed(2));
  const receipt = `BL-${Date.now()}`;

  await prisma.$transaction([
    prisma.transaction.create({
      data: { accountId, type: 'DEBIT', amount: decimalAmount, payee: biller, note: reference }
    }),
    prisma.account.update({ where: { id: accountId }, data: { balance: { decrement: decimalAmount } } })
  ]);

  return NextResponse.json({ receipt }, { status: 201 });
}
