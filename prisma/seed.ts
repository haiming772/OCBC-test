import { Prisma, PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  await prisma.transaction.deleteMany();
  await prisma.account.deleteMany();
  await prisma.payee.deleteMany();
  await prisma.statement.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Passw0rd!', 10);
  const user = await prisma.user.create({
    data: {
      email: 'demo@ocbc.local',
      name: 'Nadia Ong',
      passwordHash
    }
  });

  const everyday = await prisma.account.create({
    data: {
      name: 'Everyday Savings',
      number: '528-123-456-0',
      balance: new Prisma.Decimal('1234.56'),
      userId: user.id,
      txns: {
        create: [
          {
            type: 'CREDIT',
            amount: new Prisma.Decimal('3200.00'),
            payee: 'Payroll',
            note: 'Monthly salary',
            createdAt: new Date(Date.now() - 86400000 * 5)
          },
          {
            type: 'DEBIT',
            amount: new Prisma.Decimal('54.20'),
            payee: 'NTUC FairPrice',
            note: 'Groceries',
            createdAt: new Date(Date.now() - 86400000 * 3)
          },
          {
            type: 'DEBIT',
            amount: new Prisma.Decimal('98.40'),
            payee: 'SP Group',
            note: 'Utilities',
            createdAt: new Date(Date.now() - 86400000 * 2)
          }
        ]
      }
    }
  });

  const ocbc360 = await prisma.account.create({
    data: {
      name: 'OCBC 360',
      number: '528-987-654-0',
      balance: new Prisma.Decimal('9876.50'),
      userId: user.id,
      txns: {
        create: [
          {
            type: 'DEBIT',
            amount: new Prisma.Decimal('500.00'),
            payee: 'Mortgage Payment',
            note: 'Home loan',
            createdAt: new Date(Date.now() - 86400000 * 10)
          },
          {
            type: 'CREDIT',
            amount: new Prisma.Decimal('1500.00'),
            payee: 'Savings Transfer',
            note: 'Bonus top-up',
            createdAt: new Date(Date.now() - 86400000 * 7)
          }
        ]
      }
    }
  });

  await prisma.payee.createMany({
    data: [
      { name: 'Mei Lin', alias: 'Mei Lin', userId: user.id },
      { name: 'SP Group', alias: 'SPG', type: 'BILLER', userId: user.id }
    ]
  });

  const months = ['2024-05', '2024-06', '2024-07', '2024-08', '2024-09', '2024-10'];
  const statements = months.map((entry) => {
    const [yearStr, monthStr] = entry.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);
    return {
      month,
      year,
      fileUrl: `/statements/${entry}.pdf`,
      openingBalance: new Prisma.Decimal('1000.00'),
      closingBalance: new Prisma.Decimal('1234.56'),
      totalCredits: new Prisma.Decimal('3200.00'),
      totalDebits: new Prisma.Decimal('2400.00'),
      userId: user.id
    } satisfies Prisma.StatementCreateManyInput;
  });

  await prisma.statement.createMany({ data: statements });

  console.log('Seeded demo user -> demo@ocbc.local / Passw0rd!');
  console.log('Accounts created:', everyday.number, ocbc360.number);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
