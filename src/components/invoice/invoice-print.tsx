'use client';

import React from 'react';
import { formatKWD, formatKWDNum, formatDate } from '@/lib/utils';

interface InvoicePrintProps {
  invoice: any;
}

export function InvoicePrint({ invoice }: InvoicePrintProps) {
  if (!invoice) return null;

  const items = invoice.items || [];
  const payments = invoice.payments || [];

  const getPaymentAmount = (mode: string) => {
    const p = payments.find((item: any) => item.mode === mode);
    return p ? formatKWDNum(p.amount) : '0.000';
  };

  return (
    <div className="printable-invoice w-full max-w-[210mm] mx-auto bg-white text-slate-900 p-6 font-sans text-xs shadow-lg print:shadow-none print:p-0 print:m-0 border border-slate-200 print:border-none">
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
          .invoice-header-center * {
            position: static !important;
            transform: none !important;
          }
          .invoice-title-box {
            padding: 8px 12px !important;
            height: auto !important;
            min-height: 36px !important;
          }
          div {
            overflow: visible !important;
          }
          .badge-container, div[style*="background-color"] {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
            vertical-align: middle !important;
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
          .printable-invoice {
            height: auto !important;
            min-height: 100% !important;
            overflow: visible !important;
          }
          tr {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .totals-section, .payment-breakdown-box {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .invoice-footer-signatures {
            page-break-inside: avoid !important;
            break-inside: avoid !important;
            margin-top: 10px !important;
          }
          /* Compact Table Spacing */
          th {
            font-size: 11px !important;
            padding: 4px 6px !important;
          }
          td.item-row-td {
            font-size: 10px !important;
            padding: 4px 6px !important;
            line-height: 1.2 !important;
          }
          .header-table {
            margin-bottom: 6px !important;
          }
          .invoice-title-box {
            padding: 8px 12px !important;
            height: auto !important;
            min-height: 36px !important;
            margin: 6px 0 !important;
          }
          .customer-info-box td {
            padding: 6px 10px !important;
          }
          .payment-breakdown-box {
            padding: 6px !important;
          }
        }
      `}} />

      {/* 1. HEADER (3 Columns as Table for Print Stability) */}
      <table className="header-table w-full border-b-2 border-blue-900 pb-4 mb-3 table-fixed">
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
              {/* CENTER HEADER BLOCK - FIX OVERLAP */}
              <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', margin: '0 auto', width: '100%' }}>
                
                {/* 1. ARABIC COMPANY NAME (Has proper line-height so line 2 never touches the blue box) */}
                <div style={{ 
                  fontSize: '15px', 
                  fontWeight: 'bold', 
                  color: '#1e3a8a', 
                  lineHeight: '1.6', 
                  marginBottom: '8px', 
                  fontFamily: "'Noto Naskh Arabic', 'Segoe UI', Tahoma, sans-serif",
                  direction: 'rtl',
                  textAlign: 'center',
                  width: '100%'
                }}>
                  شركة راجستان للبيع بالتجزئة لأدوات النجارة والحدادة
                </div>

                {/* 2. BLUE BRAND BADGE (Explicit margin top & bottom + centered text) */}
                <div style={{
                  display: 'inline-block',
                  backgroundColor: '#1e3a8a',
                  color: '#ffffff',
                  fontSize: '13px',
                  fontWeight: '800',
                  letterSpacing: '1px',
                  padding: '6px 22px',
                  borderRadius: '9999px',
                  lineHeight: '1.2',
                  textAlign: 'center',
                  textTransform: 'uppercase',
                  verticalAlign: 'middle',
                  margin: '6px 0',
                  boxSizing: 'border-box'
                }}>
                  RAJASTHAN TOOLS Q8
                </div>

                {/* 3. ENGLISH COMPANY NAME */}
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

                {/* 4. TAGLINE */}
                <div style={{ 
                  fontSize: '10px', 
                  color: '#64748b', 
                  fontStyle: 'italic', 
                  marginTop: '2px',
                  textAlign: 'center'
                }}>
                  Industrial Hardware & Power Tools Retail Solution
                </div>

              </div>
            </td>

            {/* Right Column (30%): Contact & QR Placeholder */}
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

      {/* 2. TITLE BAR (Bordered) */}
      <div className="invoice-title-box" style={{ border: '1.5px solid #1e3a8a', borderRadius: '4px', padding: '8px 16px', textAlign: 'center', backgroundColor: '#ffffff', margin: '12px 0', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        {invoice.type === 'CREDIT' && (
          <div style={{ fontSize: '14px', fontWeight: 700, lineHeight: '1.2' }}>
            <span>CREDIT INVOICE</span> <span style={{ margin: '0 6px' }}>/</span> <span style={{ fontFamily: '"Noto Naskh Arabic", sans-serif' }}>فاتورة آجل</span>
          </div>
        )}
        {invoice.type === 'QUOTATION' && (
          <div style={{ fontSize: '14px', fontWeight: 700, lineHeight: '1.2' }}>
            <span>QUOTATION</span> <span style={{ margin: '0 6px' }}>/</span> <span style={{ fontFamily: '"Noto Naskh Arabic", sans-serif' }}>عرض سعر</span>
          </div>
        )}
        {invoice.type !== 'CREDIT' && invoice.type !== 'QUOTATION' && (
          <div style={{ fontSize: '14px', fontWeight: 700, lineHeight: '1.2' }}>
            <span>CASH INVOICE</span> <span style={{ margin: '0 6px' }}>/</span> <span style={{ fontFamily: '"Noto Naskh Arabic", sans-serif' }}>فاتورة نقداً</span>
          </div>
        )}
      </div>

      {/* 3. CUSTOMER INFO BAR (2 Columns Table) */}
      <table className="customer-info-box w-full border-collapse border border-slate-300 rounded mb-3 bg-slate-50/30 text-xs table-fixed">
        <tbody>
          <tr>
            <td className="p-2.5 align-top w-1/2 border-r border-slate-300">
              <div className="space-y-1">
                <div className="flex">
                  <span className="font-bold w-32">Bill No / رقم الفاتورة :</span>
                  <span className="font-mono font-bold text-blue-900">RT-{invoice.invoiceNo}</span>
                </div>
                <div className="flex">
                  <span className="font-bold w-32 shrink-0">Customer / اسم العميل :</span>
                  <div className="flex flex-col">
                    <span className="font-semibold">{invoice.customerNameSnap}</span>
                    {(invoice.nameArSnap || invoice.customer?.nameAr) && (
                      <span className="font-arabic text-[11px] text-slate-700 leading-tight">
                        {invoice.nameArSnap || invoice.customer?.nameAr}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex">
                  <span className="font-bold w-32">Tel No. / التلفون :</span>
                  <span className="font-mono">{invoice.customerPhoneSnap || '+965 -------'}</span>
                </div>
              </div>
            </td>
            <td className="p-2.5 align-top w-1/2 pl-4">
              <div className="space-y-1">
                <div className="flex">
                  <span className="font-bold w-28 text-left">DATE / التاريخ :</span>
                  <span className="font-mono text-left">{formatDate(invoice.dateTime)}</span>
                </div>
                <div className="flex">
                  <span className="font-bold w-28 text-left">Type / النوع :</span>
                  <span className="font-semibold text-left">{invoice.type}</span>
                </div>
                <div className="flex">
                  <span className="font-bold w-28 text-left">Narration :</span>
                  <span className="italic text-left truncate">{invoice.narration || '-'}</span>
                </div>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* 4. ITEMS TABLE (7 Columns Bordered) */}
      <table className="w-full border-collapse border border-slate-400 text-xs mb-3" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr className="bg-slate-200 text-slate-900 border-b border-slate-400 font-bold text-[11px] text-center">
            <th className="border border-slate-400 p-1.5 w-10">
              <div>SR</div>
              <div className="font-arabic font-normal text-[10px]">م</div>
            </th>
            <th className="border border-slate-400 p-1.5 w-24">
              <div>ITEM CODE</div>
              <div className="font-arabic font-normal text-[10px]">باركود</div>
            </th>
            <th className="border border-slate-400 p-1.5 text-left">
              <div>ITEM DESCRIPTION</div>
              <div className="font-arabic font-normal text-[10px]">البيان / تفاصيل السلعة</div>
            </th>
            <th className="border border-slate-400 p-1.5 w-14">
              <div>QTY</div>
              <div className="font-arabic font-normal text-[10px]">الكمية</div>
            </th>
            <th className="border border-slate-400 p-1.5 w-24 text-right">
              <div>PRICE</div>
              <div className="font-arabic font-normal text-[10px]">السعر</div>
            </th>
            <th className="border border-slate-400 p-1.5 w-28 text-right">
              <div>AMOUNT (KD)</div>
              <div className="font-arabic font-normal text-[10px]">الإجمالي بالدينار</div>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-300 font-medium">
          {items.map((item: any, idx: number) => (
            <tr key={item.id || idx} className={`${idx > 0 && idx % 10 === 0 ? 'page-break' : ''} text-slate-900 hover:bg-slate-50 print-avoid-break`}>
              <td className="item-row-td border border-slate-400 text-center font-mono">{idx + 1}</td>
              <td className="item-row-td border border-slate-400 text-center font-mono font-semibold">{item.itemCodeSnap}</td>
              <td className="item-row-td border border-slate-400">
                <p className="font-bold text-slate-900 leading-none">{item.nameEnSnap}</p>
                {item.nameArSnap && <p className="font-arabic text-[10px] text-slate-600 leading-none mt-0.5">{item.nameArSnap}</p>}
              </td>
              <td className="item-row-td border border-slate-400 text-center font-mono font-bold">{item.qty}</td>
              <td className="item-row-td border border-slate-400 text-right font-mono">{formatKWDNum(item.price)}</td>
              <td className="item-row-td border border-slate-400 text-right font-mono font-extrabold">{formatKWDNum(item.amount)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* 5. BOTTOM BREAKDOWN & TOTALS (2 Columns as Table) */}
      <table className="payment-breakdown-box w-full mb-4 print-avoid-break border-collapse table-fixed">
        <tbody>
          <tr>
            {/* Left Column (60%): Payment Breakdown Matrix */}
            <td className="w-[60%] align-top pr-4">
              <p className="font-bold text-[10px] text-slate-700 uppercase mb-1">Payment Mode Breakdown / تفاصيل الدفع</p>
              <table className="w-full border-collapse border border-slate-400 text-[10px] text-center mb-3">
                <thead className="bg-slate-100 font-bold">
                  <tr>
                    <th className="border border-slate-400 p-1">Cash نقدي</th>
                    <th className="border border-slate-400 p-1">K-Net كي نت</th>
                    <th className="border border-slate-400 p-1">Visa/Master</th>
                    <th className="border border-slate-400 p-1">Online/Link</th>
                  </tr>
                </thead>
                <tbody className="font-mono font-bold text-slate-800">
                  <tr>
                    <td className="border border-slate-400 p-1">{getPaymentAmount('CASH')}</td>
                    <td className="border border-slate-400 p-1">{getPaymentAmount('KNET')}</td>
                    <td className="border border-slate-400 p-1">{getPaymentAmount('VISA')}</td>
                    <td className="border border-slate-400 p-1">{getPaymentAmount('ONLINE')}</td>
                  </tr>
                </tbody>
              </table>

              {/* Amount In Words */}
              <div className="p-2 bg-slate-100 border border-slate-300 rounded text-[11px]">
                <p className="font-bold text-slate-800">
                  Amount in Words: <span className="font-semibold italic text-blue-900">{invoice.amountInWordsEn}</span>
                </p>
                {invoice.amountInWordsAr && (
                  <p className="font-arabic font-bold text-slate-800 mt-0.5">
                    المبلغ كتابة: <span className="font-semibold text-blue-900">{invoice.amountInWordsAr}</span>
                  </p>
                )}
              </div>
            </td>

            {/* Right Column (40%): Totals Box */}
            <td className="w-[40%] align-top space-y-1 text-xs">
              <div className="flex justify-between p-1.5 border-b border-slate-200">
                <span className="font-semibold">Gross Amount / اجمالي السعر:</span>
                <span className="font-mono font-bold">{formatKWDNum(invoice.grossAmount)} KD</span>
              </div>
              <div className="flex justify-between p-1.5 border-b border-slate-200">
                <span className="font-semibold">Discount Amount / الخصم:</span>
                <span className="font-mono text-red-600">-{formatKWDNum(invoice.discountAmount)} KD</span>
              </div>
              <div className="flex justify-between p-1.5 border-b border-slate-200">
                <span className="font-semibold">Extra Amount / إضافي:</span>
                <span className="font-mono">+{formatKWDNum(invoice.extraAmount)} KD</span>
              </div>
              {/* Highlighted Net Total Box */}
              <div className="flex justify-between p-2 bg-blue-900 text-white font-extrabold rounded shadow-sm text-sm mt-1">
                <span>NET AMT IN KD:</span>
                <span className="font-mono text-base">{formatKWDNum(invoice.netAmount)} KD</span>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      {/* 6. SIGNATURE ROW */}
      <div className="invoice-footer-signatures grid grid-cols-2 gap-8 my-6 text-xs pt-4 border-t border-slate-300">
        <div>
          <p className="font-bold">Checked By / تدقيق: _______________________</p>
        </div>
        <div className="text-right">
          <p className="font-bold">Received By / المستلم: _______________________</p>
        </div>
      </div>

      {/* 7. DECLARATION & BRAND STRIP */}
      <div className="border-t-2 border-slate-400 pt-2 text-center text-[10px] text-slate-600 space-y-1">
        <p className="font-arabic font-bold text-slate-800">
          يمكن استبدال أو إرجاع البضائع المباعة خلال ١٤ يومًا من تاريخ الفاتورة بحالتها الأصلية
        </p>
        <p className="italic">
          Goods Sold can be exchanged or returned within 14 days from Invoice date with Original Condition.
        </p>

        {/* Dynamic Brand Logos Footer */}
        <div className="pt-2 flex justify-center items-center gap-6 font-bold text-slate-400 uppercase tracking-widest text-[9px]">
          <span>MAKITA</span> • <span>BOSCH</span> • <span>HILTI</span> • <span>DEWALT</span> • <span>STANLEY</span>
        </div>
      </div>
    </div>
  );
}
