import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cachedResponse } from '@/lib/cache';

export async function GET(request: Request) {
  try {
    const sales = await prisma.factSales.findMany({
      select: {
        customerId: true,
        orderNumber: true,
        salesAmount: true,
        customer: {
          select: {
            fullName: true,
            customerSegment: true,
          },
        },
        date: {
          select: {
            year: true,
          },
        },
      },
      take: 10000,
    });

    if (!sales.length) {
      return NextResponse.json({
        overall: null,
        segments: [],
      });
    }

    type CustYearKey = string;

    type CustYearAgg = {
      customerId: string;
      customerName: string;
      segment: string;
      year: number;
      orders: Set<string>;
      totalSales: number;
    };

    const custYearMap: Record<CustYearKey, CustYearAgg> = {};

    for (const row of sales) {
      if (!row.customer || !row.date) continue;

      const year = row.date.year;
      const custId = String(row.customerId);
      const key: CustYearKey = `${custId}-${year}`;
      const segment = row.customer.customerSegment ?? 'Unknown';
      const name = row.customer.fullName;

      if (!custYearMap[key]) {
        custYearMap[key] = {
          customerId: custId,
          customerName: name,
          segment,
          year,
          orders: new Set<string>(),
          totalSales: 0,
        };
      }

      const cy = custYearMap[key];
      cy.orders.add(row.orderNumber);
      cy.totalSales += Number(row.salesAmount ?? 0);
    }

    // Hitung statistik per segment
    type SegmentAgg = {
      segment: string;
      customerYears: number; // jumlah kombinasi customer-year
      totalOrders: number;
      totalSales: number;
    };

    const segmentMap: Record<string, SegmentAgg> = {};

    Object.values(custYearMap).forEach((cy) => {
      const seg = cy.segment;
      if (!segmentMap[seg]) {
        segmentMap[seg] = {
          segment: seg,
          customerYears: 0,
          totalOrders: 0,
          totalSales: 0,
        };
      }

      const freq = cy.orders.size;
      segmentMap[seg].customerYears += 1;
      segmentMap[seg].totalOrders += freq;
      segmentMap[seg].totalSales += cy.totalSales;
    });

    const segments = Object.values(segmentMap).map((s) => {
      const avgFrequency =
        s.customerYears > 0 ? s.totalOrders / s.customerYears : 0;
      const avgTicket =
        s.totalOrders > 0 ? s.totalSales / s.totalOrders : 0;

      return {
        segment: s.segment,
        customer_years: s.customerYears,
        total_orders: s.totalOrders,
        total_sales: Number(s.totalSales.toFixed(2)),
        avg_frequency_per_customer_per_year: Number(
          avgFrequency.toFixed(2),
        ),
        avg_ticket_size: Number(avgTicket.toFixed(2)),
      };
    });

    // Overall metrics
    const overallOrders = segments.reduce(
      (sum, s) => sum + s.total_orders,
      0,
    );
    const overallCustomerYears = segments.reduce(
      (sum, s) => sum + s.customer_years,
      0,
    );
    const overallSales = segments.reduce(
      (sum, s) => sum + s.total_sales,
      0,
    );

    const overallAvgFreq =
      overallCustomerYears > 0
        ? overallOrders / overallCustomerYears
        : 0;
    const overallAvgTicket =
      overallOrders > 0 ? overallSales / overallOrders : 0;

    // Tandai segment yang high-frequency & low-ticket
    const segmentsWithFlag = segments
      .map((s) => ({
        ...s,
        is_high_freq_low_ticket:
          s.avg_frequency_per_customer_per_year > overallAvgFreq &&
          s.avg_ticket_size < overallAvgTicket,
      }))
      .sort(
        (a, b) =>
          b.avg_frequency_per_customer_per_year -
          a.avg_frequency_per_customer_per_year,
      );

    return cachedResponse({
      overall: {
        overall_avg_frequency_per_customer_per_year: Number(
          overallAvgFreq.toFixed(2),
        ),
        overall_avg_ticket_size: Number(overallAvgTicket.toFixed(2)),
      },
      segments: segmentsWithFlag,
    }, 300); // Cache for 5 minutes
  } catch (error) {
    console.error('Error in purchase-frequency API:', error);
    return NextResponse.json(
      {
        overall: null,
        segments: [],
        error: 'Failed to calculate purchase frequency',
      },
      { status: 500 },
    );
  }
}
