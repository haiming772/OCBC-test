import { NextResponse, type NextRequest } from 'next/server';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { payNowSchema } from '@/lib/z';

export async function POST(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const json = await request.json().catch(() => ({}));
  const parsed = payNowSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
  }

  const { accountId, recipient, amount, message } = parsed.data;
  const account = await prisma.account.findFirst({ where: { id: accountId, userId: user.id } });
  if (!account) {
    return NextResponse.json({ error: 'Account not found' }, { status: 404 });
  }
  const decimalAmount = new Prisma.Decimal(amount.toFixed(2));
  const reference = `PN-${Date.now()}`;

  await prisma.$transaction([
    prisma.transaction.create({
      data: { accountId, type: 'DEBIT', amount: decimalAmount, payee: recipient, note: message }
    }),
    prisma.account.update({
      where: { id: accountId },
      data: { balance: { decrement: decimalAmount } }
    })
  ]);

  return NextResponse.json({ reference, balance: account.balance.sub(decimalAmount).toString() }, { status: 201 });
}
