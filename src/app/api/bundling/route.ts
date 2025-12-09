import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const categoryFilter = searchParams.get('category') ?? undefined;

    // Ambil data sales + product
    const sales = await prisma.factSales.findMany({
      include: {
        product: true, // relasi dari model FactSales
      },
      where: categoryFilter
        ? {
            product: {
              productCategoryName: categoryFilter,
            },
          }
        : undefined,
    });

    // Kalau tidak ada data, tetap balikin struktur yang konsisten
    if (!sales.length) {
      return NextResponse.json({
        productPairs: [],
        categoryPairs: [],
        topCategories: [],
      });
    }

    // =========================
    // 1. Kelompokkan per order
    // =========================
    const orderGroups = sales.reduce<Record<string, typeof sales>>(
      (acc, sale) => {
        const key = sale.orderNumber; // string
        if (!acc[key]) acc[key] = [];
        acc[key].push(sale);
        return acc;
      },
      {},
    );

    const totalOrders = Object.keys(orderGroups).length;

    // ======================================
    // 2. Hitung pasangan produk (productPairs)
    // ======================================
    type ProductType = NonNullable<(typeof sales)[number]['product']>;

    const pairCount: Record<
      string,
      {
        product1: ProductType;
        product2: ProductType;
        count: number;
      }
    > = {};

    Object.values(orderGroups).forEach((orderItems) => {
      for (let i = 0; i < orderItems.length; i++) {
        for (let j = i + 1; j < orderItems.length; j++) {
          const item1 = orderItems[i];
          const item2 = orderItems[j];

          if (!item1.product || !item2.product) continue;

          const id1 = item1.productId;
          const id2 = item2.productId;

          // Pastikan urutan konsisten (id kecil duluan)
          const [first, second] = id1 < id2 ? [item1, item2] : [item2, item1];

          const key = `${String(first.productId)}-${String(second.productId)}`;

          if (!pairCount[key]) {
            pairCount[key] = {
              product1: first.product,
              product2: second.product,
              count: 0,
            };
          }
          pairCount[key].count += 1;
        }
      }
    });

    const productPairs = Object.values(pairCount)
      // threshold minimal co-occurrence (boleh kamu ubah)
      .filter((pair) => pair.count >= 5)
      .map((pair) => ({
        product1_id: String(pair.product1.id),
        product1_name: pair.product1.productName,
        product1_category: pair.product1.productCategoryName,
        product2_id: String(pair.product2.id),
        product2_name: pair.product2.productName,
        product2_category: pair.product2.productCategoryName,
        co_occurrence: pair.count,
        total_orders: totalOrders,
        support: Number(((pair.count / totalOrders) * 100).toFixed(2)),
      }))
      .sort((a, b) => b.co_occurrence - a.co_occurrence)
      .slice(0, 100);

    // ======================================
    // 3. Hitung pasangan kategori (categoryPairs)
    // ======================================
    const categoryPairCount: Record<string, number> = {};

    Object.values(orderGroups).forEach((orderItems) => {
      const categories = new Set<string>();
      orderItems.forEach((item) => {
        const cat = item.product?.productCategoryName;
        if (cat) categories.add(cat);
      });

      const catArray = Array.from(categories).sort();

      for (let i = 0; i < catArray.length; i++) {
        for (let j = i + 1; j < catArray.length; j++) {
          const key = `${catArray[i]}-${catArray[j]}`;
          categoryPairCount[key] = (categoryPairCount[key] || 0) + 1;
        }
      }
    });

    const categoryPairs = Object.entries(categoryPairCount)
      .map(([key, count]) => {
        const [cat1, cat2] = key.split('-');
        return {
          category1: cat1,
          category2: cat2,
          co_occurrence: count,
          support: Number(((count / totalOrders) * 100).toFixed(2)),
        };
      })
      .sort((a, b) => b.co_occurrence - a.co_occurrence);

    // ======================================
    // 4. Statistik basket per kategori (topCategories)
    // ======================================
    const categoryStats: Record<
      string,
      { orders: Set<string>; totalBasketSize: number }
    > = {};

    Object.entries(orderGroups).forEach(([orderNum, items]) => {
      const basketSize = items.length;
      items.forEach((item) => {
        const cat = item.product?.productCategoryName;
        if (!cat) return;

        if (!categoryStats[cat]) {
          categoryStats[cat] = {
            orders: new Set<string>(),
            totalBasketSize: 0,
          };
        }

        categoryStats[cat].orders.add(orderNum);
        categoryStats[cat].totalBasketSize += basketSize;
      });
    });

    const topCategories = Object.entries(categoryStats)
      .map(([category, stats]) => ({
        category,
        total_orders: stats.orders.size,
        avg_basket_size: Number(
          (stats.totalBasketSize / stats.orders.size).toFixed(2),
        ),
      }))
      .sort((a, b) => b.total_orders - a.total_orders);

    // ======================================
    // 5. Response
    // ======================================
    return NextResponse.json({
      productPairs,
      categoryPairs,
      topCategories,
    });
  } catch (error) {
    console.error('Error fetching bundling data:', error);

    // Tetap balikin shape yang sama supaya frontend tidak error .slice()
    return NextResponse.json(
      {
        productPairs: [],
        categoryPairs: [],
        topCategories: [],
        error: 'Failed to fetch bundling data',
      },
      { status: 500 },
    );
  }
}
