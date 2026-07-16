import React from 'react';
import { User, UserRole } from '../types';
import {
  LayoutDashboard,
  Users,
  ShieldAlert,
  CloudLightning,
  Bug,
  DollarSign,
  BrainCircuit,
  Settings,
  ShieldCheck,
  LogOut,
  Radio
} from 'lucide-react';

interface SidebarProps {
  currentUser: User;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
}

export default function Sidebar({ currentUser, activeTab, setActiveTab, onLogout }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Executive Dashboard', icon: LayoutDashboard },
    { id: 'suppliers', label: 'Suppliers Matrix', icon: Users },
    { id: 'risk', label: 'Risk Model Engine', icon: ShieldAlert },
    { id: 'weather', label: 'Weather Alerts Hub', icon: CloudLightning },
    { id: 'cyber', label: 'Cyber Threat Center', icon: Bug },
    { id: 'finance', label: 'Financial Exposure', icon: DollarSign },
    { id: 'ai', label: 'Gemini Copilot', icon: BrainCircuit },
    { id: 'settings', label: 'System Settings', icon: Settings }
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-900 flex flex-col justify-between h-screen sticky top-0 font-sans text-slate-300">
      <div>
        {/* Header Branding */}
        <div className="p-6 border-b border-slate-900/80">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-black text-sm shadow-lg shadow-blue-500/20">
              V
            </div>
            <div>
              <span className="font-bold text-white text-base tracking-tight block">Vanguard Risk</span>
              <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1 mt-0.5">
                <Radio className="w-2.5 h-2.5 text-emerald-500 animate-pulse" />
                LIVE RADAR
              </span>
            </div>
          </div>
        </div>

        {/* User Identity Banner with Dynamic RBAC badge */}
        <div className="p-4 mx-3 my-4 bg-slate-900/50 border border-slate-800/80 rounded-xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-xs text-blue-400 font-mono">
              {currentUser.name.substring(0, 2).toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-xs font-semibold text-slate-200 block truncate leading-none">
                {currentUser.name}
              </span>
              <span className="text-[10px] text-slate-400 font-mono truncate block mt-1">
                {currentUser.email}
              </span>
            </div>
          </div>
          <div className="mt-2.5 flex items-center justify-between">
            <span className="text-[9px] text-slate-500 font-semibold uppercase tracking-wider">Simulated Role</span>
            <span className="text-[9px] font-mono px-2 py-0.5 rounded-full font-bold bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
              <ShieldCheck className="w-2.5 h-2.5" />
              {currentUser.role}
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition duration-150 ${
                  isActive
                    ? 'bg-slate-900 text-white border border-slate-800'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/30'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-blue-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Log Out */}
      <div className="p-4 border-t border-slate-900/80">
        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-slate-900 hover:border-rose-950/40 hover:bg-rose-950/20 text-xs font-semibold text-slate-400 hover:text-rose-400 transition duration-150"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Exit Enterprise SSO</span>
        </button>
      </div>
    </aside>
  );
}
