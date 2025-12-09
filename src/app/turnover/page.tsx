'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, Cell, ComposedChart, Area
} from 'recharts';

interface CategoryTurnover {
  category: string | null;
  total_sold: number;
  avg_inventory: number;
  turnover_ratio: number;
  days_to_sell: number;
  total_sales_value: number;
  inventory_value: number;
}

interface ProductTurnover {
  product_id: string;
  product_name: string;
  category: string | null;
  total_sold: number;
  avg_inventory: number;
  turnover_ratio: number;
  days_to_sell: number;
  sales_value: number;
}

interface MonthlyTrend {
  year: number;
  month: number;
  month_name: string;
  category: string | null;
  monthly_sold: number;
  avg_inventory: number;
  turnover_ratio: number;
}

const TurnoverPage = () => {
  const [data, setData] = useState<{
    categoryTurnover: CategoryTurnover[];
    productTurnover: ProductTurnover[];
    monthlyTrend: MonthlyTrend[];
    years: number[];
    categories: string[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showSlowMovers, setShowSlowMovers] = useState(false);

  useEffect(() => {
    fetchData();
  }, [selectedYear, selectedCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedYear) params.append('year', selectedYear.toString());
      if (selectedCategory) params.append('category', selectedCategory);
      
      const url = `/api/turnover${params.toString() ? '?' + params.toString() : ''}`;
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

  const topMovers = data.productTurnover.slice(0, 20);
  const slowMovers = [...data.productTurnover].sort((a, b) => a.turnover_ratio - b.turnover_ratio).slice(0, 20);
  
  const filteredMonthlyTrend = selectedCategory
    ? data.monthlyTrend.filter(t => t.category === selectedCategory)
    : data.monthlyTrend;

  // Aggregate monthly trend by month if no category selected
  const aggregatedMonthlyTrend = selectedCategory 
    ? filteredMonthlyTrend
    : filteredMonthlyTrend.reduce((acc: any[], curr) => {
        const existing = acc.find(item => 
          item.year === curr.year && item.month === curr.month
        );
        if (existing) {
          existing.monthly_sold += curr.monthly_sold;
          existing.avg_inventory += curr.avg_inventory;
          existing.turnover_ratio = existing.monthly_sold / existing.avg_inventory;
        } else {
          acc.push({...curr});
        }
        return acc;
      }, []);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analisis Inventory Turnover</h1>
        <p className="text-gray-600">
          Perputaran stok produk per kategori - identifikasi fast movers dan slow movers
        </p>
      </div>

      {/* Filters */}
      <div className="flex gap-4 items-center flex-wrap">
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
        <div>
          <label className="block text-sm font-medium mb-2">Filter Kategori:</label>
          <select
            value={selectedCategory || ''}
            onChange={(e) => setSelectedCategory(e.target.value || null)}
            className="px-4 py-2 border rounded-lg"
          >
            <option value="">Semua Kategori</option>
            {data.categories.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>
        </div>
        {selectedCategory && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center gap-4">
            <span className="text-blue-800">
              Filter: <strong>{selectedCategory}</strong>
            </span>
            <button
              onClick={() => setSelectedCategory(null)}
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
            <CardTitle className="text-sm font-medium text-gray-600">Avg Turnover Ratio</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {(data.categoryTurnover.reduce((sum, c) => sum + c.turnover_ratio, 0) / 
                data.categoryTurnover.length).toFixed(2)}x
            </div>
            <p className="text-xs text-gray-500 mt-1">times per year</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Fastest Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">
              {data.categoryTurnover[0]?.turnover_ratio.toFixed(1)}x
            </div>
            <p className="text-xs text-gray-500 mt-1 truncate">
              {data.categoryTurnover[0]?.category}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Slowest Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-orange-600">
              {[...data.categoryTurnover].sort((a, b) => a.turnover_ratio - b.turnover_ratio)[0]?.turnover_ratio.toFixed(1)}x
            </div>
            <p className="text-xs text-gray-500 mt-1 truncate">
              {[...data.categoryTurnover].sort((a, b) => a.turnover_ratio - b.turnover_ratio)[0]?.category}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${data.categoryTurnover.reduce((sum, c) => sum + c.inventory_value, 0).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Turnover Comparison */}
        <Card>
          <CardHeader>
            <CardTitle>Turnover Ratio per Kategori</CardTitle>
            <CardDescription>Klik kategori untuk drill-down detail produk</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data.categoryTurnover}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="category" 
                  angle={-45}
                  textAnchor="end"
                  height={120}
                  style={{ fontSize: '11px' }}
                />
                <YAxis />
                <Tooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded shadow-lg">
                          <p className="font-semibold">{data.category}</p>
                          <p className="text-sm">Turnover: {data.turnover_ratio}x</p>
                          <p className="text-sm">Days to Sell: {data.days_to_sell} days</p>
                          <p className="text-sm">Sold: {data.total_sold.toLocaleString()}</p>
                          <p className="text-sm">Avg Inventory: {data.avg_inventory.toLocaleString()}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar 
                  dataKey="turnover_ratio" 
                  fill="#8884d8" 
                  name="Turnover Ratio"
                  onClick={(data: any) => setSelectedCategory(data.category)}
                >
                  {data.categoryTurnover.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={selectedCategory === entry.category ? '#FF8042' : COLORS[index % COLORS.length]}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Days to Sell */}
        <Card>
          <CardHeader>
            <CardTitle>Days to Sell Inventory</CardTitle>
            <CardDescription>Rata-rata hari untuk menjual inventory</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={[...data.categoryTurnover].sort((a, b) => b.days_to_sell - a.days_to_sell)}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="category" 
                  angle={-45}
                  textAnchor="end"
                  height={120}
                  style={{ fontSize: '11px' }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="days_to_sell" name="Days to Sell">
                  {data.categoryTurnover.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={
                        entry.days_to_sell < 30 ? '#00C49F' :
                        entry.days_to_sell < 60 ? '#FFBB28' :
                        entry.days_to_sell < 90 ? '#FF8042' : '#d32f2f'
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Trend */}
      {aggregatedMonthlyTrend.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Trend Bulanan - Turnover Ratio</CardTitle>
            <CardDescription>
              {selectedCategory ? `Kategori: ${selectedCategory}` : 'Seluruh Kategori (Agregat)'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={aggregatedMonthlyTrend}>
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
                <Bar 
                  yAxisId="left"
                  dataKey="monthly_sold" 
                  fill="#8884d8" 
                  name="Units Sold"
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="turnover_ratio" 
                  stroke="#ff7300" 
                  name="Turnover Ratio"
                  strokeWidth={2}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Product Details Table */}
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => setShowSlowMovers(false)}
          className={`px-6 py-2 rounded-lg font-semibold ${
            !showSlowMovers ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Fast Movers (Top 20)
        </button>
        <button
          onClick={() => setShowSlowMovers(true)}
          className={`px-6 py-2 rounded-lg font-semibold ${
            showSlowMovers ? 'bg-orange-600 text-white' : 'bg-gray-200 text-gray-700'
          }`}
        >
          Slow Movers (Bottom 20)
        </button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>
            {showSlowMovers ? 'Slow Movers - Perputaran Lambat' : 'Fast Movers - Perputaran Cepat'}
          </CardTitle>
          <CardDescription>
            {showSlowMovers 
              ? 'Produk dengan turnover ratio terendah - perhatian inventory management'
              : 'Produk dengan turnover ratio tertinggi - stok popular'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Rank</th>
                  <th className="px-4 py-3 text-left font-semibold">Product</th>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-right font-semibold">Total Sold</th>
                  <th className="px-4 py-3 text-right font-semibold">Avg Inventory</th>
                  <th className="px-4 py-3 text-right font-semibold">Turnover Ratio</th>
                  <th className="px-4 py-3 text-right font-semibold">Days to Sell</th>
                  <th className="px-4 py-3 text-right font-semibold">Sales Value</th>
                  <th className="px-4 py-3 text-center font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {(showSlowMovers ? slowMovers : topMovers).map((product, index) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                        !showSlowMovers && index < 3 ? 'bg-yellow-500' : 
                        showSlowMovers && index < 3 ? 'bg-red-500' : 'bg-gray-400'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs">
                      <div className="font-medium truncate" title={product.product_name}>
                        {product.product_name}
                      </div>
                      <div className="text-xs text-gray-500">ID: {product.product_id}</div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {product.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">{product.total_sold.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{product.avg_inventory.toFixed(1)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${
                        product.turnover_ratio > 10 ? 'text-green-600' :
                        product.turnover_ratio > 5 ? 'text-blue-600' :
                        product.turnover_ratio > 2 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {product.turnover_ratio.toFixed(2)}x
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`${
                        product.days_to_sell < 30 ? 'text-green-600' :
                        product.days_to_sell < 60 ? 'text-yellow-600' : 'text-red-600'
                      }`}>
                        {product.days_to_sell} days
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      ${product.sales_value.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {product.turnover_ratio > 10 ? (
                        <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                          Fast Mover
                        </span>
                      ) : product.turnover_ratio > 5 ? (
                        <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                          Good
                        </span>
                      ) : product.turnover_ratio > 2 ? (
                        <span className="px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs font-semibold">
                          Average
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-xs font-semibold">
                          Slow Mover
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

      {/* Category Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Ringkasan per Kategori</CardTitle>
          <CardDescription>Overview performa inventory semua kategori</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Category</th>
                  <th className="px-4 py-3 text-right font-semibold">Total Sold</th>
                  <th className="px-4 py-3 text-right font-semibold">Avg Inventory</th>
                  <th className="px-4 py-3 text-right font-semibold">Turnover Ratio</th>
                  <th className="px-4 py-3 text-right font-semibold">Days to Sell</th>
                  <th className="px-4 py-3 text-right font-semibold">Sales Value</th>
                  <th className="px-4 py-3 text-right font-semibold">Inventory Value</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {data.categoryTurnover.map((category, index) => (
                  <tr 
                    key={index} 
                    className={`hover:bg-gray-50 ${
                      selectedCategory === category.category ? 'bg-blue-50' : ''
                    }`}
                    onClick={() => setSelectedCategory(
                      selectedCategory === category.category ? null : category.category
                    )}
                    style={{ cursor: 'pointer' }}
                  >
                    <td className="px-4 py-3 font-semibold">{category.category}</td>
                    <td className="px-4 py-3 text-right">{category.total_sold.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">{category.avg_inventory.toFixed(0)}</td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${
                        category.turnover_ratio > 10 ? 'text-green-600' :
                        category.turnover_ratio > 5 ? 'text-blue-600' : 'text-orange-600'
                      }`}>
                        {category.turnover_ratio.toFixed(2)}x
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">{category.days_to_sell} days</td>
                    <td className="px-4 py-3 text-right">${category.total_sales_value.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">${category.inventory_value.toLocaleString()}</td>
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

export default TurnoverPage;