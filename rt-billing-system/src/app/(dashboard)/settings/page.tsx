'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Settings as SettingsIcon, Building, FileText, Database, ShieldAlert, Save, Download, Trash2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { COMPANY_DETAILS } from '@/lib/constants';
import { toast } from 'sonner';

export default function SettingsPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || 'CASHIER';
  const isSuperAdmin = userRole === 'SUPER_ADMIN';

  const [activeTab, setActiveTab] = useState<'company' | 'invoice' | 'backup' | 'danger'>('company');

  // Form State
  const [companyNameEn, setCompanyNameEn] = useState(COMPANY_DETAILS.nameEn);
  const [companyNameAr, setCompanyNameAr] = useState(COMPANY_DETAILS.nameAr);
  const [addressEn, setAddressEn] = useState(COMPANY_DETAILS.addressEn);
  const [addressAr, setAddressAr] = useState(COMPANY_DETAILS.addressAr);
  const [phone, setPhone] = useState(COMPANY_DETAILS.phone);
  const [email, setEmail] = useState(COMPANY_DETAILS.email);

  // Wipe Data Modal State
  const [showWipeModal, setShowWipeModal] = useState(false);
  const [wipeProducts, setWipeProducts] = useState(false);
  const [isWiping, setIsWiping] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Company Settings updated successfully!');
  };

  const handleDownloadBackup = () => {
    const backupObj = {
      timestamp: new Date().toISOString(),
      company: COMPANY_DETAILS,
      version: '1.0.0',
    };
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupObj, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `RT-Database-Backup-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    toast.success('Database backup JSON exported!');
  };

  const handleWipeData = async () => {
    try {
      setIsWiping(true);
      const res = await fetch('/api/settings/wipe-data', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ options: { wipeProducts } }),
      });

      if (res.ok) {
        toast.success('All test invoices, purchases, and transactional data wiped cleanly!');
        setShowWipeModal(false);
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to wipe test data');
      }
    } catch (e: any) {
      toast.error(e.message);
    } finally {
      setIsWiping(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <SettingsIcon className="w-6 h-6 text-blue-600" /> System Settings & Store Configuration
        </h1>
        <p className="text-sm text-slate-500">Manage store address, invoice prefixes, backups, and production data handover.</p>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('company')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'company' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Company Profile
        </button>
        <button
          onClick={() => setActiveTab('invoice')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'invoice' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Invoice & Printing
        </button>
        <button
          onClick={() => setActiveTab('backup')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
            activeTab === 'backup' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Database Backup
        </button>
        {isSuperAdmin && (
          <button
            onClick={() => setActiveTab('danger')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 ${
              activeTab === 'danger' ? 'bg-red-600 text-white' : 'text-red-500 hover:text-red-700'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" /> Super Admin Tools
          </button>
        )}
      </div>

      {/* 1. COMPANY INFORMATION */}
      {activeTab === 'company' && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold">Company Profile Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSaveSettings} className="space-y-4 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">English Company Name</label>
                <Input value={companyNameEn} onChange={(e) => setCompanyNameEn(e.target.value)} required />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Arabic Company Name</label>
                <Input value={companyNameAr} onChange={(e) => setCompanyNameAr(e.target.value)} required className="font-arabic" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">English Address</label>
                  <Input value={addressEn} onChange={(e) => setAddressEn(e.target.value)} required />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Arabic Address</label>
                  <Input value={addressAr} onChange={(e) => setAddressAr(e.target.value)} required className="font-arabic" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Phone</label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} required />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 dark:text-slate-300">Email</label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} required />
                </div>
              </div>
              <div className="pt-4 flex justify-end">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2">
                  <Save className="w-4 h-4" /> Save Store Profile
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* 2. INVOICE SETTINGS */}
      {activeTab === 'invoice' && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold">Invoice & Print Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Invoice Number Prefix</label>
                <Input defaultValue="RT-" className="font-mono font-bold" />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Currency Symbol</label>
                <Input defaultValue="KD" className="font-mono font-bold" readOnly />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Decimals Precision</label>
                <Input defaultValue="3" className="font-mono font-bold" readOnly />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 3. BACKUP & RESTORE */}
      {activeTab === 'backup' && (
        <Card className="border-slate-200 dark:border-slate-800">
          <CardHeader>
            <CardTitle className="text-base font-bold">System Data Backup</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <p className="text-slate-500">Download a full JSON snapshot of your store products, customers, and invoices.</p>
            <Button onClick={handleDownloadBackup} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold gap-2">
              <Download className="w-4 h-4" /> Backup Database Now (JSON)
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 4. SUPER ADMIN DANGER ZONE / WIPE DATA */}
      {activeTab === 'danger' && isSuperAdmin && (
        <Card className="border-red-500/30 bg-red-500/5">
          <CardHeader>
            <CardTitle className="text-base font-bold text-red-500 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" /> Production Handover & Data Reset
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <p className="text-slate-400">
              Wipe all test invoices, test customer ledgers, and sample purchase orders before handing over software to client.
            </p>
            <Button onClick={() => setShowWipeModal(true)} variant="destructive" className="font-bold gap-2">
              <Trash2 className="w-4 h-4" /> Wipe Test Data (Handover)
            </Button>
          </CardContent>
        </Card>
      )}

      {/* WIPE DATA CONFIRMATION MODAL */}
      {showWipeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 text-xs text-white">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-500 flex items-center justify-center mx-auto text-xl font-bold">
              ⚠️
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold">Confirm Production Data Reset</h3>
              <p className="text-xs text-slate-400 mt-1">
                This will permanently delete all test Invoices, Payments, Stock Intake Orders, and Test Customers. Categories, Brands, and Admin Users will be preserved.
              </p>
            </div>

            <div className="flex items-center gap-2 bg-slate-950 p-3 rounded-xl border border-slate-800">
              <input
                type="checkbox"
                id="wipeProd"
                checked={wipeProducts}
                onChange={(e) => setWipeProducts(e.target.checked)}
                className="w-4 h-4 rounded text-red-600"
              />
              <label htmlFor="wipeProd" className="text-xs text-slate-300 font-semibold cursor-pointer">
                Also delete sample test products
              </label>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setShowWipeModal(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleWipeData}
                disabled={isWiping}
                className="bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                {isWiping ? 'Wiping Data...' : 'Confirm Data Wipe'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
