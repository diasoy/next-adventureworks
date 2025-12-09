import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    // 1. Ambil semua data sales dengan product info
    const sales = await prisma.factSales.findMany({
      select: {
        productId: true,
        orderQuantity: true,
        product: {
          select: {
            productName: true,
            productCategoryName: true,
          },
        },
      },
    });

    // 2. Ambil semua data inventory dengan product info
    const inventories = await prisma.factInventoryMonthly.findMany({
      select: {
        productId: true,
        avgQty: true,
        product: {
          select: {
            productName: true,
            productCategoryName: true,
          },
        },
      },
    });

    if (!sales.length && !inventories.length) {
      return NextResponse.json({ 
        summary: null,
        categories: [],
        products: []
      });
    }

    // Aggregate by category
    const soldQtyByCategory: Record<string, number> = {};
    const inventoryQtyByCategory: Record<string, number> = {};
    const productCountByCategory: Record<string, Set<string>> = {};

    // Aggregate by product
    const soldQtyByProduct: Record<string, { qty: number; name: string; category: string }> = {};
    const inventoryQtyByProduct: Record<string, { qty: number; name: string; category: string }> = {};

    for (const row of sales) {
      const cat = row.product?.productCategoryName ?? 'Unknown';
      const productId = String(row.productId);
      const productName = row.product?.productName ?? 'Unknown Product';
      const qty = row.orderQuantity ?? 0;
      
      soldQtyByCategory[cat] = (soldQtyByCategory[cat] ?? 0) + qty;
      
      if (!productCountByCategory[cat]) {
        productCountByCategory[cat] = new Set();
      }
      productCountByCategory[cat].add(productId);

      if (!soldQtyByProduct[productId]) {
        soldQtyByProduct[productId] = { qty: 0, name: productName, category: cat };
      }
      soldQtyByProduct[productId].qty += qty;
    }

    for (const row of inventories) {
      const cat = row.product?.productCategoryName ?? 'Unknown';
      const productId = String(row.productId);
      const productName = row.product?.productName ?? 'Unknown Product';
      const avgQty = Number(row.avgQty ?? 0);
      
      inventoryQtyByCategory[cat] = (inventoryQtyByCategory[cat] ?? 0) + avgQty;

      if (!inventoryQtyByProduct[productId]) {
        inventoryQtyByProduct[productId] = { qty: 0, name: productName, category: cat };
      }
      inventoryQtyByProduct[productId].qty += avgQty;
    }

    // Calculate categories
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
        const turnover = totalInv > 0 ? totalSold / totalInv : 0;

        return {
          category: cat,
          total_sold: totalSold,
          avg_inventory: Number(totalInv.toFixed(2)),
          turnover_ratio: Number(turnover.toFixed(4)),
          total_products: productCountByCategory[cat]?.size ?? 0,
        };
      })
      .filter((c) => c.turnover_ratio > 0)
      .sort((a, b) => b.turnover_ratio - a.turnover_ratio);

    // Calculate products
    const allProductIds = Array.from(
      new Set([
        ...Object.keys(soldQtyByProduct),
        ...Object.keys(inventoryQtyByProduct),
      ]),
    );

    const products = allProductIds
      .map((productId) => {
        const soldData = soldQtyByProduct[productId];
        const invData = inventoryQtyByProduct[productId];
        
        const totalSold = soldData?.qty ?? 0;
        const totalInv = invData?.qty ?? 0;
        const turnover = totalInv > 0 ? totalSold / totalInv : 0;
        
        const name = soldData?.name ?? invData?.name ?? 'Unknown';
        const category = soldData?.category ?? invData?.category ?? 'Unknown';

        return {
          product_id: productId,
          product_name: name,
          category: category,
          total_sold: totalSold,
          avg_inventory: Number(totalInv.toFixed(2)),
          turnover_ratio: Number(turnover.toFixed(4)),
        };
      })
      .filter((p) => p.turnover_ratio > 0)
      .sort((a, b) => b.turnover_ratio - a.turnover_ratio);

    // Calculate summary
    const totalCategories = categories.length;
    const overallTurnover = categories.length > 0
      ? categories.reduce((sum, c) => sum + c.turnover_ratio, 0) / categories.length
      : 0;

    return NextResponse.json({
      summary: {
        total_categories: totalCategories,
        overall_turnover: Number(overallTurnover.toFixed(4)),
      },
      categories,
      products,
    });
  } catch (error) {
    console.error('Error in inventory-turnover API:', error);
    return NextResponse.json(
      {
        summary: null,
        categories: [],
        products: [],
        error: 'Failed to calculate inventory turnover',
      },
      { status: 500 },
    );
  }
}
