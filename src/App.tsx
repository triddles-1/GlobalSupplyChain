import React, { useState, useEffect } from 'react';
import { User, Supplier, RiskAlert, PlatformSettings } from './types';
import AuthModal from './components/AuthModal';
import Sidebar from './components/Sidebar';
import DashboardTab from './components/DashboardTab';
import SupplierTab from './components/SupplierTab';
import RiskCenterTab from './components/RiskCenterTab';
import WeatherTab from './components/WeatherTab';
import CyberTab from './components/CyberTab';
import FinanceTab from './components/FinanceTab';
import AIAssistantTab from './components/AIAssistantTab';
import SettingsTab from './components/SettingsTab';
import { ShieldCheck, HelpCircle, Radio, Bell, AlertTriangle } from 'lucide-react';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(null);

  // Core Data State
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [alerts, setAlerts] = useState<RiskAlert[]>([]);
  const [settings, setSettings] = useState<PlatformSettings>({
    organizationName: 'Global Enterprises Inc.',
    weights: { financial: 25, cyber: 25, weather: 20, esg: 15, operational: 15 },
    alertThresholds: { critical: 75, high: 60, medium: 40 }
  });

  // Loaders
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  // Notifications Drawer state
  const [isNotificationsOpen, setIsNotificationsOpen] = useState<boolean>(false);

  // On mount: Try to fetch current user session and base dataset
  useEffect(() => {
    const initApp = async () => {
      setLoading(true);
      setError('');
      try {
        // 1. Get Me
        const meRes = await fetch('/api/auth/me');
        const meData = await meRes.json();
        if (meData.user) {
          setCurrentUser(meData.user);
        }

        // 2. Load core datasets
        await refreshAllData();
      } catch (err) {
        setError('Express server connection failed. Compiling bundles on port 3000...');
      } finally {
        setLoading(false);
      }
    };

    initApp();
  }, []);

  const refreshAllData = async (userEmail?: string) => {
    const email = userEmail || currentUser?.email || 'procurement@enterprise.com';
    const headers = { 'x-user-email': email };

    try {
      const [supRes, alertRes, setRes] = await Promise.all([
        fetch('/api/suppliers', { headers }),
        fetch('/api/alerts', { headers }),
        fetch('/api/settings', { headers })
      ]);

      const [supData, alertData, setData] = await Promise.all([
        supRes.json(),
        alertRes.json(),
        setRes.json()
      ]);

      if (supData.suppliers) setSuppliers(supData.suppliers);
      if (alertData.alerts) setAlerts(alertData.alerts);
      if (setData.settings) setSettings(setData.settings);
    } catch (err) {
      console.error('Failed to load full dataset:', err);
    }
  };

  // Switch active SSO identity session
  const handleSwitchUser = async (email: string) => {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (data.success) {
        setCurrentUser(data.user);
        await refreshAllData(data.user.email);
      }
    } catch (err) {
      console.error('Failed to switch user:', err);
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // API Call proxies to server
  const handleAddSupplier = async (form: any) => {
    try {
      const res = await fetch('/api/suppliers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || 'admin@enterprise.com'
        },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        await refreshAllData();
        return data.supplier;
      }
    } catch (err) {
      console.error('Add supplier failed:', err);
    }
  };

  const handleUpdateSupplier = async (id: string, updated: any) => {
    try {
      const res = await fetch(`/api/suppliers/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || 'admin@enterprise.com'
        },
        body: JSON.stringify(updated)
      });
      const data = await res.json();
      if (data.success) {
        await refreshAllData();
        return data.supplier;
      }
    } catch (err) {
      console.error('Update supplier failed:', err);
    }
  };

  const handleAddAlert = async (alertForm: any) => {
    try {
      const res = await fetch('/api/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || 'admin@enterprise.com'
        },
        body: JSON.stringify(alertForm)
      });
      const data = await res.json();
      if (data.success) {
        await refreshAllData();
        return data.alert;
      }
    } catch (err) {
      console.error('Add alert failed:', err);
    }
  };

  const handleUpdateAlertStatus = async (id: string, status: 'active' | 'mitigated' | 'monitoring') => {
    try {
      const res = await fetch(`/api/alerts/${id}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || 'admin@enterprise.com'
        },
        body: JSON.stringify({ status })
      });
      const data = await res.json();
      if (data.success) {
        await refreshAllData();
        return data.alert;
      }
    } catch (err) {
      console.error('Update alert failed:', err);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      const res = await fetch(`/api/alerts/${id}`, {
        method: 'DELETE',
        headers: {
          'x-user-email': currentUser?.email || 'admin@enterprise.com'
        }
      });
      const data = await res.json();
      if (data.success) {
        await refreshAllData();
        return true;
      }
    } catch (err) {
      console.error('Delete alert failed:', err);
    }
  };

  const handleUpdateSettings = async (newSettings: any) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser?.email || 'admin@enterprise.com'
        },
        body: JSON.stringify(newSettings)
      });
      const data = await res.json();
      if (data.success) {
        await refreshAllData();
        return data.settings;
      }
    } catch (err) {
      console.error('Update settings failed:', err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-slate-400 font-sans p-6">
        <div className="w-12 h-12 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mb-4" />
        <h2 className="text-sm font-semibold text-white">Booting Vanguard Control Tower</h2>
        <p className="text-xs text-slate-600 mt-1">Populating 100 suppliers matrix, starting express core routes on port 3000...</p>
      </div>
    );
  }

  // Not logged in: Show Identity SSO Switcher Modal on full screen
  if (!currentUser) {
    return <AuthModal onLoginSuccess={(u) => { setCurrentUser(u); refreshAllData(u.email); }} />;
  }

  // Active notifications list for topbar drawer
  const activeAlertsCount = alerts.filter(a => a.status === 'active').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex font-sans antialiased overflow-x-hidden selection:bg-indigo-500/30 selection:text-white">
      {/* Sidebar Navigation */}
      <Sidebar
        currentUser={currentUser}
        activeTab={activeTab}
        setActiveTab={(t) => { setActiveTab(t); setSelectedSupplierId(null); }}
        onLogout={handleLogout}
      />

      {/* Main Workspace Scaffolding */}
      <div className="flex-1 flex flex-col min-h-screen relative bg-slate-900">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
              Workspace / {settings.organizationName}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* System Status Pill */}
            <div className="hidden sm:flex items-center gap-2 bg-slate-800/50 border border-slate-700/50 px-3 py-1 rounded-full text-[10px] font-mono text-emerald-400 font-semibold shadow-inner">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>REALTIME TRACKING ACTIVE</span>
            </div>

            {/* Quick Notifications Button */}
            <div className="relative">
              <button
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className="p-2 bg-slate-800/50 border border-slate-700/50 hover:border-slate-600 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-slate-200 transition relative"
              >
                <Bell className="w-4.5 h-4.5" />
                {activeAlertsCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[9px] font-bold text-white rounded-full flex items-center justify-center font-mono animate-bounce">
                    {activeAlertsCount}
                  </span>
                )}
              </button>

              {/* Notifications dropdown menu panel */}
              {isNotificationsOpen && (
                <div className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 space-y-3 z-50 animate-fade-in">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-200">Active Threat Stream</span>
                    <span className="text-[10px] font-mono text-slate-500">{activeAlertsCount} active events</span>
                  </div>
                  
                  <div className="space-y-2.5 max-h-60 overflow-y-auto pr-0.5">
                    {alerts.filter(a => a.status === 'active').slice(0, 3).map(alert => (
                      <div key={alert.id} className="p-2.5 bg-slate-950 border border-slate-800/60 rounded-xl space-y-1">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-xs font-semibold text-slate-200 truncate">{alert.title}</span>
                          <span className="text-[8px] font-mono bg-rose-500/10 text-rose-400 px-1 py-0.2 rounded shrink-0">
                            {alert.severity.toUpperCase()}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 line-clamp-2 leading-relaxed">{alert.description}</p>
                      </div>
                    ))}
                    {activeAlertsCount === 0 && (
                      <p className="text-xs text-slate-500 text-center py-4">No active threat alerts registered.</p>
                    )}
                  </div>
                  
                  <div className="border-t border-slate-800 pt-2 text-center">
                    <button
                      onClick={() => { setActiveTab('weather'); setIsNotificationsOpen(false); }}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-semibold"
                    >
                      View Threat Hub
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable Main Viewport Canvas */}
        <main className="flex-1 overflow-y-auto px-8 py-8">
          {activeTab === 'dashboard' && (
            <DashboardTab
              suppliers={suppliers}
              alerts={alerts}
              setActiveTab={setActiveTab}
              setSelectedSupplierId={setSelectedSupplierId}
            />
          )}

          {activeTab === 'suppliers' && (
            <SupplierTab
              suppliers={suppliers}
              currentUser={currentUser}
              onAddSupplier={handleAddSupplier}
              onUpdateSupplier={handleUpdateSupplier}
              selectedSupplierId={selectedSupplierId}
              setSelectedSupplierId={setSelectedSupplierId}
            />
          )}

          {activeTab === 'risk' && (
            <RiskCenterTab
              suppliers={suppliers}
              settings={settings}
              currentUser={currentUser}
              onUpdateSettings={handleUpdateSettings}
            />
          )}

          {activeTab === 'weather' && (
            <WeatherTab
              suppliers={suppliers}
              alerts={alerts}
              currentUser={currentUser}
              onAddAlert={handleAddAlert}
              onUpdateAlertStatus={handleUpdateAlertStatus}
              onDeleteAlert={handleDeleteAlert}
            />
          )}

          {activeTab === 'cyber' && (
            <CyberTab
              alerts={alerts}
              suppliers={suppliers}
            />
          )}

          {activeTab === 'finance' && (
            <FinanceTab
              suppliers={suppliers}
            />
          )}

          {activeTab === 'ai' && (
            <AIAssistantTab
              currentUser={currentUser}
              suppliers={suppliers}
            />
          )}

          {activeTab === 'settings' && (
            <SettingsTab
              currentUser={currentUser}
              onSwitchUser={handleSwitchUser}
              settings={settings}
              onUpdateSettings={handleUpdateSettings}
            />
          )}
        </main>
      </div>
    </div>
  );
}
