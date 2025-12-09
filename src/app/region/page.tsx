'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  ScatterChart, Scatter, Cell, LineChart, Line, PieChart, Pie
} from 'recharts';

interface TerritoryData {
  territory_id: string | null;
  territory_name: string | null;
  country: string | null;
  region: string | null;
  group_name: string | null;
  total_sales: number;
  total_discount: number;
  avg_discount_rate: number;
  total_profit: number;
  avg_profit_margin: number;
  total_orders: number;
  avg_order_value: number;
}

interface MonthlyTrend {
  year: number;
  month: number;
  month_name: string;
  territory_name: string | null;
  total_sales: number;
  avg_discount_rate: number;
  avg_profit_margin: number;
}

interface DiscountDistribution {
  discount_range: string;
  count: number;
  total_sales: number;
  avg_profit_margin: number;
}

const RegionPage = () => {
  const [data, setData] = useState<{
    territoryAnalysis: TerritoryData[];
    monthlyTrend: MonthlyTrend[];
    discountDistribution: DiscountDistribution[];
    years: number[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedTerritory, setSelectedTerritory] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedYear]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = selectedYear 
        ? `/api/region?year=${selectedYear}`
        : '/api/region';
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

  const filteredMonthlyTrend = selectedTerritory
    ? data.monthlyTrend.filter(t => t.territory_name === selectedTerritory)
    : data.monthlyTrend;

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analisis Regional: Diskon & Profit Margin</h1>
        <p className="text-gray-600">
          Analisis wilayah penjualan berdasarkan tingkat diskon dan profit margin
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
        {selectedTerritory && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-4">
            <span className="text-blue-800">
              Territory: <strong>{selectedTerritory}</strong>
            </span>
            <button
              onClick={() => setSelectedTerritory(null)}
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
            <CardTitle className="text-sm font-medium text-gray-600">Total Penjualan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data.territoryAnalysis.reduce((sum, t) => sum + t.total_sales, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Diskon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              ${data.territoryAnalysis.reduce((sum, t) => sum + t.total_discount, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Rata-rata Diskon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {(data.territoryAnalysis.reduce((sum, t) => sum + t.avg_discount_rate, 0) / 
                data.territoryAnalysis.length).toFixed(2)}%
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Rata-rata Profit Margin</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(data.territoryAnalysis.reduce((sum, t) => sum + t.avg_profit_margin, 0) / 
                data.territoryAnalysis.length).toFixed(2)}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scatter Plot: Discount vs Profit Margin */}
        <Card>
          <CardHeader>
            <CardTitle>Hubungan Diskon vs Profit Margin</CardTitle>
            <CardDescription>Klik titik untuk filter territory</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="number" 
                  dataKey="avg_discount_rate" 
                  name="Avg Discount Rate"
                  label={{ value: 'Rata-rata Diskon (%)', position: 'insideBottom', offset: -5 }}
                />
                <YAxis 
                  type="number" 
                  dataKey="avg_profit_margin" 
                  name="Avg Profit Margin"
                  label={{ value: 'Profit Margin (%)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded shadow-lg">
                          <p className="font-semibold">{data.territory_name || 'Unknown'}</p>
                          <p className="text-sm">Diskon: {data.avg_discount_rate}%</p>
                          <p className="text-sm">Profit Margin: {data.avg_profit_margin}%</p>
                          <p className="text-sm">Sales: ${data.total_sales.toLocaleString()}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter 
                  data={data.territoryAnalysis} 
                  fill="#8884d8"
                  onClick={(data) => setSelectedTerritory(data.territory_name)}
                >
                  {data.territoryAnalysis.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={selectedTerritory === entry.territory_name ? '#FF8042' : COLORS[index % COLORS.length]}
                      r={Math.max(entry.total_sales / 100000, 5)}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Discount Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Distribusi Tingkat Diskon</CardTitle>
            <CardDescription>Profit margin berdasarkan range diskon</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data.discountDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="discount_range" />
                <YAxis yAxisId="left" orientation="left" stroke="#8884d8" />
                <YAxis yAxisId="right" orientation="right" stroke="#82ca9d" />
                <Tooltip />
                <Legend />
                <Bar yAxisId="left" dataKey="count" fill="#8884d8" name="Jumlah Transaksi" />
                <Bar yAxisId="right" dataKey="avg_profit_margin" fill="#82ca9d" name="Avg Profit Margin (%)" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      {filteredMonthlyTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Trend Bulanan - Diskon & Profit Margin</CardTitle>
            <CardDescription>
              {selectedTerritory ? `Territory: ${selectedTerritory}` : 'Semua Territory'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={filteredMonthlyTrend}>
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
                  dataKey="avg_discount_rate" 
                  stroke="#ff7300" 
                  name="Avg Discount Rate (%)"
                  strokeWidth={2}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="avg_profit_margin" 
                  stroke="#387908" 
                  name="Avg Profit Margin (%)"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Territory Comparison Table */}
      <Card>
        <CardHeader>
          <CardTitle>Perbandingan Territory</CardTitle>
          <CardDescription>Klik nama territory untuk melihat trend bulanan</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Territory</th>
                  <th className="px-4 py-3 text-left font-semibold">Country</th>
                  <th className="px-4 py-3 text-left font-semibold">Region</th>
                  <th className="px-4 py-3 text-right font-semibold">Total Sales</th>
                  <th className="px-4 py-3 text-right font-semibold">Total Discount</th>
                  <th className="px-4 py-3 text-right font-semibold">Avg Discount %</th>
                  <th className="px-4 py-3 text-right font-semibold">Avg Profit Margin %</th>
                  <th className="px-4 py-3 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.territoryAnalysis.map((territory, index) => (
                  <tr 
                    key={index}
                    className={`hover:bg-gray-50 transition-colors ${
                      selectedTerritory === territory.territory_name ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedTerritory(territory.territory_name)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="px-4 py-3 font-semibold">
                      {territory.territory_name || 'Unknown'}
                    </td>
                    <td className="px-4 py-3">{territory.country || '-'}</td>
                    <td className="px-4 py-3">{territory.region || '-'}</td>
                    <td className="px-4 py-3 text-right">
                      ${territory.total_sales.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right text-red-600">
                      ${territory.total_discount.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${
                        territory.avg_discount_rate > 10 ? 'text-red-600' : 
                        territory.avg_discount_rate > 5 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {territory.avg_discount_rate}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-semibold ${
                        territory.avg_profit_margin < 20 ? 'text-red-600' : 
                        territory.avg_profit_margin < 30 ? 'text-orange-600' : 'text-green-600'
                      }`}>
                        {territory.avg_profit_margin}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {territory.avg_discount_rate > 10 && territory.avg_profit_margin < 25 ? (
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                          High Risk
                        </span>
                      ) : territory.avg_discount_rate > 5 || territory.avg_profit_margin < 30 ? (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                          Monitor
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          Healthy
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

export default RegionPage;