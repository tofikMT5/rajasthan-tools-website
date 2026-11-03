'use client';

import React from 'react';
import { formatKWD, formatKWDNum, formatDate } from '@/lib/utils';
import { kwdToWordsEn, kwdToWordsAr } from '@/lib/amount-to-words';

interface PurchasePrintProps {
  purchase: any;
}

export function PurchasePrint({ purchase }: PurchasePrintProps) {
  if (!purchase) return null;

  const items = (purchase.items as any[]) || [];
  const grossAmount = Number(purchase.subtotal ?? purchase.total ?? 0);
  const discountAmount = Number(purchase.discount ?? 0);
  const netAmount = Number(purchase.total ?? 0);
  const paidAmount = Number(
    purchase.paidAmount !== undefined && purchase.paidAmount !== null
      ? purchase.paidAmount
      : purchase.status === 'PAID'
      ? netAmount
      : 0
  );
  const dueAmount = Number(
    purchase.dueAmount !== undefined && purchase.dueAmount !== null
      ? purchase.dueAmount
      : Math.max(0, netAmount - paidAmount)
  );

  const paymentMethod = purchase.paymentMethod || 'Cash';
  const status = purchase.status || (dueAmount <= 0 ? 'PAID' : paidAmount > 0 ? 'PARTIAL' : 'UNPAID');

  const wordsEn = kwdToWordsEn(netAmount);
  const wordsAr = kwdToWordsAr(netAmount);

  return (
    <div className="printable-purchase w-full max-w-[210mm] mx-auto bg-white text-slate-900 p-6 font-sans text-xs shadow-lg print:shadow-none print:p-0 print:m-0 border border-slate-200 print:border-none">
      <style dangerouslySetInnerHTML={{ __html: `
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Noto+Naskh+Arabic:wght@400;600;700&display=swap');
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
            size: A4;
            margin: 10mm;
          }
          .no-print, aside, nav, button {
            display: none !important;
          }
          .print-avoid-break {
            page-break-inside: avoid;
          }
          .printable-purchase {
            height: auto !important;
            min-height: 100% !important;
            overflow: visible !important;
          }
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          th {
            font-size: 11px !important;
            padding: 4px 6px !important;
          }
          td.item-row-td {
            font-size: 10px !important;
            padding: 4px 6px !important;
            line-height: 1.2 !important;
          }
        }
      `}} />

      {/* 1. HEADER (Company Info) */}
      <table className="w-full border-b-2 border-blue-900 pb-4 mb-3 table-fixed">
        <tbody>
          <tr>
            {/* Left Column (30%): English Address */}
            <td className="w-[30%] text-[10px] leading-relaxed text-slate-700 align-top pr-2">
              <p className="font-bold text-blue-900 text-xs">Shuwaikh Ind. Area 2</p>
              <p>Block 1, St. 17, Shop 11</p>
              <p>Tara Center, Kuwait</p>
              <p>P.O.Box 26952, Pin 13130</p>
              <p className="font-mono text-slate-500 mt-1">CR: 429108</p>
            </td>

            {/* Center Column (40%): Company Title & Logo */}
            <td className="w-[40%] text-center align-top px-2">
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto', width: '100%' }}>
                <div style={{ 
                  fontSize: '15px', 
                  fontWeight: 'bold', 
                  color: '#1e3a8a', 
                  lineHeight: '1.6', 
                  marginBottom: '6px', 
                  fontFamily: "'Noto Naskh Arabic', 'Segoe UI', Tahoma, sans-serif",
                  direction: 'rtl',
                  textAlign: 'center',
                  width: '100%'
                }}>
                  شركة راجستان للبيع بالتجزئة لأدوات النجارة والحدادة
                </div>

                <div style={{
                  display: 'inline-block',
                  backgroundColor: '#1e3a8a',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '800',
                  letterSpacing: '1px',
                  padding: '5px 22px',
                  borderRadius: '9999px',
                  lineHeight: '1.2',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  verticalAlign: 'middle',
                  margin: '4px 0',
                  boxSizing: 'border-box'
                }}>
                  RAJASTHAN TOOLS Q8
                </div>

                <div style={{ 
                  fontSize: '12px', 
                  fontWeight: '700', 
                  color: '#0f172a', 
                  lineHeight: '1.4', 
                  margin: '2px 0 0 0',
                  textAlign: 'center'
                }}>
                  Rajasthan Retail Co. for Woodworking and Blacksmithing Tools
                </div>

                <div style={{ 
                  fontSize: '10px', 
                  color: '#64748b', 
                  fontStyle: 'italic', 
                  marginTop: '2px',
                  textAlign: 'center'
                }}>
                  Purchase & Stock Intake Invoice • فاتورة مشتريات وتوريد مخزون
                </div>
              </div>
            </td>

            {/* Right Column (30%): Contact & Location */}
            <td className="w-[30%] text-right text-[10px] leading-relaxed text-slate-700 align-top pl-2">
              <p className="font-arabic font-bold text-blue-900 text-xs">الشويخ الصناعية ٢</p>
              <p className="font-arabic">قطعة ١، شارع ١٧، محل ١١</p>
              <p className="font-mono font-bold text-blue-900 text-xs mt-1">Tel: +965 9099 7484</p>
              <p className="font-arabic text-xs">تلفون: ٩٠٩٩٧٤٨٤</p>
              <p className="text-[9px] text-slate-500 mt-0.5">rajasthantools.q8@gmail.com</p>
            </td>
          </tr>
        </tbody>
      </table>

      {/* 2. TITLE BAR */}
      <div style={{
        border: '1.5px solid #1e3a8a',
        borderRadius: '4px',
        padding: '7px 16px',
        textAlign: 'center',
        backgroundColor: '#ffffff',
        margin: '10px 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px'
      }}>
        <div style={{ fontSize: '13px', fontWeight: 800, color: '#1e3a8a' }}>
          <span>PURCHASE INVOICE</span> <span style={{ margin: '0 6px' }}>/</span> <span className="font-arabic">فاتورة مشتريات وتوريد</span>
        </div>

        {/* Status Badge */}
        <div style={{
          padding: '4px 14px',
          borderRadius: '4px',
          fontSize: '11px',
          fontWeight: 'bold',
          letterSpacing: '0.5px',
          backgroundColor:
            status === 'PAID' ? '#dcfce7' : status === 'PARTIAL' ? '#fef3c7' : '#ffe4e6',
          color:
            status === 'PAID' ? '#166534' : status === 'PARTIAL' ? '#92400e' : '#9f1239',
          border: `1px solid ${
            status === 'PAID' ? '#86efac' : status === 'PARTIAL' ? '#fcd34d' : '#fda4af'
          }`
        }}>
          {status === 'PAID' ? 'PAID / مدفوع بالكامل' : status === 'PARTIAL' ? 'PARTIALLY PAID / مدفوع جزئياً' : 'UNPAID / غير مدفوع (آجل)'}
        </div>
      </div>

      {/* 3. SUPPLIER & ORDER INFO BAR (2 Columns Table) */}
      <table className="w-full border-collapse border border-slate-300 rounded mb-3 bg-slate-50/40 text-xs table-fixed">
        <tbody>
          <tr>
            <td className="p-2.5 align-top w-1/2 border-r border-slate-300">
              <div className="space-y-1">
                <div className="flex">
                  <span className="font-bold w-36 text-slate-700">Purchase No / رقم الفاتورة :</span>
                  <span className="font-mono font-bold text-orange-600">{purchase.purchaseNo}</span>
                </div>
                <div className="flex">
                  <span className="font-bold w-36 shrink-0 text-slate-700">Supplier / اسم المورد :</span>
                  <span className="font-bold text-slate-900">{purchase.supplier?.name || 'Registered Supplier'}</span>
                </div>
                <div className="flex">
                  <span className="font-bold w-36 text-slate-700">Tel No. / التلفون :</span>
                  <span className="font-mono">{purchase.supplier?.phone || '+965 -------'}</span>
                </div>
              </div>
            </td>
            <td className="p-2.5 align-top w-1/2 pl-4">
              <div className="space-y-1">
                <div className="flex">
                  <span className="font-bold w-32 text-left text-slate-700">DATE / التاريخ :</span>
                  <span className="font-mono text-left font-semibold">{formatDate(purchase.date)}</span>
                </div>
                <div className="flex">
                  <span className="font-bold w-32 text-left text-slate-700">Payment Mode / الدفع :</span>
                  <span className="font-semibold text-left text-slate-900">{paymentMethod}</span>
                </div>
                <div className="flex">
                  <span className="font-bold w-32 text-left text-slate-700">Remarks / ملاحظات :</span>
                  <span className="italic text-left truncate text-slate-600">{purchase.notes || 'None'}</span>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* 4. ITEMS TABLE */}
      <table className="w-full border-collapse border border-slate-400 text-xs mb-3" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr className="bg-slate-200 text-slate-900 border-b border-slate-400 font-bold text-[11px] text-center">
            <th className="border border-slate-400 p-1.5 w-10">
              <div>SR</div>
              <div className="font-arabic font-normal text-[10px]">م</div>
            </th>
            <th className="border border-slate-400 p-1.5 w-28">
              <div>ITEM CODE</div>
              <div className="font-arabic font-normal text-[10px]">كود الصنف</div>
            </th>
            <th className="border border-slate-400 p-1.5 text-left">
              <div>ITEM DESCRIPTION</div>
              <div className="font-arabic font-normal text-[10px]">البيان / تفاصيل السلعة الموردة</div>
            </th>
            <th className="border border-slate-400 p-1.5 w-20">
              <div>QTY</div>
              <div className="font-arabic font-normal text-[10px]">الكمية</div>
            </th>
            <th className="border border-slate-400 p-1.5 w-28 text-right">
              <div>UNIT COST (KD)</div>
              <div className="font-arabic font-normal text-[10px]">سعر التكلفة</div>
            </th>
            <th className="border border-slate-400 p-1.5 w-28 text-right">
              <div>TOTAL (KD)</div>
              <div className="font-arabic font-normal text-[10px]">الإجمالي بالدينار</div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-300 font-medium">
          {items.map((item: any, idx: number) => {
            const lineTotal = Number(item.lineTotal ?? (Number(item.qty || 1) * Number(item.costPrice || 0)));
            return (
              <tr key={item.id || idx} className="text-slate-900 hover:bg-slate-50 print-avoid-break">
                <td className="item-row-td border border-slate-400 text-center font-mono">{idx + 1}</td>
                <td className="item-row-td border border-slate-400 text-center font-mono font-bold text-orange-600">
                  {item.itemCode || '-'}
                </td>
                <td className="item-row-td border border-slate-400">
                  <p className="font-bold text-slate-900 leading-none">{item.nameEn}</p>
                  {item.nameAr && (
                    <p className="font-arabic text-[10px] text-slate-600 leading-none mt-0.5">{item.nameAr}</p>
                  )}
                </td>
                <td className="item-row-td border border-slate-400 text-center font-mono font-bold">
                  {item.qty} {item.unit || 'PCS'}
                </td>
                <td className="item-row-td border border-slate-400 text-right font-mono">
                  {formatKWDNum(item.costPrice)}
                </td>
                <td className="item-row-td border border-slate-400 text-right font-mono font-extrabold text-slate-900">
                  {formatKWDNum(lineTotal)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 5. BOTTOM BREAKDOWN & FINANCIAL TOTALS (Exact structure requested by user) */}
      <table className="w-full mb-4 print-avoid-break border-collapse table-fixed">
        <tbody>
          <tr>
            {/* Left Column (58%): Payment Mode Matrix & Amount in Words */}
            <td className="w-[58%] align-top pr-4">
              <p className="font-bold text-[10px] text-slate-700 uppercase mb-1">
                Payment Breakdown / تفاصيل الدفع وطريقة السداد
              </p>
              <table className="w-full border-collapse border border-slate-400 text-[10px] text-center mb-3">
                <thead className="bg-slate-100 font-bold text-slate-800">
                  <tr>
                    <th className="border border-slate-400 p-1">Cash نقدي</th>
                    <th className="border border-slate-400 p-1">K-Net كي نت</th>
                    <th className="border border-slate-400 p-1">Visa/Card</th>
                    <th className="border border-slate-400 p-1">Cheque / شيك</th>
                  </tr>
                </thead>
                <tbody className="font-mono font-bold text-slate-800">
                  <tr>
                    <td className="border border-slate-400 p-1">
                      {paymentMethod.toLowerCase().includes('cash') || status === 'PAID' && !paymentMethod.toLowerCase().includes('knet')
                        ? formatKWDNum(paidAmount)
                        : '0.000'}
                    </td>
                    <td className="border border-slate-400 p-1">
                      {paymentMethod.toLowerCase().includes('knet') || paymentMethod.toLowerCase().includes('k-net')
                        ? formatKWDNum(paidAmount)
                        : '0.000'}
                    </td>
                    <td className="border border-slate-400 p-1">
                      {paymentMethod.toLowerCase().includes('visa') || paymentMethod.toLowerCase().includes('card')
                        ? formatKWDNum(paidAmount)
                        : '0.000'}
                    </td>
                    <td className="border border-slate-400 p-1">
                      {paymentMethod.toLowerCase().includes('cheque')
                        ? formatKWDNum(paidAmount)
                        : '0.000'}
                    </td>
                  </tr>
                </tbody>
              </table>

              {/* Amount In Words */}
              <div className="p-2.5 bg-slate-100 border border-slate-300 rounded text-[11px] space-y-1">
                <p className="font-bold text-slate-800">
                  Amount in Words: <span className="font-semibold italic text-blue-900">{wordsEn}</span>
                </p>
                <p className="font-arabic font-bold text-slate-800">
                  المبلغ كتابة: <span className="font-semibold text-blue-900">{wordsAr}</span>
                </p>
              </div>
            </td>

            {/* Right Column (42%): Totals Box (Total Bill, Discount, Paid, Balance) */}
            <td className="w-[42%] align-top space-y-1.5 text-xs">
              <div className="border border-slate-300 rounded overflow-hidden">
                {/* 1. Machine / Gross Total Bill */}
                <div className="flex justify-between items-center p-2 bg-slate-50 border-b border-slate-200">
                  <span className="font-bold text-slate-700">Gross Total Bill / إجمالي البضاعة:</span>
                  <span className="font-mono font-bold text-slate-900">{formatKWDNum(grossAmount)} KD</span>
                </div>

                {/* 2. Discount */}
                <div className="flex justify-between items-center p-2 bg-white border-b border-slate-200">
                  <span className="font-bold text-slate-700">Discount Given / الخصم:</span>
                  <span className="font-mono font-bold text-rose-600">
                    -{formatKWDNum(discountAmount)} KD
                  </span>
                </div>

                {/* 3. Net Total Payable */}
                <div className="flex justify-between items-center p-2 bg-blue-900 text-white font-extrabold text-sm">
                  <span>NET TOTAL / الصافي:</span>
                  <span className="font-mono text-base">{formatKWDNum(netAmount)} KD</span>
                </div>

                {/* 4. Paid Amount */}
                <div className="flex justify-between items-center p-2 bg-emerald-50 border-b border-slate-200">
                  <span className="font-bold text-emerald-800">Paid Amount / المبلغ المدفوع:</span>
                  <span className="font-mono font-bold text-emerald-700">{formatKWDNum(paidAmount)} KD</span>
                </div>

                {/* 5. Remaining / Due Amount */}
                <div className="flex justify-between items-center p-2 bg-rose-50">
                  <span className="font-bold text-rose-800">Balance Due / المبلغ المتبقي:</span>
                  <span className="font-mono font-extrabold text-rose-700">{formatKWDNum(dueAmount)} KD</span>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* 6. SIGNATURE ROW */}
      <div className="grid grid-cols-2 gap-8 my-5 text-xs pt-3 border-t border-slate-300">
        <div>
          <p className="font-bold">Prepared / Checked By: _______________________</p>
          <p className="font-arabic text-[10px] text-slate-500 mt-1">توقيع المسؤول والمحاسب</p>
        </div>
        <div className="text-right">
          <p className="font-bold">Received & Approved By: _______________________</p>
          <p className="font-arabic text-[10px] text-slate-500 mt-1">اعتماد المستلم والمخزن</p>
        </div>
      </div>

      {/* 7. BRAND STRIP */}
      <div className="border-t-2 border-slate-400 pt-2 text-center text-[10px] text-slate-600 space-y-1">
        <p className="italic">
          RT Billing System • Rajasthan Tools Q8 Retail & Wholesale Solution • Shuwaikh Industrial, Kuwait
        </p>
        <div className="pt-1 flex justify-center items-center gap-6 font-bold text-slate-400 uppercase tracking-widest text-[9px]">
          <span>MAKITA</span> • <span>BOSCH</span> • <span>HILTI</span> • <span>DEWALT</span> • <span>STANLEY</span> • <span>DCA</span>
        </div>
      </div>
    </div>
  );
}

