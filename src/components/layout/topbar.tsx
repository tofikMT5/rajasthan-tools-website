'use client';

import React, { useState } from 'react';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { logoutAction } from '@/app/actions/auth';
import { useI18n } from '@/lib/i18n/i18n-context';
import { Search, Bell, Globe, Sun, Moon, User, LogOut, Package, ShieldAlert, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface TopbarProps {
  onOpenSearch?: () => void;
}

export function Topbar({ onOpenSearch }: TopbarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { lang, toggleLanguage } = useI18n();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

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
      <div className="hidden md:flex items-center w-72 lg:w-96">
        <div
          onClick={onOpenSearch}
          className="w-full flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-400 hover:border-slate-300 dark:hover:border-slate-700 cursor-pointer text-xs font-medium transition-all"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span>Search products, invoices...</span>
          <kbd className="ml-auto px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-[10px] font-mono text-slate-600 dark:text-slate-300">
            ⌘K
          </kbd>
        </div>
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
