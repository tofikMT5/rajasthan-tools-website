"use client";
import React, { useEffect, useState } from "react";
import { toast } from "sonner";
import { ShieldAlert, Save } from "lucide-react";
import { useSession } from "next-auth/react";

export default function SaasAdminPage() {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [toggles, setToggles] = useState({
    enablePos: true,
    enableInvoices: true,
    enableProducts: true,
    enableCategories: true,
    enableCustomers: true,
    enableSuppliers: true,
    enablePurchases: true,
    enableReports: true,
    enableUsers: true,
    enableSettings: true,
    enableQuotations: true,
    enableProfitReport: true,
    enablePdfExport: true,
    enableWhatsapp: true,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/saas')
      .then(res => res.json())
      .then(data => {
        if (data && data.success && data.toggles) {
          setToggles(data.toggles);
        }
        setLoading(false);
      });
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Use the hardcoded master key for now, as requested in prompt: RT_MASTER_LOCK_2026
    if (password === 'RT_MASTER_LOCK_2026') {
      setIsAuthenticated(true);
    } else {
      toast.error('Access Denied: Incorrect Master Key');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="fixed inset-0 z-[999] flex flex-col items-center justify-center bg-slate-950">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-2xl shadow-2xl max-w-sm w-full">
          <ShieldAlert className="w-12 h-12 text-blue-500 mb-6 mx-auto" />
          <h2 className="text-xl font-bold text-white text-center mb-6">Master Unlock</h2>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" 
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Enter Master Key"
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 text-center tracking-widest"
              autoFocus
            />
            <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg transition-colors">
              Unlock Controls
            </button>
          </form>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    try {
      const res = await fetch('/api/saas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(toggles),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("✅ Toggles saved successfully!");
      } else {
        toast.error(data.error || "Failed to save toggles");
      }
    } catch (e: any) {
      toast.error(e.message || "An error occurred");
    }
  };

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ShieldAlert className="w-8 h-8 text-blue-600" /> SaaS Super Admin Control
          </h1>
          <p className="text-slate-500 mt-1">Enable or disable premium modules for the client.</p>
        </div>
        <button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-bold">
          <Save className="w-5 h-5" /> Save Changes
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-sm p-6">
        {loading ? (
          <p>Loading features...</p>
        ) : (
          <div className="space-y-8">
            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-4 uppercase tracking-wider text-blue-600 border-b border-slate-200 dark:border-slate-800 pb-2">
                Sidebar Modules
              </h2>
              <div className="space-y-2">
                <ToggleItem title="POS & New Invoice" description="Allow client to use the POS system." value={toggles.enablePos} onChange={() => handleToggle('enablePos')} />
                <ToggleItem title="Invoices" description="Allow client to manage generated invoices." value={toggles.enableInvoices} onChange={() => handleToggle('enableInvoices')} />
                <ToggleItem title="Products" description="Allow client to manage product inventory." value={toggles.enableProducts} onChange={() => handleToggle('enableProducts')} />
                <ToggleItem title="Categories" description="Allow client to manage product categories." value={toggles.enableCategories} onChange={() => handleToggle('enableCategories')} />
                <ToggleItem title="Customers" description="Allow client to manage customer accounts." value={toggles.enableCustomers} onChange={() => handleToggle('enableCustomers')} />
                <ToggleItem title="Suppliers" description="Allow client to manage supplier profiles." value={toggles.enableSuppliers} onChange={() => handleToggle('enableSuppliers')} />
                <ToggleItem title="Purchases Module" description="Allow client to manage purchases and suppliers." value={toggles.enablePurchases} onChange={() => handleToggle('enablePurchases')} />
                <ToggleItem title="Reports" description="Allow client to view basic analytics." value={toggles.enableReports} onChange={() => handleToggle('enableReports')} />
                <ToggleItem title="Users" description="Allow client to manage employee logins." value={toggles.enableUsers} onChange={() => handleToggle('enableUsers')} />
                <ToggleItem title="Settings" description="Allow client to change company settings." value={toggles.enableSettings} onChange={() => handleToggle('enableSettings')} />
              </div>
            </div>

            <div>
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white mb-4 uppercase tracking-wider text-orange-500 border-b border-slate-200 dark:border-slate-800 pb-2">
                Premium Features
              </h2>
              <div className="space-y-2">
                <ToggleItem title="Quotations Feature" description="Allow the client to generate Quotations from POS." value={toggles.enableQuotations} onChange={() => handleToggle('enableQuotations')} />
                <ToggleItem title="Profit Margin Report" description="Unlock the detailed profit margin analytics in Reports." value={toggles.enableProfitReport} onChange={() => handleToggle('enableProfitReport')} />
                <ToggleItem title="PDF Export" description="Allow downloading invoices as PDF." value={toggles.enablePdfExport} onChange={() => handleToggle('enablePdfExport')} />
                <ToggleItem title="WhatsApp Integration" description="Allow sending invoices directly via WhatsApp." value={toggles.enableWhatsapp} onChange={() => handleToggle('enableWhatsapp')} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function ToggleItem({ title, description, value, onChange }: { title: string, description: string, value: boolean, onChange: () => void }) {
  return (
    <div className="flex items-center justify-between py-4 border-b border-slate-100 dark:border-slate-800 last:border-0">
      <div>
        <h3 className="font-bold text-lg text-slate-900 dark:text-white">{title}</h3>
        <p className="text-slate-500 text-sm">{description}</p>
      </div>
      <button 
        onClick={onChange}
        className={`relative inline-flex h-7 w-12 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${value ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'}`}
      >
        <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${value ? 'translate-x-5' : 'translate-x-0'}`} />
      </button>
    </div>
  );
}
