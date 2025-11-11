import { z } from 'zod';

const passwordRule = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/\d/, 'Password must contain a number');

export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(80),
  password: passwordRule
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

export const payNowSchema = z.object({
  accountId: z.coerce.number().int().positive(),
  recipient: z.string().min(2).max(120),
  amount: z.coerce.number().positive(),
  message: z.string().max(140).optional()
});

export const billPaySchema = z.object({
  accountId: z.coerce.number().int().positive(),
  biller: z.enum(['SP Group', 'Singtel', 'Town Council']),
  reference: z.string().min(3).max(40),
  amount: z.coerce.number().positive()
});

export const transferSchema = z.object({
  fromAccountId: z.coerce.number().int().positive(),
  toAccountId: z.coerce.number().int().positive().refine((val, ctx) => {
    if (val === ctx.parent?.fromAccountId) {
      return false;
    }
    return true;
  }, 'Choose a different destination account'),
  amount: z.coerce.number().positive(),
  note: z.string().max(140).optional()
});

export const nameSchema = z.object({ name: z.string().min(2).max(80) });

export const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1),
  newPassword: passwordRule
});

export const statementFilterSchema = z.object({
  month: z.coerce.number().int().min(1).max(12).optional(),
  year: z.coerce.number().int().min(2000).max(2100).optional()
});

export const txnFilterSchema = z.object({
  accountId: z.coerce.number().int().positive(),
  page: z.coerce.number().int().min(1).default(1),
  type: z.enum(['all', 'CREDIT', 'DEBIT']).default('all'),
  from: z.string().optional(),
  to: z.string().optional()
});
