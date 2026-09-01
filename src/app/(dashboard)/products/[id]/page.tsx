'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Package, ArrowLeft, Barcode, History, Tag, ShieldCheck, Globe, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatKWD, formatDate } from '@/lib/utils';
import { toast } from 'sonner';
import bwipjs from 'bwip-js';

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;

  const [product, setProduct] = useState<any>(null);
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'basic' | 'pricing' | 'details'>('basic');
  const [editItemCode, setEditItemCode] = useState('');
  const [editBarcode, setEditBarcode] = useState('');
  const [editNameEn, setEditNameEn] = useState('');
  const [editNameAr, setEditNameAr] = useState('');
  const [editCategoryId, setEditCategoryId] = useState('');
  const [editUnit, setEditUnit] = useState('PCS');
  const [editCostPrice, setEditCostPrice] = useState<string | number>('');
  const [editSalePrice, setEditSalePrice] = useState<string | number>('');
  const [editWholesalePrice, setEditWholesalePrice] = useState<string | number>('');
  const [editStockQty, setEditStockQty] = useState<string | number>('');
  const [editMinStockAlert, setEditMinStockAlert] = useState<string | number>(5);
  const [editOrigin, setEditOrigin] = useState('');
  const [imageBase64, setImageBase64] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);
  const isInitialMount = React.useRef(true);
  const prevNameEn = React.useRef(editNameEn);

  // Auto-translate nameEn to nameAr
  useEffect(() => {
    // Prevent translating on initial open when editNameEn is just populated from DB
    if (isInitialMount.current) {
      isInitialMount.current = false;
      prevNameEn.current = editNameEn;
      return;
    }
    
    // Only translate if the name actually changed (user is typing)
    if (editNameEn === prevNameEn.current) return;
    prevNameEn.current = editNameEn;

    if (!editNameEn || editNameEn.trim() === '') return;
    const timer = setTimeout(async () => {
      try {
        setIsTranslating(true);
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(editNameEn)}&langpair=en|ar`);
        const data = await res.json();
        if (data && data.responseData && data.responseData.translatedText) {
          setEditNameAr(data.responseData.translatedText);
        }
      } catch (error) {
        console.error('Translation error:', error);
      } finally {
        setIsTranslating(false);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [editNameEn]);

  useEffect(() => {
    fetch('/api/categories').then(res => res.json()).then(data => {
      if (Array.isArray(data)) setCategories(data);
    });
  }, []);

  const openEditModal = () => {
    setActiveTab('basic');
    setEditItemCode(product.itemCode || '');
    setEditBarcode(product.barcode || '');
    setEditNameEn(product.nameEn || '');
    setEditNameAr(product.nameAr || '');
    setEditCategoryId(product.categoryId || '');
    setEditUnit(product.unit || 'PCS');
    setEditCostPrice(product.costPrice || 0);
    setEditSalePrice(product.salePrice || 0);
    setEditWholesalePrice(product.wholesalePrice || 0);
    setEditStockQty(product.stockQty || 0);
    setEditMinStockAlert(product.minStockAlert || 5);
    setEditOrigin(product.origin || '');
    setImageBase64(product.images?.[0] || '');
    isInitialMount.current = true; // reset so we don't translate the DB value
    setIsEditModalOpen(true);
  };

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

  const handleUpdateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSaving(true);
      const res = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          itemCode: editItemCode,
          barcode: editBarcode || editItemCode,
          nameEn: editNameEn,
          nameAr: editNameAr,
          categoryId: editCategoryId,
          unit: editUnit,
          costPrice: Number(editCostPrice),
          salePrice: Number(editSalePrice),
          wholesalePrice: editWholesalePrice ? Number(editWholesalePrice) : undefined,
          stockQty: Number(editStockQty),
          minStockAlert: Number(editMinStockAlert),
          origin: editOrigin,
          images: imageBase64 ? [imageBase64] : [],
        }),
      });
      if (res.ok) {
        toast.success('Product updated successfully!');
        setIsEditModalOpen(false);
        const updated = await res.json();
        setProduct({ ...product, ...updated });
      } else {
        toast.error('Failed to update product');
      }
    } catch (err) {
      toast.error('Error updating product');
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    async function fetchProduct() {
      try {
        const res = await fetch(`/api/products/${productId}`);
        if (res.ok) {
          const data = await res.json();
          setProduct(data);
        } else {
          toast.error('Product not found');
        }
      } catch (e) {
        toast.error('Error fetching product details');
      } finally {
        setIsLoading(false);
      }
    }
    fetchProduct();
  }, [productId]);

  useEffect(() => {
    if (product && product.barcode) {
      try {
        bwipjs.toCanvas('barcodeCanvas', {
          bcid: 'code128',
          text: product.barcode,
          scale: 3,
          height: 10,
          includetext: true,
          textxalign: 'center',
        });
      } catch (e) {}
    }
  }, [product]);

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading product details...</div>;
  }

  if (!product) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-500">Product not found.</p>
        <Button onClick={() => router.push('/products')}>Back to Products</Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header Controls */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/products')} className="gap-2 text-slate-600">
          <ArrowLeft className="w-4 h-4" /> Back to Products
        </Button>
        <div className="flex gap-2">
          <Button variant="outline" onClick={openEditModal} className="gap-2 text-xs border-slate-300 hover:bg-slate-50 text-slate-700">
            <Edit className="w-3.5 h-3.5" /> Edit Details & Image
          </Button>
        </div>
      </div>

      {/* Main Details Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Column: Product Info */}
        <Card className="md:col-span-2 border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-start">
              <div>
                <Badge variant="outline" className="font-mono text-xs mb-2">
                  {product.itemCode}
                </Badge>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{product.nameEn}</h1>
                <p className="text-base font-arabic font-semibold text-slate-500">{product.nameAr}</p>
              </div>
              <Badge variant={product.stockQty <= product.minStockAlert ? 'warning' : 'success'}>
                {product.stockQty} {product.unit} In Stock
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Price Grid */}
            <div className="grid grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs text-slate-400 block">Cost Price</span>
                <span className="text-sm font-mono text-slate-500">{formatKWD(product.costPrice)}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Sale Price</span>
                <span className="text-lg font-mono font-extrabold text-blue-600">{formatKWD(product.salePrice)}</span>
              </div>
              <div>
                <span className="text-xs text-slate-400 block">Wholesale Price</span>
                <span className="text-sm font-mono text-slate-500">{formatKWD(product.wholesalePrice || 0)}</span>
              </div>
            </div>

            {/* Additional Info */}
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 block">Category</span>
                <span className="font-semibold text-slate-900 dark:text-white">{product.category?.nameEn}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Country of Origin</span>
                <span className="font-semibold text-slate-900 dark:text-white">{product.origin || 'Taiwan / China'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Min Stock Alert Level</span>
                <span className="font-semibold text-amber-600">{product.minStockAlert} {product.unit}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Barcode Preview */}
        <Card className="border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center p-6 text-center">
          <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-1.5">
            <Barcode className="w-4 h-4 text-blue-600" /> Barcode Label
          </CardTitle>

          <div className="p-4 bg-white rounded-xl shadow-inner border border-slate-200 mb-4">
            <canvas id="barcodeCanvas" className="max-w-full" />
          </div>

          <p className="text-xs font-mono text-slate-500 mb-4">{product.barcode || product.itemCode}</p>

          <Button onClick={() => window.print()} className="w-full text-xs bg-slate-900 hover:bg-slate-800 text-white gap-2">
            <Barcode className="w-4 h-4" /> Print Barcode Label
          </Button>
        </Card>
      </div>

      {/* EDIT MODAL */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full shadow-2xl overflow-hidden">
            <div className="p-4 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit Product</h3>
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
            <form onSubmit={handleUpdateProduct} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              
              {/* TAB 1: BASIC INFO */}
              {activeTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Item Code / SKU *</label>
                      <Input className="text-black dark:text-white" value={editItemCode} onChange={e => setEditItemCode(e.target.value)} required />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Barcode</label>
                      <Input className="text-black dark:text-white" value={editBarcode} onChange={e => setEditBarcode(e.target.value)} />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">English Name *</label>
                    <Input className="text-black dark:text-white" value={editNameEn} onChange={e => setEditNameEn(e.target.value)} required />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Arabic Name *</label>
                    <Input className="text-black dark:text-white font-arabic" value={editNameAr} onChange={e => setEditNameAr(e.target.value)} required dir="rtl" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Category *</label>
                      <select
                        value={editCategoryId}
                        onChange={(e) => setEditCategoryId(e.target.value)}
                        className="w-full h-9 rounded-md border border-slate-300 bg-white text-slate-900 px-3 text-xs outline-none"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.nameEn}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Unit</label>
                      <select
                        value={editUnit}
                        onChange={(e) => setEditUnit(e.target.value)}
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
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Cost Price (KD) *</label>
                      <Input className="text-black dark:text-white" type="number" step="0.001" value={editCostPrice} onChange={e => setEditCostPrice(e.target.value)} required />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Sale Price (KD) *</label>
                      <Input className="text-black dark:text-white" type="number" step="0.001" value={editSalePrice} onChange={e => setEditSalePrice(e.target.value)} required />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Wholesale Price (KD)</label>
                      <Input className="text-black dark:text-white" type="number" step="0.001" value={editWholesalePrice} onChange={e => setEditWholesalePrice(e.target.value)} />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Stock Qty</label>
                      <Input className="text-black dark:text-white" type="number" value={editStockQty} onChange={e => setEditStockQty(e.target.value)} />
                    </div>
                    <div>
                      <label className="text-xs font-semibold text-slate-700 block mb-1">Min Stock Alert Level</label>
                      <Input className="text-black dark:text-white" type="number" value={editMinStockAlert} onChange={e => setEditMinStockAlert(e.target.value)} />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: DETAILS */}
              {activeTab === 'details' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 block mb-1">Country of Origin</label>
                    <Input className="text-black dark:text-white" value={editOrigin} onChange={e => setEditOrigin(e.target.value)} placeholder="e.g. Japan, Germany, Taiwan" />
                  </div>
                  
                  <div className="pt-4 border-t border-slate-100">
                    <label className="text-xs font-semibold text-slate-700 block mb-2">Product Image (Website)</label>
                    <div className="flex items-center gap-3">
                      {imageBase64 && (
                        <img src={imageBase64} alt="Preview" className="w-12 h-12 rounded-md object-cover border border-slate-200" />
                      )}
                      <input type="file" accept="image/*" onChange={handleImageUpload} className="text-xs" />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-between items-center pt-4 border-t border-slate-200 mt-4">
                <Button type="button" variant="outline" className="text-black dark:text-white" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
                <Button type="submit" disabled={isSaving} className="bg-blue-600 text-white hover:bg-blue-700">Save Changes</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
