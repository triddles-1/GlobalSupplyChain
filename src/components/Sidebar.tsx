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
    <aside className="w-60 border-r border-slate-800 flex flex-col shrink-0 bg-slate-950 h-screen sticky top-0 font-sans text-slate-300 justify-between">
      <div className="flex-1 flex flex-col min-h-0">
        {/* Header Branding */}
        <div className="p-6 flex items-center gap-3">
          <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center font-bold text-white shadow-lg shadow-indigo-500/20">V</div>
          <span className="font-semibold tracking-tight text-white uppercase text-sm font-display">Vanguard RM</span>
        </div>
        
        {/* Navigation Items */}
        <nav className="flex-1 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-slate-800 text-white'
                    : 'text-slate-400 hover:bg-slate-900'
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-indigo-400' : 'bg-transparent'}`}></span>
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                <span className="truncate">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* User block & Logout at the bottom */}
      <div className="border-t border-slate-800 p-4 space-y-3 bg-slate-950/60">
        <div className="flex items-center gap-3 p-2 rounded-lg bg-slate-900/50 border border-slate-800/40">
          <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-xs font-bold text-indigo-400">
            {currentUser.name.substring(0, 2).toUpperCase()}
          </div>
          <div className="overflow-hidden flex-1">
            <p className="text-xs font-medium text-white truncate leading-tight">{currentUser.name}</p>
            <p className="text-[10px] text-slate-500 truncate mt-0.5">{currentUser.role}</p>
          </div>
        </div>

        <button
          onClick={onLogout}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-800 hover:border-rose-950/40 hover:bg-rose-950/20 text-xs font-semibold text-slate-400 hover:text-rose-400 transition-colors"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
