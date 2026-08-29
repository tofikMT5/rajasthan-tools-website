'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import {
  TrendingUp,
  Receipt,
  AlertTriangle,
  Users,
  Plus,
  ArrowUpRight,
  Package,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatKWD, formatDate } from '@/lib/utils';

export default function DashboardPage() {
  const { data: session } = useSession();
  const userName = session?.user?.name || 'Admin';

  const [invoices, setInvoices] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [invRes, prodRes, custRes] = await Promise.all([
          fetch('/api/invoices'),
          fetch('/api/products'),
          fetch('/api/customers'),
        ]);

        const invData = await invRes.json();
        const prodData = await prodRes.json();
        const custData = await custRes.json();

        if (Array.isArray(invData)) setInvoices(invData);
        if (Array.isArray(prodData)) setProducts(prodData);
        if (Array.isArray(custData)) setCustomers(custData);
      } catch (e) {
      } finally {
        setIsLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const todaySales = invoices.reduce((sum, inv) => sum + Number(inv.netAmount || 0), 0);
  const lowStockItems = products.filter((p) => p.stockQty <= (p.alertQty || 5));

  const getTimeGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* 1. Welcome Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-blue-900 via-slate-900 to-amber-950 p-6 sm:p-8 text-white overflow-hidden shadow-xl border border-slate-800">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-orange-400 uppercase tracking-widest mb-1">
              <Sparkles className="w-4 h-4" /> Live Overview • Kuwait Standard Time
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {getTimeGreeting()}, {userName} 👋
            </h1>
            <p className="text-slate-300 text-sm mt-1">
              Here is what is happening at <span className="font-semibold text-white">Rajasthan Tools Q8</span> today.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/pos">
              <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-lg shadow-orange-500/30 gap-2">
                <Plus className="w-5 h-5" /> New Invoice (POS)
              </Button>
            </Link>
          </div>
        </div>

        {/* Ambient Glow */}
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today Sales */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Revenue</CardTitle>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{formatKWD(todaySales)}</div>
            <div className="flex items-center gap-1.5 text-xs text-emerald-600 font-semibold mt-1">
              Live Store Collection
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Invoices Count */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Invoices</CardTitle>
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600">
              <Receipt className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{invoices.length} Bills</div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium mt-1">
              Issued in store
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Low Stock Alert */}
        <Card className="border-slate-200 dark:border-slate-800 border-l-4 border-l-amber-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Low Stock Items</CardTitle>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-amber-600">{lowStockItems.length} Products</div>
            <div className="text-xs text-slate-500 font-medium mt-1">Requires reorder attention</div>
          </CardContent>
        </Card>

        {/* Card 4: Total Customers */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-xs font-bold text-slate-500 uppercase tracking-wider">Registered Customers</CardTitle>
            <div className="p-2 rounded-xl bg-purple-50 dark:bg-purple-950/40 text-purple-600">
              <Users className="w-5 h-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-black text-slate-900 dark:text-white">{customers.length} Accounts</div>
            <div className="text-xs text-emerald-600 font-semibold mt-1">Active customer ledgers</div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Recent Billing Invoices & Empty State Banner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Invoices Table (2/3 width) */}
        <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base font-bold">Recent Billing Invoices</CardTitle>
            <Link href="/invoices">
              <Button variant="ghost" size="sm" className="text-xs text-blue-600 hover:text-blue-700">
                View All Invoices →
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="p-0">
            {invoices.length === 0 ? (
              <div className="p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-900 text-slate-400 flex items-center justify-center mx-auto">
                  <Receipt className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">No invoices yet</h3>
                  <p className="text-xs text-slate-500 mt-1">Start by creating your first POS invoice for customer checkout.</p>
                </div>
                <Link href="/pos">
                  <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs">
                    + Open POS Billing Screen
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 font-semibold text-slate-500">
                    <tr>
                      <th className="p-3.5 pl-6">Bill No</th>
                      <th className="p-3.5">Customer</th>
                      <th className="p-3.5">Amount</th>
                      <th className="p-3.5">Payment</th>
                      <th className="p-3.5 pr-6 text-right">Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {invoices.slice(0, 5).map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                        <td className="p-3.5 pl-6 font-mono font-bold text-blue-600">{inv.invoiceNo}</td>
                        <td className="p-3.5 text-slate-900 dark:text-slate-100 font-semibold">
                          {inv.customer?.name || 'Cash Customer'}
                        </td>
                        <td className="p-3.5 font-bold font-mono text-emerald-600">{formatKWD(inv.netAmount)}</td>
                        <td className="p-3.5">{inv.paymentMode || 'CASH'}</td>
                        <td className="p-3.5 pr-6 text-right text-slate-400 font-mono">{formatDate(inv.dateTime)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Low Stock Alert Cards (1/3 width) */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Low Stock Reorder Items
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {lowStockItems.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-500">
                All inventory stock levels are healthy!
              </div>
            ) : (
              lowStockItems.slice(0, 4).map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 space-y-1.5"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-xs font-bold text-slate-900 dark:text-white leading-snug">{item.nameEn}</h5>
                      <span className="text-[10px] font-mono text-slate-400">{item.itemCode}</span>
                    </div>
                    <Badge variant="warning" className="font-mono text-[10px]">
                      {item.stockQty} left
                    </Badge>
                  </div>
                </div>
              ))
            )}
            <Link href="/products" className="block pt-2">
              <Button variant="outline" size="sm" className="w-full text-xs">
                Manage Product Inventory →
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
