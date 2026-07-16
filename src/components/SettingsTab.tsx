import React from 'react';
import { User, PlatformSettings } from '../types';
import { ShieldCheck, UserCheck, Settings, Landmark, RefreshCw, Terminal, Info, Database } from 'lucide-react';

interface SettingsTabProps {
  currentUser: User;
  onSwitchUser: (email: string) => void;
  settings: PlatformSettings;
  onUpdateSettings: (newSettings: any) => Promise<any>;
}

export default function SettingsTab({ currentUser, onSwitchUser, settings, onUpdateSettings }: SettingsTabProps) {
  const mockUsers = [
    { email: 'admin@enterprise.com', name: 'Chief Security Officer', role: 'Admin', desc: 'Full system privileges: modify coefficients, onboard nodes, resolve alerts.' },
    { email: 'procurement@enterprise.com', name: 'Sarah Patel', role: 'Procurement Manager', desc: 'Operations lead: onboard nodes, manage filters, view active threats.' },
    { email: 'analyst@enterprise.com', name: 'David Jenkins', role: 'Risk Analyst', desc: 'Threat analyst: simulate incidents, query Gemini models, audit scores.' },
    { email: 'supplier@zenith.com', name: 'Kenji Sato', role: 'Supplier', desc: 'Restricted supplier: view compliance status and documentation checklist.' },
    { email: 'viewer@enterprise.com', name: 'Executive Viewer', role: 'Viewer', desc: 'Read-only viewer: examine charts, track spending, download matrix CSV.' }
  ];

  const handleUpdateOrg = async (name: string) => {
    if (currentUser.role !== 'Admin' && currentUser.role !== 'Procurement Manager') return;
    await onUpdateSettings({ organizationName: name });
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Intro Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">Settings & Administration</h1>
        <p className="text-sm text-slate-400">Configure role-based access control, system organization parameters, and connection gateways.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start font-sans">
        {/* User Identity Switching Panel */}
        <div className="lg:col-span-2 bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 space-y-4">
          <div>
            <h3 className="text-sm font-semibold text-slate-200 font-display">SSO Identity Switcher (Simulate RBAC Roles)</h3>
            <p className="text-xs text-slate-500 mt-1">Select an active corporate profile below to test restricted pages, forms, and permission policies across the dashboard.</p>
          </div>

          <div className="space-y-3 pt-2">
            {mockUsers.map((u) => {
              const isCurrent = currentUser.email === u.email;
              return (
                <button
                  key={u.email}
                  onClick={() => onSwitchUser(u.email)}
                  className={`w-full text-left p-3.5 rounded-xl border transition flex items-start gap-3.5 cursor-pointer ${
                    isCurrent
                      ? 'bg-indigo-600/15 border-indigo-500/40 text-white'
                      : 'bg-slate-900 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <div className={`p-2 rounded-lg border mt-0.5 ${
                    isCurrent ? 'bg-indigo-500/20 border-indigo-500/30 text-indigo-400' : 'bg-slate-950 border-slate-800 text-slate-400'
                  }`}>
                    <UserCheck className="w-4 h-4" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-xs font-display">{u.name}</span>
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                        isCurrent ? 'bg-indigo-500/25 text-indigo-300 border-indigo-500/30' : 'bg-slate-800 text-slate-400 border-slate-700'
                      }`}>
                        {u.role.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1 leading-normal">{u.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Global Configurations */}
        <div className="space-y-6">
          {/* Org details */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5 font-display">
              <Landmark className="w-4.5 h-4.5 text-indigo-400" />
              Organization Profile
            </h3>
            <div>
              <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Organization Name</label>
              <input
                type="text"
                disabled={currentUser.role !== 'Admin' && currentUser.role !== 'Procurement Manager'}
                value={settings.organizationName}
                onChange={(e) => handleUpdateOrg(e.target.value)}
                className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-slate-700 disabled:opacity-45 font-semibold"
              />
              <p className="text-[10px] text-slate-500 mt-1">SaaS platform branding. Requires procurement/admin role to modify.</p>
            </div>
          </div>

          {/* Database Gateways */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5 font-display">
              <Database className="w-4.5 h-4.5 text-emerald-400" />
              Runtime Connection Gateways
            </h3>
            <div className="space-y-2 text-xs font-mono text-slate-400">
              <div className="p-2 bg-slate-950 rounded-lg flex items-center justify-between border border-slate-800/30">
                <span className="text-[10px] text-slate-500">Express Port</span>
                <span className="text-emerald-400">3000 (Active)</span>
              </div>
              <div className="p-2 bg-slate-950 rounded-lg flex items-center justify-between border border-slate-800/30">
                <span className="text-[10px] text-slate-500">Gemini SDK proxy</span>
                <span className="text-indigo-400">Active</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-500 leading-normal">
              To inject custom proprietary API keys, please use the <strong>Settings &gt; Secrets</strong> dashboard panel in Google AI Studio.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
