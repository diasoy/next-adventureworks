import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cachedResponse } from '@/lib/cache';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const yearParam = searchParams.get('year');

    const sales = await prisma.factSales.findMany({
      select: {
        territoryId: true,
        salesAmount: true,
        profitAmount: true,
        discountRate: true,
        territory: {
          select: {
            territoryName: true,
            groupName: true,
            country: true,
            region: true,
          },
        },
        date: {
          select: {
            year: true,
            month: true,
          },
        },
      },
      where: yearParam ? {
        date: {
          year: Number(yearParam),
        },
      } : undefined,
      take: 10000,
    });

    if (!sales.length) {
      return NextResponse.json({ 
        territoryAnalysis: [],
        monthlyTrend: [],
        discountDistribution: [],
        years: []
      });
    }

    // Filter by year if provided
    const filteredSales = yearParam
      ? sales.filter(s => s.date && s.date.year === Number(yearParam))
      : sales;

    // Get unique years
    const years = Array.from(new Set(
      sales
        .filter(s => s.date)
        .map(s => s.date!.year)
    )).sort();

    type TerritoryAgg = {
      territoryId: string;
      territoryName: string;
      groupName: string | null;
      country: string | null;
      region: string | null;
      totalSales: number;
      totalProfit: number;
      totalDiscount: number;
      discountWeightedSum: number;
      discountWeight: number;
      orderCount: number;
    };

    const territoryAgg: Record<string, TerritoryAgg> = {};

    // Monthly aggregation
    type MonthlyKey = string; // "2023-1-TerritoryName"
    type MonthlyAgg = {
      year: number;
      month: number;
      territoryName: string;
      totalSales: number;
      totalProfit: number;
      discountWeightedSum: number;
      discountWeight: number;
    };
    const monthlyAgg: Record<MonthlyKey, MonthlyAgg> = {};

    // Discount distribution
    type DiscountBucket = {
      count: number;
      totalSales: number;
      totalProfit: number;
    };
    const discountBuckets: Record<string, DiscountBucket> = {
      '0-5%': { count: 0, totalSales: 0, totalProfit: 0 },
      '5-10%': { count: 0, totalSales: 0, totalProfit: 0 },
      '10-15%': { count: 0, totalSales: 0, totalProfit: 0 },
      '15-20%': { count: 0, totalSales: 0, totalProfit: 0 },
      '20%+': { count: 0, totalSales: 0, totalProfit: 0 },
    };

    for (const row of filteredSales) {
      if (!row.territoryId || !row.territory) continue;

      const key = String(row.territoryId);
      const salesAmount = Number(row.salesAmount ?? 0);
      const profitAmount = Number(row.profitAmount ?? 0);
      const discountRate = Number(row.discountRate ?? 0); // 0.10 = 10%
      const discountAmount = salesAmount * discountRate;

      // Territory aggregation
      if (!territoryAgg[key]) {
        territoryAgg[key] = {
          territoryId: key,
          territoryName: row.territory.territoryName,
          groupName: row.territory.groupName,
          country: row.territory.country,
          region: row.territory.region,
          totalSales: 0,
          totalProfit: 0,
          totalDiscount: 0,
          discountWeightedSum: 0,
          discountWeight: 0,
          orderCount: 0,
        };
      }

      const t = territoryAgg[key];
      t.totalSales += salesAmount;
      t.totalProfit += profitAmount;
      t.totalDiscount += discountAmount;
      t.discountWeightedSum += discountRate * salesAmount;
      t.discountWeight += salesAmount;
      t.orderCount += 1;

      // Monthly trend
      if (row.date) {
        const year = row.date.year;
        const month = row.date.month;
        const monthKey = `${year}-${month}-${row.territory.territoryName}`;

        if (!monthlyAgg[monthKey]) {
          monthlyAgg[monthKey] = {
            year,
            month,
            territoryName: row.territory.territoryName,
            totalSales: 0,
            totalProfit: 0,
            discountWeightedSum: 0,
            discountWeight: 0,
          };
        }

        const m = monthlyAgg[monthKey];
        m.totalSales += salesAmount;
        m.totalProfit += profitAmount;
        m.discountWeightedSum += discountRate * salesAmount;
        m.discountWeight += salesAmount;
      }

      // Discount distribution
      const discountPct = discountRate * 100;
      let bucket = '20%+';
      if (discountPct < 5) bucket = '0-5%';
      else if (discountPct < 10) bucket = '5-10%';
      else if (discountPct < 15) bucket = '10-15%';
      else if (discountPct < 20) bucket = '15-20%';

      discountBuckets[bucket].count += 1;
      discountBuckets[bucket].totalSales += salesAmount;
      discountBuckets[bucket].totalProfit += profitAmount;
    }

    // Format territory analysis
    const territoryAnalysis = Object.values(territoryAgg)
      .map((t) => {
        const avgDiscount = t.discountWeight > 0
          ? (t.discountWeightedSum / t.discountWeight) * 100
          : 0;

        const profitMargin = t.totalSales > 0
          ? (t.totalProfit / t.totalSales) * 100
          : 0;

        const avgOrderValue = t.orderCount > 0
          ? t.totalSales / t.orderCount
          : 0;

        return {
          territory_id: t.territoryId,
          territory_name: t.territoryName,
          country: t.country,
          region: t.region,
          group_name: t.groupName,
          total_sales: Number(t.totalSales.toFixed(2)),
          total_discount: Number(t.totalDiscount.toFixed(2)),
          avg_discount_rate: Number(avgDiscount.toFixed(2)),
          total_profit: Number(t.totalProfit.toFixed(2)),
          avg_profit_margin: Number(profitMargin.toFixed(2)),
          total_orders: t.orderCount,
          avg_order_value: Number(avgOrderValue.toFixed(2)),
        };
      })
      .sort((a, b) => b.avg_discount_rate - a.avg_discount_rate);

    // Format monthly trend
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyTrend = Object.values(monthlyAgg)
      .map((m) => {
        const avgDiscount = m.discountWeight > 0
          ? (m.discountWeightedSum / m.discountWeight) * 100
          : 0;

        const profitMargin = m.totalSales > 0
          ? (m.totalProfit / m.totalSales) * 100
          : 0;

        return {
          year: m.year,
          month: m.month,
          month_name: `${monthNames[m.month - 1]} ${m.year}`,
          territory_name: m.territoryName,
          total_sales: Number(m.totalSales.toFixed(2)),
          avg_discount_rate: Number(avgDiscount.toFixed(2)),
          avg_profit_margin: Number(profitMargin.toFixed(2)),
        };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      });

    // Format discount distribution
    const discountDistribution = Object.entries(discountBuckets)
      .map(([range, data]) => ({
        discount_range: range,
        count: data.count,
        total_sales: Number(data.totalSales.toFixed(2)),
        avg_profit_margin: data.totalSales > 0
          ? Number(((data.totalProfit / data.totalSales) * 100).toFixed(2))
          : 0,
      }));

    return cachedResponse({
      territoryAnalysis,
      monthlyTrend,
      discountDistribution,
      years
    }, 300); // Cache for 5 minutes
  } catch (error) {
    console.error('Error in discount-territory API:', error);
    return NextResponse.json(
      {
        territoryAnalysis: [],
        monthlyTrend: [],
        discountDistribution: [],
        years: [],
        error: 'Failed to calculate discount by territory',
      },
      { status: 500 },
    );
  }
}
