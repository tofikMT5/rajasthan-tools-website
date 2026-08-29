'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Users, ArrowLeft, Phone, MapPin, Receipt, Wallet, MessageSquare, Plus, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatKWD, formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function CustomerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const customerId = params.id as string;

  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchCustomer() {
      try {
        const res = await fetch(`/api/customers/${customerId}`);
        if (res.ok) {
          const data = await res.json();
          setCustomer(data);
        } else {
          toast.error('Customer not found');
        }
      } catch (e) {
        toast.error('Error loading customer profile');
      } finally {
        setIsLoading(false);
      }
    }
    fetchCustomer();
  }, [customerId]);

  if (isLoading) return <div className="p-8 text-center text-slate-500">Loading customer profile...</div>;

  if (!customer) {
    return (
      <div className="p-8 text-center space-y-4">
        <p className="text-slate-500">Customer profile not found.</p>
        <Button onClick={() => router.push('/customers')}>Back to Customers</Button>
      </div>
    );
  }

  const openWhatsApp = () => {
    const cleanPhone = customer.phone.replace(/\D/g, '');
    const waUrl = `https://wa.me/965${cleanPhone}`;
    window.open(waUrl, '_blank');
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto pb-12">
      {/* Top Header Controls */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => router.push('/customers')} className="gap-2 text-slate-600">
          <ArrowLeft className="w-4 h-4" /> Back to Customers
        </Button>
        <div className="flex gap-2">
          <Button onClick={openWhatsApp} variant="outline" className="gap-2 text-emerald-600 border-emerald-200 hover:bg-emerald-50">
            <MessageSquare className="w-4 h-4" /> WhatsApp
          </Button>
          <Button onClick={() => router.push('/pos')} className="bg-orange-500 hover:bg-orange-600 text-white font-bold gap-2">
            <Plus className="w-4 h-4" /> New Bill for Customer
          </Button>
        </div>
      </div>

      {/* Customer Avatar & Bio Card */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-2xl flex items-center justify-center shadow-lg">
              {customer.nameEn[0]}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">{customer.nameEn}</h1>
                <Badge variant="outline" className="font-mono text-xs">
                  {customer.type}
                </Badge>
              </div>
              {customer.nameAr && <p className="text-sm font-arabic font-semibold text-slate-500">{customer.nameAr}</p>}
              <div className="flex items-center gap-4 text-xs text-slate-500 mt-2">
                <span className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-blue-600" /> +965 {customer.phone}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" /> {customer.area || 'Shuwaikh'}
                </span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4">
            <span className="text-xs text-slate-400 font-semibold uppercase">Total Invoices</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{customer._count?.invoices || 0} Bills</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4">
            <span className="text-xs text-slate-400 font-semibold uppercase">Credit Limit</span>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">{formatKWD(customer.creditLimit)}</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800 border-l-4 border-l-red-500">
          <CardContent className="p-4">
            <span className="text-xs text-slate-400 font-semibold uppercase">Current Balance Due</span>
            <div className="text-2xl font-black text-red-600 mt-1">{formatKWD(customer.currentBalance)}</div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 dark:border-slate-800">
          <CardContent className="p-4">
            <span className="text-xs text-slate-400 font-semibold uppercase">Account Created</span>
            <div className="text-sm font-semibold text-slate-700 dark:text-slate-300 mt-2">{formatDate(customer.createdAt)}</div>
          </CardContent>
        </Card>
      </div>

      {/* Invoices History Table */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardHeader>
          <CardTitle className="text-base font-bold flex items-center gap-2">
            <Receipt className="w-4 h-4 text-blue-600" /> Purchase History & Invoices
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 border-y border-slate-200 dark:border-slate-800 font-semibold text-slate-500">
                <tr>
                  <th className="p-3.5 pl-6">Invoice No</th>
                  <th className="p-3.5">Date</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Net Amount</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {customer.invoices && customer.invoices.length > 0 ? (
                  customer.invoices.map((inv: any) => (
                    <tr key={inv.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                      <td className="p-3.5 pl-6 font-mono font-bold text-blue-600">RT-{inv.invoiceNo}</td>
                      <td className="p-3.5 text-slate-500">{formatDate(inv.dateTime)}</td>
                      <td className="p-3.5">{inv.type}</td>
                      <td className="p-3.5 font-mono font-bold">{formatKWD(inv.netAmount)}</td>
                      <td className="p-3.5">
                        <Badge variant={inv.status === 'PAID' ? 'success' : 'warning'}>{inv.status}</Badge>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-6 text-center text-slate-400">
                      No invoices recorded for this customer yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
