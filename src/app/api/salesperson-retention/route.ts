import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cachedResponse } from '@/lib/cache';

export async function GET(request: Request) {
  try {
    const sales = await prisma.factSales.findMany({
      select: {
        salespersonId: true,
        customerId: true,
        orderNumber: true,
        salesAmount: true,
        salesperson: {
          select: {
            fullName: true,
          },
        },
      },
      take: 10000,
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
        let totalOrders = 0;

        for (const cust of Object.values(s.customers)) {
          totalOrders += cust.orderNumbers.size;
          if (cust.orderNumbers.size >= 2) {
            repeatCustomers += 1;
          }
        }

        const retentionRate =
          totalCustomers > 0 ? repeatCustomers / totalCustomers : 0;
        const avgOrdersPerCustomer =
          totalCustomers > 0 ? totalOrders / totalCustomers : 0;
        const avgSalesPerCustomer =
          totalCustomers > 0 ? s.totalSales / totalCustomers : 0;

        return {
          salesperson_id: s.salespersonId,
          salesperson_name: s.salespersonName,
          territory_name: null,
          total_customers: totalCustomers,
          repeat_customers: repeatCustomers,
          retention_rate: Number(retentionRate.toFixed(4)),
          total_orders: totalOrders,
          total_sales: Number(s.totalSales.toFixed(2)),
          avg_orders_per_customer: Number(avgOrdersPerCustomer.toFixed(2)),
          avg_sales_per_customer: Number(avgSalesPerCustomer.toFixed(2)),
        };
      })
      .sort((a, b) => b.retention_rate - a.retention_rate);

    // Calculate summary
    const totalSalespersons = salespersons.length;
    const avgRetentionRate = totalSalespersons > 0
      ? salespersons.reduce((sum, sp) => sum + sp.retention_rate, 0) / totalSalespersons
      : 0;
    const avgOrdersPerCustomer = totalSalespersons > 0
      ? salespersons.reduce((sum, sp) => sum + sp.avg_orders_per_customer, 0) / totalSalespersons
      : 0;

    return cachedResponse({
      summary: {
        total_salespersons: totalSalespersons,
        avg_retention_rate: Number(avgRetentionRate.toFixed(4)),
        avg_orders_per_customer: Number(avgOrdersPerCustomer.toFixed(2)),
      },
      salespersons,
    }, 300); // Cache for 5 minutes
  } catch (error) {
    console.error('Error in salesperson-retention API:', error);
    return NextResponse.json(
      {
        summary: null,
        salespersons: [],
        error: 'Failed to calculate salesperson retention',
      },
      { status: 500 },
    );
  }
}
