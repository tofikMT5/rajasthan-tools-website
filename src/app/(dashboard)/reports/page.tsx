'use client';

import React, { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, Download, Printer, DollarSign, Package, Users, ShieldAlert, Search, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { formatKWD } from '@/lib/utils';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import { FeatureLockOverlay } from '@/components/shared/FeatureLockOverlay';

export default function ReportsPage() {
  const [activeReportTab, setActiveReportTab] = useState<'sales' | 'zreport' | 'products' | 'profit' | 'inventory'>('sales');
  
  const [productSales, setProductSales] = useState<any[]>([]);
  const [isProductsLoading, setIsProductsLoading] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [toggles, setToggles] = useState<any>(null);

  useEffect(() => {
    const fetchToggles = () => {
      fetch('/api/saas')
        .then(res => res.json())
        .then(data => {
          if (data && data.success && data.toggles) setToggles(data.toggles);
        });
    };
    fetchToggles();
    const interval = setInterval(fetchToggles, 10000); // 10s polling
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    async function loadProducts() {
      setIsProductsLoading(true);
      try {
        const res = await fetch('/api/reports/products');
        if (res.ok) {
          const data = await res.json();
          setProductSales(data);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setIsProductsLoading(false);
      }
    }
    loadProducts();
  }, []);

  const filteredProducts = productSales.filter(p => 
    (p.nameEn || '').toLowerCase().includes(productSearch.toLowerCase()) || 
    (p.nameAr || '').toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.itemCode || '').toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.barcode || '').toLowerCase().includes(productSearch.toLowerCase())
  );

  const exportExcel = () => {
    const reportData = [
      { Category: 'Hand Tools', Sales_KD: 450.500, Items_Sold: 120 },
      { Category: 'Power Tools', Sales_KD: 1240.250, Items_Sold: 45 },
      { Category: 'Hardware', Sales_KD: 890.000, Items_Sold: 310 },
      { Category: 'Blacksmithing', Sales_KD: 320.750, Items_Sold: 28 },
    ];
    const worksheet = XLSX.utils.json_to_sheet(reportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'SalesReport');
    XLSX.writeFile(workbook, 'RT-Sales-Report-2026.xlsx');
    toast.success('Excel report downloaded successfully!');
  };

  return (
    <FeatureLockOverlay isLocked={Boolean(toggles && !toggles.enableReports)}>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Top Header Controls */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BarChart3 className="w-6 h-6 text-blue-600" /> Business Analytics & Reports
            </h1>
            <p className="text-sm text-slate-500">Z-Report, sales breakdown, inventory valuation, profit margins.</p>
          </div>
          <div className="flex items-center gap-3">
          <Button onClick={exportExcel} variant="outline" className="gap-2 text-xs font-bold">
            <Download className="w-4 h-4 text-emerald-600" /> Export Excel
          </Button>
          <Button onClick={() => window.print()} className="bg-slate-900 hover:bg-slate-800 text-white font-bold gap-2 text-xs">
            <Printer className="w-4 h-4" /> Print Report
          </Button>
        </div>
      </div>

      {/* Tabs Bar */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-sm">
        <button
          onClick={() => setActiveReportTab('sales')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            activeReportTab === 'sales' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Sales Summary
        </button>
        <button
          onClick={() => setActiveReportTab('zreport')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            activeReportTab === 'zreport' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Daily Z-Report (Closing)
        </button>
        <button
          onClick={() => setActiveReportTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            activeReportTab === 'products' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Product Sales
        </button>
        <button
          onClick={() => setActiveReportTab('inventory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            activeReportTab === 'inventory' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Inventory Valuation
        </button>
        <button
          onClick={() => setActiveReportTab('profit')}
          className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            activeReportTab === 'profit' ? 'bg-blue-600 text-white shadow' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Profit Margin (Admin)
        </button>
      </div>

      {/* 1. SALES REPORT TAB */}
      {activeReportTab === 'sales' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardContent className="p-5">
                <span className="text-xs text-slate-400 font-semibold uppercase">Total Monthly Revenue</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">14,850.500 KD</div>
                <span className="text-xs text-emerald-600 font-bold mt-1 block">+12.5% vs last month</span>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
              <CardContent className="p-5">
                <span className="text-xs text-slate-400 font-semibold uppercase">Total Invoices Issued</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">310 Bills</div>
                <span className="text-xs text-slate-500 font-medium mt-1 block">Avg 47.900 KD per invoice</span>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
              <CardContent className="p-5">
                <span className="text-xs text-slate-400 font-semibold uppercase">Cash vs K-Net Ratio</span>
                <div className="text-2xl font-black text-blue-600 mt-1">72% K-Net / 28% Cash</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 2. Z-REPORT (DAILY CLOSING) */}
      {activeReportTab === 'zreport' && (
        <Card className="border-slate-200 dark:border-slate-800 max-w-2xl mx-auto">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 text-center">
            <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">DAILY CASHIER CLOSING (Z-REPORT)</h3>
            <p className="text-xs text-slate-500 font-mono">Date: 23-Aug-2026 • Shift: Counter Sale</p>
          </CardHeader>
          <CardContent className="p-6 space-y-4 text-xs font-mono">
            <div className="flex justify-between p-2 rounded bg-slate-50 dark:bg-slate-900 font-bold">
              <span>CASH COLLECTIONS:</span>
              <span>355.250 KD</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-50 dark:bg-slate-900 font-bold">
              <span>K-NET COLLECTIONS:</span>
              <span>923.600 KD</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-slate-50 dark:bg-slate-900 font-bold">
              <span>VISA / MASTER COLLECTIONS:</span>
              <span>142.000 KD</span>
            </div>
            <div className="flex justify-between p-3 rounded bg-blue-900 text-white font-extrabold text-sm">
              <span>TOTAL DAY NET COLLECTIONS:</span>
              <span>1,420.850 KD</span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 5. PRODUCT SALES TAB */}
      {activeReportTab === 'products' && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold">Product Sales Performance</CardTitle>
            <div className="relative w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <Input 
                placeholder="Search products..." 
                className="pl-9 h-9 text-xs" 
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {isProductsLoading ? (
              <div className="p-12 flex justify-center items-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center text-slate-500 text-sm">No products found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-500">
                    <tr>
                      <th className="p-3.5 pl-6">Code / Barcode</th>
                      <th className="p-3.5">Product Name</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5 text-center">Total Qty Sold</th>
                      <th className="p-3.5 text-right">Revenue (KD)</th>
                      <th className="p-3.5 text-right pr-6">Stock Left</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {filteredProducts.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="p-3.5 pl-6 font-mono text-slate-500">{p.itemCode} {p.barcode && p.barcode !== p.itemCode ? ` / ${p.barcode}` : ''}</td>
                        <td className="p-3.5">
                          <div className="font-bold text-slate-900 dark:text-white">{p.nameEn}</div>
                          <div className="text-[10px] text-slate-400">{p.nameAr}</div>
                        </td>
                        <td className="p-3.5">
                          <Badge variant="outline" className="text-[10px] font-normal">{p.category}</Badge>
                        </td>
                        <td className="p-3.5 text-center font-bold">{p.totalQtySold}</td>
                        <td className="p-3.5 text-right text-emerald-600 font-extrabold font-mono">{formatKWD(p.totalRevenue)}</td>
                        <td className="p-3.5 text-right pr-6 font-mono font-bold">
                          <span className={p.currentStock <= 5 ? 'text-red-500' : 'text-slate-600 dark:text-slate-300'}>
                            {p.currentStock}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 3. INVENTORY VALUATION TAB */}
      {activeReportTab === 'inventory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Card className="border-slate-200 dark:border-slate-800">
              <CardContent className="p-5">
                <span className="text-xs text-slate-400 font-semibold uppercase">Total Inventory Cost Value</span>
                <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">28,450.000 KD</div>
              </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800">
              <CardContent className="p-5">
                <span className="text-xs text-slate-400 font-semibold uppercase">Total Inventory Retail Value</span>
                <div className="text-2xl font-black text-emerald-600 mt-1">42,800.500 KD</div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* 4. PROFIT MARGIN TAB */}
      {activeReportTab === 'profit' && (
        <FeatureLockOverlay isLocked={Boolean(toggles && !toggles.enableProfitReport)}>
          <Card className="border-slate-200 dark:border-slate-800">
            <CardHeader>
              <CardTitle className="text-base font-bold">Category Profitability Analysis</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-500">
                    <tr>
                      <th className="p-3.5 pl-6">Category</th>
                      <th className="p-3.5">Cost Price</th>
                      <th className="p-3.5">Sale Revenue</th>
                      <th className="p-3.5">Gross Profit (KD)</th>
                      <th className="p-3.5 pr-6">Profit Margin %</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium font-mono">
                    <tr>
                      <td className="p-3.5 pl-6 font-sans font-bold">Power Tools</td>
                      <td className="p-3.5 text-slate-500">8,200.000 KD</td>
                      <td className="p-3.5 text-slate-900 dark:text-white font-bold">12,400.000 KD</td>
                      <td className="p-3.5 text-emerald-600 font-extrabold">+4,200.000 KD</td>
                      <td className="p-3.5 pr-6 font-bold text-blue-600">33.8%</td>
                    </tr>
                    <tr>
                      <td className="p-3.5 pl-6 font-sans font-bold">Hand Tools</td>
                      <td className="p-3.5 text-slate-500">2,100.000 KD</td>
                      <td className="p-3.5 text-slate-900 dark:text-white font-bold">3,800.000 KD</td>
                      <td className="p-3.5 text-emerald-600 font-extrabold">+1,700.000 KD</td>
                      <td className="p-3.5 pr-6 font-bold text-blue-600">44.7%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </FeatureLockOverlay>
      )}
      </div>
    </FeatureLockOverlay>
  );
}
