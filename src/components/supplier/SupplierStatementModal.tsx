'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  FileText,
  X,
  Printer,
  Calendar,
  Building2,
  ExternalLink,
  CreditCard,
  ShoppingBag,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { formatKWD, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { SupplierStatementPrint } from './supplier-statement-print';

interface SupplierStatementModalProps {
  isOpen: boolean;
  onClose: () => void;
  supplierId?: string;
  initialPreset?: 'all' | 'this_month' | 'last_month' | 'last_2_months' | 'last_30_days';
}

export function SupplierStatementModal({
  isOpen,
  onClose,
  supplierId,
  initialPreset = 'last_2_months',
}: SupplierStatementModalProps) {
  const [activePreset, setActivePreset] = useState<string>(initialPreset);
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && supplierId) {
      applyPreset(initialPreset);
    }
  }, [isOpen, supplierId]);

  const applyPreset = (preset: string) => {
    setActivePreset(preset);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    let fromStr = '';
    const toStr = todayStr;

    if (preset === 'all') {
      fromStr = '2025-01-01';
    } else if (preset === 'this_month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      fromStr = startOfMonth.toISOString().split('T')[0];
    } else if (preset === 'last_month') {
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
      fromStr = startOfLastMonth.toISOString().split('T')[0];
      setFromDate(fromStr);
      setToDate(endOfLastMonth.toISOString().split('T')[0]);
      fetchStatement(fromStr, endOfLastMonth.toISOString().split('T')[0]);
      return;
    } else if (preset === 'last_2_months') {
      const d = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
      fromStr = d.toISOString().split('T')[0];
    } else if (preset === 'last_30_days') {
      const d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      fromStr = d.toISOString().split('T')[0];
    }

    setFromDate(fromStr);
    setToDate(toStr);
    fetchStatement(fromStr, toStr);
  };

  const fetchStatement = async (fromVal: string, toVal: string) => {
    if (!supplierId) return;
    try {
      setIsLoading(true);
      const url = new URL(`/api/suppliers/${supplierId}/statement`, window.location.origin);
      if (fromVal) url.searchParams.append('from', fromVal);
      if (toVal) url.searchParams.append('to', toVal);

      const res = await fetch(url.toString());
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        toast.error('Failed to load supplier statement');
      }
    } catch (e) {
      toast.error('Error fetching statement data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCustomDateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActivePreset('custom');
    fetchStatement(fromDate, toDate);
  };

  const handlePrint = () => {
    setTimeout(() => {
      window.print();
    }, 300);
  };

  if (!isOpen) return null;

  const supplier = data?.supplier;
  const summary = data?.summary;
  const purchases = data?.purchases || [];

  return (
    <>
      {/* HIDDEN PRINT CONTAINER */}
      <div className="hidden print:block fixed inset-0 z-[9999] bg-white">
        {data && <SupplierStatementPrint data={data} />}
      </div>

      {/* REGULAR MODAL UI */}
      <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto no-print">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-5xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans">
          
          {/* Top Header */}
          <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-950/60 shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-500/10 text-orange-600 dark:text-orange-400 flex items-center justify-center font-bold">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <span>Supplier Account Statement</span>
                  {supplier && (
                    <Badge variant="outline" className="text-xs font-mono font-bold text-orange-600 border-orange-300">
                      {supplier.name}
                    </Badge>
                  )}
                </h2>
                <p className="text-xs text-slate-500 font-arabic">
                  كشف حساب المورد وتوريدات البضائع والمدفوعات والمبالغ المتبقية
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={handlePrint}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs gap-1.5 h-9 rounded-xl shadow-sm"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Date Range Selector & Presets */}
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shrink-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              
              {/* Preset Toggle Pills */}
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-semibold">
                <span className="text-slate-400 text-[11px] font-bold uppercase mr-1">Period:</span>
                <button
                  type="button"
                  onClick={() => applyPreset('last_2_months')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    activePreset === 'last_2_months'
                      ? 'bg-orange-500 text-white font-bold shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  Last 2 Months (آخر شهرين)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('this_month')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    activePreset === 'this_month'
                      ? 'bg-orange-500 text-white font-bold shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  This Month (هذا الشهر)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('last_month')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    activePreset === 'last_month'
                      ? 'bg-orange-500 text-white font-bold shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  Last Month (الشهر الماضي)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('last_30_days')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    activePreset === 'last_30_days'
                      ? 'bg-orange-500 text-white font-bold shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  Last 30 Days (30 يوم)
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset('all')}
                  className={`px-3 py-1.5 rounded-xl transition-all ${
                    activePreset === 'all'
                      ? 'bg-orange-500 text-white font-bold shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  All Time (الكل)
                </button>
              </div>

              {/* Custom Date Form */}
              <form onSubmit={handleCustomDateSubmit} className="flex items-center gap-2">
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400 text-[11px]">From:</span>
                  <Input
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    className="h-8 text-xs font-mono w-32"
                  />
                </div>
                <div className="flex items-center gap-1.5 text-xs">
                  <span className="text-slate-400 text-[11px]">To:</span>
                  <Input
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    className="h-8 text-xs font-mono w-32"
                  />
                </div>
                <Button type="submit" size="sm" variant="secondary" className="h-8 text-xs font-bold">
                  Filter
                </Button>
              </form>
            </div>
          </div>

          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {isLoading ? (
              <div className="py-20 text-center text-slate-400 space-y-2">
                <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-xs font-semibold">Generating supplier statement...</p>
              </div>
            ) : !data ? (
              <div className="py-20 text-center text-slate-400">
                <p className="text-sm font-semibold">No statement data found.</p>
              </div>
            ) : (
              <>
                {/* Supplier Bio Bar */}
                {supplier && (
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white font-black text-xl flex items-center justify-center shadow-md">
                        {supplier.name[0]}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
                          {supplier.name}
                        </h3>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          Phone: <span className="font-bold text-slate-700 dark:text-slate-300">{supplier.phone || 'No phone recorded'}</span>
                          {supplier.address && ` • Address: ${supplier.address}`}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                        <span className="text-[10px] uppercase font-bold text-slate-400 block">
                          Current Outstanding Balance
                        </span>
                        <span className="text-lg font-black font-mono text-rose-600">
                          {formatKWD(summary?.currentSupplierBalance || 0)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* 4 Financial Highlight Cards */}
                {summary && (
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Intake Orders
                      </span>
                      <span className="text-xl font-black font-mono text-slate-900 dark:text-white mt-1 block">
                        {summary.purchasesCount} Orders
                      </span>
                      <span className="text-[10px] text-slate-400 font-arabic block">
                        {summary.paidPurchasesCount} مدفوع • {summary.unpaidPurchasesCount} آجل
                      </span>
                    </div>

                    <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                      <span className="text-[10px] font-bold uppercase text-slate-400 block">
                        Total Purchases (Net)
                      </span>
                      <span className="text-xl font-black font-mono text-orange-600 mt-1 block">
                        {formatKWD(summary.totalPurchases)}
                      </span>
                      <span className="text-[10px] text-slate-400 font-arabic block">إجمالي قيمة التوريدات</span>
                    </div>

                    <div className="p-4 rounded-2xl border border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20">
                      <span className="text-[10px] font-bold uppercase text-emerald-700 dark:text-emerald-300 block">
                        Total Amount Paid
                      </span>
                      <span className="text-xl font-black font-mono text-emerald-600 mt-1 block">
                        {formatKWD(summary.totalPaid)}
                      </span>
                      <span className="text-[10px] text-emerald-600/80 font-arabic block">المبلغ المسدد للمورد</span>
                    </div>

                    <div className="p-4 rounded-2xl border border-rose-500/30 bg-rose-50/20 dark:bg-rose-950/20">
                      <span className="text-[10px] font-bold uppercase text-rose-700 dark:text-rose-300 block">
                        Balance Remaining Due
                      </span>
                      <span className="text-xl font-black font-mono text-rose-600 mt-1 block">
                        {formatKWD(summary.totalDue)}
                      </span>
                      <span className="text-[10px] text-rose-600/80 font-arabic block">المبلغ المتبقي للمورد</span>
                    </div>
                  </div>
                )}

                {/* Payment Breakdown Bar */}
                {summary && (
                  <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-slate-600 dark:text-slate-400 flex items-center gap-1.5 text-xs">
                      <CreditCard className="w-4 h-4 text-orange-500" />
                      <span>Payment Breakdown / تفاصيل السداد:</span>
                    </span>
                    <div className="flex flex-wrap items-center gap-2 font-mono text-xs">
                      {summary.paymentModes['Cash'] > 0 && (
                        <Badge variant="outline" className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
                          Cash: <strong className="ml-1 text-slate-900 dark:text-white">{formatKWD(summary.paymentModes['Cash'])}</strong>
                        </Badge>
                      )}
                      {summary.paymentModes['K-Net'] > 0 && (
                        <Badge variant="outline" className="bg-blue-50/50 dark:bg-blue-950/40 border-blue-200 text-blue-700 dark:text-blue-300">
                          K-Net: <strong className="ml-1">{formatKWD(summary.paymentModes['K-Net'])}</strong>
                        </Badge>
                      )}
                      {summary.paymentModes['Visa / Card'] > 0 && (
                        <Badge variant="outline" className="bg-indigo-50/50 dark:bg-indigo-950/40 border-indigo-200 text-indigo-700 dark:text-indigo-300">
                          Card: <strong className="ml-1">{formatKWD(summary.paymentModes['Visa / Card'])}</strong>
                        </Badge>
                      )}
                      {summary.paymentModes['Cheque'] > 0 && (
                        <Badge variant="outline" className="bg-amber-50/50 dark:bg-amber-950/40 border-amber-200 text-amber-700 dark:text-amber-300">
                          Cheque: <strong className="ml-1">{formatKWD(summary.paymentModes['Cheque'])}</strong>
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Purchases List Table */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-orange-500" />
                      <span>Purchase Orders in Period ({purchases.length})</span>
                    </h4>
                    <span className="text-[11px] text-slate-400 font-medium">Chronological order</span>
                  </div>

                  <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                        <tr>
                          <th className="p-3 pl-4">Date</th>
                          <th className="p-3">Purchase #</th>
                          <th className="p-3">Payment Mode</th>
                          <th className="p-3 text-center">Status</th>
                          <th className="p-3 text-right">Total Amount</th>
                          <th className="p-3 text-right">Paid Amount</th>
                          <th className="p-3 text-right">Due Balance</th>
                          <th className="p-3 pr-4 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                        {purchases.length === 0 ? (
                          <tr>
                            <td colSpan={8} className="p-8 text-center text-slate-400 text-xs">
                              No purchase orders found for this supplier in the selected date range.
                            </td>
                          </tr>
                        ) : (
                          purchases.map((p: any) => (
                            <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                              <td className="p-3 pl-4 font-mono text-slate-500">{formatDate(p.date)}</td>
                              <td className="p-3 font-mono font-bold text-orange-600">{p.purchaseNo}</td>
                              <td className="p-3 font-mono text-[11px] text-slate-600 dark:text-slate-400">
                                {p.paymentMethod}
                              </td>
                              <td className="p-3 text-center">
                                <Badge
                                  variant={
                                    p.status === 'PAID'
                                      ? 'success'
                                      : p.status === 'PARTIAL'
                                      ? 'warning'
                                      : 'destructive'
                                  }
                                  className="text-[10px]"
                                >
                                  {p.status}
                                </Badge>
                              </td>
                              <td className="p-3 text-right font-mono font-bold text-slate-900 dark:text-white">
                                {formatKWD(p.totalAmount)}
                              </td>
                              <td className="p-3 text-right font-mono font-bold text-emerald-600">
                                {formatKWD(p.paidAmount)}
                              </td>
                              <td className="p-3 text-right font-mono font-bold text-rose-600">
                                {formatKWD(p.dueAmount)}
                              </td>
                              <td className="p-3 pr-4 text-right">
                                <Link href={`/purchases/${p.id}`} target="_blank">
                                  <Button size="sm" variant="ghost" className="h-7 text-xs text-blue-600 gap-1 hover:bg-blue-50">
                                    View <ExternalLink className="w-3 h-3" />
                                  </Button>
                                </Link>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Modal Footer */}
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex items-center justify-between shrink-0">
            <span className="text-xs text-slate-500">
              Period: <strong className="font-mono text-slate-700 dark:text-slate-300">{fromDate || 'Start'}</strong> to{' '}
              <strong className="font-mono text-slate-700 dark:text-slate-300">{toDate || 'Today'}</strong>
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onClose} className="text-xs font-bold">
                Close
              </Button>
              <Button
                type="button"
                onClick={handlePrint}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print / Save PDF
              </Button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
