'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ShoppingBag, ArrowLeft, Plus, Trash2, Building2, Save, Search, CreditCard, Tag, TrendingDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { formatKWD, formatKWDNum } from '@/lib/utils';
import { toast } from 'sonner';
import { useSearchStore } from '@/stores/search-store';
import { SupplierPriceCompareModal } from '@/components/shared/SupplierPriceCompareModal';

const PAYMENT_MODES = [
  { id: 'Cash', nameEn: 'Cash', nameAr: 'نقدي' },
  { id: 'K-Net', nameEn: 'K-Net', nameAr: 'كي نت' },
  { id: 'Visa / Card', nameEn: 'Visa / Card', nameAr: 'فيزا / بطاقة' },
  { id: 'Cheque', nameEn: 'Cheque', nameAr: 'شيك' },
];

export default function EditPurchasePage() {
  const router = useRouter();
  const params = useParams();
  const purchaseId = params.id as string;

  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);

  // Form State
  const [supplierId, setSupplierId] = useState('');
  const [purchaseNo, setPurchaseNo] = useState(`PUR-${Date.now().toString().slice(-6)}`);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState<'PAID' | 'PARTIAL' | 'UNPAID'>('PAID');
  const [paymentMode, setPaymentMode] = useState('Cash');
  const [discount, setDiscount] = useState('0');
  const [paidAmount, setPaidAmount] = useState('');
  const [items, setItems] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quick Add Supplier Modal State
  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [showPriceCompareModal, setShowPriceCompareModal] = useState(false);
  const [compareProductId, setCompareProductId] = useState<string | undefined>(undefined);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [newSupplierPhone, setNewSupplierPhone] = useState('');

  const { globalSearch } = useSearchStore();

  useEffect(() => {
    async function loadData() {
      try {
        const [supRes, prodRes, purRes] = await Promise.all([
          fetch('/api/suppliers'),
          fetch('/api/products'),
          fetch(`/api/purchases/${purchaseId}`)
        ]);
        const supData = await supRes.json();
        const prodData = await prodRes.json();
        const purData = await purRes.json();

        if (Array.isArray(supData)) {
          setSuppliers(supData);
        }
        if (Array.isArray(prodData)) setProducts(prodData);
        
        if (purData && !purData.error) {
          setSupplierId(purData.supplierId);
          setPurchaseNo(purData.purchaseNo);
          setDate(new Date(purData.date).toISOString().split('T')[0]);
          setNotes(purData.notes || '');
          setItems(purData.items || []);
          setStatus(purData.status || 'PAID');
          setPaymentMode(purData.paymentMethod || 'Cash');
          setDiscount(String(Number(purData.discount) || 0));
          setPaidAmount(String(Number(purData.paidAmount) || 0));
        } else {
          toast.error('Purchase not found');
        }
      } catch (e) {
        toast.error('Failed to load form data');
      }
    }
    loadData();
  }, [purchaseId]);

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

  // Financial Calculations
  const grossTotal = items.reduce((acc, i) => acc + i.lineTotal, 0);
  const discountVal = Math.max(0, parseFloat(discount) || 0);
  const netTotal = Math.max(0, Number((grossTotal - discountVal).toFixed(3)));

  let numPaid = netTotal;
  let dueAmount = 0;

  if (status === 'PAID') {
    numPaid = netTotal;
    dueAmount = 0;
  } else if (status === 'UNPAID') {
    numPaid = 0;
    dueAmount = netTotal;
  } else if (status === 'PARTIAL') {
    numPaid = Math.max(0, parseFloat(paidAmount) || 0);
    dueAmount = Math.max(0, Number((netTotal - numPaid).toFixed(3)));
  }

  const handleStatusChange = (newStatus: 'PAID' | 'PARTIAL' | 'UNPAID') => {
    setStatus(newStatus);
    if (newStatus === 'PARTIAL' && (!paidAmount || paidAmount === '0')) {
      setPaidAmount('');
    } else if (newStatus === 'PAID') {
      setPaidAmount(String(netTotal.toFixed(3)));
    } else if (newStatus === 'UNPAID') {
      setPaidAmount('0');
    }
  };

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

    if (status === 'PARTIAL' && numPaid <= 0) {
      toast.error('Please enter the partially paid amount');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch(`/api/purchases/${purchaseId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          supplierId,
          purchaseNo,
          date,
          notes,
          status,
          paymentMethod: paymentMode,
          subtotal: Number(grossTotal.toFixed(3)),
          discount: Number(discountVal.toFixed(3)),
          total: Number(netTotal.toFixed(3)),
          paidAmount: Number(numPaid.toFixed(3)),
          dueAmount: Number(dueAmount.toFixed(3)),
          items,
        }),
      });

      if (res.ok) {
        const purchase = await res.json();
        toast.success(`Purchase #${purchase.purchaseNo} updated successfully! 🎉`);
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
        <Button variant="ghost" onClick={() => router.push(`/purchases/${purchaseId}`)} className="gap-2 text-slate-600">
          <ArrowLeft className="w-4 h-4" /> Back to Purchase Details
        </Button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-orange-500" /> Edit Purchase Invoice #{purchaseNo}
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
                  className="w-full h-10 rounded-lg border border-slate-200 dark:border-slate-800 bg-transparent px-3 text-xs outline-none font-bold text-slate-900 dark:text-white"
                >
                  {suppliers.map((s) => (
                    <option key={s.id} value={s.id} className="text-slate-900 dark:text-white dark:bg-slate-900">
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
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-500">Select Products for Intake</h3>
                <button
                  type="button"
                  onClick={() => {
                    setCompareProductId(undefined);
                    setShowPriceCompareModal(true);
                  }}
                  className="text-emerald-600 dark:text-emerald-400 hover:underline font-bold text-[11px] flex items-center gap-1"
                >
                  <TrendingDown className="w-3 h-3" /> Compare Rates
                </button>
              </div>
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {products
                  .filter((p) => {
                    if (!globalSearch) return true;
                    const s = globalSearch.toLowerCase();
                    return (
                      p.nameEn.toLowerCase().includes(s) ||
                      p.nameAr.includes(s) ||
                      p.itemCode.toLowerCase().includes(s) ||
                      (p.barcode && p.barcode.includes(s))
                    );
                  })
                  .map((p) => (
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
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        title="Compare supplier prices & rate history"
                        onClick={(e) => {
                          e.stopPropagation();
                          setCompareProductId(p.id);
                          setShowPriceCompareModal(true);
                        }}
                        className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 flex items-center justify-center transition-colors"
                      >
                        <TrendingDown className="w-3.5 h-3.5" />
                      </button>
                      <Button type="button" size="icon" variant="ghost" className="h-7 w-7 text-orange-500">
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Right Column (7 Cols): Items Table, Discount, Payment Modes & Grand Total */}
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
                    {items.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="p-6 text-center text-slate-400 text-xs">
                          No products in order. Click (+) on any product from the left list.
                        </td>
                      </tr>
                    ) : (
                      items.map((item) => (
                        <tr key={item.productId}>
                          <td className="p-2">
                            <p className="font-bold text-slate-900 dark:text-white">{item.nameEn}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] text-slate-400 font-mono">{item.itemCode}</span>
                                <button
                                  type="button"
                                  title="Check best supplier prices"
                                  onClick={() => {
                                    setCompareProductId(item.productId);
                                    setShowPriceCompareModal(true);
                                  }}
                                  className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold flex items-center gap-0.5"
                                >
                                  <TrendingDown className="w-3 h-3" /> Rates
                                </button>
                              </div>
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
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Discount Field */}
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4 text-orange-500" />
                  <div>
                    <span className="font-bold text-xs text-slate-800 dark:text-slate-200 block">
                      Bill Discount / الخصم بالدينار
                    </span>
                    <span className="text-[10px] text-slate-400">Discount given on total order</span>
                  </div>
                </div>
                <div className="w-36">
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    value={discount}
                    onChange={(e) => setDiscount(e.target.value)}
                    placeholder="0.000"
                    className="h-9 font-mono font-bold text-right text-xs bg-white dark:bg-slate-900"
                  />
                </div>
              </div>

              {/* Payment Status & Modes Section */}
              <div className="space-y-3 pt-1">
                {/* 3 Status Pills: Paid | Partially | Unpaid */}
                <div>
                  <label className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1 mb-1.5">
                    <CreditCard className="w-3 h-3 text-emerald-500" /> Payment Status & Mode
                  </label>
                  <div className="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
                    <button
                      type="button"
                      onClick={() => handleStatusChange('PAID')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                        status === 'PAID'
                          ? 'bg-emerald-600/30 text-emerald-400 border border-emerald-500/50 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Paid (مدفوع)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange('PARTIAL')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                        status === 'PARTIAL'
                          ? 'bg-amber-500/30 text-amber-300 border border-amber-500/50 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Partially (جزئي)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleStatusChange('UNPAID')}
                      className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-colors ${
                        status === 'UNPAID'
                          ? 'bg-rose-600/30 text-rose-400 border border-rose-500/50 shadow-sm'
                          : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Unpaid (آجل)
                    </button>
                  </div>
                </div>

                {/* Payment Method Selector (Cash, K-Net, Visa, etc.) */}
                {status !== 'UNPAID' && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 dark:text-slate-400">
                      <span>Select Payment Method:</span>
                      <span className="text-orange-500 font-bold">{paymentMode}</span>
                    </div>
                    <div className="grid grid-cols-4 gap-1.5">
                      {PAYMENT_MODES.map((mode) => (
                        <button
                          key={mode.id}
                          type="button"
                          onClick={() => setPaymentMode(mode.id)}
                          className={`p-2 rounded-lg border text-center text-[11px] font-bold transition-all ${
                            paymentMode === mode.id
                              ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                              : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                          }`}
                        >
                          <div>{mode.nameEn}</div>
                          <div className="text-[9px] opacity-80">{mode.nameAr}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* When Partially Paid: Type Paid Amount Field */}
                {status === 'PARTIAL' && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-amber-900 dark:text-amber-300 block mb-1">
                          Paid Amount (KD) / المبلغ المدفوع *
                        </label>
                        <Input
                          type="number"
                          step="0.001"
                          min="0"
                          max={netTotal}
                          value={paidAmount}
                          onChange={(e) => setPaidAmount(e.target.value)}
                          placeholder="Type paid amount..."
                          autoFocus
                          className="h-9 font-mono font-bold text-xs bg-white dark:bg-slate-900 border-amber-300 text-emerald-600"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                          Remaining Due (KD) / المتبقي
                        </label>
                        <div className="h-9 px-3 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center font-mono font-black text-rose-600 text-xs">
                          {formatKWD(dueAmount)}
                        </div>
                      </div>
                    </div>
                    <p className="text-[10px] text-amber-700 dark:text-amber-400 italic">
                      Client will pay {formatKWD(numPaid)} now via {paymentMode}, and {formatKWD(dueAmount)} will remain balance due.
                    </p>
                  </div>
                )}

                {/* Grand Total Summary Card */}
                <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-white space-y-2">
                  <div className="flex justify-between items-center text-xs text-slate-400 font-medium">
                    <span>Items Gross Total:</span>
                    <span className="font-mono font-bold text-slate-200">{formatKWD(grossTotal)}</span>
                  </div>
                  {discountVal > 0 && (
                    <div className="flex justify-between items-center text-xs text-rose-400 font-medium">
                      <span>Discount Given:</span>
                      <span className="font-mono font-bold">-{formatKWD(discountVal)}</span>
                    </div>
                  )}
                  <div className="pt-2 border-t border-slate-800 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                        Net Purchase Value
                      </span>
                      <span className="text-[10px] text-slate-500">
                        {status === 'PAID'
                          ? `Paid via ${paymentMode}`
                          : status === 'PARTIAL'
                          ? `Paid: ${formatKWD(numPaid)} • Due: ${formatKWD(dueAmount)}`
                          : 'Unpaid (Due: Full Amount)'}
                      </span>
                    </div>
                    <span className="text-2xl font-black font-mono text-emerald-400">{formatKWD(netTotal)}</span>
                  </div>
                </div>
              </div>
            </CardContent>

            <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => router.push(`/purchases/${purchaseId}`)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || items.length === 0} className="bg-orange-500 hover:bg-orange-600 text-white font-bold gap-2">
                <Save className="w-4 h-4" /> {isSubmitting ? 'Saving Changes...' : 'Save Updated Invoice'}
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
    
      {/* Supplier Price Comparison Modal */}
      <SupplierPriceCompareModal
        isOpen={showPriceCompareModal}
        onClose={() => setShowPriceCompareModal(false)}
        initialProductId={compareProductId}
      />
    </div>
  );
}
