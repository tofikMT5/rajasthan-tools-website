'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { UserCog, Plus, Shield, Check, X, KeyRound } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';
import { toast } from 'sonner';

export default function UsersPage() {
  const { data: session } = useSession();
  const currentUserRole = (session?.user as any)?.role || 'CASHIER';
  const isSuperAdmin = currentUserRole === 'SUPER_ADMIN';

  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'SUPER_ADMIN' | 'ADMIN' | 'CASHIER' | 'SALESMAN' | 'VIEWER'>('CASHIER');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/users');
      const data = await res.json();
      if (Array.isArray(data)) setUsers(data);
    } catch (e) {
      toast.error('Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSuperAdmin && role === 'SUPER_ADMIN') {
      toast.error('Only Super Admin can assign SUPER_ADMIN role');
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName,
          username,
          password,
          role,
          phone,
          email,
          isActive: true,
        }),
      });

      if (res.ok) {
        toast.success('User account created!');
        setIsModalOpen(false);
        setFullName('');
        setUsername('');
        setPassword('');
        fetchUsers();
      } else {
        const err = await res.json();
        toast.error(err.error || 'Failed to create user');
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
            <UserCog className="w-6 h-6 text-blue-600" /> Staff Accounts & Access Management
          </h1>
          <p className="text-sm text-slate-500">Configure access levels for store admins, cashiers, and salesmen.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white font-bold gap-2">
          <Plus className="w-4 h-4" /> Add User Account
        </Button>
      </div>

      {/* Users Table */}
      <Card className="border-slate-200 dark:border-slate-800">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 font-semibold text-slate-500">
                <tr>
                  <th className="p-3.5 pl-6">User</th>
                  <th className="p-3.5">Username</th>
                  <th className="p-3.5">Role</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 pr-6 text-right">Last Login</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50">
                    <td className="p-3.5 pl-6 font-bold text-slate-900 dark:text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-xs flex items-center justify-center">
                        {(u.fullName || 'A')[0].toUpperCase()}
                      </div>
                      <span>{u.fullName}</span>
                    </td>
                    <td className="p-3.5 font-mono text-slate-500">{u.username}</td>
                    <td className="p-3.5">
                      <Badge variant={u.role === 'SUPER_ADMIN' ? 'destructive' : u.role === 'ADMIN' ? 'warning' : 'outline'}>
                        {u.role}
                      </Badge>
                    </td>
                    <td className="p-3.5 font-mono">{u.phone || '-'}</td>
                    <td className="p-3.5">
                      <Badge variant={u.isActive ? 'success' : 'destructive'}>{u.isActive ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="p-3.5 pr-6 text-right text-slate-400">{formatDate(u.lastLogin)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* CREATE USER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Add Staff User</h3>
            <form onSubmit={handleCreateUser} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Full Name *</label>
                <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Dinesh Sharma" required />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Username *</label>
                <Input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="dinesh" required />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Password *</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 dark:text-slate-300">Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as any)}
                  className="w-full h-9 rounded-md border border-slate-200 dark:border-slate-800 bg-transparent px-3 text-xs outline-none"
                >
                  {isSuperAdmin && <option value="SUPER_ADMIN">SUPER_ADMIN (System Owner)</option>}
                  <option value="ADMIN">ADMIN (Store Manager)</option>
                  <option value="CASHIER">CASHIER (POS & Billing)</option>
                  <option value="SALESMAN">SALESMAN (POS)</option>
                  <option value="VIEWER">VIEWER (Read-only)</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white font-bold">
                  Create User
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
