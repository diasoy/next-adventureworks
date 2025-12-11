'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  ScatterChart,
  Scatter,
} from 'recharts';

interface Summary {
  total_customers: number;
  total_revenue: number;
  total_profit: number;
  avg_clv: number;
  avg_order_value: number;
  avg_purchase_frequency: number;
  avg_days_since_last_order: number;
}

interface Segment {
  segment: string;
  customer_count: number;
  total_revenue: number;
  avg_clv: number;
  percentage: number;
}

interface Customer {
  customer_id: string;
  customer_name: string;
  customer_segment: string;
  total_revenue: number;
  total_profit: number;
  order_count: number;
  avg_order_value: number;
  days_since_last_order: number;
  clv: number;
  rfm_score: string;
  rfm_segment: string;
}

interface ApiResponse {
  summary: Summary | null;
  segments: Segment[];
  customers: Customer[];
}

// Colors for RFM segments
const SEGMENT_COLORS: Record<string, string> = {
  Champions: '#10b981',
  'Loyal Customers': '#3b82f6',
  'At Risk': '#f59e0b',
  'Cannot Lose Them': '#ef4444',
  'New Customers': '#8b5cf6',
  Promising: '#06b6d4',
  'Need Attention': '#f97316',
  'Potential Loyalist': '#14b8a6',
  Lost: '#6b7280',
  Others: '#9ca3af',
};

