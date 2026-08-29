'use client';

import React, { useState, useEffect } from 'react';
import { Building2, Plus, Phone, Mail, MapPin } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');

  const fetchSuppliers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/suppliers');
      const data = await res.json();
      if (Array.isArray(data)) setSuppliers(data);
    } catch (e) {
      toast.error('Failed to load suppliers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const handleCreateSupplier = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, phone, email, address }),
      });

      if (res.ok) {
        toast.success('Supplier added successfully!');
        setIsModalOpen(false);
        setName('');
        setPhone('');
        setEmail('');
        setAddress('');
        fetchSuppliers();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to create supplier');
      }
    } catch (e: any) {
      toast.error(e.message);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto pb-12">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Building2 className="w-6 h-6 text-blue-600" /> Supplier Directory
          </h1>
          <p className="text-sm text-slate-500">Manage tool manufacturers and hardware distributors.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2">
          <Plus className="w-4 h-4" /> Add Supplier
        </Button>
      </div>

      {/* Grid View */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {suppliers.map((s) => (
          <Card key={s.id} className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 font-bold flex items-center justify-center text-sm">
                  {s.name[0]}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white">{s.name}</h3>
                  <Badge variant="outline" className="font-mono text-[10px]">
                    {s._count?.products || 0} Products
                  </Badge>
                </div>
              </div>

              <div className="space-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100 dark:border-slate-800">
                {s.phone && (
                  <p className="flex items-center gap-2 font-mono">
                    <Phone className="w-3.5 h-3.5 text-slate-400" /> {s.phone}
                  </p>
                )}
                {s.email && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" /> {s.email}
                  </p>
                )}
                {s.address && (
                  <p className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {s.address}
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CREATE SUPPLIER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add New Supplier</h3>
            <form onSubmit={handleCreateSupplier} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Supplier / Company Name *</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Makita Gulf FZE" required />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Phone Number</label>
                <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+965 2244 5566" />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Email Address</label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="sales@makitagulf.com" />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Address</label>
                <Input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Shuwaikh Industrial Area 1" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                  Save Supplier
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
