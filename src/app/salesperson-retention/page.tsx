/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import React, { useEffect, useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';

interface RetentionSummary {
  total_salespersons: number;
  avg_retention_rate: number;      // 0 - 1
  avg_orders_per_customer: number; // rata-rata global
}

interface SalespersonRow {
  salesperson_id: string;
  salesperson_name: string;
  territory_name: string | null;
  total_customers: number;
  repeat_customers: number;
  retention_rate: number; // 0 - 1
  total_orders: number;
  total_sales: number;
  avg_orders_per_customer: number;
  avg_sales_per_customer: number;
}

interface RetentionApiResponse {
  summary: RetentionSummary | null;
  salespersons: SalespersonRow[];
}

const SalespersonRetentionPage = () => {
  const [data, setData] = useState<RetentionApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSalespersonId, setSelectedSalespersonId] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/salesperson-retention');
        const json: RetentionApiResponse = await res.json();

        setData({
          summary: json.summary,
          salespersons: json.salespersons ?? [],
        });
      } catch (err) {
        console.error('Error fetching salesperson-retention:', err);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4" />
          <div className="h-64 bg-gray-200 rounded" />
        </div>
      </div>
    );
  }

  if (!data || !data.summary) {
    return <div className="p-8">Tidak ada data salesperson retention.</div>;
  }

  const { summary, salespersons } = data;

  const sortedByRetention = [...salespersons].sort(
    (a, b) => b.retention_rate - a.retention_rate
  );

  const topByRetention = sortedByRetention.slice(0, 15);
  const best = sortedByRetention[0];

  const COLORS = {
    normal: '#8884d8',
    highlight: '#22c55e',
  };

  const totalSales = salespersons.reduce(
    (sum, s) => sum + s.total_sales,
    0
  );
  const totalOrders = salespersons.reduce(
    (sum, s) => sum + s.total_orders,
    0
  );

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Salesperson Retention Analysis</h1>
        <p className="text-gray-600">
          Mengukur seberapa baik salesperson mempertahankan pelanggan (repeat order) 
          dan hubungannya dengan total penjualan.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Salesperson
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.total_salespersons.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg Retention Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {(summary.avg_retention_rate * 100).toFixed(1)}%
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg Orders per Customer
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-indigo-600">
              {summary.avg_orders_per_customer.toFixed(2)}x
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Sales (All Salesperson)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${totalSales.toLocaleString()}
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Total Orders: {totalOrders.toLocaleString()}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Chart: Retention per Salesperson */}
      <Card>
        <CardHeader>
          <CardTitle>Top Salesperson berdasarkan Retention Rate</CardTitle>
          <CardDescription>
            Bar hijau = retention tertinggi. Klik bar untuk highlight di tabel.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart
              data={topByRetention}
              margin={{ top: 20, right: 30, left: 0, bottom: 100 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="salesperson_name"
                angle={-45}
                textAnchor="end"
                interval={0}
                height={100}
              />
              <YAxis
                tickFormatter={(v) => `${(v * 100).toFixed(0)}%`}
                domain={[0, 1]}
              />
              <Tooltip
                formatter={(value: any, name: string) => {
                  if (name === 'retention_rate' || name === 'Retention Rate') {
                    return [`${(value * 100).toFixed(1)}%`, 'Retention Rate'];
                  }
                  if (name === 'total_sales' || name === 'Total Sales') {
                    return [`$${value.toLocaleString()}`, 'Total Sales'];
                  }
                  return [value, name];
                }}
              />
              <Legend />
              <Bar dataKey="retention_rate" name="Retention Rate">
                {topByRetention.map((s, index) => {
                  const isBest =
                    best && s.salesperson_id === best.salesperson_id;
                  const fill = isBest ? COLORS.highlight : COLORS.normal;
                  return (
                    <Cell
                      key={`sp-bar-${s.salesperson_id}-${index}`}
                      fill={fill}
                      cursor="pointer"
                      onClick={() =>
                        setSelectedSalespersonId(
                          selectedSalespersonId === s.salesperson_id
                            ? null
                            : s.salesperson_id
                        )
                      }
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detail Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Retention per Salesperson</CardTitle>
          <CardDescription>
            Urut berdasarkan retention rate (tertinggi ke terendah).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">
                    Salesperson
                  </th>
                  <th className="px-4 py-3 text-left font-semibold">
                    Territory
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Total Customers
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Repeat Customers
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Retention Rate
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Total Orders
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Total Sales
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Avg Orders/Customer
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Avg Sales/Customer
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {sortedByRetention.map((s, index) => (
                  <tr
                    key={`sp-row-${s.salesperson_id}-${index}`}
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedSalespersonId === s.salesperson_id
                        ? 'bg-blue-50'
                        : ''
                    }`}
                    onClick={() =>
                      setSelectedSalespersonId(
                        selectedSalespersonId === s.salesperson_id
                          ? null
                          : s.salesperson_id
                      )
                    }
                  >
                    <td className="px-4 py-3 font-semibold">
                      {s.salesperson_name}
                    </td>
                    <td className="px-4 py-3">
                      {s.territory_name || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {s.total_customers.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {s.repeat_customers.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {(s.retention_rate * 100).toFixed(1)}%
                    </td>
                    <td className="px-4 py-3 text-right">
                      {s.total_orders.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      ${s.total_sales.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {s.avg_orders_per_customer.toFixed(2)}x
                    </td>
                    <td className="px-4 py-3 text-right">
                      ${s.avg_sales_per_customer.toFixed(2)}
                    </td>
                  </tr>
                ))}

                {sortedByRetention.length === 0 && (
                  <tr>
                    <td
                      colSpan={9}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      Tidak ada data salesperson.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalespersonRetentionPage;
