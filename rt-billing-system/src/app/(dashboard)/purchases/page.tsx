'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ShoppingBag, Plus, Search, Eye, Trash2, Calendar, Building2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatKWD, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { FeatureLockOverlay } from '@/components/shared/FeatureLockOverlay';

export default function PurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
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

  const fetchPurchases = async () => {
    try {
      setIsLoading(true);
      const url = new URL('/api/purchases', window.location.origin);
      if (search) url.searchParams.append('search', search);
      if (selectedSupplier) url.searchParams.append('supplierId', selectedSupplier);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (Array.isArray(data)) setPurchases(data);
    } catch (e) {
      toast.error('Failed to load purchases');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuppliers = async () => {
    try {
      const res = await fetch('/api/suppliers');
      const data = await res.json();
      if (Array.isArray(data)) setSuppliers(data);
    } catch (e) {}
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchPurchases();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedSupplier]);

  const handleDeletePurchase = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetch(`/api/purchases/${deleteTargetId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Purchase cancelled & stock reversed successfully!');
        setDeleteTargetId(null);
        fetchPurchases();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to delete purchase');
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const totalAmount = purchases.reduce((acc, p) => acc + Number(p.total), 0);

  return (
    <FeatureLockOverlay isLocked={Boolean(toggles && !toggles.enablePurchases)}>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-orange-500" /> Supplier Purchases & Inventory Intake
          </h1>
          <p className="text-sm text-slate-500">Stock intake orders, supplier invoices, and cost updates.</p>
        </div>
        <Link href="/purchases/new">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold gap-2">
            <Plus className="w-4 h-4" /> New Purchase Order
          </Button>
        </Link>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-5">
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Purchase Orders</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{purchases.length} Orders</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-5">
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Stock Intake Value</span>
            <div className="text-2xl font-black text-emerald-600 mt-1">{formatKWD(totalAmount)}</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-5">
            <span className="text-xs text-slate-400 font-semibold uppercase">Active Suppliers</span>
            <div className="text-2xl font-black text-blue-600 mt-1">{suppliers.length} Suppliers</div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Supplier Filter */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Purchase No or Supplier..."
            className="pl-10 h-10"
          />
        </div>

        <select
          value={selectedSupplier}
          onChange={(e) => setSelectedSupplier(e.target.value)}
          className="h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none w-full sm:w-auto"
        >
          <option value="">All Suppliers</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
      </div>

      {/* Purchases Data Table */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-500">
                <tr>
                  <th className="p-3.5 pl-6">Purchase No</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Supplier</th>
                  <th className="p-3.5">Items Count</th>
                  <th className="p-3.5">Total Amount</th>
                  <th className="p-3.5">Notes</th>
                  <th className="p-3.5 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {purchases.map((p) => {
                  const items = (p.items as any[]) || [];
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                      <td className="p-3.5 pl-6 font-mono font-bold text-orange-600">{p.purchaseNo}</td>
                      <td className="p-3.5 text-slate-500 font-mono">{formatDate(p.date)}</td>
                      <td className="p-3.5 font-bold text-slate-900 dark:text-white">{p.supplier?.name || 'Unknown Supplier'}</td>
                      <td className="p-3.5">
                        <Badge variant="outline" className="font-mono text-[10px]">
                          {items.length} Items
                        </Badge>
                      </td>
                      <td className="p-3.5 font-mono font-extrabold text-emerald-600">{formatKWD(p.total)}</td>
                      <td className="p-3.5 text-slate-500 max-w-xs truncate">{p.notes || '-'}</td>
                      <td className="p-3.5 pr-6 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/purchases/${p.id}`}>
                            <Button size="sm" variant="ghost" className="h-7 text-xs text-blue-600 gap-1">
                              <Eye className="w-3.5 h-3.5" /> View
                            </Button>
                          </Link>
                          <Button
                            onClick={() => setDeleteTargetId(p.id)}
                            size="sm"
                            variant="ghost"
                            className="h-7 text-xs text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* CONFIRM DELETE MODAL WITH REVERSAL WARNING */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Cancel Purchase Order?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This action will automatically reverse stock quantities and adjust supplier balance.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={() => setDeleteTargetId(null)} variant="outline" className="w-full text-xs">
                Keep Order
              </Button>
              <Button onClick={handleDeletePurchase} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs">
                Reverse Stock & Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
      </div>
    </FeatureLockOverlay>
  );
}
