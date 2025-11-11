'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { Prisma } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { nameSchema, passwordChangeSchema, payNowSchema, billPaySchema, transferSchema } from '@/lib/z';
import { hashPassword, requireUser, verifyPassword, TOKEN_NAME } from '@/lib/auth';

export async function logoutAction() {
  const cookieStore = cookies();
  cookieStore.set(TOKEN_NAME, '', { path: '/', maxAge: 0 });
  redirect('/login?success=Signed%20out');
}

export async function updateNameAction(_: { error?: string } | undefined, formData: FormData) {
  const user = await requireUser();
  const parsed = nameSchema.safeParse({ name: formData.get('name') });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid name' };
  }

  await prisma.user.update({ where: { id: user.id }, data: { name: parsed.data.name } });
  revalidatePath('/profile');
  redirect(`/profile?success=${encodeURIComponent('Name updated')}`);
}

export async function updatePasswordAction(_: { error?: string } | undefined, formData: FormData) {
  const user = await requireUser();
  const parsed = passwordChangeSchema.safeParse({
    currentPassword: formData.get('currentPassword'),
    newPassword: formData.get('newPassword')
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid password' };
  }

  const matches = await verifyPassword(parsed.data.currentPassword, user.passwordHash);
  if (!matches) {
    return { error: 'Current password is incorrect.' };
  }

  await prisma.user.update({ where: { id: user.id }, data: { passwordHash: await hashPassword(parsed.data.newPassword) } });
  redirect(`/profile?success=${encodeURIComponent('Password updated')}`);
}

function mutateBalance(accountId: number, delta: Prisma.Decimal) {
  return prisma.account.update({
    where: { id: accountId },
    data: { balance: { increment: delta } }
  });
}

export async function payNowAction(_: { error?: string } | undefined, formData: FormData) {
  const user = await requireUser();
  const parsed = payNowSchema.safeParse({
    accountId: formData.get('accountId'),
    recipient: formData.get('recipient'),
    amount: formData.get('amount'),
    message: formData.get('message')
  });
  if (!parsed.success) {
    return { error: 'Please review the PayNow form.' };
  }

  const { accountId, recipient, amount, message } = parsed.data;
  const account = await prisma.account.findFirst({ where: { id: accountId, userId: user.id } });
  if (!account) {
    return { error: 'Account not found.' };
  }

  const decimalAmount = new Prisma.Decimal(amount.toFixed(2));
  const reference = `PN-${Date.now()}`;

  await prisma.$transaction([
    prisma.transaction.create({
      data: { accountId, type: 'DEBIT', amount: decimalAmount, payee: recipient, note: message }
    }),
    mutateBalance(accountId, decimalAmount.mul(-1))
  ]);

  revalidatePath('/');
  revalidatePath(`/accounts/${accountId}`);
  redirect(`/payments/paynow?success=${encodeURIComponent(`PayNow sent (${reference})`)}`);
}

export async function billPayAction(_: { error?: string } | undefined, formData: FormData) {
  const user = await requireUser();
  const parsed = billPaySchema.safeParse({
    accountId: formData.get('accountId'),
    biller: formData.get('biller'),
    reference: formData.get('reference'),
    amount: formData.get('amount')
  });
  if (!parsed.success) {
    return { error: 'Please review the bill payment form.' };
  }

  const { accountId, biller, reference, amount } = parsed.data;
  const account = await prisma.account.findFirst({ where: { id: accountId, userId: user.id } });
  if (!account) {
    return { error: 'Account not found.' };
  }

  const decimalAmount = new Prisma.Decimal(amount.toFixed(2));
  const receipt = `BL-${Date.now()}`;

  await prisma.$transaction([
    prisma.transaction.create({
      data: { accountId, type: 'DEBIT', amount: decimalAmount, payee: biller, note: reference }
    }),
    mutateBalance(accountId, decimalAmount.mul(-1))
  ]);

  revalidatePath('/');
  revalidatePath(`/accounts/${accountId}`);
  redirect(`/payments/bills?success=${encodeURIComponent(`Bill paid (${receipt})`)}`);
}

export async function transferAction(_: { error?: string } | undefined, formData: FormData) {
  const user = await requireUser();
  const parsed = transferSchema.safeParse({
    fromAccountId: formData.get('fromAccountId'),
    toAccountId: formData.get('toAccountId'),
    amount: formData.get('amount'),
    note: formData.get('note')
  });
  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message || 'Invalid transfer.' };
  }

  const { fromAccountId, toAccountId, amount, note } = parsed.data;
  const [fromAccount, toAccount] = await Promise.all([
    prisma.account.findFirst({ where: { id: fromAccountId, userId: user.id } }),
    prisma.account.findFirst({ where: { id: toAccountId, userId: user.id } })
  ]);

  if (!fromAccount || !toAccount) {
    return { error: 'Accounts mismatch.' };
  }

  const decimalAmount = new Prisma.Decimal(amount.toFixed(2));
  const reference = `TR-${Date.now()}`;

  await prisma.$transaction([
    prisma.transaction.create({
      data: { accountId: fromAccountId, type: 'DEBIT', amount: decimalAmount, payee: toAccount.name, note }
    }),
    prisma.transaction.create({
      data: { accountId: toAccountId, type: 'CREDIT', amount: decimalAmount, payee: fromAccount.name, note }
    }),
    mutateBalance(fromAccountId, decimalAmount.mul(-1)),
    mutateBalance(toAccountId, decimalAmount)
  ]);

  revalidatePath('/');
  revalidatePath(`/accounts/${fromAccountId}`);
  revalidatePath(`/accounts/${toAccountId}`);
  redirect(`/payments/transfer?success=${encodeURIComponent(`Transfer scheduled (${reference})`)}`);
}
