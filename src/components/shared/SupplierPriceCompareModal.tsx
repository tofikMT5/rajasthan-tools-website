'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import {
  Search,
  X,
  TrendingDown,
  Building2,
  Calendar,
  Award,
  ArrowRight,
  Package,
  Clock,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  CheckCircle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { formatKWD, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

interface SupplierPriceCompareModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProductId?: string;
  initialQuery?: string;
}

export function SupplierPriceCompareModal({
  isOpen,
  onClose,
  initialProductId,
  initialQuery,
}: SupplierPriceCompareModalProps) {
  const [query, setQuery] = useState(initialQuery || '');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(initialProductId || null);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const isInitialMount = useRef(true);

  // Sync props on open
  useEffect(() => {
    if (isOpen) {
      if (initialProductId) {
        setSelectedProductId(initialProductId);
        fetchData({ productId: initialProductId });
      } else if (initialQuery) {
        setQuery(initialQuery);
        fetchData({ query: initialQuery });
      } else {
        fetchData({});
      }
    }
  }, [isOpen, initialProductId, initialQuery]);

  // Live debounced search when user types
  useEffect(() => {
    if (!isOpen) return;
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) {
        fetchData({ query: query.trim() });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const fetchData = async (params: { query?: string; productId?: string }) => {
    try {
      setIsLoading(true);
      const url = new URL('/api/purchases/supplier-prices', window.location.origin);
      if (params.productId) url.searchParams.append('productId', params.productId);
      if (params.query) url.searchParams.append('query', params.query);

      const res = await fetch(url.toString());
      if (res.ok) {
        const json = await res.json();
        setData(json);
        if (json.product) {
          setSelectedProductId(json.product.id);
        }
      } else {
        toast.error('Failed to load supplier price comparison');
      }
    } catch (e: any) {
      toast.error('Error loading price history');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      fetchData({ query: query.trim() });
    }
  };

  const handleSelectProduct = (product: any) => {
    setSelectedProductId(product.id);
    fetchData({ productId: product.id });
  };

  if (!isOpen) return null;

  const product = data?.product;
  const summary = data?.summary;
  const suppliers: any[] = data?.suppliers || [];
  const history: any[] = data?.history || [];
  const matchingProducts: any[] = data?.matchingProducts || [];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden font-sans">
        
        {/* Top Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/60 dark:bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <span>Supplier Purchase Price History & Comparison</span>
                <Badge variant="outline" className="text-[10px] text-emerald-600 border-emerald-300 font-mono">
                  BEST RATES
                </Badge>
              </h2>
              <p className="text-xs text-slate-500 font-arabic">
                مقارنة أسعار الشراء وتاريخ الموردين مع معرفة أرخص مورد لكل منتج
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose} className="rounded-full text-slate-400 hover:text-slate-900 dark:hover:text-white">
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Search Bar & Auto-Suggestions Bar */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3 shrink-0">
          <form onSubmit={handleSearchSubmit} className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3.5 text-slate-400" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type product name, item code, or barcode (e.g. Grinder, DCA, Bearing, 6202)..."
              autoFocus
              className="pl-10 pr-24 h-11 text-xs rounded-xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white"
            />
            {query && (
              <button
                type="button"
                onClick={() => {
                  setQuery('');
                  fetchData({});
                }}
                className="absolute right-20 top-3 text-slate-400 hover:text-slate-600 p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <Button
              type="submit"
              size="sm"
              className="absolute right-1.5 top-1.5 h-8 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-lg px-3"
            >
              Search
            </Button>
          </form>

          {/* Quick matching product chips if multiple results */}
          {matchingProducts.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs no-scrollbar">
              <span className="text-[11px] font-bold text-slate-400 shrink-0">Products:</span>
              {matchingProducts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectProduct(p)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all border ${
                    selectedProductId === p.id
                      ? 'bg-orange-500 text-white border-orange-600 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-orange-400'
                  }`}
                >
                  {p.nameEn} <span className="font-mono text-[10px] opacity-75">({p.itemCode})</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {isLoading ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold">Comparing prices across all supplier purchases...</p>
            </div>
          ) : !product ? (
            <div className="py-16 text-center text-slate-400 space-y-2">
              <Package className="w-12 h-12 mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-xs font-bold text-slate-600 dark:text-slate-400">No product found</p>
              <p className="text-[11px] text-slate-400">Type a product name or item code in the search bar above.</p>
            </div>
          ) : (
            <>
              {/* Product Info Bar & Key Stats Banner */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-black text-base text-slate-900 dark:text-white">{product.nameEn}</h3>
                    <Badge variant="outline" className="font-mono text-[10px] text-orange-600 border-orange-300">
                      {product.itemCode}
                    </Badge>
                  </div>
                  {product.nameAr && (
                    <p className="text-xs text-slate-500 font-arabic mt-0.5">{product.nameAr}</p>
                  )}
                  <p className="text-[11px] text-slate-400 mt-1 font-mono">
                    Current Catalog Cost: <span className="font-bold text-slate-700 dark:text-slate-300">{formatKWD(product.costPrice)}</span> • Retail Price: <span className="font-bold text-emerald-600">{formatKWD(product.salePrice)}</span>
                  </p>
                </div>

                {summary && (
                  <div className="flex items-center gap-2">
                    {/* Lowest Price Banner */}
                    <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-right">
                      <span className="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase block">
                        🏆 Lowest Rate Ever
                      </span>
                      <span className="text-xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                        {formatKWD(summary.lowestCostPrice)}
                      </span>
                      <span className="text-[10px] text-emerald-700 dark:text-emerald-400 block truncate max-w-[160px] font-semibold">
                        from {summary.lowestSupplierName}
                      </span>
                    </div>

                    {/* Latest Price Banner */}
                    <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-right">
                      <span className="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase block">
                        🕒 Latest Purchase
                      </span>
                      <span className="text-xl font-black font-mono text-blue-600 dark:text-blue-400">
                        {formatKWD(summary.latestCostPrice)}
                      </span>
                      <span className="text-[10px] text-blue-700 dark:text-blue-400 block truncate max-w-[160px]">
                        from {summary.latestSupplierName}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* SECTION 1: Supplier Cost Comparison Cards */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Building2 className="w-4 h-4 text-orange-500" />
                    <span>Suppliers Comparison ({suppliers.length} Suppliers)</span>
                  </h4>
                  <span className="text-[11px] text-slate-400 font-medium">Ranked by lowest cost price</span>
                </div>

                {suppliers.length === 0 ? (
                  <div className="p-6 rounded-2xl border border-dashed border-slate-300 dark:border-slate-800 text-center text-slate-400 text-xs">
                    No purchase intake records found for this product yet.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {suppliers.map((s, idx) => (
                      <div
                        key={s.supplierId}
                        className={`p-4 rounded-2xl border transition-all ${
                          s.isLowest
                            ? 'bg-emerald-500/5 border-emerald-500/50 shadow-sm'
                            : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-black text-xs flex items-center justify-center font-mono">
                              #{idx + 1}
                            </span>
                            <div>
                              <h5 className="font-extrabold text-sm text-slate-900 dark:text-white">
                                {s.supplierName}
                              </h5>
                              <span className="text-[11px] text-slate-400 font-mono">
                                {s.supplierPhone || 'No phone'}
                              </span>
                            </div>
                          </div>

                          {s.isLowest ? (
                            <Badge className="bg-emerald-600 hover:bg-emerald-600 text-white font-extrabold text-[10px] gap-1 shadow-sm">
                              <Award className="w-3 h-3" /> BEST RATE
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-[10px] text-slate-400 font-mono">
                              +{formatKWD(s.minPrice - summary.lowestCostPrice)} diff
                            </Badge>
                          )}
                        </div>

                        <div className="grid grid-cols-3 gap-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium">Lowest Price:</span>
                            <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">
                              {formatKWD(s.minPrice)}
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-medium">Last Price:</span>
                            <span className="font-mono font-bold text-xs text-slate-700 dark:text-slate-300">
                              {formatKWD(s.lastPrice)}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-slate-400 block font-medium">Orders / Qty:</span>
                            <span className="font-mono font-bold text-xs text-slate-900 dark:text-white">
                              {s.purchaseCount} orders ({s.totalQty})
                            </span>
                          </div>
                        </div>

                        <div className="mt-2 text-[10px] text-slate-400 flex items-center justify-between">
                          <span>Last purchase: {formatDate(s.lastDate)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* SECTION 2: Full Chronological Purchase Orders Table */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-blue-500" />
                    <span>Purchase History Orders ({history.length})</span>
                  </h4>
                  <span className="text-[11px] text-slate-400">Chronological timeline of all intakes</span>
                </div>

                <div className="overflow-x-auto border border-slate-200 dark:border-slate-800 rounded-2xl bg-white dark:bg-slate-900">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 text-slate-500 font-semibold">
                      <tr>
                        <th className="p-3 pl-4">Date</th>
                        <th className="p-3">Purchase No</th>
                        <th className="p-3">Supplier</th>
                        <th className="p-3 text-center">Qty</th>
                        <th className="p-3 text-right">Cost Price (KD)</th>
                        <th className="p-3 text-right">Line Total</th>
                        <th className="p-3 pr-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                      {history.map((h, idx) => (
                        <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/50">
                          <td className="p-3 pl-4 font-mono text-slate-500">{formatDate(h.date)}</td>
                          <td className="p-3 font-mono font-bold text-orange-600">{h.purchaseNo}</td>
                          <td className="p-3 font-bold text-slate-900 dark:text-white">{h.supplierName}</td>
                          <td className="p-3 text-center font-mono font-bold">
                            {h.qty} {h.unit}
                          </td>
                          <td className="p-3 text-right font-mono font-black text-slate-900 dark:text-white">
                            {formatKWD(h.costPrice)}
                            {h.costPrice === summary?.lowestCostPrice && (
                              <span className="ml-1 text-[9px] text-emerald-600 font-bold bg-emerald-500/10 px-1 py-0.5 rounded">
                                🏆 BEST
                              </span>
                            )}
                          </td>
                          <td className="p-3 text-right font-mono font-extrabold text-emerald-600">
                            {formatKWD(h.lineTotal)}
                          </td>
                          <td className="p-3 pr-4 text-right">
                            <Link href={`/purchases/${h.purchaseId}`} target="_blank">
                              <Button size="sm" variant="ghost" className="h-7 text-xs text-blue-600 gap-1 hover:bg-blue-50">
                                View <ExternalLink className="w-3 h-3" />
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 flex justify-end shrink-0">
          <Button variant="outline" onClick={onClose} className="text-xs font-bold">
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
