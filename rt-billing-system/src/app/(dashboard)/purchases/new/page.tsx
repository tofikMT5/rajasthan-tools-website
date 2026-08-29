'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowLeft, Plus, Trash2, Building2, Save, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { formatKWD, formatKWDNum } from '@/lib/utils';
import { toast } from 'sonner';

export default function NewPurchasePage() {
  const router = useRouter();

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Form State
  const [supplierId, setSupplierId] = useState('');
  const [purchaseNo, setPurchaseNo] = useState(`PUR-${Date.now().toString().slice(-6)}`);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick Add Supplier Modal State
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const [supRes, prodRes] = await Promise.all([fetch('/api/suppliers'), fetch('/api/products')]);
        const supData = await supRes.json();
        const prodData = await prodRes.json();

        if (Array.isArray(supData)) {
          setSuppliers(supData);
          if (supData.length > 0) setSupplierId(supData[0].id);
        }
        if (Array.isArray(prodData)) setProducts(prodData);
      } catch (e) {
        toast.error('Failed to load form data');
      }
    }
    loadData();
  }, []);

  const handleAddItemRow = (product: any) => {
    const existingIndex = items.findIndex((i) => i.productId === product.id);
    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].qty += 1;
      updated[existingIndex].lineTotal = Number((updated[existingIndex].qty * updated[existingIndex].costPrice).toFixed(3));
      setItems(updated);
    } else {
      const costPrice = Number(product.costPrice || 0);
      const newItem = {
        productId: product.id,
        itemCode: product.itemCode,
        nameEn: product.nameEn,
        nameAr: product.nameAr,
        unit: product.unit || 'PCS',
        qty: 1,
        costPrice: costPrice,
        lineTotal: costPrice,
      };
      setItems([...items, newItem]);
    }
  };

  const handleUpdateItem = (productId: string, field: 'qty' | 'costPrice', value: number) => {
    const updated = items.map((item) => {
      if (item.productId === productId) {
        const newQty = field === 'qty' ? value : item.qty;
        const newCost = field === 'costPrice' ? value : item.costPrice;
        return {
          ...item,
          qty: newQty,
          costPrice: newCost,
          lineTotal: Number((newQty * newCost).toFixed(3)),
        };
      }
      return item;
    });
    setItems(updated);
  };

  const handleRemoveItemRow = (productId: string) => {
    setItems(items.filter((i) => i.productId !== productId));
  };

  const grandTotal = items.reduce((acc, i) => acc + i.lineTotal, 0);

  const handleQuickAddSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newSupplierName, phone: newSupplierPhone }),
      });

      if (res.ok) {
        const created = await res.json();
        toast.success(`Supplier ${created.name} registered!`);
        setSuppliers([created, ...suppliers]);
        setSupplierId(created.id);
        setShowSupplierModal(false);
        setNewSupplierName('');
        setNewSupplierPhone('');
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleSavePurchase = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!supplierId) {
      toast.error('Please select a supplier');
      return;
    }
    if (items.length === 0) {
      toast.error('Please add at least 1 product to purchase order');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId,
          purchaseNo,
          date,
          notes,
          items,
          total: Number(grandTotal.toFixed(3)),
        }),
      });

      if (res.ok) {
        const purchase = await res.json();
        toast.success(`Purchase #${purchase.purchaseNo} created and stock updated! 🎉`);
        router.push(`/purchases/${purchase.id}`);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to save purchase order');
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/purchases')} className="gap-2 text-slate-600">
          <ArrowLeft className="w-4 h-4" /> Back to Purchases
        </Button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-orange-500" /> New Stock Intake Purchase Order
        </h1>
      </div>

      <form onSubmit={handleSavePurchase} className="space-y-6">
        {/* Supplier & Header Metadata */}
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-6 space-y-4 text-xs">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Supplier *</label>
                  <button
                    type="button"
                    onClick={() => setShowSupplierModal(true)}
                    className="text-orange-500 hover:underline font-bold text-[11px]"
                  >
                    + Add New
                  </button>
                </div>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 text-xs outline-none font-bold"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Purchase Order No *</label>
                <Input value={purchaseNo} onChange={(e) => setPurchaseNo(e.target.value)} required className="h-10 font-mono font-bold" />
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Intake Date *</label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} required className="h-10 font-mono" />
              </div>
            </div>

            <div>
              <label className="font-semibold text-slate-700 dark:text-slate-300">Purchase Notes / Remarks</label>
              <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. Batch shipment #8821 from Taiwan" />
            </div>
          </CardContent>
        </Card>

        {/* Products Selection & Order Items Table */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Left Column (5 Cols): Product Selector List */}
          <Card className="md:col-span-5 border-slate-200 dark:border-slate-800">
            <CardContent className="p-4 space-y-3">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Select Products for Intake</h3>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {products.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => handleAddItemRow(p)}
                    className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-orange-500/50 cursor-pointer transition-all flex items-center justify-between text-xs"
                  >
                    <div>
                      <h5 className="font-bold text-slate-900 dark:text-white">{p.nameEn}</h5>
                      <span className="text-[10px] text-slate-400 font-mono">
                        {p.itemCode} • Cost: {formatKWD(p.costPrice)}
                      </span>
                    </div>
                    <Button size="icon" variant="ghost" className="h-7 w-7 text-orange-500">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Right Column (7 Cols): Items Table & Grand Total */}
          <Card className="md:col-span-7 border-slate-200 dark:border-slate-800 flex flex-col justify-between">
            <CardContent className="p-4 space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Order Items ({items.length})</h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 font-semibold text-slate-500">
                    <tr>
                      <th className="p-2">Item</th>
                      <th className="p-2 w-20">Qty</th>
                      <th className="p-2 w-24">Cost (KD)</th>
                      <th className="p-2 text-right">Total</th>
                      <th className="p-2 w-8"></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                    {items.map((item) => (
                      <tr key={item.productId}>
                        <td className="p-2">
                          <p className="font-bold text-slate-900 dark:text-white">{item.nameEn}</p>
                          <span className="text-[10px] text-slate-400 font-mono">{item.itemCode}</span>
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            min="1"
                            value={item.qty}
                            onChange={(e) => handleUpdateItem(item.productId, 'qty', Number(e.target.value))}
                            className="h-8 font-mono text-xs"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            step="0.001"
                            value={item.costPrice}
                            onChange={(e) => handleUpdateItem(item.productId, 'costPrice', Number(e.target.value))}
                            className="h-8 font-mono text-xs"
                          />
                        </td>
                        <td className="p-2 text-right font-mono font-bold text-emerald-600">{formatKWD(item.lineTotal)}</td>
                        <td className="p-2">
                          <button
                            type="button"
                            onClick={() => handleRemoveItemRow(item.productId)}
                            className="text-slate-400 hover:text-red-500 p-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Grand Total Banner */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex justify-between items-center text-white">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Grand Total Purchase Value</span>
                <span className="text-2xl font-black font-mono text-emerald-400">{formatKWD(grandTotal)}</span>
              </div>
            </CardContent>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.push('/purchases')}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || items.length === 0} className="bg-orange-500 hover:bg-orange-600 text-white font-bold gap-2">
                <Save className="w-4 h-4" /> {isSubmitting ? 'Saving Intake...' : 'Save & Update Stock'}
              </Button>
            </div>
          </Card>
        </div>
      </form>

      {/* QUICK ADD SUPPLIER MODAL */}
      {showSupplierModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Quick Add Supplier</h3>
            <form onSubmit={handleQuickAddSupplier} className="space-y-3">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Supplier / Brand Name *</label>
                <Input value={newSupplierName} onChange={(e) => setNewSupplierName(e.target.value)} required placeholder="Makita Gulf FZE" />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Phone</label>
                <Input value={newSupplierPhone} onChange={(e) => setNewSupplierPhone(e.target.value)} placeholder="+965 2244 5566" />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setShowSupplierModal(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white font-bold">
                  Save & Select
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
