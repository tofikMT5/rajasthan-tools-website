'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { X, ArrowDownRight, ArrowUpRight, Calculator, Check, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { formatKWD, formatKWDNum } from '@/lib/utils';
import { kwdToWordsEn, kwdToWordsAr } from '@/lib/amount-to-words';
import { toast } from 'sonner';

interface VoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (savedVoucher?: any, printImmediately?: boolean) => void;
  initialVoucher?: any;
  defaultType?: 'PAYMENT' | 'RECEIPT';
  currentBalance?: number;
}

const COMMON_CATEGORIES = [
  'Stationery',
  'Transport / Fuel',
  'Tea / Refreshments',
  'Office Maintenance',
  'Hardware Supplies',
  'Courier / Delivery',
  'Cash Replenishment',
  'Other',
];

export function VoucherModal({
  isOpen,
  onClose,
  onSuccess,
  initialVoucher,
  defaultType = 'PAYMENT',
  currentBalance = 0,
}: VoucherModalProps) {
  const { data: session } = useSession();

  const isEditing = Boolean(initialVoucher?.id);
  const [type, setType] = useState<'PAYMENT' | 'RECEIPT'>(defaultType);
  const [voucherNo, setVoucherNo] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidTo, setPaidTo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('Cash');
  const [category, setCategory] = useState('Stationery');
  const [customCategory, setCustomCategory] = useState('');
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<string>('');
  const [preparedBy, setPreparedBy] = useState('');
  const [approvedBy, setApprovedBy] = useState('Dinesh');
  const [receivedBy, setReceivedBy] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingNo, setIsLoadingNo] = useState(false);

  // Fetch next sequential voucher number when modal opens in create mode or type changes
  const fetchNextNo = async (targetType: string) => {
    try {
      setIsLoadingNo(true);
      const res = await fetch(`/api/petty-cash/next-no?type=${targetType}`);
      const data = await res.json();
      if (data && data.nextVoucherNo) {
        setVoucherNo(data.nextVoucherNo);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingNo(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      if (initialVoucher) {
        setType(initialVoucher.type || 'PAYMENT');
        setVoucherNo(initialVoucher.voucherNo || '');
        setDate(initialVoucher.date ? new Date(initialVoucher.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
        setPaidTo(initialVoucher.paidTo || '');
        setPaymentMethod(initialVoucher.paymentMethod || 'Cash');
        const cat = initialVoucher.category || 'Stationery';
        if (COMMON_CATEGORIES.includes(cat)) {
          setCategory(cat);
          setCustomCategory('');
        } else {
          setCategory('Other');
          setCustomCategory(cat);
        }
        setDescription(initialVoucher.description || '');
        setAmount(String(Number(initialVoucher.amount) || ''));
        setPreparedBy(initialVoucher.preparedBy || '');
        setApprovedBy(initialVoucher.approvedBy || 'Dinesh');
        setReceivedBy(initialVoucher.receivedBy || '');
      } else {
        const initialT = defaultType || 'PAYMENT';
        setType(initialT);
        setDate(new Date().toISOString().split('T')[0]);
        setPaidTo('');
        setPaymentMethod('Cash');
        setCategory(initialT === 'RECEIPT' ? 'Cash Replenishment' : 'Stationery');
        setCustomCategory('');
        setDescription('');
        setAmount('');
        const userName = (session?.user as any)?.name || 'Admin';
        setPreparedBy(userName);
        setApprovedBy('Dinesh');
        setReceivedBy('');
        fetchNextNo(initialT);
      }
    }
  }, [isOpen, initialVoucher, defaultType, session]);

  if (!isOpen) return null;

  const numAmount = parseFloat(amount) || 0;
  const projectedBalance = type === 'RECEIPT' ? currentBalance + numAmount : currentBalance - numAmount;

  const handleTypeChange = (newType: 'PAYMENT' | 'RECEIPT') => {
    setType(newType);
    if (!isEditing) {
      fetchNextNo(newType);
      if (newType === 'RECEIPT' && category === 'Stationery') {
        setCategory('Cash Replenishment');
      } else if (newType === 'PAYMENT' && category === 'Cash Replenishment') {
        setCategory('Stationery');
      }
    }
  };

  const handleSubmit = async (printImmediately = false) => {
    const finalAmount = parseFloat(amount);
    if (isNaN(finalAmount) || finalAmount <= 0) {
      toast.error('Please enter a valid amount in KD');
      return;
    }

    if (!paidTo.trim()) {
      toast.error(type === 'RECEIPT' ? 'Please enter Received From name' : 'Please enter Paid To name');
      return;
    }

    const finalCategory = category === 'Other' ? (customCategory.trim() || 'Other') : category;
    if (!finalCategory) {
      toast.error('Please select or enter an expense category');
      return;
    }

    try {
      setIsSubmitting(true);
      const payload = {
        voucherNo: voucherNo.trim(),
        date: new Date(date).toISOString(),
        type,
        paidTo: paidTo.trim(),
        paymentMethod,
        category: finalCategory,
        description: description.trim(),
        amount: finalAmount,
        preparedBy: preparedBy.trim() || null,
        approvedBy: approvedBy.trim() || null,
        receivedBy: receivedBy.trim() || null,
      };

      const url = isEditing ? `/api/petty-cash/${initialVoucher.id}` : '/api/petty-cash';
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to save voucher');
      }

      toast.success(isEditing ? 'Petty cash voucher updated successfully!' : 'Petty cash voucher created successfully!');
      onSuccess(data.voucher, printImmediately);
      onClose();
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white uppercase tracking-wide">
              {isEditing ? 'Edit Petty Cash Voucher' : 'Petty Cash Voucher – Screen Format'}
            </h2>
            <p className="text-xs text-orange-600 dark:text-orange-400 font-semibold mt-0.5">
              RT Billing POS Software • {type === 'PAYMENT' ? 'Payment (Cash Out)' : 'Receipt (Cash In)'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Voucher Type Tabs (Payment vs Receipt) */}
        <div className="p-4 bg-slate-100/70 dark:bg-slate-950/50 border-b border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => handleTypeChange('PAYMENT')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs transition-all ${
              type === 'PAYMENT'
                ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <ArrowDownRight className="w-4 h-4" />
            Cash Paid / Expense (PCV)
          </button>
          <button
            type="button"
            onClick={() => handleTypeChange('RECEIPT')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl font-bold text-xs transition-all ${
              type === 'RECEIPT'
                ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-50 border border-slate-200 dark:border-slate-800'
            }`}
          >
            <ArrowUpRight className="w-4 h-4" />
            Cash Received / Replenish (PCR)
          </button>
        </div>

        {/* Form Body - Exactly matching Image 1 */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit(false);
          }}
          className="p-6 space-y-4 text-xs"
        >
          {/* Row 1: Voucher No & Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Voucher No. <span className="text-orange-500">*</span>
              </label>
              <Input
                value={voucherNo}
                onChange={(e) => setVoucherNo(e.target.value)}
                placeholder="PCV-0001"
                required
                className="font-mono font-bold text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Date <span className="text-orange-500">*</span>
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="font-mono text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700"
              />
            </div>
          </div>

          {/* Row 2: Paid To / Received From & Payment Method */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                {type === 'RECEIPT' ? 'Received From *' : 'Paid To *'}
              </label>
              <Input
                value={paidTo}
                onChange={(e) => setPaidTo(e.target.value)}
                placeholder="Enter name"
                required
                className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700"
              />
            </div>
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">Payment Method</label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full h-9 rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 px-3 text-xs outline-none text-slate-900 dark:text-white font-semibold"
              >
                <option value="Cash">Cash (نقدي)</option>
                <option value="K-Net">K-Net (كي نت)</option>
                <option value="Bank Transfer">Bank Transfer (تحويل بنكي)</option>
                <option value="Cheque">Cheque (شيك)</option>
              </select>
            </div>
          </div>

          {/* Row 3: Expense Category */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Expense Category <span className="text-orange-500">*</span>
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {COMMON_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => {
                    setCategory(cat);
                    if (cat !== 'Other') setCustomCategory('');
                  }}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all ${
                    category === cat
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
            {category === 'Other' && (
              <Input
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="Type custom expense category..."
                className="mt-1 text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700"
              />
            )}
          </div>

          {/* Row 4: Description / Particulars */}
          <div>
            <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Description / Particulars
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter expense details here..."
              rows={2}
              className="w-full rounded-md border border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 p-2.5 text-xs outline-none text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-blue-500 resize-none"
            />
          </div>

          {/* Row 5: Amount (KD) & Cash Balance (KD) */}
          <div className="grid grid-cols-2 gap-4 p-3.5 rounded-xl bg-orange-50/70 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900/40">
            <div>
              <label className="font-bold text-orange-900 dark:text-orange-300 block mb-1">
                Amount (KD) <span className="text-orange-500">*</span>
              </label>
              <Input
                type="number"
                step="0.001"
                min="0.001"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="5.000"
                required
                className="font-mono font-black text-base text-orange-600 dark:text-orange-400 bg-white dark:bg-slate-900 border-orange-300 dark:border-orange-800"
              />
            </div>
            <div>
              <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Estimated Balance (KD)
              </label>
              <div className="h-9 px-3 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 flex items-center justify-between font-mono font-black text-base text-emerald-600 dark:text-emerald-400">
                <span>{formatKWDNum(projectedBalance)}</span>
                <span className="text-xs font-sans text-slate-500">KD</span>
              </div>
            </div>
          </div>

          {/* In Words Preview */}
          {numAmount > 0 && (
            <div className="p-2.5 bg-slate-50 dark:bg-slate-950 rounded-lg text-[10px] space-y-0.5 border border-slate-200 dark:border-slate-800">
              <p className="text-slate-600 dark:text-slate-400">
                <span className="font-bold text-slate-800 dark:text-slate-200">In Words:</span> {kwdToWordsEn(numAmount)}
              </p>
              <p className="text-slate-600 dark:text-slate-400 font-arabic text-right dir-rtl">
                <span className="font-bold text-slate-800 dark:text-slate-200">فقط وقدره:</span> {kwdToWordsAr(numAmount)}
              </p>
            </div>
          )}

          {/* Row 6: Prepared By, Approved By, Received By */}
          <div className="grid grid-cols-3 gap-3 pt-1">
            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">Prepared By</label>
              <Input
                value={preparedBy}
                onChange={(e) => setPreparedBy(e.target.value)}
                placeholder="Cashier"
                className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 h-8 text-[11px]"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">Approved By</label>
              <Input
                value={approvedBy}
                onChange={(e) => setApprovedBy(e.target.value)}
                placeholder="Dinesh"
                className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 h-8 text-[11px]"
              />
            </div>
            <div>
              <label className="font-semibold text-slate-600 dark:text-slate-400 block mb-1">Received By</label>
              <Input
                value={receivedBy}
                onChange={(e) => setReceivedBy(e.target.value)}
                placeholder={paidTo || 'Receiver'}
                className="text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 h-8 text-[11px]"
              />
            </div>
          </div>

          {/* Bottom Action Buttons */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200 dark:border-slate-800">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isSubmitting}
              className="border-slate-300 text-slate-700 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-300"
            >
              Cancel
            </Button>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold"
              >
                Save & Print
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold"
              >
                {isSubmitting ? 'Saving...' : isEditing ? 'Update Voucher' : 'Save Voucher'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
