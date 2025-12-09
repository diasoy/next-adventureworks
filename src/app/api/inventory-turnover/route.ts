import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // 1. Ambil total qty terjual per kategori (dari factSales)
    const sales = await prisma.factSales.findMany({
      select: {
        orderQuantity: true,
        product: {
          select: {
            productCategoryName: true,
          },
        },
      },
    });

    // 2. Ambil avg inventory per kategori (dari factInventoryMonthly)
    const inventories = await prisma.factInventoryMonthly.findMany({
      select: {
        avgQty: true,
        product: {
          select: {
            productCategoryName: true,
          },
        },
      },
    });

    if (!sales.length && !inventories.length) {
      return NextResponse.json({ categories: [] });
    }

    const soldQtyByCategory: Record<string, number> = {};
    const inventoryQtyByCategory: Record<string, number> = {};

    for (const row of sales) {
      const cat = row.product?.productCategoryName ?? 'Unknown';
      const qty = row.orderQuantity ?? 0;
      soldQtyByCategory[cat] =
        (soldQtyByCategory[cat] ?? 0) + qty;
    }

    for (const row of inventories) {
      const cat = row.product?.productCategoryName ?? 'Unknown';
      const avgQty = Number(row.avgQty ?? 0);
      inventoryQtyByCategory[cat] =
        (inventoryQtyByCategory[cat] ?? 0) + avgQty;
    }

    const allCategories = Array.from(
      new Set([
        ...Object.keys(soldQtyByCategory),
        ...Object.keys(inventoryQtyByCategory),
      ]),
    );

    const categories = allCategories
      .map((cat) => {
        const totalSold = soldQtyByCategory[cat] ?? 0;
        const totalInv = inventoryQtyByCategory[cat] ?? 0;

        const turnover =
          totalInv > 0 ? totalSold / totalInv : null;

        return {
          category: cat,
          total_sold_qty: totalSold,
          total_avg_inventory_qty: Number(totalInv.toFixed(2)),
          turnover: turnover !== null ? Number(turnover.toFixed(4)) : null,
        };
      })
      // filter kategori yang punya inventory > 0
      .filter((c) => c.turnover !== null)
      .sort((a, b) => (b.turnover ?? 0) - (a.turnover ?? 0));

    const fastest = categories[0] ?? null;
    const slowest =
      categories.length > 0
        ? categories[categories.length - 1]
        : null;

    return NextResponse.json({
      categories,
      fastest,
      slowest,
    });
  } catch (error) {
    console.error('Error in inventory-turnover API:', error);
    return NextResponse.json(
      {
        categories: [],
        fastest: null,
        slowest: null,
        error: 'Failed to calculate inventory turnover',
      },
      { status: 500 },
    );
  }
}
