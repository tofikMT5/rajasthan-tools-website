'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { logoutAction } from '@/app/actions/auth';
import { useI18n } from '@/lib/i18n/i18n-context';
import { useSearchStore } from '@/stores/search-store';
import { Search, Bell, Globe, Sun, Moon, User, LogOut, Package, ShieldAlert, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TopbarProps {
  onOpenSearch?: () => void;
}

export function Topbar({ onOpenSearch }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const { lang, toggleLanguage } = useI18n();
  const { globalSearch, setGlobalSearch } = useSearchStore();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  
  const [searchResults, setSearchResults] = useState<any>({ products: [], invoices: [], customers: [] });
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (globalSearch.length < 2) {
      setSearchResults({ products: [], invoices: [], customers: [] });
      setShowDropdown(false);
      return;
    }

    setShowDropdown(true);
    setIsSearching(true);
    const delay = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${globalSearch}`);
        const data = await res.json();
        setSearchResults(data);
      } catch (e) {
        console.error(e);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [globalSearch]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [searchRef]);

  const navigateTo = (path: string) => {
    setShowDropdown(false);
    setGlobalSearch('');
    router.push(path);
  };

  // Generate breadcrumb text
  const pathParts = pathname.split('/').filter(Boolean);
  const currentTitle = pathParts[0] ? pathParts[0].toUpperCase() : 'DASHBOARD';

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between z-20 no-print sticky top-0 shadow-sm">
      {/* Left: Breadcrumbs */}
      <div className="flex items-center gap-3">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Pages</span>
        <span className="text-slate-300">/</span>
        <h1 className="text-base font-bold text-slate-900 dark:text-white capitalize">{currentTitle}</h1>
      </div>

      {/* Center: Global Search Bar */}
      <div ref={searchRef} className="hidden md:flex items-center w-72 lg:w-96 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3" />
        <Input
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          onFocus={() => { if (globalSearch.length >= 2) setShowDropdown(true); }}
          placeholder="Search products, invoices, customers..."
          className="w-full pl-9 h-9 bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-200 focus-visible:ring-1 focus-visible:ring-orange-500 rounded-xl"
        />
        <div className="absolute right-3 hidden lg:block">
          {isSearching ? (
             <div className="w-3 h-3 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
          ) : (
            <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-300">
              ⌘K
            </kbd>
          )}
        </div>

        {/* SEARCH DROPDOWN */}
        {showDropdown && (
          <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl overflow-hidden z-50 max-h-[70vh] flex flex-col">
             <div className="overflow-y-auto p-2 space-y-4">
                {searchResults.products.length === 0 && searchResults.invoices.length === 0 && searchResults.customers.length === 0 && !isSearching && (
                  <p className="p-4 text-center text-xs text-slate-500">No results found for "{globalSearch}"</p>
                )}
                
                {searchResults.products.length > 0 && (
                  <div>
                    <h4 className="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Products</h4>
                    {searchResults.products.map((p: any) => (
                      <button key={p.id} onClick={() => navigateTo(`/products/${p.id}`)} className="w-full text-left p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex justify-between items-center group transition-colors">
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-500">{p.nameEn}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{p.itemCode}</p>
                        </div>
                        <span className="text-[10px] bg-slate-100 dark:bg-slate-950 px-2 py-0.5 rounded text-slate-500 font-medium">Product</span>
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.invoices.length > 0 && (
                  <div>
                    <h4 className="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Invoices</h4>
                    {searchResults.invoices.map((inv: any) => (
                      <button key={inv.id} onClick={() => navigateTo(`/invoices/${inv.id}`)} className="w-full text-left p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex justify-between items-center group transition-colors">
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-orange-500">{inv.customerNameSnap}</p>
                          <p className="text-[10px] text-slate-400 font-mono">Invoice RT-{inv.invoiceNo}</p>
                        </div>
                        <span className="text-[10px] bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 px-2 py-0.5 rounded font-medium">Invoice</span>
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.customers.length > 0 && (
                  <div>
                    <h4 className="px-2 pb-1 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Customers</h4>
                    {searchResults.customers.map((c: any) => (
                      <button key={c.id} onClick={() => navigateTo(`/customers/${c.id}`)} className="w-full text-left p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 flex justify-between items-center group transition-colors">
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-emerald-500">{c.nameEn}</p>
                          <p className="text-[10px] text-slate-400 font-mono">{c.phone || 'No phone'}</p>
                        </div>
                        <span className="text-[10px] bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded font-medium">Customer</span>
                      </button>
                    ))}
                  </div>
                )}
             </div>
          </div>
        )}
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Language Switcher */}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleLanguage}
          className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 flex items-center gap-1.5"
        >
          <Globe className="w-4 h-4 text-blue-600" />
          <span>{lang === 'en' ? 'AR' : 'EN'}</span>
        </Button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-slate-900 animate-pulse" />
          </button>

          {/* Notifications Dropdown Drawer */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex justify-between items-center pb-3 border-b border-slate-100 dark:border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" /> Notifications
                </h4>
                <span className="text-[10px] bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300 px-2 py-0.5 rounded-full font-bold">
                  2 Low Stock
                </span>
              </div>
              <div className="py-3 space-y-2.5 text-xs">
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Bosch Rotary Hammer Drill</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Only 3 units left (Min Alert: 5)</p>
                  </div>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex gap-2.5">
                  <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-slate-100">Makita Angle Grinder 850W</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">Only 4 units left (Min Alert: 5)</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile Avatar Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow">
              {(session?.user?.name || 'A')[0].toUpperCase()}
            </div>
            <span className="hidden sm:inline-block text-xs font-semibold text-slate-700 dark:text-slate-200 max-w-[100px] truncate">
              {session?.user?.name || 'Admin'}
            </span>
          </button>

          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-2 z-50 text-xs">
              <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="font-bold text-slate-900 dark:text-white truncate">{session?.user?.name}</p>
                <p className="text-[10px] text-slate-400 truncate">{(session?.user as any)?.role}</p>
              </div>
              <button
                onClick={() => {
                  sessionStorage.removeItem('app-session-active');
                  logoutAction();
                }}
                className="w-full text-left px-4 py-2.5 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 flex items-center gap-2 font-medium"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
