'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FileText, Search, Printer, Eye, MessageSquare, Plus, Calendar, Filter, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatKWD, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { useSearchStore } from '@/stores/search-store';
import { FeatureLockOverlay } from '@/components/shared/FeatureLockOverlay';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [localSearch, setLocalSearch] = useState('');
  const { globalSearch } = useSearchStore();
  const search = localSearch || globalSearch;
  
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
    const interval = setInterval(fetchToggles, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchInvoices = async () => {
    try {
      setIsLoading(true);
      const url = new URL('/api/invoices', window.location.origin);
      if (search) url.searchParams.append('search', search);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (Array.isArray(data)) setInvoices(data);
    } catch (e) {
      toast.error('Failed to load invoices');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchInvoices();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const handleDeleteInvoice = async () => {
    if (!deleteTargetId) return;
    try {
      const res = await fetch(`/api/invoices/${deleteTargetId}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        toast.success('Invoice deleted & stock restored successfully!');
        setDeleteTargetId(null);
        fetchInvoices();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to delete invoice');
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <FeatureLockOverlay isLocked={Boolean(toggles && !toggles.enableInvoices)}>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-blue-600" /> Sales & Billing Invoices
          </h1>
          <p className="text-sm text-slate-500">History of all cash, credit, and quotation invoices.</p>
        </div>
        <Link href="/pos">
          <Button className="bg-orange-500 hover:bg-orange-600 text-white font-bold gap-2">
            <Plus className="w-4 h-4" /> Create New Bill
          </Button>
        </Link>
      </div>

      {/* Search Bar */}
      <div className="flex items-center gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <Input
            value={localSearch}
            onChange={(e) => setLocalSearch(e.target.value)}
            placeholder="Search by Bill No (e.g. 1005) or Customer name..."
            className="pl-10 h-10"
          />
        </div>
      </div>

      {/* Invoices Table */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-500">
                <tr>
                  <th className="p-3.5 pl-6">Bill No</th>
                  <th className="p-3.5">Date & Time</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Net Amount</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <td className="p-3.5 pl-6 font-mono font-bold text-blue-600">RT-{inv.invoiceNo}</td>
                    <td className="p-3.5 text-slate-500 font-mono">{formatDate(inv.dateTime)}</td>
                    <td className="p-3.5 font-bold text-slate-900 dark:text-white">{inv.customerNameSnap}</td>
                    <td className="p-3.5">
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {inv.type}
                      </Badge>
                    </td>
                    <td className="p-3.5 font-mono font-extrabold text-slate-900 dark:text-white">
                      {formatKWD(inv.netAmount)}
                    </td>
                    <td className="p-3.5">
                      <Badge variant={inv.status === 'PAID' ? 'success' : 'warning'}>{inv.status}</Badge>
                    </td>
                    <td className="p-3.5 pr-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link href={`/invoices/${inv.id}`}>
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-blue-600 gap-1">
                            <Eye className="w-3.5 h-3.5" /> View
                          </Button>
                        </Link>
                        <Link href={`/invoices/${inv.id}?print=true`}>
                          <Button size="sm" variant="ghost" className="h-7 text-xs text-slate-500 hover:text-slate-900">
                            <Printer className="w-3.5 h-3.5" />
                          </Button>
                        </Link>
                        <Button
                          onClick={() => setDeleteTargetId(inv.id)}
                          size="sm"
                          variant="ghost"
                          className="h-7 text-xs text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
      </div>

      {/* CONFIRM DELETE MODAL WITH REVERSAL WARNING */}
      {deleteTargetId && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div className="text-center">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Sales Invoice?</h3>
              <p className="text-xs text-slate-500 mt-1">
                This action will automatically restore stock quantities and adjust customer balance.
              </p>
            </div>
            <div className="flex gap-2 pt-2">
              <Button onClick={() => setDeleteTargetId(null)} variant="outline" className="w-full text-xs">
                Keep Invoice
              </Button>
              <Button onClick={handleDeleteInvoice} className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-xs">
                Restore Stock & Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </FeatureLockOverlay>
  );
}
