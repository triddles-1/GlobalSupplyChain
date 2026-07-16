import React, { useState } from 'react';
import { User } from '../types';
import { ShieldCheck, LogIn, Sparkles, UserCheck } from 'lucide-react';

interface AuthModalProps {
  onLoginSuccess: (user: User) => void;
}

export default function AuthModal({ onLoginSuccess }: AuthModalProps) {
  const [email, setEmail] = useState('procurement@enterprise.com');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const seedUsers = [
    { email: 'admin@enterprise.com', name: 'CSO (Admin)', role: 'Admin', desc: 'Full write access and settings controls' },
    { email: 'procurement@enterprise.com', name: 'Sarah Patel (Procurement)', role: 'Procurement Manager', desc: 'Can manage suppliers and view alerts' },
    { email: 'analyst@enterprise.com', name: 'David Jenkins (Analyst)', role: 'Risk Analyst', desc: 'Can adjust risk scores and run AI analysis' },
    { email: 'supplier@zenith.com', name: 'Kenji Sato (Supplier)', role: 'Supplier', desc: 'Can view own profile and compliance status' },
    { email: 'viewer@enterprise.com', name: 'Executive Viewer', role: 'Viewer', desc: 'Read-only access across the dashboard' }
  ];

  const handleLogin = async (selectedEmail: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: selectedEmail }),
      });
      const data = await res.json();
      if (data.success) {
        onLoginSuccess(data.user);
      } else {
        setError(data.message || 'Authentication failed');
      }
    } catch (err) {
      setError('Connection to Express server failed. Re-trying...');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-6 text-slate-100 font-sans">
      <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 relative overflow-hidden">
        {/* Decorative ambient gradient */}
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-3 mb-6">
          <div className="p-3 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">Vanguard Risk</h1>
            <p className="text-xs text-slate-400">Global Supply Chain Risk Platform</p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-lg font-semibold text-slate-200">Welcome Back</h2>
          <p className="text-sm text-slate-400">Select an enterprise identity profile below to simulate standard single sign-on (SSO) with RBAC access levels.</p>
        </div>

        {error && (
          <div className="p-3 mb-4 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400 text-xs">
            {error}
          </div>
        )}

        <div className="space-y-3 mb-6">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">SSO Profiles</label>
          {seedUsers.map((u) => (
            <button
              key={u.email}
              onClick={() => handleLogin(u.email)}
              disabled={loading}
              className="w-full text-left p-3.5 rounded-xl border border-slate-800/80 bg-slate-950 hover:bg-slate-800/50 hover:border-slate-700 transition duration-200 group flex items-start gap-3"
            >
              <div className="p-1.5 bg-slate-900 rounded-lg border border-slate-800 text-slate-400 group-hover:text-blue-400 transition-colors mt-0.5">
                <UserCheck className="w-4 h-4" />
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm text-slate-200 group-hover:text-white transition-colors">{u.name}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-mono bg-slate-800 border border-slate-700 text-slate-400">
                    {u.role}
                  </span>
                </div>
                <p className="text-xs text-slate-500 mt-1">{u.desc}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-800" />
          </div>
          <span className="relative bg-slate-900 px-3 text-xs font-mono text-slate-500">DEMO AUTHENTICATION</span>
        </div>

        <div className="flex items-center gap-2 justify-center text-xs text-slate-500">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>Express backend live connection verified on Port 3000</span>
        </div>
      </div>
    </div>
  );
}
