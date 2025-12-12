// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user
  const hashedPassword = await hash('admin123', 12);
  
  await prisma.user.upsert({
    where: { email: 'admin@adventureworks.com' },
    update: {},
    create: {
      email: 'admin@adventureworks.com',
      name: 'Administrator',
      password: hashedPassword,
      role: 'admin',
    },
  });

  console.log('Admin user created: admin@adventureworks.com / admin123');
  
  // Seed dim_dates
  // SESUAIKAN RANGE DENGAN DATA ADVENTUREWORKS-MU
  const start = new Date(2001, 0, 1);  // 2001-01-01
  const end   = new Date(2004, 11, 31); // 2004-12-31

  const monthNames = [
    'January','February','March','April','May','June',
    'July','August','September','October','November','December'
  ];

  const rows: {
    dateKey: number;
    fullDate: Date;
    day: number;
    month: number;
    monthName: string;
    quarter: number;
    year: number;
    isWeekend: boolean;
  }[] = [];

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const fullDate = new Date(d);
    const year  = fullDate.getFullYear();
    const month = fullDate.getMonth() + 1; // 1–12
    const day   = fullDate.getDate();

    const dateKey = year * 10000 + month * 100 + day; // YYYYMMDD

    const isWeekend = fullDate.getDay() === 0 || fullDate.getDay() === 6; // 0 = Minggu, 6 = Sabtu

    rows.push({
      dateKey,
      fullDate,
      day,
      month,
      monthName: monthNames[month - 1],
      quarter: Math.floor((month - 1) / 3) + 1,
      year,
      isWeekend,
    });
  }

  // insert bulk
  await prisma.dimDate.createMany({
    data: rows,
    skipDuplicates: true,   // aman kalau seed di-run ulang
  });

  console.log(`Inserted ${rows.length} rows into dim_dates`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
