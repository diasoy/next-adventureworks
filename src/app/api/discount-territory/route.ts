import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const sales = await prisma.factSales.findMany({
      include: {
        territory: true, // DimTerritory
      },
    });

    if (!sales.length) {
      return NextResponse.json({ territories: [] });
    }

    type TerritoryAgg = {
      territoryId: string;
      territoryName: string;
      groupName: string | null;
      country: string | null;
      totalSales: number;
      totalProfit: number;
      discountWeightedSum: number;
      discountWeight: number;
    };

    const agg: Record<string, TerritoryAgg> = {};

    for (const row of sales) {
      if (!row.territoryId || !row.territory) continue;

      const key = String(row.territoryId);
      const salesAmount = Number(row.salesAmount ?? 0);
      const profitAmount = Number(row.profitAmount ?? 0);
      const discountRate = Number(row.discountRate ?? 0); // 0.10 = 10%

      if (!agg[key]) {
        agg[key] = {
          territoryId: key,
          territoryName: row.territory.territoryName,
          groupName: row.territory.groupName,
          country: row.territory.country,
          totalSales: 0,
          totalProfit: 0,
          discountWeightedSum: 0,
          discountWeight: 0,
        };
      }

      const t = agg[key];
      t.totalSales += salesAmount;
      t.totalProfit += profitAmount;
      // rata-rata diskon dibobot dengan salesAmount
      t.discountWeightedSum += discountRate * salesAmount;
      t.discountWeight += salesAmount;
    }

    const territories = Object.values(agg)
      .map((t) => {
        const avgDiscount =
          t.discountWeight > 0
            ? t.discountWeightedSum / t.discountWeight
            : 0;

        const profitMargin =
          t.totalSales > 0 ? t.totalProfit / t.totalSales : 0;

        return {
          territory_id: t.territoryId,
          territory_name: t.territoryName,
          group_name: t.groupName,
          country: t.country,
          total_sales: Number(t.totalSales.toFixed(2)),
          total_profit: Number(t.totalProfit.toFixed(2)),
          avg_discount: Number(avgDiscount.toFixed(4)), // misal 0.1234 = 12.34%
          profit_margin: Number(profitMargin.toFixed(4)),
        };
      })
      .sort((a, b) => b.avg_discount - a.avg_discount);

    const highestDiscount = territories[0] ?? null;

    return NextResponse.json({
      territories,
      highestDiscount,
    });
  } catch (error) {
    console.error('Error in discount-territory API:', error);
    return NextResponse.json(
      {
        territories: [],
        highestDiscount: null,
        error: 'Failed to calculate discount by territory',
      },
      { status: 500 },
    );
  }
}