export default function CustomerValuePage() {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch('/api/customer-value');
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error('Failed to fetch customer value data:', error);
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
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data || !data.summary) {
    return (
      <div className="p-8">
        <p className="text-gray-500">No data available</p>
      </div>
    );
  }

  const filteredCustomers = selectedSegment
    ? data.customers.filter((c) => c.rfm_segment === selectedSegment)
    : data.customers;

  // Prepare chart data
  const segmentChartData = data.segments.map((seg) => ({
    name: seg.segment,
    customers: seg.customer_count,
    clv: seg.avg_clv,
    fill: SEGMENT_COLORS[seg.segment] || '#9ca3af',
  }));

  const scatterData = data.customers.slice(0, 50).map((cust) => ({
    x: cust.order_count,
    y: cust.clv,
    name: cust.customer_name,
    segment: cust.rfm_segment,
  }));

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Customer Lifetime Value (CLV) & RFM Analysis</h1>
        <p className="text-gray-600">
          Analisis nilai lifetime pelanggan, segmentasi RFM (Recency, Frequency, Monetary), dan
          identifikasi customer segments untuk strategi retention & targeting.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Customers</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.summary.total_customers.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Avg CLV</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.summary.avg_clv.toLocaleString()}</div>
            <p className="text-xs text-gray-500 mt-1">Customer Lifetime Value</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg Order Value
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.summary.avg_order_value.toLocaleString()}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Avg Purchase Frequency
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {data.summary.avg_purchase_frequency.toFixed(1)}
            </div>
            <p className="text-xs text-gray-500 mt-1">orders per customer</p>
          </CardContent>
        </Card>
      </div>

      {/* RFM Segment Distribution */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>RFM Segment Distribution</CardTitle>
            <CardDescription>
              Distribusi pelanggan berdasarkan segmentasi RFM. Klik segment untuk filter tabel.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={segmentChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => `${entry.name}: ${entry.customers}`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="customers"
                  onClick={(entry) => {
                    setSelectedSegment(
                      selectedSegment === entry.name ? null : entry.name
                    );
                  }}
                  style={{ cursor: 'pointer' }}
                >
                  {segmentChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average CLV by Segment</CardTitle>
            <CardDescription>
              Rata-rata Customer Lifetime Value per segmen pelanggan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={segmentChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" angle={-45} textAnchor="end" height={100} />
                <YAxis />
                <Tooltip formatter={(value) => `$${Number(value).toLocaleString()}`} />
                <Bar dataKey="clv" name="Avg CLV">
                  {segmentChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Segment Details Table */}
      <Card>
        <CardHeader>
          <CardTitle>Segment Details</CardTitle>
          <CardDescription>
            Detail metrics per segmen. Klik untuk menandai segmen fokus.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Segment</th>
                  <th className="px-4 py-3 text-right font-semibold">Customers</th>
                  <th className="px-4 py-3 text-right font-semibold">Percentage</th>
                  <th className="px-4 py-3 text-right font-semibold">Total Revenue</th>
                  <th className="px-4 py-3 text-right font-semibold">Avg CLV</th>
                  <th className="px-4 py-3 text-left font-semibold">Priority</th>
                </tr>
              </thead>
              <tbody>
                {data.segments.map((seg, idx) => {
                  const isHighPriority = ['Champions', 'Loyal Customers', 'Cannot Lose Them', 'At Risk'].includes(seg.segment);
                  const bgColor = selectedSegment === seg.segment ? 'bg-blue-50' : '';
                  
                  return (
                    <tr
                      key={idx}
                      className={`border-b hover:bg-gray-50 cursor-pointer ${bgColor}`}
                      onClick={() => setSelectedSegment(selectedSegment === seg.segment ? null : seg.segment)}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: SEGMENT_COLORS[seg.segment] }}
                          ></div>
                          <span className="font-medium">{seg.segment}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right">{seg.customer_count}</td>
                      <td className="px-4 py-3 text-right">{seg.percentage}%</td>
                      <td className="px-4 py-3 text-right">
                        ${seg.total_revenue.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        ${seg.avg_clv.toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        {isHighPriority && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                            High Priority
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Scatter Plot: Order Frequency vs CLV */}
      <Card>
        <CardHeader>
          <CardTitle>Customer Value Scatter: Order Frequency vs CLV</CardTitle>
          <CardDescription>
            Visualisasi hubungan antara frekuensi order dan Customer Lifetime Value (Top 50 customers).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x" name="Order Count" />
              <YAxis dataKey="y" name="CLV" />
              <Tooltip
                cursor={{ strokeDasharray: '3 3' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border rounded shadow-lg">
                        <p className="font-semibold">{data.name}</p>
                        <p className="text-sm text-gray-600">Orders: {data.x}</p>
                        <p className="text-sm text-gray-600">CLV: ${data.y.toLocaleString()}</p>
                        <p className="text-sm text-gray-600">Segment: {data.segment}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Scatter data={scatterData} fill="#3b82f6" />
            </ScatterChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Customers Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            {selectedSegment ? `Top Customers - ${selectedSegment}` : 'Top Customers by CLV'}
          </CardTitle>
          <CardDescription>
            {selectedSegment
              ? `Menampilkan customers dalam segment "${selectedSegment}". Klik segment di atas untuk clear filter.`
              : 'Top 100 customers berdasarkan Customer Lifetime Value. Klik segment untuk filter.'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Customer</th>
                  <th className="px-4 py-3 text-left font-semibold">RFM Segment</th>
                  <th className="px-4 py-3 text-center font-semibold">RFM Score</th>
                  <th className="px-4 py-3 text-right font-semibold">CLV</th>
                  <th className="px-4 py-3 text-right font-semibold">Total Revenue</th>
                  <th className="px-4 py-3 text-right font-semibold">Orders</th>
                  <th className="px-4 py-3 text-right font-semibold">Avg Order Value</th>
                  <th className="px-4 py-3 text-right font-semibold">Days Since Last Order</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.slice(0, 50).map((cust, idx) => {
                  const segmentColor = SEGMENT_COLORS[cust.rfm_segment] || '#9ca3af';
                  const isRecent = cust.days_since_last_order < 30;
                  
                  return (
                    <tr key={idx} className="border-b hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div>
                          <div className="font-medium">{cust.customer_name}</div>
                          <div className="text-xs text-gray-500">{cust.customer_segment}</div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: segmentColor }}
                          ></div>
                          <span className="text-xs font-medium">{cust.rfm_segment}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex items-center px-2 py-1 rounded text-xs font-mono bg-gray-100">
                          {cust.rfm_score}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold">
                        ${cust.clv.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        ${cust.total_revenue.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">{cust.order_count}</td>
                      <td className="px-4 py-3 text-right">
                        ${cust.avg_order_value.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={isRecent ? 'text-green-600 font-medium' : ''}>
                          {cust.days_since_last_order} days
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          
          {selectedSegment && (
            <div className="mt-4 text-center">
              <button
                onClick={() => setSelectedSegment(null)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
              >
                Clear Filter - Show All Customers
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* RFM Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>RFM Segmentation Explained</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2">📈 High Value Segments:</h4>
              <ul className="space-y-1 text-gray-700">
                <li><span className="font-medium text-green-600">Champions:</span> Recent, frequent, high-value buyers. Best customers!</li>
                <li><span className="font-medium text-blue-600">Loyal Customers:</span> Regular buyers with good value. Nurture them!</li>
                <li><span className="font-medium text-red-600">Cannot Lose Them:</span> High-value but inactive. Win them back!</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">⚠️ Need Attention:</h4>
              <ul className="space-y-1 text-gray-700">
                <li><span className="font-medium text-orange-600">At Risk:</span> High-value customers becoming inactive. Act now!</li>
                <li><span className="font-medium text-orange-500">Need Attention:</span> Regular customers with declining activity.</li>
                <li><span className="font-medium text-gray-600">Lost:</span> Inactive low-value customers. Re-engagement needed.</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">🌱 Growth Potential:</h4>
              <ul className="space-y-1 text-gray-700">
                <li><span className="font-medium text-purple-600">New Customers:</span> Recent first-time buyers. Onboard them!</li>
                <li><span className="font-medium text-cyan-600">Promising:</span> Recent buyers with potential. Engage more!</li>
                <li><span className="font-medium text-teal-600">Potential Loyalist:</span> Frequent recent buyers. Build loyalty!</li>
              </ul>
            </div>
            <div className="bg-blue-50 p-4 rounded">
              <h4 className="font-semibold mb-2">💡 RFM Score Format:</h4>
              <p className="text-gray-700">Score format: <span className="font-mono bg-white px-2 py-1 rounded">R-F-M</span></p>
              <ul className="mt-2 space-y-1 text-gray-700">
                <li><strong>R (Recency):</strong> How recently purchased (1-5, 5 = most recent)</li>
                <li><strong>F (Frequency):</strong> How often purchased (1-5, 5 = most frequent)</li>
                <li><strong>M (Monetary):</strong> How much spent (1-5, 5 = highest value)</li>
              </ul>
              <p className="mt-2 text-xs text-gray-600">Example: Score <span className="font-mono">555</span> = Champions (recent, frequent, high-value)</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
