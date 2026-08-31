'use client';

import React, { useState, useEffect } from 'react';
import { Package, Plus, Search, Filter, LayoutGrid, List, Barcode, AlertTriangle, Edit, Eye, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { formatKWD } from '@/lib/utils';
import { FeatureLockOverlay } from '@/components/shared/FeatureLockOverlay';
import Link from 'next/link';

export default function ProductsPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [toggles, setToggles] = useState<any>(null);

  // Add Product Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'details' | 'settings'>('basic');

  // Form Fields
  const [itemCode, setItemCode] = useState('');
  const [barcode, setBarcode] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [unit, setUnit] = useState('PCS');
  const [costPrice, setCostPrice] = useState<string | number>('');
  const [salePrice, setSalePrice] = useState<string | number>('');
  const [wholesalePrice, setWholesalePrice] = useState<string | number>('');
  const [stockQty, setStockQty] = useState<string | number>('');
  const [minStockAlert, setMinStockAlert] = useState<string | number>(5);
  const [origin, setOrigin] = useState('');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [isTranslating, setIsTranslating] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX = 600;
        let w = img.width; let h = img.height;
        if (w > h) { if (w > MAX) { h *= MAX / w; w = MAX; } }
        else { if (h > MAX) { w *= MAX / h; h = MAX; } }
        canvas.width = w; canvas.height = h;
        canvas.getContext('2d')?.drawImage(img, 0, 0, w, h);
        setImageBase64(canvas.toDataURL('image/jpeg', 0.8));
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  // Auto-translate nameEn to nameAr
  useEffect(() => {
    if (!nameEn || nameEn.trim() === '') return;
    const timer = setTimeout(async () => {
      try {
        setIsTranslating(true);
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(nameEn)}&langpair=en|ar`);
        const data = await res.json();
        if (data && data.responseData && data.responseData.translatedText) {
          setNameAr(data.responseData.translatedText);
        }
      } catch (error) {
        console.error('Translation error:', error);
      } finally {
        setIsTranslating(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [nameEn]);

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

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const url = new URL('/api/products', window.location.origin);
      if (search) url.searchParams.append('search', search);
      if (selectedCategory) url.searchParams.append('categoryId', selectedCategory);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (Array.isArray(data)) setProducts(data);
    } catch (e) {
      toast.error('Failed to load products');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (Array.isArray(data)) {
        setCategories(data);
        if (data.length > 0) setCategoryId(data[0].id);
      }
    } catch (e) {}
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedCategory]);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemCode,
          barcode: barcode || itemCode,
          nameEn,
          nameAr,
          categoryId,
          unit,
          costPrice: Number(costPrice),
          salePrice: Number(salePrice),
          wholesalePrice: wholesalePrice ? Number(wholesalePrice) : undefined,
          stockQty: Number(stockQty),
          minStockAlert: Number(minStockAlert),
          origin,
          showOnWebsite: true,
          status: 'ACTIVE',
          images: imageBase64 ? [imageBase64] : [],
        }),
      });

      if (res.ok) {
        toast.success('Product created successfully!');
        setIsModalOpen(false);
        // Reset form
        setItemCode('');
        setBarcode('');
        setNameEn('');
        setNameAr('');
        setCostPrice('');
        setSalePrice('');
        setStockQty('');
        setImageBase64('');
        fetchProducts();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to create product');
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <FeatureLockOverlay isLocked={Boolean(toggles && !toggles.enableProducts)}>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Top Title & Quick Actions */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600" /> Products & Hardware Inventory
            </h1>
            <p className="text-sm text-slate-500">Manage pricing, KWD decimals, stock levels and barcodes.</p>
          </div>
          <div className="flex items-center gap-3">
          <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2">
            <Plus className="w-4 h-4" /> Add Product
          </Button>
        </div>
      </div>

      {/* Filter & View Controls */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        {/* Search */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, code, barcode..."
            className="pl-10 h-10"
          />
        </div>

        {/* Category Filter dropdown */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.nameEn} ({cat.nameAr})
              </option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex items-center p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-slate-900 shadow text-blue-600' : 'text-slate-400'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === 'table' ? 'bg-white dark:bg-slate-900 shadow text-blue-600' : 'text-slate-400'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Grid View */}
      {viewMode === 'grid' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <Card key={p.id} className="border-slate-200 dark:border-slate-800 hover:border-blue-500/50 transition-all flex flex-col justify-between">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {p.itemCode}
                  </Badge>
                  <Badge variant={p.stockQty <= p.minStockAlert ? 'warning' : 'success'} className="font-mono text-[10px]">
                    {p.stockQty} {p.unit}
                  </Badge>
                </div>

                <div>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{p.nameEn}</h3>
                  <p className="text-xs text-slate-500 font-arabic font-semibold line-clamp-1">{p.nameAr}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Sale Price</span>
                    <span className="text-base font-extrabold text-blue-600 font-mono">{formatKWD(p.salePrice)}</span>
                  </div>
                  <Link href={`/products/${p.id}`}>
                    <Button size="sm" variant="ghost" className="h-8 text-xs text-slate-500 hover:text-blue-600 gap-1">
                      <Eye className="w-3.5 h-3.5" /> View
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Table View */}
      {viewMode === 'table' && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-500">
                  <tr>
                    <th className="p-3.5 pl-6">Code</th>
                    <th className="p-3.5">Product Name</th>
                    <th className="p-3.5">Category</th>
                    <th className="p-3.5">Cost</th>
                    <th className="p-3.5">Sale Price</th>
                    <th className="p-3.5">Stock</th>
                    <th className="p-3.5 pr-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                      <td className="p-3.5 pl-6 font-mono font-bold text-blue-600">{p.itemCode}</td>
                      <td className="p-3.5">
                        <p className="font-bold text-slate-900 dark:text-white">{p.nameEn}</p>
                        <p className="text-[11px] text-slate-500 font-arabic">{p.nameAr}</p>
                      </td>
                      <td className="p-3.5 text-slate-500">{p.category?.nameEn || '-'}</td>
                      <td className="p-3.5 font-mono text-slate-400">{formatKWD(p.costPrice)}</td>
                      <td className="p-3.5 font-mono font-bold text-emerald-600">{formatKWD(p.salePrice)}</td>
                      <td className="p-3.5 font-mono font-bold">{p.stockQty} {p.unit}</td>
                      <td className="p-3.5 pr-6 text-right">
                        <Link href={`/products/${p.id}`}>
                          <Button size="sm" variant="ghost" className="h-7 text-xs">
                            Details
                          </Button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* CREATE PRODUCT MODAL (WITH 4 TABS) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden">
            {/* Header Tabs */}
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Add New Product</h3>
              <div className="flex gap-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-xl text-xs font-semibold">
                <button
                  onClick={() => setActiveTab('basic')}
                  className={`px-3 py-1 rounded-lg ${activeTab === 'basic' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                >
                  Basic Info
                </button>
                <button
                  onClick={() => setActiveTab('pricing')}
                  className={`px-3 py-1 rounded-lg ${activeTab === 'pricing' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                >
                  Pricing & Stock
                </button>
                <button
                  onClick={() => setActiveTab('details')}
                  className={`px-3 py-1 rounded-lg ${activeTab === 'details' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
                >
                  Details
                </button>
              </div>
            </div>

            <form onSubmit={handleCreateProduct} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* TAB 1: BASIC INFO */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Item Code / SKU *</label>
                      <Input value={itemCode} onChange={(e) => setItemCode(e.target.value)} placeholder="HT-001" required className="bg-white text-slate-900 placeholder:text-slate-400 border-slate-300" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Barcode</label>
                      <Input value={barcode} onChange={(e) => setBarcode(e.target.value)} placeholder="6291001001" className="bg-white text-slate-900 placeholder:text-slate-400 border-slate-300" />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">English Product Name *</label>
                    <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="Claw Hammer 16oz" required className="bg-white text-slate-900 placeholder:text-slate-400 border-slate-300" />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700">Arabic Product Name *</label>
                    <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder="مطرقة ألياف زجاجية" required dir="rtl" className="font-arabic bg-white text-slate-900 placeholder:text-slate-400 border-slate-300" />
                    <p className="text-[10px] text-slate-500 mt-1 ml-1">
                      {isTranslating ? 'Translating...' : 'Auto-translated from English (you can edit)'}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Category *</label>
                      <select
                        value={categoryId}
                        onChange={(e) => setCategoryId(e.target.value)}
                        className="w-full h-9 rounded-md border border-slate-300 bg-white text-slate-900 px-3 text-xs outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>
                            {c.nameEn}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Unit</label>
                      <select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="w-full h-9 rounded-md border border-slate-300 bg-white text-slate-900 px-3 text-xs outline-none focus:ring-2 focus:ring-blue-600"
                      >
                        <option value="PCS">PCS</option>
                        <option value="BOX">BOX</option>
                        <option value="SET">SET</option>
                        <option value="KG">KG</option>
                        <option value="METER">METER</option>
                      </select>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB 2: PRICING & STOCK */}
              {activeTab === 'pricing' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Cost Price (KD) *</label>
                      <Input type="number" step="0.001" value={costPrice} onChange={(e) => setCostPrice(e.target.value)} required className="bg-white text-slate-900 placeholder:text-slate-400 border-slate-300" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Sale Price (KD) *</label>
                      <Input type="number" step="0.001" value={salePrice} onChange={(e) => setSalePrice(e.target.value)} required className="bg-white text-slate-900 placeholder:text-slate-400 border-slate-300" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Wholesale Price (KD)</label>
                      <Input type="number" step="0.001" value={wholesalePrice} onChange={(e) => setWholesalePrice(e.target.value)} className="bg-white text-slate-900 placeholder:text-slate-400 border-slate-300" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Opening Stock Qty</label>
                      <Input type="number" value={stockQty} onChange={(e) => setStockQty(e.target.value)} className="bg-white text-slate-900 placeholder:text-slate-400 border-slate-300" />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700">Min Stock Alert Level</label>
                      <Input type="number" value={minStockAlert} onChange={(e) => setMinStockAlert(e.target.value)} className="bg-white text-slate-900 placeholder:text-slate-400 border-slate-300" />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: DETAILS */}
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700">Country of Origin</label>
                    <Input value={origin} onChange={(e) => setOrigin(e.target.value)} placeholder="e.g. Japan, Germany, Taiwan" className="bg-white text-slate-900 placeholder:text-slate-400 border-slate-300" />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <div className="flex items-center gap-4">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)} className="text-slate-700 border-slate-300 hover:bg-slate-100">
                    Cancel
                  </Button>
                  <div className="flex items-center gap-2">
                    <label className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-2 rounded-lg border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors flex items-center gap-2 shadow-sm">
                      <Sparkles className="w-3.5 h-3.5" /> Upload Website Image
                      <input 
                        type="file" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                        className="hidden"
                      />
                    </label>
                    {imageBase64 && <span className="text-xs text-emerald-600 font-bold">✓ Selected</span>}
                  </div>
                </div>
                <Button type="submit" disabled={isTranslating} className="bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-50">
                  Save Product
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      </div>
    </FeatureLockOverlay>
  );
}
