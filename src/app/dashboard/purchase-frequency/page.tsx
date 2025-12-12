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

interface OverallStats {
  overall_avg_frequency_per_customer_per_year: number;
  overall_avg_ticket_size: number;
}

interface SegmentRow {
  segment: string;
  customer_years: number;
  total_orders: number;
  total_sales: number;
  avg_frequency_per_customer_per_year: number;
  avg_ticket_size: number;
  is_high_freq_low_ticket: boolean;
}

interface ApiResponse {
  overall: OverallStats | null;
  segments: SegmentRow[];
}

const PurchaseFrequencyPage = () => {
  const [data, setData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/purchase-frequency');
        const json: ApiResponse = await res.json();

        // Normalisasi supaya nggak ada undefined
        setData({
          overall: json.overall,
          segments: json.segments ?? [],
        });
      } catch (err) {
        console.error('Error fetching purchase-frequency:', err);
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

  if (!data || !data.overall) {
    return <div className="p-8">Tidak ada data / gagal memuat data.</div>;
  }

  const COLORS = {
    normal: '#8884d8',
    highlight: '#ff8042',
  };

  const totalSegments = data.segments.length || 1;
  const totalCustomerYears = data.segments.reduce(
    (sum, s) => sum + s.customer_years,
    0
  );
  const totalOrders = data.segments.reduce(
    (sum, s) => sum + s.total_orders,
    0
  );
  const totalSales = data.segments.reduce(
    (sum, s) => sum + s.total_sales,
    0
  );

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Analisis Purchase Frequency</h1>
        <p className="text-gray-600">
          Rata-rata frekuensi pembelian per pelanggan per tahun, dan identifikasi
          segmen dengan high frequency — low ticket size.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Overall Avg Frequency/Year
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data.overall.overall_avg_frequency_per_customer_per_year.toFixed(2)}x
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Overall Avg Ticket Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${data.overall.overall_avg_ticket_size.toFixed(2)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Customer-Years
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalCustomerYears.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Total Orders (All Segments)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalOrders.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Frekuensi vs Ticket Size per Segment</CardTitle>
          <CardDescription>
            Highlight oranye = segmen dengan high frequency & low ticket size
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart
              data={data.segments}
              margin={{ top: 20, right: 30, left: 0, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="segment"
                angle={-45}
                textAnchor="end"
                interval={0}
                height={80}
              />
              <YAxis />
              <Tooltip
                formatter={(value: any, name: string) => {
                  if (
                    name === 'avg_frequency_per_customer_per_year' ||
                    name === 'Avg Frequency/Year'
                  ) {
                    return [`${value}x`, 'Avg Frequency/Year'];
                  }
                  if (name === 'avg_ticket_size' || name === 'Avg Ticket Size') {
                    return [`$${value}`, 'Avg Ticket Size'];
                  }
                  return [value, name];
                }}
              />
              <Legend />
              <Bar
                dataKey="avg_frequency_per_customer_per_year"
                name="Avg Frequency/Year"
              >
                {data.segments.map((seg, index) => (
                  <Cell
                    key={`freq-cell-${seg.segment}-${index}`}
                    fill={
                      seg.is_high_freq_low_ticket
                        ? COLORS.highlight
                        : COLORS.normal
                    }
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detail per Segment</CardTitle>
          <CardDescription>
            Klik baris untuk menandai segmen fokus (tidak mengubah data, hanya
            highlight visual).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Segment</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Customer-Years
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Total Orders
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Total Sales
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Avg Freq/Year
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Avg Ticket Size
                  </th>
                  <th className="px-4 py-3 text-center font-semibold">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.segments.map((s, index) => (
                  <tr
                    key={`row-${s.segment}-${index}`} // <-- key STRING + index, tidak mungkin [object Object]
                    className={`hover:bg-gray-50 cursor-pointer ${
                      selectedSegment === s.segment ? 'bg-blue-50' : ''
                    }`}
                    onClick={() =>
                      setSelectedSegment(
                        selectedSegment === s.segment ? null : s.segment
                      )
                    }
                  >
                    <td className="px-4 py-3 font-semibold">{s.segment}</td>
                    <td className="px-4 py-3 text-right">
                      {s.customer_years.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {s.total_orders.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      ${s.total_sales.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {s.avg_frequency_per_customer_per_year.toFixed(2)}x
                    </td>
                    <td className="px-4 py-3 text-right">
                      ${s.avg_ticket_size.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {s.is_high_freq_low_ticket ? (
                        <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-xs font-semibold">
                          High Freq – Low Ticket
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-semibold">
                          Normal
                        </span>
                      )}
                    </td>
                  </tr>
                ))}

                {data.segments.length === 0 && (
                  <tr>
                    <td
                      colSpan={7}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      Tidak ada data segmen.
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

export default PurchaseFrequencyPage;
