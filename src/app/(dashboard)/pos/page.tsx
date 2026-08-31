'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
  Barcode,
  Search,
  Plus,
  Minus,
  Trash2,
  Receipt,
  User,
  CreditCard,
  CheckCircle2,
  PauseCircle,
  RotateCcw,
  Sparkles,
  HelpCircle,
  ChevronDown,
  X,
} from 'lucide-react';
import { usePosStore } from '@/stores/pos-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatKWD, formatKWDNum } from '@/lib/utils';
import { PAYMENT_MODES, INVOICE_TYPES } from '@/lib/constants';
import { toast } from 'sonner';
import { FeatureLockOverlay } from '@/components/shared/FeatureLockOverlay';

export default function PosPage() {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  const barcodeInputRef = useRef<HTMLInputElement>(null);

  // Store state
  const {
    cart,
    customer,
    invoiceType,
    discountAmount,
    extraAmount,
    narration,
    payments,
    heldBills,
    addToCart,
    updateQty,
    setQty,
    updatePrice,
    removeFromCart,
    clearCart,
    setCustomer,
    setInvoiceType,
    setDiscountAmount,
    setExtraAmount,
    setNarration,
    setPaymentAmount,
    resetPayments,
    holdBill,
    recallBill,
    removeHeldBill,
  } = usePosStore();

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

  // Local Component State
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [barcodeInput, setBarcodeInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showHeldModal, setShowHeldModal] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  
  const [discountStr, setDiscountStr] = useState('');
  const [extraStr, setExtraStr] = useState('');

  useEffect(() => {
    if (discountAmount === 0) setDiscountStr('');
    else if (parseFloat(discountStr) !== discountAmount) setDiscountStr(discountAmount.toString());
  }, [discountAmount]);

  useEffect(() => {
    if (extraAmount === 0) setExtraStr('');
    else if (parseFloat(extraStr) !== extraAmount) setExtraStr(extraAmount.toString());
  }, [extraAmount]);

  // Load products & categories
  useEffect(() => {
    async function loadData() {
      try {
        const [prodRes, catRes, custRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/categories'),
          fetch('/api/customers'),
        ]);
        const prodData = await prodRes.json();
        const catData = await catRes.json();
        const custData = await custRes.json();

        if (Array.isArray(prodData)) setProducts(prodData);
        if (Array.isArray(catData)) setCategories(catData);
        if (Array.isArray(custData)) setCustomers(custData);
      } catch (e) {
        toast.error('Failed to load POS data');
      }
    }
    loadData();
  }, []);

  // Filter products by category & search query
  const filteredProducts = products.filter((p) => {
    const matchesCategory = !selectedCategory || p.categoryId === selectedCategory;
    const matchesSearch =
      !searchQuery ||
      p.nameEn.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.nameAr.includes(searchQuery) ||
      p.itemCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchQuery));
    return matchesCategory && matchesSearch;
  });

  // Handle Barcode Scan Enter
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const matched = products.find(
      (p) => p.barcode === barcodeInput.trim() || p.itemCode.toLowerCase() === barcodeInput.trim().toLowerCase()
    );

    if (matched) {
      addToCart(matched, 1);
      toast.success(`Added ${matched.nameEn} to cart`);
      setBarcodeInput('');
    } else {
      toast.error(`No product found with code: ${barcodeInput}`);
    }
  };

  // Cart Totals Calculation
  const grossAmount = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
  const netAmount = Math.max(0, grossAmount - discountAmount + extraAmount);

  // Sync payments mode amount to netAmount if single cash payment
  useEffect(() => {
    if (payments.length === 1 && payments[0].mode === 'CASH') {
      setPaymentAmount('CASH', Number(netAmount.toFixed(3)));
    }
  }, [netAmount]);

  const totalPaid = payments.reduce((acc, p) => acc + p.amount, 0);
  const dueAmount = Math.max(0, Number((netAmount - totalPaid).toFixed(3)));

  // Save & Print Invoice Execution
  const handleSaveInvoice = async (shouldPrint = true) => {
    if (cart.length === 0) {
      toast.error('Cart is empty! Add at least one product.');
      return;
    }

    if (invoiceType === 'CREDIT' && customer?.id === 'cash-customer-default') {
      toast.error('Credit invoices require selecting a registered customer.');
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        type: invoiceType,
        customerId: customer?.id || null,
        customerNameSnap: customer?.nameEn || 'Cash Customer',
        customerPhoneSnap: customer?.phone || null,
        narration,
        items: cart,
        payments: payments.filter((p) => p.amount > 0),
        grossAmount: Number(grossAmount.toFixed(3)),
        discountAmount: Number(discountAmount.toFixed(3)),
        extraAmount: Number(extraAmount.toFixed(3)),
        netAmount: Number(netAmount.toFixed(3)),
        paidAmount: Number(totalPaid.toFixed(3)),
        dueAmount: Number(dueAmount.toFixed(3)),
      };

      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const invoice = await res.json();
        toast.success(`Invoice RT-${invoice.invoiceNo} saved successfully! 🎉`);
        clearCart();
        if (shouldPrint) {
          router.push(`/invoices/${invoice.id}?print=true`);
        }
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to save invoice');
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F1') {
        e.preventDefault();
        barcodeInputRef.current?.focus();
      } else if (e.key === 'F9') {
        e.preventDefault();
        handleSaveInvoice(true);
      } else if (e.key === 'Escape') {
        e.preventDefault();
        clearCart();
      } else if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        holdBill();
        toast.info('Bill held successfully');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [cart, customer, netAmount, payments]);

  return (
    <FeatureLockOverlay isLocked={Boolean(toggles && !toggles.enablePos)}>
      <div className="h-[calc(100vh-4rem)] flex flex-col -m-4 sm:-m-6 lg:-m-8 bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* 1. POS TOPBAR CONTROL STRIP */}
      <div className="h-14 px-6 bg-slate-900 border-b border-slate-800 flex items-center justify-between z-20 shrink-0">
        {/* Left: Bill Info & Type Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-semibold uppercase">Bill No:</span>
            <Badge className="bg-blue-600 text-white font-mono text-sm font-bold">RT-Auto</Badge>
          </div>

          <div className="h-5 w-px bg-slate-800" />

          {/* Invoice Type Dropdown */}
          <select
            value={invoiceType}
            onChange={(e) => {
              const val = e.target.value;
              if (val === 'QUOTATION' && toggles && !toggles.enableQuotations) {
                toast.error('Quotation feature is locked. Please contact Super Admin.');
                return;
              }
              setInvoiceType(val as any);
            }}
            className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1 text-xs font-bold text-orange-400 outline-none focus:ring-1 focus:ring-orange-500"
          >
            {INVOICE_TYPES.map((t) => {
              const isLocked = t.id === 'QUOTATION' && toggles && !toggles.enableQuotations;
              return (
                <option key={t.id} value={t.id} disabled={isLocked}>
                  {t.labelEn} ({t.labelAr}) {isLocked ? '🔒 Locked' : ''}
                </option>
              );
            })}
          </select>
        </div>

        {/* Center: Customer Selector Button */}
        <div className="flex items-center gap-3">
          <Button
            onClick={() => setShowCustomerModal(true)}
            variant="outline"
            className="border-slate-800 bg-slate-950 hover:bg-slate-800 text-white text-xs font-semibold gap-2 h-9 px-4"
          >
            <User className="w-4 h-4 text-blue-400" />
            <span>{customer?.nameEn || 'Cash Customer'}</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-500" />
          </Button>

          {heldBills.length > 0 && (
            <Button
              onClick={() => setShowHeldModal(true)}
              variant="outline"
              className="border-amber-500/40 bg-amber-500/10 text-amber-400 text-xs font-bold gap-2 h-9"
            >
              <PauseCircle className="w-4 h-4" /> Recall Held ({heldBills.length})
            </Button>
          )}
        </div>

        {/* Right: Keyboard Hints */}
        <div className="hidden lg:flex items-center gap-3 text-[11px] text-slate-400">
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-mono">F1</kbd> Scan
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-mono">F9</kbd> Save & Print
          </span>
          <span>
            <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-white font-mono">Ctrl+H</kbd> Hold
          </span>
        </div>
      </div>

      {/* 2. MAIN POS WORKSPACE: LEFT (60% Products) & RIGHT (40% Cart) */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {/* LEFT PANEL (60% Width): Barcode Scanner, Search, Categories & Product Grid */}
        <div className="w-7/12 border-r border-slate-800 flex flex-col bg-slate-950 p-4 space-y-3 overflow-hidden">
          {/* Barcode & Text Search Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 shrink-0">
            {/* Auto Barcode Scanner */}
            <form onSubmit={handleBarcodeSubmit} className="relative">
              <Barcode className="w-4 h-4 absolute left-3 top-3 text-orange-400" />
              <Input
                ref={barcodeInputRef}
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value)}
                placeholder="Scan barcode... (F1)"
                autoFocus
                className="pl-9 bg-slate-900 border-slate-800 text-white text-xs h-10 focus-visible:ring-orange-500"
              />
            </form>

            {/* Name/Code Search */}
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-500" />
              <Input
                ref={searchInputRef}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search name, SKU, code..."
                className="pl-9 bg-slate-900 border-slate-800 text-white text-xs h-10 focus-visible:ring-blue-500"
              />
            </div>
          </div>

          {/* Category Chips Scrollbar */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 shrink-0 no-scrollbar">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                !selectedCategory ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
              }`}
            >
              All Categories
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedCategory(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === c.id ? 'bg-blue-600 text-white' : 'bg-slate-900 text-slate-400 hover:text-white'
                }`}
              >
                {c.icon} {c.nameEn}
              </button>
            ))}
          </div>

          {/* Products Cards Grid (Scrollable) */}
          <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 pr-1">
            {filteredProducts.map((product) => (
              <Card
                key={product.id}
                onClick={() => addToCart(product, 1)}
                className="bg-slate-900 border-slate-800 hover:border-blue-500/80 cursor-pointer transition-all hover:scale-[1.02] flex flex-col justify-between group"
              >
                <CardContent className="p-3 space-y-2">
                  <div className="flex justify-between items-start">
                    <span className="text-[10px] font-mono text-slate-400">{product.itemCode}</span>
                    <Badge variant={product.stockQty <= product.minStockAlert ? 'warning' : 'outline'} className="text-[9px] px-1.5 py-0 font-mono">
                      {product.stockQty} {product.unit}
                    </Badge>
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-white line-clamp-1 group-hover:text-blue-400">{product.nameEn}</h4>
                    <p className="text-[10px] text-slate-400 font-arabic line-clamp-1">{product.nameAr}</p>
                  </div>
                  <div className="pt-1 flex items-center justify-between border-t border-slate-800">
                    <span className="text-sm font-extrabold font-mono text-emerald-400">{formatKWD(product.salePrice)}</span>
                    <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-400 hover:text-white">
                      <Plus className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* RIGHT PANEL (40% Width): Cart Table, Totals, Payment Modes & Big Save Button */}
        <div className="w-5/12 bg-slate-900 flex flex-col justify-between overflow-hidden">
          {/* Cart Header */}
          <div className="p-3 border-b border-slate-800 flex justify-between items-center bg-slate-950 shrink-0">
            <span className="text-xs font-bold text-white flex items-center gap-2">
              <Receipt className="w-4 h-4 text-orange-400" /> Cart Items ({cart.length})
            </span>
            <Button onClick={clearCart} variant="ghost" size="sm" className="h-7 text-xs text-red-400 hover:text-red-300 gap-1">
              <Trash2 className="w-3.5 h-3.5" /> Clear Cart
            </Button>
          </div>

          {/* Cart Table (Scrollable) */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500 space-y-3">
                <Barcode className="w-12 h-12 text-slate-700 animate-pulse" />
                <p className="text-xs font-medium">Scan barcode or click products from left to add to bill</p>
              </div>
            ) : (
              cart.map((item) => (
                <div
                  key={item.productId}
                  className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <h5 className="text-xs font-bold text-white truncate">{item.nameEnSnap}</h5>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {formatKWD(item.price)} × {item.qty}
                    </p>
                  </div>

                  {/* Quantity Modifier Buttons */}
                  <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800">
                    <button onClick={() => updateQty(item.productId, -1)} className="p-1 hover:text-white text-slate-400 shrink-0">
                      <Minus className="w-3 h-3" />
                    </button>
                    <input
                      type="number"
                      min="1"
                      value={item.qty === 0 ? '' : item.qty}
                      onChange={(e) => {
                        const val = parseInt(e.target.value);
                        if (!isNaN(val) && val > 0) {
                          setQty(item.productId, val);
                        } else if (e.target.value === '') {
                          // Allow clearing the input temporarily while typing
                          setQty(item.productId, 0 as any); 
                        }
                      }}
                      onBlur={(e) => {
                        if (!e.target.value || parseInt(e.target.value) < 1) {
                          setQty(item.productId, 1);
                        }
                      }}
                      className="w-10 h-5 text-center font-mono font-bold text-xs text-white bg-slate-950 border border-slate-800 rounded outline-none focus:border-blue-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    />
                    <button onClick={() => updateQty(item.productId, 1)} className="p-1 hover:text-white text-slate-400 shrink-0">
                      <Plus className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Line Total Amount */}
                  <div className="text-right min-w-[70px]">
                    <span className="font-mono font-extrabold text-xs text-white">{formatKWD(item.amount)}</span>
                  </div>

                  <button onClick={() => removeFromCart(item.productId)} className="text-slate-600 hover:text-red-400 p-1">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>

          {/* Totals & Payments Section (Bottom Fixed) */}
          <div className="p-4 bg-slate-950 border-t border-slate-800 space-y-3 shrink-0">
            {/* Discount & Extra inputs */}
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold">Discount (KD)</label>
                <Input
                  type="number"
                  step="0.001"
                  value={discountStr}
                  onChange={(e) => {
                    setDiscountStr(e.target.value);
                    setDiscountAmount(parseFloat(e.target.value) || 0);
                  }}
                  className="h-8 bg-slate-900 border-slate-800 text-white font-mono text-xs mt-0.5"
                />
              </div>
              <div>
                <label className="text-[10px] text-slate-400 uppercase font-semibold">Extra Fee (KD)</label>
                <Input
                  type="number"
                  step="0.001"
                  value={extraStr}
                  onChange={(e) => {
                    setExtraStr(e.target.value);
                    setExtraAmount(parseFloat(e.target.value) || 0);
                  }}
                  className="h-8 bg-slate-900 border-slate-800 text-white font-mono text-xs mt-0.5"
                />
              </div>
            </div>

            {/* NET AMOUNT BANNER */}
            <div className="p-3.5 rounded-xl bg-gradient-to-r from-blue-900 to-slate-900 border border-blue-700/50 flex justify-between items-center shadow-lg">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-300 block">NET AMOUNT IN KWD</span>
                <span className="text-xs text-slate-300 font-mono">Gross: {formatKWD(grossAmount)}</span>
              </div>
              <span className="text-2xl font-black font-mono text-white">{formatKWD(netAmount)}</span>
            </div>

            {/* Payment Mode Selection */}
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-400 uppercase font-semibold flex items-center gap-1">
                <CreditCard className="w-3 h-3 text-emerald-400" /> Payment Mode Breakdown
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                {PAYMENT_MODES.map((mode) => {
                  const activePayment = payments.find((p) => p.mode === mode.id);
                  const isSelected = !!activePayment && activePayment.amount > 0;
                  return (
                    <button
                      key={mode.id}
                      type="button"
                      onClick={() => setPaymentAmount(mode.id as any, isSelected ? 0 : Number(netAmount.toFixed(3)))}
                      className={`p-2 rounded-lg border text-left text-[11px] font-bold transition-all ${
                        isSelected
                          ? 'bg-emerald-600/20 border-emerald-500 text-emerald-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      <div>{mode.nameEn}</div>
                      <div className="font-mono text-[10px] text-slate-300">{isSelected ? formatKWD(activePayment.amount) : '0.000'}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Big Action Buttons */}
            <div className="grid grid-cols-2 gap-2 pt-1">
              <Button
                onClick={() => holdBill()}
                disabled={cart.length === 0}
                variant="outline"
                className="h-11 border-slate-800 bg-slate-900 text-slate-300 hover:text-white text-xs font-bold gap-2"
              >
                <PauseCircle className="w-4 h-4 text-amber-400" /> HOLD BILL
              </Button>

              <Button
                onClick={() => handleSaveInvoice(true)}
                disabled={isSubmitting || cart.length === 0}
                className="h-11 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-sm shadow-xl shadow-emerald-600/30 gap-2"
              >
                {isSubmitting ? 'Saving...' : 'SAVE & PRINT (F9)'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* RECALL HELD BILLS MODAL */}
      {showHeldModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <PauseCircle className="w-5 h-5 text-amber-400" /> Held Bills List
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {heldBills.map((b) => (
                <div key={b.id} className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex justify-between items-center">
                  <div>
                    <h5 className="text-xs font-bold text-white">{b.customerName}</h5>
                    <p className="text-[10px] text-slate-400 font-mono">
                      {b.timestamp} • {b.cart.length} Items
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={() => {
                        recallBill(b.id);
                        setShowHeldModal(false);
                      }}
                      size="sm"
                      className="bg-blue-600 hover:bg-blue-500 text-white text-xs"
                    >
                      Recall
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            <Button onClick={() => setShowHeldModal(false)} variant="outline" className="w-full text-xs border-slate-800">
              Close
            </Button>
          </div>
        </div>
      )}

      {/* QUICK CUSTOMER SELECT MODAL */}
      {showCustomerModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white">Select Customer for Bill</h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              <div
                onClick={() => {
                  setCustomer({ id: 'cash-customer-default', nameEn: 'Cash Customer', nameAr: 'عميل نقدي', phone: '90000000', type: 'RETAIL' });
                  setShowCustomerModal(false);
                }}
                className="p-3 rounded-xl bg-slate-950 hover:bg-blue-950/40 border border-slate-800 cursor-pointer text-xs font-bold text-white"
              >
                Cash Customer / عميل نقدي
              </div>
              {customers.map((c) => (
                <div
                  key={c.id}
                  onClick={() => {
                    setCustomer(c);
                    setShowCustomerModal(false);
                  }}
                  className="p-3 rounded-xl bg-slate-950 hover:bg-blue-950/40 border border-slate-800 cursor-pointer text-xs font-bold text-white flex justify-between"
                >
                  <div>
                    <p>{c.nameEn}</p>
                    <p className="text-[10px] text-slate-400 font-mono">+965 {c.phone}</p>
                  </div>
                  <Badge variant="outline">{c.type}</Badge>
                </div>
              ))}
            </div>
            <Button onClick={() => setShowCustomerModal(false)} variant="outline" className="w-full text-xs border-slate-800">
              Close
            </Button>
          </div>
        </div>
      )}
      </div>
    </FeatureLockOverlay>
  );
}
