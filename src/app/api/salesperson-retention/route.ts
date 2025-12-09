import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const sales = await prisma.factSales.findMany({
      include: {
        salesperson: true,
        customer: true,
      },
    });

    if (!sales.length) {
      return NextResponse.json({ salespersons: [] });
    }

    type CustOrders = {
      orderNumbers: Set<string>;
      totalSales: number;
    };

    type SalespersonAgg = {
      salespersonId: string;
      salespersonName: string;
      customers: Record<string, CustOrders>;
      totalSales: number;
    };

    const spMap: Record<string, SalespersonAgg> = {};

    for (const row of sales) {
      if (!row.salespersonId || !row.salesperson || !row.customerId) continue;

      const spId = String(row.salespersonId);
      const custId = String(row.customerId);
      const salesAmount = Number(row.salesAmount ?? 0);

      if (!spMap[spId]) {
        spMap[spId] = {
          salespersonId: spId,
          salespersonName: row.salesperson.fullName,
          customers: {},
          totalSales: 0,
        };
      }

      const s = spMap[spId];
      s.totalSales += salesAmount;

      if (!s.customers[custId]) {
        s.customers[custId] = {
          orderNumbers: new Set<string>(),
          totalSales: 0,
        };
      }

      s.customers[custId].orderNumbers.add(row.orderNumber);
      s.customers[custId].totalSales += salesAmount;
    }

    const salespersons = Object.values(spMap)
      .map((s) => {
        const totalCustomers = Object.keys(s.customers).length;
        let repeatCustomers = 0;

        for (const cust of Object.values(s.customers)) {
          if (cust.orderNumbers.size >= 2) {
            repeatCustomers += 1;
          }
        }

        const retentionRate =
          totalCustomers > 0 ? repeatCustomers / totalCustomers : 0;

        return {
          salesperson_id: s.salespersonId,
          salesperson_name: s.salespersonName,
          total_customers: totalCustomers,
          repeat_customers: repeatCustomers,
          retention_rate: Number(retentionRate.toFixed(4)),
          total_sales: Number(s.totalSales.toFixed(2)),
        };
      })
      .sort((a, b) => b.retention_rate - a.retention_rate);

    const bestRetention = salespersons[0] ?? null;

    return NextResponse.json({
      salespersons,
      bestRetention,
    });
  } catch (error) {
    console.error('Error in salesperson-retention API:', error);
    return NextResponse.json(
      {
        salespersons: [],
        bestRetention: null,
        error: 'Failed to calculate salesperson retention',
      },
      { status: 500 },
    );
  }
}
