'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import {
  FileText,
  ArrowLeft,
  Plus,
  Trash2,
  Save,
  Search,
  Printer,
  Users,
  Calendar,
  AlertCircle,
  CreditCard,
  DollarSign,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatKWD, formatKWDNum } from '@/lib/utils';
import { toast } from 'sonner';

export default function EditInvoicePage() {
  const router = useRouter();
  const params = useParams();
  const invoiceId = params.id as string;

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [searchProductQuery, setSearchProductQuery] = useState('');
  const [showProductDropdown, setShowProductDropdown] = useState(false);

  // Form State
  const [invoiceNo, setInvoiceNo] = useState<number | null>(null);
  const [customerId, setCustomerId] = useState('');
  const [customerName, setCustomerName] = useState('Cash Customer');
  const [customerPhone, setCustomerPhone] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [type, setType] = useState('CASH');
  const [status, setStatus] = useState('PAID');
  const [narration, setNarration] = useState('');

  // Items State
  const [items, setItems] = useState<any[]>([]);

  // Financials State
  const [extraAmount, setExtraAmount] = useState<string>('0');
  const [discountAmount, setDiscountAmount] = useState<string>('0');
  const [paidAmount, setPaidAmount] = useState<string>('0');
  const [paymentMode, setPaymentMode] = useState('Cash');

  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        const [custRes, prodRes, invRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/products'),
          fetch(`/api/invoices/${invoiceId}`),
        ]);

        const custData = await custRes.json();
        const prodData = await prodRes.json();
        const invData = await invRes.json();

        if (Array.isArray(custData)) setCustomers(custData);
        if (Array.isArray(prodData)) setProducts(prodData);

        if (invData && !invData.error) {
          setInvoiceNo(invData.invoiceNo);
          setCustomerId(invData.customerId || '');
          setCustomerName(invData.customerNameSnap || 'Cash Customer');
          setCustomerPhone(invData.customerPhoneSnap || '');
          setDate(invData.dateTime ? new Date(invData.dateTime).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]);
          setType(invData.type || 'CASH');
          setStatus(invData.status || 'PAID');
          setNarration(invData.narration || '');

          setExtraAmount(String(Number(invData.extraAmount) || 0));
          setDiscountAmount(String(Number(invData.discountAmount) || 0));
          setPaidAmount(String(Number(invData.paidAmount) || 0));

          if (invData.payments && invData.payments[0]) {
            setPaymentMode(invData.payments[0].mode || 'Cash');
          }

          // Map items
          const mappedItems = (invData.items || []).map((i: any) => ({
            productId: i.productId,
            itemCodeSnap: i.itemCodeSnap || i.product?.itemCode || '',
            nameEnSnap: i.nameEnSnap || i.product?.nameEn || '',
            nameArSnap: i.nameArSnap || i.product?.nameAr || '',
            qty: Number(i.qty),
            price: Number(i.price),
            lineDiscount: Number(i.lineDiscount) || 0,
            amount: Number(i.amount),
          }));
          setItems(mappedItems);
        } else {
          toast.error(invData.error || 'Failed to load invoice');
        }
      } catch (e: any) {
        toast.error('Error loading invoice details');
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, [invoiceId]);

  // Handle Customer Selection
  const handleCustomerChange = (selectedId: string) => {
    setCustomerId(selectedId);
    if (!selectedId) {
      setCustomerName('Cash Customer');
      setCustomerPhone('');
      return;
    }
    const found = customers.find((c) => c.id === selectedId);
    if (found) {
      setCustomerName(found.nameEn);
      setCustomerPhone(found.phone || '');
    }
  };

  // Filter products for search dropdown
  const filteredProducts = searchProductQuery.trim().length > 0
    ? products.filter((p) => {
        const q = searchProductQuery.toLowerCase();
        return (
          p.nameEn?.toLowerCase().includes(q) ||
          p.nameAr?.includes(q) ||
          p.itemCode?.toLowerCase().includes(q) ||
          p.barcode?.toLowerCase().includes(q)
        );
      }).slice(0, 10)
    : [];

  const handleAddItem = (product: any) => {
    const existingIndex = items.findIndex((i) => i.productId === product.id);
    if (existingIndex > -1) {
      const updated = [...items];
      updated[existingIndex].qty += 1;
      const subtotal = updated[existingIndex].qty * updated[existingIndex].price;
      updated[existingIndex].amount = Number((subtotal - (updated[existingIndex].lineDiscount || 0)).toFixed(3));
      setItems(updated);
    } else {
      const price = Number(product.salePrice || 0);
      const newItem = {
        productId: product.id,
        itemCodeSnap: product.itemCode,
        nameEnSnap: product.nameEn,
        nameArSnap: product.nameAr,
        qty: 1,
        price: price,
        lineDiscount: 0,
        amount: price,
      };
      setItems([...items, newItem]);
    }
    setSearchProductQuery('');
    setShowProductDropdown(false);
  };

  const handleUpdateItemField = (productId: string, field: 'qty' | 'price' | 'lineDiscount', value: number) => {
    const updated = items.map((item) => {
      if (item.productId === productId) {
        const newQty = field === 'qty' ? value : item.qty;
        const newPrice = field === 'price' ? value : item.price;
        const newDiscount = field === 'lineDiscount' ? value : item.lineDiscount;
        const lineTotal = Math.max(0, (newQty * newPrice) - newDiscount);
        return {
          ...item,
          qty: newQty,
          price: newPrice,
          lineDiscount: newDiscount,
          amount: Number(lineTotal.toFixed(3)),
        };
      }
      return item;
    });
    setItems(updated);
  };

  const handleRemoveItem = (productId: string) => {
    setItems(items.filter((i) => i.productId !== productId));
  };

  // Totals calculations
  const grossTotal = items.reduce((acc, i) => acc + (i.qty * i.price), 0);
  const totalLineDiscounts = items.reduce((acc, i) => acc + (i.lineDiscount || 0), 0);
  const extraVal = parseFloat(extraAmount) || 0;
  const generalDiscountVal = parseFloat(discountAmount) || 0;
  const netAmount = Math.max(0, grossTotal - totalLineDiscounts - generalDiscountVal + extraVal);

  // Sync paid amount when type is CASH
  useEffect(() => {
    if (type === 'CASH') {
      setPaidAmount(String(netAmount.toFixed(3)));
      setStatus('PAID');
    } else if (type === 'CREDIT' && paidAmount === '0') {
      setStatus('UNPAID');
    }
  }, [type, netAmount]);

  const numPaid = parseFloat(paidAmount) || 0;
  const dueAmount = Math.max(0, Number((netAmount - numPaid).toFixed(3)));

  const handleSave = async (printAfterSave = false) => {
    if (items.length === 0) {
      toast.error('Invoice must contain at least 1 product');
      return;
    }

    if (!customerName.trim()) {
      toast.error('Customer name is required');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        customerId: customerId || null,
        customerNameSnap: customerName.trim(),
        customerPhoneSnap: customerPhone.trim() || null,
        dateTime: new Date(date).toISOString(),
        type,
        narration: narration.trim() || null,
        grossAmount: Number(grossTotal.toFixed(3)),
        discountAmount: Number((generalDiscountVal + totalLineDiscounts).toFixed(3)),
        extraAmount: Number(extraVal.toFixed(3)),
        netAmount: Number(netAmount.toFixed(3)),
        paidAmount: Number(numPaid.toFixed(3)),
        dueAmount: Number(dueAmount.toFixed(3)),
        status: dueAmount <= 0 ? 'PAID' : numPaid > 0 ? 'PARTIAL' : 'UNPAID',
        items: items.map((i) => ({
          productId: i.productId,
          itemCodeSnap: i.itemCodeSnap,
          nameEnSnap: i.nameEnSnap,
          nameArSnap: i.nameArSnap,
          qty: i.qty,
          price: i.price,
          lineDiscount: i.lineDiscount,
          amount: i.amount,
        })),
        payments: [
          {
            mode: paymentMode,
            amount: Number(numPaid.toFixed(3)),
            reference: narration || null,
          },
        ],
      };

      const res = await fetch(`/api/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to update invoice');
      }

      toast.success(`Invoice #RT-${invoiceNo} updated successfully!`);

      if (printAfterSave) {
        router.push(`/invoices/${invoiceId}?print=true`);
      } else {
        router.push(`/invoices/${invoiceId}`);
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <div className="inline-block w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mb-3" />
        <p className="font-semibold text-sm">Loading invoice for editing...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-16 font-sans">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Button
            variant="ghost"
            onClick={() => router.push(`/invoices/${invoiceId}`)}
            className="gap-2 text-slate-500 hover:text-slate-900 dark:hover:text-white text-xs mb-1 p-0 h-auto"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Invoice
          </Button>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/10 text-orange-500 flex items-center justify-center">
              <FileText className="w-5 h-5" />
            </div>
            <span>Edit Sales Invoice #RT-{invoiceNo}</span>
            <Badge variant={status === 'PAID' ? 'success' : 'warning'}>{status}</Badge>
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Modify invoice items, change customer details, edit quantities/prices, and save changes with automated stock sync.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => router.push(`/invoices/${invoiceId}`)}
            className="text-xs font-bold border-slate-300 dark:border-slate-700"
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleSave(true)}
            disabled={isSubmitting}
            className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold gap-2 h-9"
          >
            <Printer className="w-4 h-4" /> Save & Print
          </Button>
          <Button
            onClick={() => handleSave(false)}
            disabled={isSubmitting}
            className="bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold gap-2 h-9 shadow-md shadow-orange-500/20"
          >
            <Save className="w-4 h-4" /> {isSubmitting ? 'Saving...' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Invoice Customer & Details Card */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
        <CardContent className="p-6 space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Customer Select */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Customer Account
              </label>
              <select
                value={customerId}
                onChange={(e) => handleCustomerChange(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs outline-none text-slate-900 dark:text-white font-medium"
              >
                <option value="">Walk-in Cash Customer</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nameEn} ({c.phone})
                  </option>
                ))}
              </select>
            </div>

            {/* Customer Name Snap */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Customer Name *
              </label>
              <Input
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                placeholder="Cash Customer"
                className="h-9 text-xs bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700"
              />
            </div>

            {/* Customer Phone Snap */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Customer Mobile (+965)
              </label>
              <Input
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                placeholder="9099 7484"
                className="h-9 text-xs bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700"
              />
            </div>

            {/* Invoice Date */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Invoice Date *
              </label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="h-9 text-xs bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
            {/* Invoice Type */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Billing Type
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs outline-none text-slate-900 dark:text-white font-semibold"
              >
                <option value="CASH">CASH (نقدي)</option>
                <option value="CREDIT">CREDIT (آجل)</option>
                <option value="QUOTATION">QUOTATION (عرض سعر)</option>
              </select>
            </div>

            {/* Payment Mode */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Payment Method
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full h-9 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 text-xs outline-none text-slate-900 dark:text-white font-semibold"
              >
                <option value="Cash">Cash (نقدي)</option>
                <option value="K-Net">K-Net (كي نت)</option>
                <option value="Credit">Credit / Due (آجل)</option>
                <option value="Split">Split (مقسم)</option>
              </select>
            </div>

            {/* Narration */}
            <div className="md:col-span-2">
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                Narration / Invoice Remarks
              </label>
              <Input
                value={narration}
                onChange={(e) => setNarration(e.target.value)}
                placeholder="Optional notes, delivery details, etc."
                className="h-9 text-xs bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Product Search & Quick Add */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-2 relative">
        <label className="font-bold text-xs text-slate-700 dark:text-slate-300 flex items-center gap-2">
          <Search className="w-4 h-4 text-orange-500" /> Add Product to Invoice
        </label>
        <div className="relative">
          <Input
            value={searchProductQuery}
            onChange={(e) => {
              setSearchProductQuery(e.target.value);
              setShowProductDropdown(true);
            }}
            onFocus={() => setShowProductDropdown(true)}
            placeholder="Search by Product Name, Item Code, or Scan Barcode..."
            className="pl-10 h-10 text-xs bg-slate-50 dark:bg-slate-950 border-slate-300 dark:border-slate-700"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
        </div>

        {/* Dropdown Results */}
        {showProductDropdown && filteredProducts.length > 0 && (
          <div className="absolute top-full left-4 right-4 z-30 mt-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-2xl overflow-hidden max-h-60 overflow-y-auto">
            {filteredProducts.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleAddItem(p)}
                className="w-full text-left p-3 hover:bg-orange-50 dark:hover:bg-slate-800 flex items-center justify-between border-b border-slate-100 dark:border-slate-800 last:border-none transition-colors"
              >
                <div>
                  <div className="font-bold text-xs text-slate-900 dark:text-white">{p.nameEn}</div>
                  <div className="text-[11px] text-slate-400 font-mono">
                    Code: {p.itemCode} {p.barcode ? `| Barcode: ${p.barcode}` : ''}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-mono font-bold text-emerald-600 text-xs">{formatKWD(p.salePrice)}</div>
                  <span className="text-[10px] text-slate-400">Stock: {p.stockQty}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Invoice Items Breakdown Table */}
      <Card className="border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900/90 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-500 uppercase tracking-wider">
                <tr>
                  <th className="p-3.5 pl-6">#</th>
                  <th className="p-3.5 min-w-[200px]">Product Description</th>
                  <th className="p-3.5 text-center w-28">Quantity</th>
                  <th className="p-3.5 text-right w-32">Sale Price (KD)</th>
                  <th className="p-3.5 text-right w-28">Line Discount</th>
                  <th className="p-3.5 text-right w-32 font-mono">Total (KD)</th>
                  <th className="p-3.5 pr-6 text-right w-16">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No items in this invoice. Search and add products above.
                    </td>
                  </tr>
                ) : (
                  items.map((item, index) => (
                    <tr key={item.productId} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                      <td className="p-3.5 pl-6 font-mono text-slate-400">{index + 1}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900 dark:text-white">{item.nameEnSnap}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{item.itemCodeSnap}</div>
                      </td>
                      {/* Qty Input */}
                      <td className="p-3.5 text-center">
                        <Input
                          type="number"
                          min="1"
                          value={item.qty}
                          onChange={(e) =>
                            handleUpdateItemField(
                              item.productId,
                              'qty',
                              Math.max(1, parseInt(e.target.value) || 1)
                            )
                          }
                          className="w-20 mx-auto text-center font-mono font-bold h-8 text-xs bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                        />
                      </td>
                      {/* Price Input (Supports manual price override) */}
                      <td className="p-3.5 text-right">
                        <Input
                          type="number"
                          step="0.001"
                          min="0"
                          value={item.price}
                          onChange={(e) =>
                            handleUpdateItemField(
                              item.productId,
                              'price',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-24 ml-auto text-right font-mono font-bold h-8 text-xs bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700"
                        />
                      </td>
                      {/* Line Discount */}
                      <td className="p-3.5 text-right">
                        <Input
                          type="number"
                          step="0.001"
                          min="0"
                          value={item.lineDiscount}
                          onChange={(e) =>
                            handleUpdateItemField(
                              item.productId,
                              'lineDiscount',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-20 ml-auto text-right font-mono h-8 text-xs bg-white dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-500"
                        />
                      </td>
                      {/* Total */}
                      <td className="p-3.5 text-right font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {formatKWDNum(item.amount)} KD
                      </td>
                      {/* Remove Button */}
                      <td className="p-3.5 pr-6 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(item.productId)}
                          className="h-8 w-8 p-0 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Financial Calculations Summary Box */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Left: Extra adjustments & Notes */}
        <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
          <CardContent className="p-5 space-y-4 text-xs">
            <h3 className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider">
              Adjustments & Discounts
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Bill Discount (KD)
                </label>
                <Input
                  type="number"
                  step="0.001"
                  min="0"
                  value={discountAmount}
                  onChange={(e) => setDiscountAmount(e.target.value)}
                  className="font-mono h-9 text-xs"
                />
              </div>
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Extra / Delivery (KD)
                </label>
                <Input
                  type="number"
                  step="0.001"
                  min="0"
                  value={extraAmount}
                  onChange={(e) => setExtraAmount(e.target.value)}
                  className="font-mono h-9 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Paid Amount (KD)
                </label>
                <Input
                  type="number"
                  step="0.001"
                  min="0"
                  value={paidAmount}
                  onChange={(e) => setPaidAmount(e.target.value)}
                  className="font-mono font-bold h-9 text-xs text-emerald-600"
                />
              </div>
              <div>
                <label className="font-bold text-slate-600 dark:text-slate-400 block mb-1">
                  Balance / Due (KD)
                </label>
                <div className="h-9 px-3 rounded-md bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center font-mono font-bold text-rose-600">
                  {formatKWDNum(dueAmount)} KD
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right: Net Bill Summary Card */}
        <Card className="border-orange-200 dark:border-orange-950 bg-gradient-to-br from-orange-50/60 to-orange-100/30 dark:from-orange-950/20 dark:to-slate-900 shadow-sm">
          <CardContent className="p-6 space-y-3">
            <div className="flex justify-between items-center text-xs text-slate-600 dark:text-slate-400">
              <span>Gross Items Subtotal:</span>
              <span className="font-mono font-bold">{formatKWDNum(grossTotal)} KD</span>
            </div>
            {totalLineDiscounts > 0 && (
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Line Discounts:</span>
                <span className="font-mono font-bold text-rose-600">-{formatKWDNum(totalLineDiscounts)} KD</span>
              </div>
            )}
            {generalDiscountVal > 0 && (
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>General Discount:</span>
                <span className="font-mono font-bold text-rose-600">-{formatKWDNum(generalDiscountVal)} KD</span>
              </div>
            )}
            {extraVal > 0 && (
              <div className="flex justify-between items-center text-xs text-slate-500">
                <span>Extra Charges:</span>
                <span className="font-mono font-bold text-blue-600">+{formatKWDNum(extraVal)} KD</span>
              </div>
            )}

            <div className="pt-4 border-t-2 border-orange-200 dark:border-orange-900/50 flex justify-between items-baseline">
              <span className="text-sm font-black uppercase tracking-wider text-slate-900 dark:text-white">
                Net Payable:
              </span>
              <span className="text-3xl font-black font-mono text-orange-600 dark:text-orange-400">
                {formatKWDNum(netAmount)} <span className="text-sm font-sans text-slate-600">KD</span>
              </span>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <Button
                onClick={() => handleSave(true)}
                disabled={isSubmitting}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs gap-2"
              >
                <Printer className="w-4 h-4" /> Save & Print
              </Button>
              <Button
                onClick={() => handleSave(false)}
                disabled={isSubmitting}
                className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs gap-2"
              >
                <Save className="w-4 h-4" /> {isSubmitting ? 'Saving...' : 'Save Updated Invoice'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
