'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingBag, ArrowLeft, Printer, Trash2, Building2, Calendar, FileText, Edit, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PurchasePrint } from '@/components/invoice/purchase-print';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export default function PurchaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const purchaseId = params.id as string;
  const printRef = useRef<HTMLDivElement>(null);

  const [purchase, setPurchase] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPurchase() {
      try {
        const res = await fetch(`/api/purchases/${purchaseId}`);
        if (res.ok) {
          const data = await res.json();
          setPurchase(data);
        } else {
          toast.error('Purchase invoice not found');
        }
      } catch (e) {
        toast.error('Error loading purchase details');
      } finally {
        setIsLoading(false);
      }
    }
    fetchPurchase();
  }, [purchaseId]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to cancel this purchase and reverse stock?')) return;
    try {
      const res = await fetch(`/api/purchases/${purchaseId}`, { method: 'DELETE' });
      if (res.ok) {
        toast.success('Purchase cancelled & stock reversed');
        router.push('/purchases');
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to delete purchase');
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      const res = await fetch(`/api/purchases/${purchaseId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const updated = await res.json();
        setPurchase(updated);
        toast.success(`Purchase marked as ${newStatus}`);
      } else {
        toast.error('Failed to update status');
      }
    } catch (e) {
      toast.error('Error updating status');
    }
  };

  const handleDownloadPdf = async () => {
    if (!printRef.current) return;
    toast.info('Generating PDF document...');
    try {
      const canvas = await html2canvas(printRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`Purchase-Invoice-${purchase.purchaseNo}.pdf`);
      toast.success('Purchase PDF downloaded successfully!');
    } catch (e) {
      toast.error('Failed to generate PDF');
    }
  };

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading purchase details...</div>;

  if (!purchase) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-500">Purchase order not found.</p>
        <Button onClick={() => router.push('/purchases')}>Back to Purchases</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <Button variant="ghost" onClick={() => router.push('/purchases')} className="gap-2 text-slate-600">
          <ArrowLeft className="w-4 h-4" /> Back to Purchases
        </Button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Quick Toggle */}
          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-1 rounded-lg border border-slate-200 dark:border-slate-800 shadow-sm">
            <button
              onClick={() => handleUpdateStatus('PAID')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                purchase.status === 'PAID'
                  ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Paid
            </button>
            <button
              onClick={() => handleUpdateStatus('UNPAID')}
              className={`px-3 py-1.5 text-xs font-bold rounded-md transition-colors ${
                purchase.status === 'UNPAID'
                  ? 'bg-rose-100 text-rose-700 dark:bg-rose-950/60 dark:text-rose-400 border border-rose-300 dark:border-rose-800'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Unpaid
            </button>
          </div>

          <Button
            onClick={() => router.push(`/purchases/${purchaseId}/edit`)}
            variant="outline"
            className="gap-2 text-xs font-bold border-orange-200 text-orange-600 hover:bg-orange-50 dark:hover:bg-slate-800"
          >
            <Edit className="w-4 h-4" /> Edit Invoice
          </Button>

          <Button onClick={() => window.print()} className="bg-slate-900 hover:bg-slate-800 text-white font-bold gap-2 text-xs">
            <Printer className="w-4 h-4" /> Print Invoice
          </Button>

          <Button onClick={handleDownloadPdf} variant="outline" className="gap-2 text-xs font-bold border-blue-200 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-800">
            <Download className="w-4 h-4" /> Download PDF
          </Button>

          <Button onClick={handleDelete} variant="destructive" className="gap-2 text-xs font-bold">
            <Trash2 className="w-4 h-4" /> Delete
          </Button>
        </div>
      </div>

      {/* Printable Invoice Container */}
      <div ref={printRef} className="shadow-lg rounded-xl overflow-hidden bg-white">
        <PurchasePrint purchase={purchase} />
      </div>
    </div>
  );
}
