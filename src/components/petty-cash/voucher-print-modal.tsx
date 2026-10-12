'use client';

import React from 'react';
import { Printer, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { formatKWD, formatKWDNum, formatDate } from '@/lib/utils';
import { kwdToWordsEn, kwdToWordsAr } from '@/lib/amount-to-words';

interface VoucherPrintModalProps {
  voucher: any;
  isOpen: boolean;
  onClose: () => void;
}

export function VoucherPrintModal({ voucher, isOpen, onClose }: VoucherPrintModalProps) {
  if (!isOpen || !voucher) return null;

  const isReceipt = voucher.type === 'RECEIPT';
  const voucherTitle = isReceipt ? 'PETTY CASH RECEIPT VOUCHER' : 'PETTY CASH PAYMENT VOUCHER';
  const voucherTitleAr = isReceipt ? 'سند قبض صندوق المصروفات النثرية' : 'سند صرف صندوق المصروفات النثرية';
  const partyLabel = isReceipt ? 'Received From' : 'Paid To';
  const partyLabelAr = isReceipt ? 'استلم من' : 'صرف إلى';

  const amountNumber = Number(voucher.amount) || 0;
  const runningBalanceNumber = Number(voucher.runningBalance) || 0;
  const amountWordsEn = kwdToWordsEn(amountNumber);
  const amountWordsAr = kwdToWordsAr(amountNumber);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          body * {
            visibility: hidden;
          }
          #petty-cash-printable-voucher, #petty-cash-printable-voucher * {
            visibility: visible;
          }
          #petty-cash-printable-voucher {
            position: absolute;
            left: 0;
            top: 0;
            width: 100% !important;
            margin: 0 !important;
            padding: 20mm !important;
            box-shadow: none !important;
            border: 2px solid #000 !important;
            background: white !important;
            color: black !important;
          }
          .no-print {
            display: none !important;
          }
          @page {
            size: A4 portrait;
            margin: 10mm;
          }
        }
      `}} />

      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden my-auto">
        {/* Modal Action Header (hidden on print) */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 no-print">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-900 dark:text-white text-base">Voucher Preview & Print</span>
            <span className="text-xs font-mono bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300 px-2 py-0.5 rounded font-bold">
              {voucher.voucherNo}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2 text-xs h-9">
              <Printer className="w-4 h-4" /> Print Voucher
            </Button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Area - Exactly Replicating Screen Format in Image 1 */}
        <div className="p-8 bg-slate-100 dark:bg-slate-950 flex justify-center">
          <div
            id="petty-cash-printable-voucher"
            className="w-full bg-white text-slate-900 p-8 rounded-xl shadow-lg border-2 border-slate-300 font-sans text-xs space-y-6"
          >
            {/* Header */}
            <div className="text-center pb-4 border-b-2 border-slate-800">
              <h1 className="text-xl sm:text-2xl font-black tracking-wider text-slate-950 uppercase">
                {voucherTitle}
              </h1>
              <p className="text-sm font-semibold text-slate-700 font-arabic mt-0.5">{voucherTitleAr}</p>
              <p className="text-xs font-bold text-orange-600 uppercase tracking-widest mt-1">
                RT Billing POS Software
              </p>
              <p className="text-[11px] text-slate-500 font-medium">
                Rajasthan Retail Co. for Woodworking and Blacksmithing Tools • Kuwait
              </p>
            </div>

            {/* Row 1: Voucher No & Date */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Voucher No.</label>
                <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-sm text-slate-900">
                  {voucher.voucherNo}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</label>
                <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-medium text-sm text-slate-900">
                  {voucher.date ? new Date(voucher.date).toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) : '-'}
                </div>
              </div>
            </div>

            {/* Row 2: Paid To / Received From & Payment Method */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {partyLabel} <span className="font-arabic font-normal text-slate-400">({partyLabelAr})</span>
                </label>
                <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-sm text-slate-900">
                  {voucher.paidTo || '-'}
                </div>
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Payment Method</label>
                <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-bold text-sm text-slate-900">
                  {voucher.paymentMethod || 'Cash'}
                </div>
              </div>
            </div>

            {/* Row 3: Expense Category */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Expense Category</label>
              <div className="p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-sm text-slate-900 flex items-center justify-between">
                <span>{voucher.category}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700 font-bold uppercase">
                  {isReceipt ? 'Cash In' : 'Cash Out'}
                </span>
              </div>
            </div>

            {/* Row 4: Description / Particulars */}
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Description / Particulars</label>
              <div className="p-3 bg-slate-50 border border-slate-300 rounded-lg text-sm text-slate-900 min-h-[70px] leading-relaxed whitespace-pre-wrap">
                {voucher.description || 'No particulars entered'}
              </div>
            </div>

            {/* Row 5: Amount (KD) & Cash Balance (KD) */}
            <div className="grid grid-cols-2 gap-6 p-4 rounded-xl bg-orange-50/50 border border-orange-200">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-orange-800 uppercase tracking-wider">Amount (KD)</label>
                <div className="text-2xl font-black font-mono text-orange-600">
                  {formatKWDNum(amountNumber)} <span className="text-xs font-bold text-slate-600 font-sans">KD</span>
                </div>
              </div>
              <div className="space-y-1 text-right">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Cash Balance (KD)</label>
                <div className="text-2xl font-black font-mono text-emerald-600">
                  {formatKWDNum(runningBalanceNumber)} <span className="text-xs font-bold text-slate-600 font-sans">KD</span>
                </div>
              </div>
            </div>

            {/* Amount in Words */}
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] space-y-1">
              <p className="font-semibold text-slate-800">
                <span className="text-slate-500 font-bold">In Words (EN): </span> {amountWordsEn}
              </p>
              <p className="font-semibold text-slate-800 font-arabic text-right dir-rtl">
                <span className="text-slate-500 font-bold">فقط وقدره: </span> {amountWordsAr}
              </p>
            </div>

            {/* Signatures Section - As shown at bottom of Image 1 */}
            <div className="pt-8 border-t border-slate-300 grid grid-cols-3 gap-6 text-center">
              <div className="space-y-4">
                <div className="border-b border-dashed border-slate-400 pb-1 min-h-[30px] font-semibold text-slate-800">
                  {voucher.preparedBy || 'Store Cashier'}
                </div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Prepared By
                </div>
              </div>
              <div className="space-y-4">
                <div className="border-b border-dashed border-slate-400 pb-1 min-h-[30px] font-semibold text-slate-800">
                  {voucher.approvedBy || 'Dinesh / Manager'}
                </div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Approved By
                </div>
              </div>
              <div className="space-y-4">
                <div className="border-b border-dashed border-slate-400 pb-1 min-h-[30px] font-semibold text-slate-800">
                  {voucher.receivedBy || voucher.paidTo || 'Receiver'}
                </div>
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Received By
                </div>
              </div>
            </div>

            {/* Footer timestamp */}
            <div className="pt-2 text-center text-[9px] text-slate-400 font-mono">
              Generated on {new Date().toLocaleString('en-GB')} • RT Billing System Kuwait
            </div>
          </div>
        </div>

        {/* Modal Bottom Buttons */}
        <div className="p-4 bg-slate-50 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 no-print">
          <Button variant="outline" onClick={onClose} className="border-slate-300 text-slate-700 bg-white hover:bg-slate-100 dark:bg-slate-900 dark:text-slate-300">
            Close
          </Button>
          <Button onClick={handlePrint} className="bg-orange-500 hover:bg-orange-600 text-white font-bold gap-2">
            <Printer className="w-4 h-4" /> Print Voucher
          </Button>
        </div>
      </div>
    </div>
  );
}
