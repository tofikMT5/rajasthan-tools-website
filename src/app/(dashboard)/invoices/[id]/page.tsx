'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Printer, Download, MessageSquare, ArrowLeft, Copy, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { InvoicePrint } from '@/components/invoice/invoice-print';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function InvoiceViewPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const invoiceId = params.id as string;
  const autoPrint = searchParams.get('print') === 'true';

  const printRef = useRef<HTMLDivElement>(null);
  const [invoice, setInvoice] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    async function fetchInvoice() {
      try {
        const res = await fetch(`/api/invoices/${invoiceId}`);
        if (res.ok) {
          const data = await res.json();
          setInvoice(data);
        } else {
          toast.error('Invoice not found');
        }
      } catch (e) {
        toast.error('Error fetching invoice');
      } finally {
        setIsLoading(false);
      }
    }
    fetchInvoice();
  }, [invoiceId]);

  useEffect(() => {
    if (invoice && autoPrint) {
      setTimeout(() => {
        window.print();
      }, 500);
    }
  }, [invoice, autoPrint]);

  const handleDownloadPdf = async () => {
    if (toggles && !toggles.enablePdfExport) {
      toast.error('PDF Export is locked. Please contact Super Admin.');
      return;
    }
    if (!printRef.current) return;
    toast.info('Generating PDF document...');
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Invoice-RT-${invoice.invoiceNo}.pdf`);
      toast.success('PDF downloaded!');
    } catch (e) {
      toast.error('Failed to generate PDF');
    }
  };

  const handleShareWhatsApp = () => {
    const phone = invoice.customerPhoneSnap || '90997484';
    const text = `Dear Customer, here is your Invoice RT-${invoice.invoiceNo} from Rajasthan Tools Q8 for Net Amount: ${invoice.netAmount} KD. Thank you!`;
    const waUrl = `https://wa.me/965${phone.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
    window.open(waUrl, '_blank');
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading invoice details...</div>;

  if (!invoice) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-500">Invoice not found.</p>
        <Button onClick={() => router.push('/invoices')}>Back to Invoices</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Controls Bar (Hidden on Print) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 no-print bg-slate-900 p-4 rounded-2xl border border-slate-800 text-white shadow-xl">
        <Button variant="ghost" onClick={() => router.push('/invoices')} className="text-slate-300 hover:text-white gap-2 text-xs">
          <ArrowLeft className="w-4 h-4" /> Back to Invoices
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          <Button onClick={() => window.print()} className="bg-blue-600 hover:bg-blue-500 text-white font-bold gap-2 text-xs">
            <Printer className="w-4 h-4" /> Print Invoice
          </Button>

          <Button onClick={handleDownloadPdf} variant="outline" className="border-slate-700 bg-slate-950 text-slate-200 text-xs font-bold gap-2">
            <Download className="w-4 h-4 text-emerald-400" /> Save PDF
          </Button>

          <Button onClick={handleShareWhatsApp} variant="outline" className="border-emerald-600/40 bg-emerald-950/30 text-emerald-400 text-xs font-bold gap-2">
            <MessageSquare className="w-4 h-4" /> WhatsApp
          </Button>
        </div>
      </div>

      {/* Render Pixel-Perfect Invoice Print Template */}
      <div ref={printRef}>
        <InvoicePrint invoice={invoice} />
      </div>
    </div>
  );
}
