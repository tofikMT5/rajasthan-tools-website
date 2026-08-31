'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { logoutAction } from '@/app/actions/auth';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Receipt,
  FileText,
  Package,
  Tags,
  Users,
  Building2,
  ShoppingBag,
  BarChart3,
  UserCog,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useI18n } from '@/lib/i18n/i18n-context';
import { cn } from '@/lib/utils';

interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useI18n();

  const userRole = (session?.user as any)?.role || 'CASHIER';

  const menuItems = [
    { label: t('dashboard'), href: '/dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMIN', 'CASHIER', 'SALESMAN', 'VIEWER'] },
    { label: t('pos'), href: '/pos', icon: Receipt, roles: ['SUPER_ADMIN', 'ADMIN', 'CASHIER', 'SALESMAN'], highlight: true },
    { label: t('invoices'), href: '/invoices', icon: FileText, roles: ['SUPER_ADMIN', 'ADMIN', 'CASHIER', 'SALESMAN', 'VIEWER'] },
    { label: t('products'), href: '/products', icon: Package, roles: ['SUPER_ADMIN', 'ADMIN', 'CASHIER', 'SALESMAN', 'VIEWER'] },
    { label: t('categories'), href: '/categories', icon: Tags, roles: ['SUPER_ADMIN', 'ADMIN', 'CASHIER', 'SALESMAN', 'VIEWER'] },
    { label: t('customers'), href: '/customers', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN', 'CASHIER', 'SALESMAN', 'VIEWER'] },
    { label: t('suppliers'), href: '/suppliers', icon: Building2, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { label: t('purchases'), href: '/purchases', icon: ShoppingBag, roles: ['SUPER_ADMIN', 'ADMIN', 'CASHIER', 'SALESMAN', 'VIEWER'] },
    { label: t('reports'), href: '/reports', icon: BarChart3, roles: ['SUPER_ADMIN', 'ADMIN', 'CASHIER', 'SALESMAN', 'VIEWER'] },
    { label: t('users'), href: '/users', icon: UserCog, roles: ['SUPER_ADMIN', 'ADMIN'] },
    { label: t('settings'), href: '/settings', icon: Settings, roles: ['SUPER_ADMIN', 'ADMIN'] },
  ];

  const filteredItems = menuItems.filter((item) => item.roles.includes(userRole));

  return (
    <aside
      className={cn(
        'relative bg-slate-950 text-slate-200 border-r border-slate-800 flex flex-col justify-between transition-all duration-300 z-30 select-none no-print',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Top Header Logo */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80">
        <Link href="/dashboard" className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-orange-500 p-0.5 shadow-lg shadow-blue-500/20 shrink-0">
            <div className="w-full h-full bg-slate-950 rounded-[9px] flex items-center justify-center font-black text-white tracking-widest text-sm">
              RT
            </div>
          </div>
          {!collapsed && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col">
              <span className="font-bold text-sm text-white tracking-wide leading-none">RT Billing</span>
              <span className="text-[10px] text-orange-400 font-medium tracking-wider mt-0.5">Rajasthan Tools Q8</span>
            </motion.div>
          )}
        </Link>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-colors"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation List */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {filteredItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'group relative flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all duration-200',
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30'
                  : item.highlight
                  ? 'bg-orange-500/10 text-orange-400 hover:bg-orange-500/20 border border-orange-500/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-900'
              )}
            >
              <Icon className={cn('w-5 h-5 shrink-0 transition-transform group-hover:scale-110', isActive && 'text-white')} />
              {!collapsed && <span>{item.label}</span>}
              {item.highlight && !collapsed && (
                <span className="ml-auto text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                  POS
                </span>
              )}
            </Link>
          );
        })}
      </div>

      {/* User Profile Card Footer */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-900/50">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow">
              {(session?.user?.name || 'A')[0].toUpperCase()}
            </div>
            {!collapsed && (
              <div className="flex flex-col min-w-0">
                <span className="text-xs font-semibold text-white truncate">{session?.user?.name || 'Administrator'}</span>
                <span className="text-[10px] text-slate-400 font-mono truncate">{userRole}</span>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              // Clear session storage just in case so fresh launch logic works next time
              sessionStorage.removeItem('app-session-active');
              logoutAction();
            }}
            title="Logout"
            className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition-colors shrink-0"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
