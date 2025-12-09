'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ScatterChart, Scatter, Cell } from 'recharts';

interface ProductPair {
  product1_name: string;
  product1_category: string;
  product2_name: string;
  product2_category: string;
  co_occurrence: number;
  support: number;
}

interface CategoryPair {
  category1: string;
  category2: string;
  co_occurrence: number;
  support: number;
}

interface TopCategory {
  category: string;
  total_orders: number;
  avg_basket_size: number;
}

const BundlingPage = () => {
  const [data, setData] = useState<{
    productPairs: ProductPair[];
    categoryPairs: CategoryPair[];
    topCategories: TopCategory[];
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const url = selectedCategory 
        ? `/api/bundling?category=${encodeURIComponent(selectedCategory)}`
        : '/api/bundling';
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

  const topProductPairs = data.productPairs.slice(0, 10);
  const categoryData = data.categoryPairs.slice(0, 15);
  
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7c7c'];

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Analisis Bundling Produk</h1>
        <p className="text-gray-600">
          Analisis produk dan kategori yang sering dibeli bersamaan untuk strategi cross-selling
        </p>
      </div>

      {selectedCategory && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex justify-between items-center">
          <span className="text-blue-800">
            Filter aktif: <strong>{selectedCategory}</strong>
          </span>
          <button
            onClick={() => setSelectedCategory(null)}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Hapus Filter
          </button>
        </div>
      )}

      {/* Row 1: Category Performance & Category Pairs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Categories - Interactive */}
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>Performa Kategori Produk</CardTitle>
            <CardDescription>Klik kategori untuk filter analisis bundling</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <BarChart data={data.topCategories}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="category" 
                  angle={-45} 
                  textAnchor="end" 
                  height={120}
                  style={{ fontSize: '12px' }}
                />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar 
                  dataKey="total_orders" 
                  fill="#8884d8" 
                  name="Total Transaksi"
                  onClick={(data: any) => setSelectedCategory(data.category)}
                >
                  {data.topCategories.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={selectedCategory === entry.category ? '#FF8042' : '#8884d8'}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </Bar>
                <Bar 
                  dataKey="avg_basket_size" 
                  fill="#82ca9d" 
                  name="Rata-rata Ukuran Keranjang"
                  onClick={(data: any) => setSelectedCategory(data.category)}
                >
                  {data.topCategories.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`}
                      fill={selectedCategory === entry.category ? '#FF8042' : '#82ca9d'}
                      style={{ cursor: 'pointer' }}
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Category Pairs Heatmap */}
        <Card>
          <CardHeader>
            <CardTitle>Pasangan Kategori Terpopuler</CardTitle>
            <CardDescription>Kategori yang sering dibeli bersamaan</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <ScatterChart>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  type="category" 
                  dataKey="category1" 
                  name="Kategori 1"
                  angle={-45}
                  textAnchor="end"
                  height={100}
                  style={{ fontSize: '10px' }}
                />
                <YAxis 
                  type="category" 
                  dataKey="category2" 
                  name="Kategori 2"
                  width={100}
                  style={{ fontSize: '10px' }}
                />
                <Tooltip 
                  cursor={{ strokeDasharray: '3 3' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-3 border rounded shadow-lg">
                          <p className="font-semibold">{data.category1} × {data.category2}</p>
                          <p className="text-sm">Co-occurrence: {data.co_occurrence}</p>
                          <p className="text-sm">Support: {data.support}%</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Scatter 
                  data={categoryData} 
                  fill="#8884d8"
                >
                  {categoryData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]}
                      r={Math.min(entry.co_occurrence / 10, 20)}
                    />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Row 2: Top Product Pairs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Pasangan Produk untuk Bundling</CardTitle>
          <CardDescription>
            Produk yang paling sering dibeli bersamaan - kandidat terbaik untuk paket bundling
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Rank</th>
                  <th className="px-4 py-3 text-left font-semibold">Produk 1</th>
                  <th className="px-4 py-3 text-left font-semibold">Kategori 1</th>
                  <th className="px-4 py-3 text-left font-semibold">Produk 2</th>
                  <th className="px-4 py-3 text-left font-semibold">Kategori 2</th>
                  <th className="px-4 py-3 text-right font-semibold">Frekuensi</th>
                  <th className="px-4 py-3 text-right font-semibold">Support (%)</th>
                  <th className="px-4 py-3 text-center font-semibold">Rekomendasi</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {topProductPairs.map((pair, index) => (
                  <tr 
                    key={index} 
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full font-bold text-white ${
                        index < 3 ? 'bg-yellow-500' : 'bg-gray-400'
                      }`}>
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate" title={pair.product1_name}>
                      {pair.product1_name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                        {pair.product1_category}
                      </span>
                    </td>
                    <td className="px-4 py-3 max-w-xs truncate" title={pair.product2_name}>
                      {pair.product2_name}
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
                        {pair.product2_category}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {pair.co_occurrence}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {pair.support}%
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        pair.support > 5 
                          ? 'bg-green-100 text-green-800' 
                          : pair.support > 2 
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {pair.support > 5 ? 'High Priority' : pair.support > 2 ? 'Medium' : 'Low'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Total Pasangan Produk</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.productPairs.length}</div>
            <p className="text-xs text-gray-500 mt-1">Kombinasi yang teridentifikasi</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Pasangan Kategori</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{data.categoryPairs.length}</div>
            <p className="text-xs text-gray-500 mt-1">Kombinasi kategori</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">Top Support Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">
              {topProductPairs.length > 0 ? `${topProductPairs[0].support}%` : 'N/A'}
            </div>
            <p className="text-xs text-gray-500 mt-1">Pasangan terkuat</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default BundlingPage;