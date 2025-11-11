import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import type { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from './prisma';

const TOKEN_NAME = 'ap_token';
const TOKEN_TTL_SECONDS = 60 * 60 * 24; // 1 day
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret';

const rateBucket = new Map<string, { count: number; expiresAt: number }>();
const RATE_LIMIT_MAX = 10;
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute

type TokenPayload = {
  uid: number;
  email: string;
};

export function makeToken(payload: TokenPayload) {
  return jwt.sign(payload, JWT_SECRET, { algorithm: 'HS256', expiresIn: TOKEN_TTL_SECONDS });
}

export function verifyToken(token?: string) {
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET) as TokenPayload & { exp: number };
  } catch {
    return null;
  }
}

export function setSessionCookie(res: NextResponse, token: string) {
  res.cookies.set(TOKEN_NAME, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    maxAge: TOKEN_TTL_SECONDS,
    path: '/'
  });
}

export function clearSessionCookie(res: NextResponse) {
  res.cookies.set(TOKEN_NAME, '', { path: '/', maxAge: 0 });
}

export async function getUserFromCookies() {
  const token = cookies().get(TOKEN_NAME)?.value;
  const payload = verifyToken(token);
  if (!payload) return null;
  return prisma.user.findUnique({ where: { id: payload.uid } });
}

export async function requireUser() {
  const user = await getUserFromCookies();
  if (!user) {
    redirect('/login');
  }
  return user;
}

export async function getUserFromRequest(req: NextRequest) {
  const token = req.cookies.get(TOKEN_NAME)?.value;
  const payload = verifyToken(token);
  if (!payload) return null;
  return prisma.user.findUnique({ where: { id: payload.uid } });
}

export function enforceRateLimit(identifier: string) {
  const now = Date.now();
  const bucket = rateBucket.get(identifier);
  if (!bucket || bucket.expiresAt < now) {
    rateBucket.set(identifier, { count: 1, expiresAt: now + RATE_LIMIT_WINDOW });
    return;
  }
  bucket.count += 1;
  if (bucket.count > RATE_LIMIT_MAX) {
    throw new Error('Too many attempts. Please pause and try again.');
  }
}

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export { TOKEN_NAME };
