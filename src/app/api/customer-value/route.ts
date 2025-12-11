import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
      const sales = await prisma.factSales.findMany({
        select: {
          customerId: true,
          orderNumber: true,
          salesAmount: true,
          profitAmount: true,
          customer: {
            select: {
              fullName: true,
              customerSegment: true,
            },
          },
          date: {
            select: {
              fullDate: true,
              year: true,
            },
          },
        },
        take: 15000,
      });

      if (!sales.length) {
        return NextResponse.json({
          summary: null,
          segments: [],
          customers: [],
        });
      }

      // Calculate customer metrics
      type CustomerMetrics = {
        customerId: string;
        customerName: string;
        customerSegment: string;
        totalRevenue: number;
        totalProfit: number;
        orderCount: number;
        orders: Set<string>;
        firstOrderDate: Date;
        lastOrderDate: Date;
        avgOrderValue: number;
        avgDaysBetweenOrders: number;
        daysSinceLastOrder: number;
        clv: number;
        rfmRecency: number;
        rfmFrequency: number;
        rfmMonetary: number;
        rfmScore: string;
        rfmSegment: string;
      };

      const customerMap: Record<string, Omit<CustomerMetrics, 'avgOrderValue' | 'avgDaysBetweenOrders' | 'daysSinceLastOrder' | 'clv' | 'rfmRecency' | 'rfmFrequency' | 'rfmMonetary' | 'rfmScore' | 'rfmSegment'>> = {};

      const currentDate = new Date();

      // Aggregate customer data
      for (const row of sales) {
        if (!row.customer) continue;

        const custId = String(row.customerId);
        const orderDate = new Date(row.date.fullDate);

        if (!customerMap[custId]) {
          customerMap[custId] = {
            customerId: custId,
            customerName: row.customer.fullName,
            customerSegment: row.customer.customerSegment ?? 'Unknown',
            totalRevenue: 0,
            totalProfit: 0,
            orderCount: 0,
            orders: new Set<string>(),
            firstOrderDate: orderDate,
            lastOrderDate: orderDate,
          };
        }

        const cust = customerMap[custId];
        cust.totalRevenue += Number(row.salesAmount ?? 0);
        cust.totalProfit += Number(row.profitAmount ?? 0);
        cust.orders.add(row.orderNumber);

        if (orderDate < cust.firstOrderDate) {
          cust.firstOrderDate = orderDate;
        }
        if (orderDate > cust.lastOrderDate) {
          cust.lastOrderDate = orderDate;
        }
      }

      // Calculate derived metrics
      const customers: CustomerMetrics[] = Object.values(customerMap).map((cust) => {
        const orderCount = cust.orders.size;
        const avgOrderValue = orderCount > 0 ? cust.totalRevenue / orderCount : 0;

        // Calculate average days between orders
        const daysBetweenFirst = Math.floor(
          (cust.lastOrderDate.getTime() - cust.firstOrderDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        const avgDaysBetweenOrders = orderCount > 1 ? daysBetweenFirst / (orderCount - 1) : 0;

        // Calculate days since last order (Recency)
        const daysSinceLastOrder = Math.floor(
          (currentDate.getTime() - cust.lastOrderDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        // Simple CLV calculation: (Avg Order Value × Purchase Frequency) × Avg Customer Lifespan
        // We estimate lifespan as days active / 365 or minimum 1 year
        const customerLifespanYears = Math.max(daysBetweenFirst / 365, 1);
        const purchaseFrequencyPerYear = orderCount / customerLifespanYears;
        const clv = avgOrderValue * purchaseFrequencyPerYear * 3; // Projected 3 years

        return {
          ...cust,
          orderCount,
          avgOrderValue: Number(avgOrderValue.toFixed(2)),
          avgDaysBetweenOrders: Number(avgDaysBetweenOrders.toFixed(1)),
          daysSinceLastOrder,
          clv: Number(clv.toFixed(2)),
          rfmRecency: 0,
          rfmFrequency: 0,
          rfmMonetary: 0,
          rfmScore: '',
          rfmSegment: '',
        };
      });

      // Calculate RFM scores (1-5, where 5 is best)
      // Sort for quantile calculation
      const sortedByRecency = [...customers].sort((a, b) => a.daysSinceLastOrder - b.daysSinceLastOrder);
      const sortedByFrequency = [...customers].sort((a, b) => b.orderCount - a.orderCount);
      const sortedByMonetary = [...customers].sort((a, b) => b.totalRevenue - a.totalRevenue);

      const getQuintile = (arr: CustomerMetrics[], customer: CustomerMetrics) => {
        const index = arr.findIndex(c => c.customerId === customer.customerId);
        const quintile = Math.ceil(((index + 1) / arr.length) * 5);
        return Math.min(quintile, 5);
      };

      // Assign RFM scores
      customers.forEach(cust => {
        cust.rfmRecency = getQuintile(sortedByRecency, cust);
        cust.rfmFrequency = getQuintile(sortedByFrequency, cust);
        cust.rfmMonetary = getQuintile(sortedByMonetary, cust);
        cust.rfmScore = `${cust.rfmRecency}${cust.rfmFrequency}${cust.rfmMonetary}`;

        // Segment based on RFM scores
        const r = cust.rfmRecency;
        const f = cust.rfmFrequency;
        const m = cust.rfmMonetary;

        if (r >= 4 && f >= 4 && m >= 4) {
          cust.rfmSegment = 'Champions';
        } else if (r >= 3 && f >= 3 && m >= 3) {
          cust.rfmSegment = 'Loyal Customers';
        } else if (r >= 4 && f <= 2 && m <= 2) {
          cust.rfmSegment = 'New Customers';
        } else if (r >= 3 && f <= 2 && m >= 3) {
          cust.rfmSegment = 'Promising';
        } else if (r <= 2 && f >= 4 && m >= 4) {
          cust.rfmSegment = 'At Risk';
        } else if (r <= 2 && f >= 3 && m >= 3) {
          cust.rfmSegment = 'Need Attention';
        } else if (r <= 1 && f >= 4 && m >= 4) {
          cust.rfmSegment = 'Cannot Lose Them';
        } else if (r <= 2 && f <= 2 && m <= 2) {
          cust.rfmSegment = 'Lost';
        } else if (r >= 3 && f >= 3 && m <= 2) {
          cust.rfmSegment = 'Potential Loyalist';
        } else {
          cust.rfmSegment = 'Others';
        }
      });

      // Summary statistics
      const summary = {
        total_customers: customers.length,
        total_revenue: Number(customers.reduce((sum, c) => sum + c.totalRevenue, 0).toFixed(2)),
        total_profit: Number(customers.reduce((sum, c) => sum + c.totalProfit, 0).toFixed(2)),
        avg_clv: Number((customers.reduce((sum, c) => sum + c.clv, 0) / customers.length).toFixed(2)),
        avg_order_value: Number((customers.reduce((sum, c) => sum + c.avgOrderValue, 0) / customers.length).toFixed(2)),
        avg_purchase_frequency: Number((customers.reduce((sum, c) => sum + c.orderCount, 0) / customers.length).toFixed(2)),
        avg_days_since_last_order: Number((customers.reduce((sum, c) => sum + c.daysSinceLastOrder, 0) / customers.length).toFixed(1)),
      };

      // Segment distribution
      const segmentDistribution: Record<string, { count: number; totalRevenue: number; totalCLV: number }> = {};
      customers.forEach(cust => {
        if (!segmentDistribution[cust.rfmSegment]) {
          segmentDistribution[cust.rfmSegment] = { count: 0, totalRevenue: 0, totalCLV: 0 };
        }
        segmentDistribution[cust.rfmSegment].count += 1;
        segmentDistribution[cust.rfmSegment].totalRevenue += cust.totalRevenue;
        segmentDistribution[cust.rfmSegment].totalCLV += cust.clv;
      });

      const segments = Object.entries(segmentDistribution)
        .map(([segment, data]) => ({
          segment,
          customer_count: data.count,
          total_revenue: Number(data.totalRevenue.toFixed(2)),
          avg_clv: Number((data.totalCLV / data.count).toFixed(2)),
          percentage: Number(((data.count / customers.length) * 100).toFixed(1)),
        }))
        .sort((a, b) => b.customer_count - a.customer_count);

      // Top customers by CLV
      const topCustomers = customers
        .sort((a, b) => b.clv - a.clv)
        .slice(0, 100)
        .map(cust => ({
          customer_id: cust.customerId,
          customer_name: cust.customerName,
          customer_segment: cust.customerSegment,
          total_revenue: cust.totalRevenue,
          total_profit: cust.totalProfit,
          order_count: cust.orderCount,
          avg_order_value: cust.avgOrderValue,
          days_since_last_order: cust.daysSinceLastOrder,
          clv: cust.clv,
          rfm_score: cust.rfmScore,
          rfm_segment: cust.rfmSegment,
        }));

      return NextResponse.json({
        summary,
        segments,
        customers: topCustomers,
      });
  } catch (error) {
    console.error('Error in customer-value API:', error);
    return NextResponse.json(
      { error: 'Failed to calculate customer value metrics' },
      { status: 500 }
    );
  }
}
