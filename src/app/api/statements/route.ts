import { NextResponse, type NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(request: NextRequest) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const statements = await prisma.statement.findMany({
    where: { userId: user.id },
    orderBy: [{ year: 'desc' }, { month: 'desc' }]
  });

  return NextResponse.json(
    statements.map((s) => ({
      id: s.id,
      month: s.month,
      year: s.year,
      fileUrl: s.fileUrl,
      closingBalance: s.closingBalance.toString()
    }))
  );
}
