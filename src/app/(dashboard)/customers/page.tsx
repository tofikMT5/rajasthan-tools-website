'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Plus, Search, Phone, Building, MapPin, Eye, Edit, Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { KUWAIT_AREAS, CUSTOMER_TYPES } from '@/lib/constants';
import { formatKWD } from '@/lib/utils';
import { toast } from 'sonner';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isTranslating, setIsTranslating] = useState(false);

  // Form state
  const [nameEn, setNameEn] = useState('');
  const [nameAr, setNameAr] = useState('');
  const [phone, setPhone] = useState('');
  const [altPhone, setAltPhone] = useState('');
  const [email, setEmail] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [type, setType] = useState('RETAIL');
  const [area, setArea] = useState('Shuwaikh');
  const [address, setAddress] = useState('');
  const [creditLimit, setCreditLimit] = useState(0);
  const [openingBalance, setOpeningBalance] = useState(0);
  const [notes, setNotes] = useState('');

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      const url = new URL('/api/customers', window.location.origin);
      if (search) url.searchParams.append('search', search);
      if (selectedType) url.searchParams.append('type', selectedType);

      const res = await fetch(url.toString());
      const data = await res.json();
      if (Array.isArray(data)) setCustomers(data);
    } catch (e) {
      toast.error('Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchCustomers();
    }, 300);
    return () => clearTimeout(timer);
  }, [search, selectedType]);

  // Auto-translate nameEn to nameAr
  useEffect(() => {
    const handler = setTimeout(async () => {
      if (!nameEn || nameEn.trim() === '') return;
      try {
        setIsTranslating(true);
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(nameEn)}&langpair=en|ar`);
        const data = await res.json();
        if (data && data.responseData && data.responseData.translatedText) {
          setNameAr(data.responseData.translatedText);
        }
      } catch (err) {
        console.error('Translation error', err);
      } finally {
        setIsTranslating(false);
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [nameEn]);

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nameEn,
          nameAr,
          phone,
          altPhone,
          email: email || undefined,
          companyName,
          type,
          area,
          address,
          creditLimit: Number(creditLimit),
          openingBalance: Number(openingBalance),
          notes,
        }),
      });

      if (res.ok) {
        toast.success('Customer registered successfully!');
        setIsModalOpen(false);
        // Reset form
        setNameEn('');
        setNameAr('');
        setPhone('');
        setCompanyName('');
        fetchCustomers();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to add customer');
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
            <Users className="w-6 h-6 text-blue-600" /> Customer Management
          </h1>
          <p className="text-sm text-slate-500">Retail, wholesale & contractor accounts with credit limit tracking.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2">
          <Plus className="w-4 h-4" /> Add Customer
        </Button>
      </div>

      {/* Search & Filter bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search customer name, phone..."
            className="pl-10 h-10"
          />
        </div>

        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="h-10 px-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs font-semibold text-slate-700 dark:text-slate-200 outline-none w-full sm:w-auto"
        >
          <option value="">All Customer Types</option>
          <option value="RETAIL">Retail</option>
          <option value="WHOLESALE">Wholesale</option>
          <option value="CONTRACTOR">Contractor</option>
        </select>
      </div>

      {/* Customer List Table */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-500">
                <tr>
                  <th className="p-3.5 pl-6">Customer Name</th>
                  <th className="p-3.5">Phone / Contact</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Area</th>
                  <th className="p-3.5">Credit Limit</th>
                  <th className="p-3.5">Current Balance</th>
                  <th className="p-3.5 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <td className="p-3.5 pl-6">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 font-bold flex items-center justify-center text-xs">
                          {c.nameEn[0]}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{c.nameEn}</p>
                          {c.nameAr && <p className="text-[11px] text-slate-500 font-arabic">{c.nameAr}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="p-3.5 font-mono text-slate-700 dark:text-slate-300">
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>+965 {c.phone}</span>
                      </div>
                    </td>
                    <td className="p-3.5">
                      <Badge variant="outline" className="font-semibold text-[10px]">
                        {c.type}
                      </Badge>
                    </td>
                    <td className="p-3.5 text-slate-500">{c.area || 'Shuwaikh'}</td>
                    <td className="p-3.5 font-mono text-slate-500">{formatKWD(c.creditLimit)}</td>
                    <td className="p-3.5 font-mono font-bold text-slate-900 dark:text-white">
                      {formatKWD(c.currentBalance)}
                    </td>
                    <td className="p-3.5 pr-6 text-right">
                      <Link href={`/customers/${c.id}`}>
                        <Button size="sm" variant="ghost" className="h-7 text-xs">
                          <Eye className="w-3.5 h-3.5 mr-1" /> View Profile
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

      {/* CREATE CUSTOMER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Register New Customer</h3>
            <form onSubmit={handleCreateCustomer} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Customer Name (English) *</label>
                  <Input value={nameEn} onChange={(e) => setNameEn(e.target.value)} placeholder="Soyhal Contracting" required className="text-slate-900 bg-white border-slate-300 placeholder:text-slate-400" />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Customer Name (Arabic)</label>
                  <Input value={nameAr} onChange={(e) => setNameAr(e.target.value)} placeholder="شركة سهيل" className="font-arabic text-slate-900 bg-white border-slate-300 placeholder:text-slate-400" />
                  <p className="text-[9px] text-slate-500 mt-1">
                    {isTranslating ? 'Translating...' : 'Auto-translated from English (you can edit)'}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Mobile Number (+965) *</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="99529389" required className="text-slate-900 bg-white border-slate-300 placeholder:text-slate-400" />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Customer Type *</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-xs outline-none text-slate-900"
                  >
                    <option value="RETAIL">Retail (مفرق)</option>
                    <option value="WHOLESALE">Wholesale (جملة)</option>
                    <option value="CONTRACTOR">Contractor (مقاول)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Area</label>
                  <select
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full h-9 rounded-md border border-slate-300 bg-white px-3 text-xs outline-none text-slate-900"
                  >
                    {KUWAIT_AREAS.map((a) => (
                      <option key={a} value={a}>
                        {a}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Credit Limit (KD)</label>
                  <Input type="number" step="0.001" value={creditLimit} onChange={(e) => setCreditLimit(Number(e.target.value))} className="text-slate-900 bg-white border-slate-300 placeholder:text-slate-400" />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Notes / Remarks</label>
                <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="e.g. 30 days credit terms" className="text-slate-900 bg-white border-slate-300 placeholder:text-slate-400" />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" className="border-slate-300 text-slate-700 bg-white hover:bg-slate-50" onClick={() => {
                  setIsModalOpen(false);
                  setNameEn('');
                  setNameAr('');
                  setPhone('');
                  setCompanyName('');
                  setCreditLimit(0);
                  setNotes('');
                }}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                  Save Customer
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
