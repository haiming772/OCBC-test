'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { loginSchema, registerSchema } from '@/lib/z';
import { enforceRateLimit, hashPassword, makeToken, verifyPassword, TOKEN_NAME } from '@/lib/auth';

export async function loginAction(_: { error?: string } | undefined, formData: FormData) {
  const parse = loginSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password')
  });

  if (!parse.success) {
    return { error: 'Enter a valid email and password.' };
  }

  const { email, password } = parse.data;
  enforceRateLimit(email);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { error: 'Invalid credentials.' };
  }

  const matches = await verifyPassword(password, user.passwordHash);
  if (!matches) {
    return { error: 'Invalid credentials.' };
  }

  const token = makeToken({ uid: user.id, email: user.email });
  const store = cookies();
  store.set(TOKEN_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24,
    path: '/'
  });

  redirect(`/?success=${encodeURIComponent('Welcome back')}`);
}

export async function registerAction(_: { error?: string } | undefined, formData: FormData) {
  const parse = registerSchema.safeParse({
    email: formData.get('email'),
    name: formData.get('name'),
    password: formData.get('password')
  });

  if (!parse.success) {
    return { error: 'Please check the form fields.' };
  }

  const { email, name, password } = parse.data;
  enforceRateLimit(email);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return { error: 'Email already registered.' };
  }

  const passwordHash = await hashPassword(password);

  await prisma.user.create({
    data: { email, name, passwordHash }
  });

  redirect(`/login?success=${encodeURIComponent('Account created. Please sign in')}`);
}
