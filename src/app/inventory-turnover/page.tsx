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

interface InventorySummary {
  total_categories: number;
  overall_turnover: number; // overall ratio
}

interface CategoryTurnover {
  category: string | null;
  total_sold: number;
  avg_inventory: number;
  turnover_ratio: number;
  total_products?: number;
}

interface ProductTurnover {
  product_id: string;
  product_name: string;
  category: string | null;
  total_sold: number;
  avg_inventory: number;
  turnover_ratio: number;
}

interface InventoryApiResponse {
  summary: InventorySummary | null;
  categories: CategoryTurnover[];
  products: ProductTurnover[];
}

const InventoryTurnoverPage = () => {
  const [data, setData] = useState<InventoryApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const res = await fetch('/api/inventory-turnover');
        const json: InventoryApiResponse = await res.json();

        setData({
          summary: json.summary,
          categories: json.categories ?? [],
          products: json.products ?? [],
        });
      } catch (err) {
        console.error('Error fetching inventory-turnover:', err);
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
    return <div className="p-8">Tidak ada data inventory turnover.</div>;
  }

  const { summary, categories, products } = data;

  const sortedCategories = [...categories].sort(
    (a, b) => b.turnover_ratio - a.turnover_ratio
  );

  const fastestCategory = sortedCategories[0];
  const slowestCategory = sortedCategories[sortedCategories.length - 1];

  const filteredProducts = selectedCategory
    ? products.filter((p) => (p.category || 'Unknown') === selectedCategory)
    : products;

  const topProducts = [...filteredProducts]
    .sort((a, b) => b.turnover_ratio - a.turnover_ratio)
    .slice(0, 15);

  const COLORS = {
    normal: '#8884d8',
    highlightFast: '#22c55e',
    highlightSlow: '#f97316',
    product: '#82ca9d',
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Inventory Turnover per Kategori</h1>
        <p className="text-gray-600">
          Rasio perputaran stok (total terjual / rata-rata persediaan) untuk
          mengidentifikasi kategori dengan perputaran tercepat dan terlambat.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Jumlah Kategori
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.total_categories.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600">
              Overall Turnover
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {summary.overall_turnover.toFixed(2)}x
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Rata-rata total_sold / avg_inventory
            </p>
          </CardContent>
        </Card>

        {fastestCategory && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Turnover Tercepat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-emerald-600">
                {fastestCategory.category || 'Unknown'}
              </div>
              <p className="text-sm text-gray-700">
                {fastestCategory.turnover_ratio.toFixed(2)}x
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Sold: {fastestCategory.total_sold.toLocaleString()} | Avg Inv:{' '}
                {fastestCategory.avg_inventory.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        )}

        {slowestCategory && (
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-gray-600">
                Turnover Terlambat
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-bold text-orange-600">
                {slowestCategory.category || 'Unknown'}
              </div>
              <p className="text-sm text-gray-700">
                {slowestCategory.turnover_ratio.toFixed(2)}x
              </p>
              <p className="text-xs text-gray-500 mt-1">
                Sold: {slowestCategory.total_sold.toLocaleString()} | Avg Inv:{' '}
                {slowestCategory.avg_inventory.toFixed(2)}
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Chart: Turnover per Category */}
      <Card>
        <CardHeader>
          <CardTitle>Perbandingan Inventory Turnover per Kategori</CardTitle>
          <CardDescription>
            Bar hijau = kategori dengan turnover tertinggi, oranye = terendah
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={380}>
            <BarChart
              data={sortedCategories}
              margin={{ top: 20, right: 30, left: 0, bottom: 80 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="category"
                angle={-45}
                textAnchor="end"
                interval={0}
                height={80}
              />
              <YAxis />
              <Tooltip
                formatter={(value: any, name: string) => {
                  if (name === 'turnover_ratio') {
                    return [`${value}x`, 'Turnover'];
                  }
                  return [value, name];
                }}
              />
              <Legend />
              <Bar dataKey="turnover_ratio" name="Turnover Ratio">
                {sortedCategories.map((cat, index) => {
                  const catName = cat.category || 'Unknown';
                  const isFast =
                    fastestCategory &&
                    (fastestCategory.category || 'Unknown') === catName;
                  const isSlow =
                    slowestCategory &&
                    (slowestCategory.category || 'Unknown') === catName;

                  const fill = isFast
                    ? COLORS.highlightFast
                    : isSlow
                    ? COLORS.highlightSlow
                    : COLORS.normal;

                  return (
                    <Cell
                      key={`cat-bar-${catName}-${index}`}
                      fill={fill}
                      onClick={() =>
                        setSelectedCategory(
                          selectedCategory === catName ? null : catName
                        )
                      }
                      cursor="pointer"
                    />
                  );
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Top Products Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Top Produk berdasarkan Inventory Turnover
            {selectedCategory ? ` (${selectedCategory})` : ''}
          </CardTitle>
          <CardDescription>
            Klik bar kategori di chart untuk mem-filter produk berdasarkan kategori.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-3 text-left font-semibold">Produk</th>
                  <th className="px-4 py-3 text-left font-semibold">Kategori</th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Total Terjual
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Avg Inventory
                  </th>
                  <th className="px-4 py-3 text-right font-semibold">
                    Turnover Ratio
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {topProducts.map((p, index) => (
                  <tr key={`prod-${p.product_id}-${index}`}>
                    <td className="px-4 py-3 font-semibold">
                      {p.product_name}
                    </td>
                    <td className="px-4 py-3">
                      {p.category || 'Unknown'}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {p.total_sold.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right">
                      {p.avg_inventory.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold">
                      {p.turnover_ratio.toFixed(2)}x
                    </td>
                  </tr>
                ))}

                {topProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="px-4 py-6 text-center text-gray-500"
                    >
                      Tidak ada data produk untuk kategori ini.
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

export default InventoryTurnoverPage;
