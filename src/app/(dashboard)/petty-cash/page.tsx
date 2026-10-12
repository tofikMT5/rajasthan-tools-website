'use client';

import React, { useState, useEffect } from 'react';
import {
  Wallet,
  Plus,
  ArrowDownRight,
  ArrowUpRight,
  Search,
  Filter,
  Calendar,
  FileSpreadsheet,
  Printer,
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatKWD, formatKWDNum, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import { FeatureLockOverlay } from '@/components/shared/FeatureLockOverlay';
import { VoucherModal } from '@/components/petty-cash/voucher-modal';
import { VoucherPrintModal } from '@/components/petty-cash/voucher-print-modal';

export default function PettyCashPage() {
  const [vouchers, setVouchers] = useState<any[]>([]);
  const [summary, setSummary] = useState<any>({
    currentBalance: 0,
    totalCashIn: 0,
    totalCashOut: 0,
    totalCount: 0,
    filteredTotalIn: 0,
    filteredTotalOut: 0,
    filteredCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [dateRangePreset, setDateRangePreset] = useState('ALL');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState<'PAYMENT' | 'RECEIPT'>('PAYMENT');
  const [editingVoucher, setEditingVoucher] = useState<any>(null);

  // Print Preview Modal state
  const [printVoucher, setPrintVoucher] = useState<any>(null);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Delete state
  const [deleteTarget, setDeleteTarget] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // SaaS feature toggles
  const [toggles, setToggles] = useState<any>(null);

  useEffect(() => {
    const fetchToggles = () => {
      fetch('/api/saas')
        .then((res) => res.json())
        .then((data) => {
          if (data && data.success && data.toggles) setToggles(data.toggles);
        })
        .catch(() => {});
    };
    fetchToggles();
  }, []);

  // Compute date filters when preset changes
  const handleDatePresetChange = (preset: string) => {
    setDateRangePreset(preset);
    const now = new Date();
    if (preset === 'ALL') {
      setStartDate('');
      setEndDate('');
    } else if (preset === 'TODAY') {
      const todayStr = now.toISOString().split('T')[0];
      setStartDate(todayStr);
      setEndDate(todayStr);
    } else if (preset === 'THIS_WEEK') {
      const firstDay = new Date(now.setDate(now.getDate() - now.getDay()));
      const lastDay = new Date(now.setDate(now.getDate() - now.getDay() + 6));
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(lastDay.toISOString().split('T')[0]);
    } else if (preset === 'THIS_MONTH') {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setStartDate(firstDay.toISOString().split('T')[0]);
      setEndDate(lastDay.toISOString().split('T')[0]);
    }
  };

  const fetchVouchers = async () => {
    try {
      setIsLoading(true);
      const url = new URL('/api/petty-cash', window.location.origin);
      if (search.trim()) url.searchParams.append('search', search.trim());
      if (categoryFilter && categoryFilter !== 'ALL') url.searchParams.append('category', categoryFilter);
      if (typeFilter && typeFilter !== 'ALL') url.searchParams.append('type', typeFilter);
      if (startDate) url.searchParams.append('startDate', startDate);
      if (endDate) url.searchParams.append('endDate', endDate);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (res.ok) {
        setVouchers(data.vouchers || []);
        if (data.summary) setSummary(data.summary);
      } else {
        toast.error(data.error || 'Failed to load petty cash data');
      }
    } catch (e: any) {
      toast.error('Network error loading petty cash');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchVouchers();
    }, 250);
    return () => clearTimeout(timer);
  }, [search, categoryFilter, typeFilter, startDate, endDate]);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/petty-cash/${deleteTarget.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Voucher ${deleteTarget.voucherNo} deleted successfully`);
        setDeleteTarget(null);
        fetchVouchers();
      } else {
        toast.error(data.error || 'Failed to delete voucher');
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleExportExcel = () => {
    if (vouchers.length === 0) {
      toast.error('No vouchers to export');
      return;
    }

    try {
      const exportRows = vouchers.map((v) => ({
        'Date': new Date(v.date).toLocaleDateString('en-GB'),
        'Voucher No': v.voucherNo,
        'Type': v.type === 'RECEIPT' ? 'Cash Received (In)' : 'Cash Paid (Expense)',
        'Paid To / Received From': v.paidTo,
        'Payment Method': v.paymentMethod || 'Cash',
        'Expense Category': v.category,
        'Description / Particulars': v.description,
        'Cash Received (KD)': v.type === 'RECEIPT' ? Number(v.amount).toFixed(3) : '',
        'Cash Paid (KD)': v.type === 'PAYMENT' ? Number(v.amount).toFixed(3) : '',
        'Running Balance (KD)': Number(v.runningBalance).toFixed(3),
        'Prepared By': v.preparedBy || '',
        'Approved By': v.approvedBy || '',
        'Received By': v.receivedBy || '',
      }));

      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Petty Cash Register');
      XLSX.writeFile(workbook, `RT_Petty_Cash_Register_${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Petty cash register exported to Excel successfully!');
    } catch (e: any) {
      toast.error('Failed to export Excel: ' + e.message);
    }
  };

  const handlePrintRegister = () => {
    window.print();
  };

  const openCreateModal = (type: 'PAYMENT' | 'RECEIPT') => {
    setEditingVoucher(null);
    setModalType(type);
    setIsModalOpen(true);
  };

  const openEditModal = (voucher: any) => {
    setEditingVoucher(voucher);
    setModalType(voucher.type);
    setIsModalOpen(true);
  };

  const openPrintModal = (voucher: any) => {
    setPrintVoucher(voucher);
    setIsPrintModalOpen(true);
  };

  const handleModalSuccess = (savedVoucher?: any, printImmediately = false) => {
    fetchVouchers();
    if (printImmediately && savedVoucher) {
      setTimeout(() => {
        setPrintVoucher(savedVoucher);
        setIsPrintModalOpen(true);
      }, 200);
    }
  };

  return (
    <FeatureLockOverlay isLocked={Boolean(toggles && !toggles.enablePettyCash)}>
      {/* Print stylesheet for full register report */}
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: white !important;
            color: black !important;
          }
          #petty-cash-register-printable {
            width: 100% !important;
            margin: 0 !important;
            padding: 10mm !important;
          }
          table {
            border-collapse: collapse !important;
            width: 100% !important;
          }
          th, td {
            border: 1px solid #999 !important;
            padding: 6px !important;
            font-size: 10px !important;
          }
          @page {
            size: A4 landscape;
            margin: 8mm;
          }
        }
      `}} />

      <div className="space-y-6 max-w-7xl mx-auto pb-16 font-sans">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 no-print">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-500 flex items-center justify-center">
                <Wallet className="w-6 h-6" />
              </div>
              <span>Petty Cash Management</span>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-arabic">
                إدارة المصروفات النثرية
              </span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Record petty cash vouchers, track running cash balances, print payment vouchers, and export monthly statements.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              onClick={handleExportExcel}
              variant="outline"
              className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold gap-2 h-9 shadow-sm"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-600" /> Export Excel
            </Button>
            <Button
              onClick={handlePrintRegister}
              variant="outline"
              className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold gap-2 h-9 shadow-sm"
            >
              <Printer className="w-4 h-4 text-blue-600" /> Print Register
            </Button>
            <Button
              onClick={() => openCreateModal('RECEIPT')}
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold gap-2 h-9 shadow-md shadow-emerald-600/20"
            >
              <ArrowUpRight className="w-4 h-4" /> + Cash Replenish (In)
            </Button>
            <Button
              onClick={() => openCreateModal('PAYMENT')}
              className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold gap-2 h-9 shadow-md shadow-orange-500/20"
            >
              <ArrowDownRight className="w-4 h-4" /> + New Voucher (Out)
            </Button>
          </div>
        </div>

        {/* 4 Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 no-print">
          {/* 1. Cash Balance Card */}
          <Card className="border-emerald-200 dark:border-emerald-950 bg-gradient-to-br from-emerald-50/70 to-emerald-100/40 dark:from-emerald-950/30 dark:to-slate-900 shadow-sm relative overflow-hidden">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">
                  Cash Balance (In-Hand)
                </span>
                <span className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-600 dark:text-emerald-400">
                  <Wallet className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-emerald-700 dark:text-emerald-400 mt-2">
                {formatKWD(summary.currentBalance)}
              </div>
              <p className="text-[11px] text-emerald-600 dark:text-emerald-500 font-medium mt-1">
                Live available petty cash fund
              </p>
            </CardContent>
          </Card>

          {/* 2. Total Cash In / Received Card */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Cash Received</span>
                <span className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600">
                  <TrendingUp className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-blue-600 mt-2">
                {formatKWD(summary.totalCashIn)}
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-1">
                Opening balance + replenishments
              </p>
            </CardContent>
          </Card>

          {/* 3. Total Cash Paid / Expenses Card */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Cash Paid (Expenses)</span>
                <span className="p-1.5 rounded-lg bg-rose-500/10 text-rose-600">
                  <TrendingDown className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black font-mono text-rose-600 mt-2">
                {formatKWD(summary.totalCashOut)}
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-1">
                Stationery, tea, fuel, repairs, etc.
              </p>
            </CardContent>
          </Card>

          {/* 4. Total Vouchers Card */}
          <Card className="border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Vouchers</span>
                <span className="p-1.5 rounded-lg bg-orange-500/10 text-orange-600">
                  <RefreshCw className="w-4 h-4" />
                </span>
              </div>
              <div className="text-2xl font-black text-slate-900 dark:text-white mt-2">
                {summary.totalCount} <span className="text-xs font-normal text-slate-400">Entries</span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium mt-1">
                Showing {summary.filteredCount} filtered vouchers
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3 no-print">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by Voucher #, Payee, Description, Category..."
              className="pl-10 h-9 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Type Filter */}
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="ALL">All Types (الكل)</option>
              <option value="PAYMENT">Cash Paid / Expense</option>
              <option value="RECEIPT">Cash Received / In</option>
            </select>

            {/* Category Filter */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="ALL">All Categories</option>
              <option value="Stationery">Stationery</option>
              <option value="Transport / Fuel">Transport / Fuel</option>
              <option value="Tea / Refreshments">Tea / Refreshments</option>
              <option value="Office Maintenance">Office Maintenance</option>
              <option value="Cash Replenishment">Cash Replenishment</option>
              <option value="Other">Other</option>
            </select>

            {/* Date Preset Filter */}
            <select
              value={dateRangePreset}
              onChange={(e) => handleDatePresetChange(e.target.value)}
              className="h-9 px-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="THIS_WEEK">This Week</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="CUSTOM">Custom Range</option>
            </select>

            {/* Custom Date Pickers */}
            {dateRangePreset === 'CUSTOM' && (
              <div className="flex items-center gap-1.5">
                <Input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-9 w-32 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
                <span className="text-slate-400 text-xs">to</span>
                <Input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-9 w-32 text-xs bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800"
                />
              </div>
            )}
          </div>
        </div>

        {/* Printable Register Report Area (matching Image 2 ledger format) */}
        <div id="petty-cash-register-printable" className="space-y-4">
          {/* Header visible only on print */}
          <div className="hidden print:block text-center pb-3 border-b-2 border-slate-900">
            <h1 className="text-xl font-black uppercase tracking-wider text-slate-900">
              PETTY CASH REGISTER & EXPENSE LEDGER
            </h1>
            <p className="text-xs font-bold text-slate-600">RT Billing POS Software • Rajasthan Tools Q8 (Kuwait)</p>
            <p className="text-[10px] text-slate-500 font-mono mt-1">
              Generated: {new Date().toLocaleDateString('en-GB')} | Total Cash In: {formatKWD(summary.totalCashIn)} | Total Cash Out: {formatKWD(summary.totalCashOut)} | Closing Balance: {formatKWD(summary.currentBalance)}
            </p>
          </div>

          {/* Table Card */}
          <Card className="border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="p-3.5 pl-6">Date</th>
                      <th className="p-3.5">Voucher No</th>
                      <th className="p-3.5">Paid To / From</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5 min-w-[200px]">Description / Particulars</th>
                      <th className="p-3.5 text-right font-mono">Cash Received</th>
                      <th className="p-3.5 text-right font-mono">Cash Paid</th>
                      <th className="p-3.5 text-right font-mono">Balance (KD)</th>
                      <th className="p-3.5 pr-6 text-right no-print">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {isLoading ? (
                      <tr>
                        <td colSpan={9} className="p-8 text-center text-slate-400">
                          <div className="inline-block w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-2" />
                          <p>Loading petty cash records...</p>
                        </td>
                      </tr>
                    ) : vouchers.length === 0 ? (
                      <tr>
                        <td colSpan={9} className="p-12 text-center text-slate-400">
                          <Wallet className="w-10 h-10 mx-auto mb-3 text-slate-300 dark:text-slate-600" />
                          <p className="font-bold text-slate-700 dark:text-slate-300 text-sm">No Petty Cash Vouchers Found</p>
                          <p className="text-xs text-slate-400 mt-1">
                            Click <span className="text-orange-500 font-semibold">+ New Voucher</span> or <span className="text-emerald-600 font-semibold">+ Cash Replenish</span> to enter transactions.
                          </p>
                        </td>
                      </tr>
                    ) : (
                      vouchers.map((v) => {
                        const isReceipt = v.type === 'RECEIPT';
                        const amountNum = Number(v.amount) || 0;
                        const runningBal = Number(v.runningBalance) || 0;

                        return (
                          <tr
                            key={v.id}
                            className="hover:bg-slate-50/70 dark:hover:bg-slate-900/60 transition-colors"
                          >
                            {/* Date */}
                            <td className="p-3.5 pl-6 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                              {v.date ? new Date(v.date).toLocaleDateString('en-GB') : '-'}
                            </td>

                            {/* Voucher No */}
                            <td className="p-3.5 font-mono font-bold whitespace-nowrap">
                              <span
                                className={`px-2 py-0.5 rounded text-[11px] ${
                                  isReceipt
                                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800'
                                    : 'bg-orange-50 text-orange-700 dark:bg-orange-950/60 dark:text-orange-300 border border-orange-200 dark:border-orange-800'
                                }`}
                              >
                                {v.voucherNo}
                              </span>
                            </td>

                            {/* Paid To / Received From */}
                            <td className="p-3.5 font-bold text-slate-900 dark:text-white whitespace-nowrap">
                              {v.paidTo}
                            </td>

                            {/* Category */}
                            <td className="p-3.5 whitespace-nowrap">
                              <Badge variant="outline" className="text-[10px] font-semibold bg-slate-50 dark:bg-slate-950">
                                {v.category}
                              </Badge>
                            </td>

                            {/* Description / Particulars */}
                            <td className="p-3.5 text-slate-600 dark:text-slate-300 max-w-sm truncate">
                              {v.description || '-'}
                            </td>

                            {/* Cash Received (In) */}
                            <td className="p-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                              {isReceipt ? `+${formatKWDNum(amountNum)}` : '—'}
                            </td>

                            {/* Cash Paid (Out) */}
                            <td className="p-3.5 text-right font-mono font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                              {!isReceipt ? `-${formatKWDNum(amountNum)}` : '—'}
                            </td>

                            {/* Running Balance */}
                            <td className="p-3.5 text-right font-mono font-black text-slate-900 dark:text-white whitespace-nowrap">
                              <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100">
                                {formatKWDNum(runningBal)} KD
                              </span>
                            </td>

                            {/* Actions */}
                            <td className="p-3.5 pr-6 text-right whitespace-nowrap no-print">
                              <div className="flex items-center justify-end gap-1.5">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="View & Print Voucher"
                                  onClick={() => openPrintModal(v)}
                                  className="h-8 w-8 p-0 text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                                >
                                  <Eye className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Print Voucher Directly"
                                  onClick={() => openPrintModal(v)}
                                  className="h-8 w-8 p-0 text-slate-500 hover:text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/50"
                                >
                                  <Printer className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Edit Voucher"
                                  onClick={() => openEditModal(v)}
                                  className="h-8 w-8 p-0 text-slate-500 hover:text-amber-600 hover:bg-amber-50 dark:hover:bg-amber-950/50"
                                >
                                  <Edit className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Delete Voucher"
                                  onClick={() => setDeleteTarget(v)}
                                  className="h-8 w-8 p-0 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Voucher Create / Edit Modal */}
        <VoucherModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onSuccess={handleModalSuccess}
          initialVoucher={editingVoucher}
          defaultType={modalType}
          currentBalance={summary.currentBalance}
        />

        {/* Printable Single Voucher Modal */}
        <VoucherPrintModal
          isOpen={isPrintModalOpen}
          voucher={printVoucher}
          onClose={() => setIsPrintModalOpen(false)}
        />

        {/* Delete Confirmation Dialog */}
        {deleteTarget && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
              <div className="w-12 h-12 rounded-full bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="text-center">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Delete Voucher?</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Are you sure you want to delete voucher <span className="font-mono font-bold text-rose-600">{deleteTarget.voucherNo}</span> ({formatKWD(deleteTarget.amount)})?
                  The running cash balance will be recalculated.
                </p>
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={() => setDeleteTarget(null)}
                  disabled={isDeleting}
                  className="w-1/2 text-xs"
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="w-1/2 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs"
                >
                  {isDeleting ? 'Deleting...' : 'Yes, Delete'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </FeatureLockOverlay>
  );
}
