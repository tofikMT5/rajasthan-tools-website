'use client';

import React, { useState, useEffect } from 'react';
import { Plus, Tags, Edit, Trash2, Globe, Layers } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [slug, setSlug] = useState('');
  const [icon, setIcon] = useState('📦');
  const [showOnWebsite, setShowOnWebsite] = useState(true);

  // Edit Modal State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [isTranslating, setIsTranslating] = useState(false);

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

  const fetchCategories = async () => {
    try {
      const res = await fetch('/api/categories');
      const data = await res.json();
      if (Array.isArray(data)) setCategories(data);
    } catch (e) {
      toast.error('Failed to load categories');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameEn,
          nameAr,
          slug: slug || nameEn.toLowerCase().replace(/\s+/g, '-'),
          icon,
          showOnWebsite: true,
        }),
      });

      if (res.ok) {
        toast.success('Category created successfully!');
        setIsModalOpen(false);
        setNameEn('');
        setNameAr('');
        setSlug('');
        fetchCategories();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to create category');
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleEditCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory) return;
    try {
      const res = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameEn,
          nameAr,
          slug: slug || nameEn.toLowerCase().replace(/\s+/g, '-'),
          icon,
          showOnWebsite,
        }),
      });

      if (res.ok) {
        toast.success('Category updated successfully!');
        setIsEditModalOpen(false);
        setEditingCategory(null);
        setNameEn('');
        setNameAr('');
        setSlug('');
        setIcon('📦');
        setShowOnWebsite(true);
        fetchCategories();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to update category');
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const handleDeleteCategory = async () => {
    if (!editingCategory) return;
    if (editingCategory._count?.products > 0) {
      toast.error('Cannot delete category containing active products');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this category?')) return;
    
    try {
      const res = await fetch(`/api/categories/${editingCategory.id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        toast.success('Category deleted successfully!');
        setIsEditModalOpen(false);
        setEditingCategory(null);
        fetchCategories();
      } else {
        const error = await res.json();
        toast.error(error.error || 'Failed to delete category');
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  const openCreateModal = () => {
    setEditingCategory(null);
    setNameEn('');
    setNameAr('');
    setSlug('');
    setIcon('📦');
    setShowOnWebsite(true);
    setIsModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditingCategory(cat);
    setNameEn(cat.nameEn);
    setNameAr(cat.nameAr);
    setSlug(cat.slug || '');
    setIcon(cat.icon || '📦');
    setShowOnWebsite(cat.showOnWebsite ?? true);
    setIsEditModalOpen(true);
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Tags className="w-6 h-6 text-blue-600" /> Category Management
          </h1>
          <p className="text-sm text-slate-500">Organize hardware, tools & blacksmithing items into bilingual categories.</p>
        </div>
        <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2">
          <Plus className="w-4 h-4" /> Add Category
        </Button>
      </div>

      {/* Categories Cards Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-36 bg-slate-200 dark:bg-slate-800 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
          <Tags className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No categories found</h3>
          <p className="text-sm text-slate-500 mb-4">You haven't created any categories yet.</p>
          <Button onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2">
            <Plus className="w-4 h-4" /> Add Category
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Card key={cat.id} className="border-slate-200 dark:border-slate-800 hover:border-blue-500/50 transition-all group">
              <CardContent className="p-5 flex items-start justify-between">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-slate-800 flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
                    {cat.icon || '📦'}
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">{cat.nameEn}</h3>
                    <p className="text-xs text-slate-500 font-arabic font-semibold">{cat.nameAr}</p>
                  </div>
                  <div className="pt-2 flex items-center gap-2">
                    <Badge variant="secondary" className="font-mono text-[10px]">
                      {cat._count?.products || 0} Products
                    </Badge>
                  </div>
                </div>

                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  <Button onClick={() => openEditModal(cat)} size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-blue-600">
                    <Edit className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* CREATE CATEGORY MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Create New Category</h3>
            <form onSubmit={handleCreateCategory} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">English Name *</label>
                <Input
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. Power Tools"
                  required
                  className="mt-1"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Arabic Name *</label>
                <Input
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="مثال: أدوات كهربائية"
                  required
                  className="mt-1 font-arabic"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Slug</label>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="power-tools"
                    className="mt-1 font-mono text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Icon / Emoji</label>
                  <Input
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="🔌"
                    className="mt-1 text-center"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                  Save Category
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* EDIT CATEGORY MODAL */}
      {isEditModalOpen && editingCategory && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">Edit Category</h3>
            <form onSubmit={handleEditCategory} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">English Name *</label>
                <Input
                  value={nameEn}
                  onChange={(e) => setNameEn(e.target.value)}
                  placeholder="e.g. Power Tools"
                  required
                  className="mt-1 bg-white text-slate-900 placeholder:text-slate-400 border-slate-300"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Arabic Name *</label>
                <Input
                  value={nameAr}
                  onChange={(e) => setNameAr(e.target.value)}
                  placeholder="مثال: أدوات كهربائية"
                  required
                  dir="rtl"
                  className="mt-1 font-arabic bg-white text-slate-900 placeholder:text-slate-400 border-slate-300"
                />
                <p className="text-[10px] text-slate-500 mt-1 ml-1">
                  {isTranslating ? 'Translating...' : 'Auto-translated from English (you can edit)'}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Slug</label>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="power-tools"
                    className="mt-1 font-mono text-xs bg-white text-slate-900 placeholder:text-slate-400 border-slate-300"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Icon / Emoji</label>
                  <Input
                    value={icon}
                    onChange={(e) => setIcon(e.target.value)}
                    placeholder="🔌"
                    className="mt-1 text-center bg-white text-slate-900 placeholder:text-slate-400 border-slate-300"
                  />
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <input
                  type="checkbox"
                  id="showOnWebsite"
                  checked={showOnWebsite}
                  onChange={(e) => setShowOnWebsite(e.target.checked)}
                  className="rounded border-slate-300 text-blue-600 focus:ring-blue-600 h-4 w-4"
                />
                <label htmlFor="showOnWebsite" className="text-xs font-semibold text-slate-700 cursor-pointer">
                  Show on Website
                </label>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-slate-200">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleDeleteCategory}
                  disabled={editingCategory._count?.products > 0}
                  className={`text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 ${editingCategory._count?.products > 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Trash2 className="w-4 h-4 mr-1" /> Delete
                </Button>
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)} className="text-slate-700 border-slate-300 hover:bg-slate-100">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isTranslating} className="bg-blue-600 hover:bg-blue-700 text-white font-bold disabled:opacity-50">
                    Save Changes
                  </Button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
