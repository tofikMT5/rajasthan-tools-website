'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingBag, ArrowLeft, Printer, Trash2, Building2, Calendar, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatKWD, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function PurchaseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const purchaseId = params.id as string;

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
          toast.error('Purchase order not found');
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

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading purchase details...</div>;

  if (!purchase) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-500">Purchase order not found.</p>
        <Button onClick={() => router.push('/purchases')}>Back to Purchases</Button>
      </div>
    );
  }

  const items = (purchase.items as any[]) || [];

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <Button variant="ghost" onClick={() => router.push('/purchases')} className="gap-2 text-slate-600">
          <ArrowLeft className="w-4 h-4" /> Back to Purchases
        </Button>
        <div className="flex gap-2">
          <Button onClick={() => window.print()} className="bg-slate-900 hover:bg-slate-800 text-white font-bold gap-2 text-xs">
            <Printer className="w-4 h-4" /> Print Purchase Order
          </Button>
          <Button onClick={handleDelete} variant="destructive" className="gap-2 text-xs font-bold">
            <Trash2 className="w-4 h-4" /> Reverse Stock & Delete
          </Button>
        </div>
      </div>

      {/* Main Order Details Card */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 flex flex-row items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 dark:text-white">Purchase Order #{purchase.purchaseNo}</h1>
              <Badge variant="success">STOCK RECEIVED</Badge>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-1">Date: {formatDate(purchase.date)}</p>
          </div>
          <div className="text-right">
            <span className="text-xs text-slate-400 font-semibold uppercase block">Total Purchase Value</span>
            <span className="text-2xl font-black font-mono text-emerald-600">{formatKWD(purchase.total)}</span>
          </div>
        </CardHeader>

        <CardContent className="p-6 space-y-6">
          {/* Supplier Meta */}
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="text-slate-400 font-semibold block uppercase">Supplier Name</span>
              <span className="font-bold text-slate-900 dark:text-white text-sm">{purchase.supplier?.name}</span>
            </div>
            <div>
              <span className="text-slate-400 font-semibold block uppercase">Intake Order Notes</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{purchase.notes || 'None'}</span>
            </div>
          </div>

          {/* Purchased Items Table */}
          <div>
            <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500 mb-3">Purchased Items Breakdown</h3>
            <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-500">
                  <tr>
                    <th className="p-3 pl-4">Item Code</th>
                    <th className="p-3">Product Description</th>
                    <th className="p-3 w-20 text-center">Qty</th>
                    <th className="p-3 text-right">Cost Price (KD)</th>
                    <th className="p-3 pr-4 text-right">Line Total (KD)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium font-mono">
                  {items.map((item: any, idx: number) => (
                    <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                      <td className="p-3 pl-4 font-bold text-orange-600">{item.itemCode || '-'}</td>
                      <td className="p-3 font-sans font-bold text-slate-900 dark:text-white">{item.nameEn}</td>
                      <td className="p-3 text-center font-bold">{item.qty} {item.unit || 'PCS'}</td>
                      <td className="p-3 text-right text-slate-500">{formatKWD(item.costPrice)}</td>
                      <td className="p-3 pr-4 text-right font-extrabold text-emerald-600">{formatKWD(item.lineTotal || item.qty * item.costPrice)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
