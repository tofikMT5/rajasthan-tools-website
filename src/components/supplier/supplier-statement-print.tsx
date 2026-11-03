'use client';

import React from 'react';
import { formatKWD, formatDate } from '@/lib/utils';
import { kwdToWordsEn, kwdToWordsAr } from '@/lib/amount-to-words';

interface SupplierStatementPrintProps {
  data: {
    supplier: {
      name: string;
      phone?: string;
      email?: string;
      address?: string;
      balance: number;
    };
    period: {
      from: string;
      to: string;
    };
    summary: {
      purchasesCount: number;
      paidPurchasesCount: number;
      unpaidPurchasesCount: number;
      totalGross: number;
      totalDiscount: number;
      totalPurchases: number;
      totalPaid: number;
      totalDue: number;
      currentSupplierBalance: number;
      paymentModes: Record<string, number>;
    };
    purchases: Array<{
      id: string;
      purchaseNo: string;
      date: string;
      status: string;
      paymentMethod: string;
      grossAmount: number;
      discountAmount: number;
      totalAmount: number;
      paidAmount: number;
      dueAmount: number;
      itemsCount: number;
      notes?: string;
    }>;
  };
}

export function SupplierStatementPrint({ data }: SupplierStatementPrintProps) {
  if (!data || !data.supplier) return null;

  const { supplier, period, summary, purchases } = data;
  const generatedAt = new Date().toLocaleString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className="printable-supplier-statement w-full max-w-[210mm] mx-auto bg-white text-slate-900 p-6 font-sans text-xs shadow-lg print:shadow-none print:p-0 print:m-0 border border-slate-200 print:border-none">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&family=Noto+Naskh+Arabic:wght@400;600;700&display=swap');
        .font-arabic {
          font-family: 'Noto Naskh Arabic', serif !important;
          line-height: 1.3;
        }
        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          body {
            background: white !important;
          }
          @page {
            size: A4 portrait;
            margin: 8mm;
          }
          .no-print, aside, nav, button, header {
            display: none !important;
          }
          .print-avoid-break {
            page-break-inside: avoid;
          }
          .printable-supplier-statement {
            height: auto !important;
            min-height: 100% !important;
            overflow: visible !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
          }
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
        }
      `}} />

      {/* 1. COMPANY HEADER & DOCUMENT TITLE */}
      <div className="border-b-2 border-slate-900 pb-4 mb-4">
        <div className="flex items-start justify-between">
          <div className="space-y-0.5">
            <h1 className="text-xl font-black tracking-tight text-slate-900">RAJASTHAN TOOLS Q8</h1>
            <p className="text-[11px] font-semibold text-slate-600">Hardware, Power Tools & Machinery Retail / Wholesale</p>
            <p className="text-[10px] text-slate-500">Shuwaikh Industrial Area 2, Street 22, Kuwait</p>
            <p className="text-[10px] font-mono text-slate-500">
              Tel: <span className="font-bold text-slate-700">+965 9099 7484</span> • Email: rajasthantools.q8@gmail.com
            </p>
          </div>

          <div className="text-right space-y-0.5 font-arabic">
            <h2 className="text-lg font-bold text-slate-900">شركة راجستان للأدوات والمعدات</h2>
            <p className="text-[11px] text-slate-600">تجارة الأدوات الصناعية ومعدات الورش ومواد البناء</p>
            <p className="text-[10px] text-slate-500">الشويخ الصناعية ٢، شارع ٢٢، الكويت</p>
            <p className="text-[10px] font-mono text-slate-500">هاتف: ٩٠٩٩٧٤٨٤ ٩٦٥+</p>
          </div>
        </div>

        {/* Big Banner Header */}
        <div className="mt-3 py-2 px-4 rounded-xl bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-black text-sm tracking-wider uppercase">SUPPLIER ACCOUNT STATEMENT</span>
            <span className="text-[10px] bg-orange-600 text-white px-2 py-0.5 rounded font-mono font-bold">
              {summary.purchasesCount} ORDERS
            </span>
          </div>
          <div className="text-right font-arabic">
            <span className="text-sm font-bold">كشف حساب المورد والمشتريات والمدفوعات</span>
          </div>
        </div>
      </div>

      {/* 2. SUPPLIER INFO & STATEMENT PERIOD */}
      <div className="grid grid-cols-2 gap-4 mb-4 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
        <div>
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Supplier Details / بيانات المورد</span>
          <div className="mt-1">
            <h3 className="text-sm font-black text-slate-900">{supplier.name}</h3>
            <p className="text-[11px] text-slate-600 mt-1 font-mono">
              Phone: <span className="font-bold text-slate-900">{supplier.phone || 'No phone recorded'}</span>
              {supplier.address && ` • Address: ${supplier.address}`}
            </p>
            {supplier.email && <p className="text-[10px] text-slate-500 font-mono">{supplier.email}</p>}
          </div>
        </div>

        <div className="text-right space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Statement Period / فترة الكشف</span>
          <div className="font-mono text-xs font-bold text-slate-900">
            From: <span className="text-orange-700">{period.from}</span> To: <span className="text-orange-700">{period.to}</span>
          </div>
          <div className="text-[10px] text-slate-500 font-mono">
            Generated: {generatedAt}
          </div>
          <div className="pt-1">
            <span className="text-[10px] text-slate-500 block">Supplier Outstanding Balance / الرصيد المستحق للمورد:</span>
            <span className="text-base font-black font-mono text-rose-600">
              {formatKWD(summary.currentSupplierBalance)}
            </span>
          </div>
        </div>
      </div>

      {/* 3. FINANCIAL SUMMARY KPI CARDS */}
      <div className="grid grid-cols-4 gap-2.5 mb-4">
        <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
          <span className="text-[9px] font-bold uppercase text-slate-400 block">Intake Orders</span>
          <span className="text-base font-black font-mono text-slate-900">{summary.purchasesCount} Orders</span>
          <span className="text-[9px] text-slate-400 font-arabic block">
            {summary.paidPurchasesCount} مدفوع • {summary.unpaidPurchasesCount} آجل
          </span>
        </div>

        <div className="p-2.5 rounded-lg border border-slate-200 bg-white">
          <span className="text-[9px] font-bold uppercase text-slate-400 block">Total Purchases (Net)</span>
          <span className="text-base font-black font-mono text-slate-900">{formatKWD(summary.totalPurchases)}</span>
          <span className="text-[9px] font-arabic text-slate-400 block">إجمالي قيمة التوريدات</span>
        </div>

        <div className="p-2.5 rounded-lg border border-emerald-300 bg-emerald-50/60">
          <span className="text-[9px] font-bold uppercase text-emerald-800 block">Total Amount Paid</span>
          <span className="text-base font-black font-mono text-emerald-700">{formatKWD(summary.totalPaid)}</span>
          <span className="text-[9px] font-arabic text-emerald-600 block">إجمالي المسدد للمورد</span>
        </div>

        <div className="p-2.5 rounded-lg border border-rose-300 bg-rose-50/60">
          <span className="text-[9px] font-bold uppercase text-rose-800 block">Balance Remaining Due</span>
          <span className="text-base font-black font-mono text-rose-700">{formatKWD(summary.totalDue)}</span>
          <span className="text-[9px] font-arabic text-rose-600 block">المبلغ المتبقي للمورد</span>
        </div>
      </div>

      {/* 4. PAYMENT MODES BREAKDOWN */}
      <div className="mb-4 p-2.5 rounded-xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between text-[11px] gap-2">
        <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px] flex items-center gap-1">
          <span>Payment Breakdown / تفاصيل السداد:</span>
        </span>
        <div className="flex flex-wrap items-center gap-3 font-mono text-[11px]">
          {summary.paymentModes['Cash'] > 0 && (
            <span className="px-2 py-0.5 rounded bg-white border border-slate-200">
              Cash (نقدي): <strong className="text-slate-900">{formatKWD(summary.paymentModes['Cash'])}</strong>
            </span>
          )}
          {summary.paymentModes['K-Net'] > 0 && (
            <span className="px-2 py-0.5 rounded bg-white border border-slate-200">
              K-Net (كي نت): <strong className="text-blue-700">{formatKWD(summary.paymentModes['K-Net'])}</strong>
            </span>
          )}
          {summary.paymentModes['Visa / Card'] > 0 && (
            <span className="px-2 py-0.5 rounded bg-white border border-slate-200">
              Card (بطاقة): <strong className="text-indigo-700">{formatKWD(summary.paymentModes['Visa / Card'])}</strong>
            </span>
          )}
          {summary.paymentModes['Cheque'] > 0 && (
            <span className="px-2 py-0.5 rounded bg-white border border-slate-200">
              Cheque (شيك): <strong className="text-amber-700">{formatKWD(summary.paymentModes['Cheque'])}</strong>
            </span>
          )}
        </div>
      </div>

      {/* 5. PURCHASES LEDGER TABLE */}
      <div className="mb-6">
        <h4 className="text-[11px] font-black uppercase tracking-wider text-slate-700 mb-2 flex items-center justify-between">
          <span>Detailed Purchase Intake Orders ({purchases.length})</span>
          <span className="font-arabic text-[11px] font-normal text-slate-500">كشف فواتير التوريد التفصيلية</span>
        </h4>

        <div className="border border-slate-300 rounded-xl overflow-hidden">
          <table className="w-full text-left text-[11px]">
            <thead className="bg-slate-100 border-b border-slate-300 font-bold text-slate-700">
              <tr>
                <th className="p-2 pl-3 w-8 text-center">#</th>
                <th className="p-2 w-24">Date / التاريخ</th>
                <th className="p-2 w-28">Purchase #</th>
                <th className="p-2">Payment Mode</th>
                <th className="p-2 text-center w-20">Status</th>
                <th className="p-2 text-right w-24">Total (KD)</th>
                <th className="p-2 text-right w-24">Paid (KD)</th>
                <th className="p-2 pr-3 text-right w-24">Balance (KD)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 font-medium">
              {purchases.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-slate-400">
                    No purchase intake orders recorded for this supplier in the selected period.
                  </td>
                </tr>
              ) : (
                purchases.map((p, idx) => (
                  <tr key={p.id} className={idx % 2 === 1 ? 'bg-slate-50/70' : 'bg-white'}>
                    <td className="p-2 pl-3 text-center font-mono text-slate-400 text-[10px]">{idx + 1}</td>
                    <td className="p-2 font-mono text-slate-600">{formatDate(p.date)}</td>
                    <td className="p-2 font-mono font-bold text-orange-600">{p.purchaseNo}</td>
                    <td className="p-2 font-mono text-[11px] text-slate-700">{p.paymentMethod}</td>
                    <td className="p-2 text-center">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold font-mono ${
                          p.status === 'PAID'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : p.status === 'PARTIAL'
                            ? 'bg-amber-100 text-amber-800 border border-amber-300'
                            : 'bg-rose-100 text-rose-800 border border-rose-300'
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="p-2 text-right font-mono font-bold text-slate-900">
                      {formatKWD(p.totalAmount)}
                    </td>
                    <td className="p-2 text-right font-mono font-bold text-emerald-600">
                      {formatKWD(p.paidAmount)}
                    </td>
                    <td className="p-2 pr-3 text-right font-mono font-bold text-rose-600">
                      {formatKWD(p.dueAmount)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {/* Total Footer Row */}
            <tfoot className="bg-slate-100 border-t-2 border-slate-400 font-bold text-slate-900">
              <tr>
                <td colSpan={5} className="p-2.5 pl-3 text-right uppercase text-[10px] tracking-wider">
                  Period Totals / إجمالي الفترة:
                </td>
                <td className="p-2.5 text-right font-mono font-black text-slate-900">
                  {formatKWD(summary.totalPurchases)}
                </td>
                <td className="p-2.5 text-right font-mono font-black text-emerald-700">
                  {formatKWD(summary.totalPaid)}
                </td>
                <td className="p-2.5 pr-3 text-right font-mono font-black text-rose-700">
                  {formatKWD(summary.totalDue)}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* 6. AMOUNT IN WORDS & DECLARATION */}
      <div className="border border-slate-200 rounded-xl p-3 bg-slate-50 mb-6 text-[11px] flex justify-between items-center gap-4">
        <div>
          <span className="text-[10px] font-bold text-slate-500 uppercase block">Total Outstanding Balance to Supplier:</span>
          <p className="font-bold text-slate-800 mt-0.5">{kwdToWordsEn(summary.totalDue)}</p>
        </div>
        <div className="text-right font-arabic">
          <span className="text-[10px] font-bold text-slate-500 block">المبلغ المتبقي للمورد كتابة:</span>
          <p className="font-bold text-slate-800 mt-0.5">{kwdToWordsAr(summary.totalDue)}</p>
        </div>
      </div>

      {/* 7. SIGNATURES & STAMP SECTION */}
      <div className="grid grid-cols-3 gap-6 pt-6 border-t border-slate-200 text-center text-[10px] text-slate-500">
        <div>
          <div className="h-12 border-b border-dashed border-slate-300"></div>
          <span className="mt-1 block font-bold text-slate-700">Purchasing Officer</span>
          <span className="font-arabic block">مسؤول المشتريات</span>
        </div>
        <div>
          <div className="h-12 border-b border-dashed border-slate-300"></div>
          <span className="mt-1 block font-bold text-slate-700">Company Official Stamp</span>
          <span className="font-arabic block">ختم الشركة المعتمد</span>
        </div>
        <div>
          <div className="h-12 border-b border-dashed border-slate-300"></div>
          <span className="mt-1 block font-bold text-slate-700">Supplier Acknowledgment</span>
          <span className="font-arabic block">توقيع مندوب المورد</span>
        </div>
      </div>

      {/* System Note */}
      <div className="mt-6 pt-3 border-t border-slate-100 text-center text-[9px] text-slate-400 font-mono">
        This is a computer-generated supplier statement issued by Rajasthan Tools Q8 Billing System.
      </div>
    </div>
  );
}
