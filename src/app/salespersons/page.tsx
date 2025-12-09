'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, Cell, LineChart, Line, PieChart, Pie, RadialBarChart, RadialBar
} from 'recharts';

interface SalespersonData {
  salesperson_id: string;
  salesperson_name: string;
  job_title: string | null;
  territory_name: string | null;
  total_customers: number;
  repeat_customers: number;
  retention_rate: number;
  avg_customer_orders: number;
  total_sales: number;
  total_orders: number;
  avg_order_value: number;
}

interface LoyaltyMetric {
  salesperson_id: string;
  salesperson_name: string;
  loyalty_tier: string;
  customer_count: number;
  avg_orders: number;
  total_revenue: number;
}

interface RetentionTrend {
  year: number;
  month: number;
  month_name: string;
  salesperson_id: string;
  salesperson_name: string;
  new_customers: number;
  repeat_customers: number;
  retention_rate: number;
}

const SalespersonsPage = () => {
  const [data, setData] = useState<{
    salespersonAnalysis: SalespersonData[];
    loyaltyMetrics: LoyaltyMetric[];
    retentionTrend: RetentionTrend[];
    years: number[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedSalesperson, setSelectedSalesperson] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = selectedYear 
        ? `/api/salespersons?year=${selectedYear}`
        : '/api/salespersons';
      const response = await fetch(url);
      const result = await response.json();
      setData(result);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!data) return <div className="p-8">Error loading data</div>;

  const selectedSalespersonData = selectedSalesperson 
    ? data.salespersonAnalysis.find(s => s.salesperson_id === selectedSalesperson)
    : null;

  const filteredLoyaltyMetrics = selectedSalesperson
    ? data.loyaltyMetrics.filter(l => l.salesperson_id === selectedSalesperson)
    : [];

  const filteredRetentionTrend = selectedSalesperson
    ? data.retentionTrend.filter(r => r.salesperson_id === selectedSalesperson)
    : data.retentionTrend;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analisis Retensi Pelanggan per Salesperson</h1>
        <p className="text-gray-600">
          Evaluasi performa salesperson berdasarkan customer retention dan repeat orders
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center">
        <div>
          <label className="block text-sm font-medium mb-2">Filter Tahun:</label>
          <select
            value={selectedYear || ''}
            onChange={(e) => setSelectedYear(e.target.value ? Number(e.target.value) : null)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">Semua Tahun</option>
            {data.years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>
        </div>
        {selectedSalesperson && selectedSalespersonData && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-4">
            <div>
              <span className="text-blue-800">
                Salesperson: <strong>{selectedSalespersonData.salesperson_name}</strong>
              </span>
              <div className="text-xs text-blue-600">
                Retention Rate: {selectedSalespersonData.retention_rate}% | 
                Total Sales: ${selectedSalespersonData.total_sales.toLocaleString()}
              </div>
            </div>
            <button
              onClick={() => setSelectedSalesperson(null)}
              className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Salespersons</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.salespersonAnalysis.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Avg Retention Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(data.salespersonAnalysis.reduce((sum, s) => sum + s.retention_rate, 0) / 
                data.salespersonAnalysis.length).toFixed(2)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Sales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              ${data.salespersonAnalysis.reduce((sum, s) => sum + s.total_sales, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Best Retention</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-purple-600">
              {data.salespersonAnalysis[0]?.retention_rate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-500 mt-1 truncate">
              {data.salespersonAnalysis[0]?.salesperson_name}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Retention vs Sales Scatter */}
        <Card>
          <CardHeader>
            <CardTitle>Retention Rate vs Total Sales</CardTitle>
            <CardDescription>Klik titik untuk drill-down detail salesperson</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="retention_rate" 
                  name="Retention Rate"
                  label={{ value: 'Retention Rate (%)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="total_sales" 
                  name="Total Sales"
                  label={{ value: 'Total Sales ($)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded shadow-lg">
                          <p className="font-semibold">{data.salesperson_name}</p>
                          <p className="text-sm">Territory: {data.territory_name || 'N/A'}</p>
                          <p className="text-sm">Retention: {data.retention_rate}%</p>
                          <p className="text-sm">Customers: {data.total_customers}</p>
                          <p className="text-sm">Repeats: {data.repeat_customers}</p>
                          <p className="text-sm">Sales: ${data.total_sales.toLocaleString()}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter 
                  data={data.salespersonAnalysis} 
                  fill="#8884d8"
                  onClick={(data) => setSelectedSalesperson(data.salesperson_id)}
                >
                  {data.salespersonAnalysis.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={selectedSalesperson === entry.salesperson_id ? '#FF8042' : COLORS[index % COLORS.length]}
                      r={Math.max(entry.total_customers / 20, 5)}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Customer Loyalty Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>
              {selectedSalesperson ? 'Customer Loyalty Breakdown' : 'Top Performers - Retention'}
            </CardTitle>
            <CardDescription>
              {selectedSalesperson ? selectedSalespersonData?.salesperson_name : 'Top 10 by retention rate'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {selectedSalesperson && filteredLoyaltyMetrics.length > 0 ? (
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={filteredLoyaltyMetrics as any}
                    dataKey="customer_count"
                    nameKey="loyalty_tier"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    label={(entry: any) => `${entry.loyalty_tier}: ${entry.customer_count}`}
                  >
                    {filteredLoyaltyMetrics.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <ResponsiveContainer width="100%" height={350}>
                <BarChart data={data.salespersonAnalysis.slice(0, 10)}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="salesperson_name" 
                    angle={-45}
                    textAnchor="end"
                    height={120}
                    style={{ fontSize: '11px' }}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar 
                    dataKey="retention_rate" 
                    fill="#82ca9d" 
                    name="Retention Rate (%)"
                    onClick={(data: any) => setSelectedSalesperson(data.salesperson_id)}
                  >
                    {data.salespersonAnalysis.slice(0, 10).map((entry, index) => (
                      <Cell 
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        style={{ cursor: 'pointer' }}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Retention Trend (if salesperson selected) */}
      {selectedSalesperson && filteredRetentionTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Monthly Retention Trend</CardTitle>
            <CardDescription>{selectedSalespersonData?.salesperson_name}</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredRetentionTrend}>
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
                  dataKey="new_customers" 
                  stroke="#8884d8" 
                  name="New Customers"
                  strokeWidth={2}
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="repeat_customers" 
                  stroke="#82ca9d" 
                  name="Repeat Customers"
                  strokeWidth={2}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="retention_rate" 
                  stroke="#ff7300" 
                  name="Retention Rate (%)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Salesperson Performance Table */}
      <Card>
        <CardHeader>
          <CardTitle>Detail Performance Salesperson</CardTitle>
          <CardDescription>Klik baris untuk melihat detail dan trend</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Rank</th>
                  <th className="px-4 py-3 text-left font-semibold">Salesperson</th>
                  <th className="px-4 py-3 text-left font-semibold">Territory</th>
                  <th className="px-4 py-3 text-right font-semibold">Total Customers</th>
                  <th className="px-4 py-3 text-right font-semibold">Repeat Customers</th>
                  <th className="px-4 py-3 text-right font-semibold">Retention Rate</th>
                  <th className="px-4 py-3 text-right font-semibold">Avg Orders/Customer</th>
                  <th className="px-4 py-3 text-right font-semibold">Total Sales</th>
                  <th className="px-4 py-3 text-center font-semibold">Performance</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.salespersonAnalysis.map((salesperson, index) => (
                  <tr 
                    key={index}
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedSalesperson === salesperson.salesperson_id ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedSalesperson(
                      selectedSalesperson === salesperson.salesperson_id ? null : salesperson.salesperson_id
                    )}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                        index < 3 ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-semibold">{salesperson.salesperson_name}</div>
                      <div className="text-xs text-gray-500">{salesperson.job_title || 'N/A'}</div>
                    </td>
                    <td className="px-4 py-3">{salesperson.territory_name || '-'}</td>
                    <td className="px-4 py-3 text-right">{salesperson.total_customers}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="font-semibold text-green-600">
                        {salesperson.repeat_customers}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${
                        salesperson.retention_rate >= 70 ? 'text-green-600' :
                        salesperson.retention_rate >= 50 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {salesperson.retention_rate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {salesperson.avg_customer_orders.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      ${salesperson.total_sales.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {salesperson.retention_rate >= 70 && salesperson.total_sales > 500000 ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          Star Performer
                        </span>
                      ) : salesperson.retention_rate >= 50 ? (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                          Good
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                          Needs Improvement
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalespersonsPage;