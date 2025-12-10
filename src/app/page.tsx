'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Users, ShoppingCart, TrendingUp, DollarSign, Package, TrendingDown } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface DashboardData {
  summary: {
    total_revenue: number;
    total_orders: number;
    total_customers: number;
    total_products: number;
    avg_order_value: number;
    total_profit: number;
    avg_profit_margin: number;
    total_discount: number;
  };
  topCustomers: Array<{
    customer_id: string;
    customer_name: string;
    total_revenue: number;
    total_orders: number;
    avg_order_value: number;
  }>;
  topProducts: Array<{
    product_id: string;
    product_name: string;
    category: string;
    total_revenue: number;
    total_quantity: number;
  }>;
  salesByCategory: Array<{
    category: string;
    total_revenue: number;
    total_quantity: number;
    total_orders: number;
  }>;
  monthlyTrend: Array<{
    year: number;
    month: number;
    month_name: string;
    total_revenue: number;
    total_profit: number;
    total_orders: number;
    profit_margin: number;
  }>;
  recentOrders: Array<{
    order_number: string;
    order_date: string;
    customer_name: string;
    territory_name: string;
    total_revenue: number;
    total_profit: number;
    total_items: number;
    profit_margin: number;
  }>;
}

export default function Home() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/dashboard');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        
        // Check if there's an error in the response
        if (result.error) {
          setError(result.error);
          return;
        }
        
        setData(result);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(error instanceof Error ? error.message : 'Failed to fetch dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col gap-4 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 p-8">
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-800">Error Loading Dashboard</CardTitle>
            <CardDescription className="text-red-600">{error}</CardDescription>
          </CardHeader>
          <CardContent>
            <button 
              onClick={() => window.location.reload()} 
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!data || !data.summary) {
    return (
      <div className="flex flex-col gap-4 p-8">
        <div className="text-center text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: "Total Revenue",
      value: `$${data.summary.total_revenue.toLocaleString()}`,
      description: `Avg profit margin: ${data.summary.avg_profit_margin.toFixed(2)}%`,
      icon: DollarSign,
      trend: "up",
    },
    {
      title: "Total Orders",
      value: data.summary.total_orders.toLocaleString(),
      description: `Avg order value: $${data.summary.avg_order_value.toLocaleString()}`,
      icon: ShoppingCart,
      trend: "up",
    },
    {
      title: "Customers",
      value: data.summary.total_customers.toLocaleString(),
      description: `${data.summary.total_products} products sold`,
      icon: Users,
      trend: "up",
    },
    {
      title: "Total Profit",
      value: `$${data.summary.total_profit.toLocaleString()}`,
      description: `Discount: $${data.summary.total_discount.toLocaleString()}`,
      icon: TrendingUp,
      trend: "up",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
        <p className="text-muted-foreground">
          Welcome to your AdventureWorks CRM dashboard
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">
                {stat.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Monthly Revenue & Profit Trend</CardTitle>
            <CardDescription>
              Last 12 months sales and profit overview
            </CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.monthlyTrend}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month_name" 
                  angle={-45}
                  textAnchor="end"
                  height={80}
                />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="total_revenue" 
                  stroke="#8884d8" 
                  name="Revenue"
                  strokeWidth={2}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="total_profit" 
                  stroke="#82ca9d" 
                  name="Profit"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Top Customers</CardTitle>
            <CardDescription>
              Your top 5 performing customers
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {data.topCustomers.slice(0, 5).map((customer, index) => (
                <div key={index} className="flex items-center">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary font-semibold text-sm">
                    {customer.customer_name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                  </div>
                  <div className="ml-4 space-y-1">
                    <p className="text-sm font-medium leading-none">{customer.customer_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {customer.total_orders} orders
                    </p>
                  </div>
                  <div className="ml-auto font-medium text-sm">
                    ${customer.total_revenue.toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Sales by Category</CardTitle>
            <CardDescription>
              Revenue breakdown by product category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.salesByCategory.slice(0, 8)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="category" 
                  angle={-45}
                  textAnchor="end"
                  height={100}
                />
                <YAxis />
                <Tooltip />
                <Bar dataKey="total_revenue" fill="#8884d8" name="Revenue" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Orders</CardTitle>
            <CardDescription>
              Latest transactions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {data.recentOrders.slice(0, 5).map((order, index) => (
                <div key={index} className="flex items-center justify-between border-b pb-3 last:border-0">
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{order.order_number}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.customer_name} • {new Date(order.order_date).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold">${order.total_revenue.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">
                      {order.total_items} items
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

