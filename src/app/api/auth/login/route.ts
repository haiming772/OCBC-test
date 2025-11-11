import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { loginSchema } from '@/lib/z';
import { enforceRateLimit, makeToken, setSessionCookie, verifyPassword } from '@/lib/auth';

export async function POST(request: NextRequest) {
  const json = await request.json().catch(() => ({}));
  const parsed = loginSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 400 });
  }

  const { email, password } = parsed.data;
  enforceRateLimit(email);
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) {
    return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
  }

  const token = makeToken({ uid: user.id, email: user.email });
  const response = NextResponse.json({ id: user.id, email: user.email, name: user.name });
  setSessionCookie(response, token);
  return response;
}
