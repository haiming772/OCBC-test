import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { registerSchema } from '@/lib/z';
import { enforceRateLimit, hashPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => ({}));
  const parsed = registerSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid form data' }, { status: 400 });
  }

  const { email, name, password } = parsed.data;
  enforceRateLimit(email);
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: 'Email already registered' }, { status: 409 });
  }

  await prisma.user.create({
    data: { email, name, passwordHash: await hashPassword(password) }
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
