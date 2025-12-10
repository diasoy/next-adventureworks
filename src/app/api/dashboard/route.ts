import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { cachedResponse } from '@/lib/cache';

export async function GET(request: Request) {
  try {
    console.log('Dashboard API: Starting data fetch...');
    
    // Test database connection
    await prisma.$connect();
    console.log('Dashboard API: Database connected');
    
    // Fetch sales data with only necessary fields
    const sales = await prisma.factSales.findMany({
      select: {
        salesAmount: true,
        profitAmount: true,
        discountAmount: true,
        orderNumber: true,
        orderQuantity: true,
        customerId: true,
        productId: true,
        territoryId: true,
        customer: {
          select: {
            fullName: true,
          },
        },
        product: {
          select: {
            productName: true,
            productCategoryName: true,
          },
        },
        territory: {
          select: {
            territoryName: true,
          },
        },
        date: {
          select: {
            year: true,
            month: true,
            monthName: true,
            fullDate: true,
          },
        },
      },
      take: 10000, // Limit to prevent memory issues
    });

    console.log(`Dashboard API: Fetched ${sales.length} sales records`);

    if (!sales.length) {
      console.log('Dashboard API: No sales data found');
      return cachedResponse({
        summary: {
          total_revenue: 0,
          total_orders: 0,
          total_customers: 0,
          total_products: 0,
          avg_order_value: 0,
          total_profit: 0,
          avg_profit_margin: 0,
          total_discount: 0,
        },
        topCustomers: [],
        topProducts: [],
        salesByCategory: [],
        salesByTerritory: [],
        monthlyTrend: [],
        recentOrders: [],
      }, 300);
    }

    // Calculate summary metrics
    const totalRevenue = sales.reduce((sum, s) => sum + Number(s.salesAmount ?? 0), 0);
    const totalProfit = sales.reduce((sum, s) => sum + Number(s.profitAmount ?? 0), 0);
    const totalDiscount = sales.reduce((sum, s) => sum + Number(s.discountAmount ?? 0), 0);
    const uniqueOrders = new Set(sales.map(s => s.orderNumber)).size;
    const uniqueCustomers = new Set(sales.map(s => s.customerId)).size;
    const uniqueProducts = new Set(sales.map(s => s.productId)).size;
    const avgOrderValue = uniqueOrders > 0 ? totalRevenue / uniqueOrders : 0;
    const avgProfitMargin = totalRevenue > 0 ? (totalProfit / totalRevenue) * 100 : 0;

    // Top Customers by revenue
    const customerRevenue: Record<string, { name: string; revenue: number; orders: number }> = {};
    sales.forEach(s => {
      const custId = String(s.customerId);
      const custName = s.customer?.fullName ?? 'Unknown';
      const revenue = Number(s.salesAmount ?? 0);

      if (!customerRevenue[custId]) {
        customerRevenue[custId] = { name: custName, revenue: 0, orders: 0 };
      }
      customerRevenue[custId].revenue += revenue;
      customerRevenue[custId].orders += 1;
    });

    const topCustomers = Object.entries(customerRevenue)
      .map(([id, data]) => ({
        customer_id: id,
        customer_name: data.name,
        total_revenue: Number(data.revenue.toFixed(2)),
        total_orders: data.orders,
        avg_order_value: Number((data.revenue / data.orders).toFixed(2)),
      }))
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, 10);

    // Top Products by revenue
    const productRevenue: Record<string, { name: string; category: string; revenue: number; qty: number }> = {};
    sales.forEach(s => {
      const prodId = String(s.productId);
      const prodName = s.product?.productName ?? 'Unknown';
      const category = s.product?.productCategoryName ?? 'Unknown';
      const revenue = Number(s.salesAmount ?? 0);
      const qty = s.orderQuantity ?? 0;

      if (!productRevenue[prodId]) {
        productRevenue[prodId] = { name: prodName, category, revenue: 0, qty: 0 };
      }
      productRevenue[prodId].revenue += revenue;
      productRevenue[prodId].qty += qty;
    });

    const topProducts = Object.entries(productRevenue)
      .map(([id, data]) => ({
        product_id: id,
        product_name: data.name,
        category: data.category,
        total_revenue: Number(data.revenue.toFixed(2)),
        total_quantity: data.qty,
      }))
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, 10);

    // Sales by Category
    const categoryRevenue: Record<string, { revenue: number; qty: number; orders: number }> = {};
    sales.forEach(s => {
      const category = s.product?.productCategoryName ?? 'Unknown';
      const revenue = Number(s.salesAmount ?? 0);
      const qty = s.orderQuantity ?? 0;

      if (!categoryRevenue[category]) {
        categoryRevenue[category] = { revenue: 0, qty: 0, orders: 0 };
      }
      categoryRevenue[category].revenue += revenue;
      categoryRevenue[category].qty += qty;
      categoryRevenue[category].orders += 1;
    });

    const salesByCategory = Object.entries(categoryRevenue)
      .map(([category, data]) => ({
        category,
        total_revenue: Number(data.revenue.toFixed(2)),
        total_quantity: data.qty,
        total_orders: data.orders,
      }))
      .sort((a, b) => b.total_revenue - a.total_revenue);

    // Sales by Territory
    const territoryRevenue: Record<string, { name: string; revenue: number; profit: number; orders: number }> = {};
    sales.forEach(s => {
      if (!s.territory) return;
      const terrId = String(s.territoryId);
      const terrName = s.territory.territoryName;
      const revenue = Number(s.salesAmount ?? 0);
      const profit = Number(s.profitAmount ?? 0);

      if (!territoryRevenue[terrId]) {
        territoryRevenue[terrId] = { name: terrName, revenue: 0, profit: 0, orders: 0 };
      }
      territoryRevenue[terrId].revenue += revenue;
      territoryRevenue[terrId].profit += profit;
      territoryRevenue[terrId].orders += 1;
    });

    const salesByTerritory = Object.entries(territoryRevenue)
      .map(([id, data]) => ({
        territory_id: id,
        territory_name: data.name,
        total_revenue: Number(data.revenue.toFixed(2)),
        total_profit: Number(data.profit.toFixed(2)),
        total_orders: data.orders,
        profit_margin: data.revenue > 0 ? Number(((data.profit / data.revenue) * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => b.total_revenue - a.total_revenue)
      .slice(0, 10);

    // Monthly Trend
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const monthlyData: Record<string, { revenue: number; profit: number; orders: Set<string> }> = {};

    sales.forEach(s => {
      if (!s.date) return;
      const monthKey = `${s.date.year}-${String(s.date.month).padStart(2, '0')}`;
      const revenue = Number(s.salesAmount ?? 0);
      const profit = Number(s.profitAmount ?? 0);

      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { revenue: 0, profit: 0, orders: new Set() };
      }
      monthlyData[monthKey].revenue += revenue;
      monthlyData[monthKey].profit += profit;
      monthlyData[monthKey].orders.add(s.orderNumber);
    });

    const monthlyTrend = Object.entries(monthlyData)
      .map(([key, data]) => {
        const [year, month] = key.split('-');
        return {
          year: Number(year),
          month: Number(month),
          month_name: `${monthNames[Number(month) - 1]} ${year}`,
          total_revenue: Number(data.revenue.toFixed(2)),
          total_profit: Number(data.profit.toFixed(2)),
          total_orders: data.orders.size,
          profit_margin: data.revenue > 0 ? Number(((data.profit / data.revenue) * 100).toFixed(2)) : 0,
        };
      })
      .sort((a, b) => {
        if (a.year !== b.year) return a.year - b.year;
        return a.month - b.month;
      })
      .slice(-12); // Last 12 months

    // Recent Orders (last 10 unique orders)
    const orderMap: Record<string, {
      date: string;
      customer: string;
      territory: string;
      revenue: number;
      profit: number;
      items: number;
    }> = {};

    sales.forEach(s => {
      const orderNum = s.orderNumber;
      if (!orderMap[orderNum]) {
        const dateValue = s.date?.fullDate;
        orderMap[orderNum] = {
          date: dateValue ? new Date(dateValue).toISOString() : new Date().toISOString(),
          customer: s.customer?.fullName ?? 'Unknown',
          territory: s.territory?.territoryName ?? 'Unknown',
          revenue: 0,
          profit: 0,
          items: 0,
        };
      }
      orderMap[orderNum].revenue += Number(s.salesAmount ?? 0);
      orderMap[orderNum].profit += Number(s.profitAmount ?? 0);
      orderMap[orderNum].items += 1;
    });

    const recentOrders = Object.entries(orderMap)
      .map(([orderNum, data]) => ({
        order_number: orderNum,
        order_date: data.date,
        customer_name: data.customer,
        territory_name: data.territory,
        total_revenue: Number(data.revenue.toFixed(2)),
        total_profit: Number(data.profit.toFixed(2)),
        total_items: data.items,
        profit_margin: data.revenue > 0 ? Number(((data.profit / data.revenue) * 100).toFixed(2)) : 0,
      }))
      .sort((a, b) => new Date(b.order_date).getTime() - new Date(a.order_date).getTime())
      .slice(0, 10);

    return cachedResponse({
      summary: {
        total_revenue: Number(totalRevenue.toFixed(2)),
        total_orders: uniqueOrders,
        total_customers: uniqueCustomers,
        total_products: uniqueProducts,
        avg_order_value: Number(avgOrderValue.toFixed(2)),
        total_profit: Number(totalProfit.toFixed(2)),
        avg_profit_margin: Number(avgProfitMargin.toFixed(2)),
        total_discount: Number(totalDiscount.toFixed(2)),
      },
      topCustomers,
      topProducts,
      salesByCategory,
      salesByTerritory,
      monthlyTrend,
      recentOrders,
    }, 300); // Cache for 5 minutes
  } catch (error) {
    console.error('Error in dashboard API:', error);
    console.error('Error details:', error instanceof Error ? error.message : String(error));
    
    return NextResponse.json(
      {
        summary: {
          total_revenue: 0,
          total_orders: 0,
          total_customers: 0,
          total_products: 0,
          avg_order_value: 0,
          total_profit: 0,
          avg_profit_margin: 0,
          total_discount: 0,
        },
        topCustomers: [],
        topProducts: [],
        salesByCategory: [],
        salesByTerritory: [],
        monthlyTrend: [],
        recentOrders: [],
        error: error instanceof Error ? error.message : 'Failed to fetch dashboard data',
      },
      { status: 500 },
    );
  }
}
