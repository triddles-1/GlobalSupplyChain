import React, { useMemo } from 'react';
import { RiskAlert, Supplier } from '../types';
import { Bug, ShieldAlert, CheckSquare, FileWarning, HelpCircle, Activity, ShieldCheck, Cpu } from 'lucide-react';

interface CyberTabProps {
  alerts: RiskAlert[];
  suppliers: Supplier[];
}

export default function CyberTab({ alerts, suppliers }: CyberTabProps) {
  const cyberAlerts = useMemo(() => {
    return alerts.filter(a => a.type === 'cyber');
  }, [alerts]);

  const stats = useMemo(() => {
    // Average cyber rating of suppliers
    const total = suppliers.length;
    const avgCyber = Math.round(suppliers.reduce((acc, s) => acc + s.cyberRating, 0) / total);
    const lowCyberCount = suppliers.filter(s => s.cyberRating < 60).length;

    return {
      avgCyber,
      lowCyberCount
    };
  }, [suppliers]);

  const activeCVEs = [
    { cve: 'CVE-2026-38101', score: '9.8 Critical', title: 'Apache Log4j Unauthenticated RCE', patchStatus: 'Overdue' },
    { cve: 'CVE-2026-29188', score: '8.4 High', title: 'Fortinet FortiOS Improper Privilege Escalation', patchStatus: 'Patched' },
    { cve: 'CVE-2026-1182', score: '7.5 High', title: 'OpenSSL Out-Of-Bounds Buffer Overflow', patchStatus: 'In Progress' }
  ];

  const getSeverityStyle = (sev: string) => {
    if (sev === 'critical') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    if (sev === 'high') return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Intro Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-display">Cyber Threat Intelligence Center</h1>
        <p className="text-sm text-slate-400">Monitoring CVE vulnerabilities, ransomware, and technical exposure on vendor integrations.</p>
      </div>

      {/* Cyber stats strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 font-sans">
        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 relative overflow-hidden">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block font-display">Average Cyber Resilience</span>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">{stats.avgCyber}/100</span>
            <span className="text-xs text-emerald-400 font-semibold font-mono">B+ Rating</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Aggregated active cybersecurity scores across portfolio</p>
        </div>

        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 relative overflow-hidden">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block font-display">High Cyber Risk Vendors</span>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-rose-400 tracking-tight">{stats.lowCyberCount}</span>
            <span className="text-xs text-rose-500 font-semibold font-mono">Rating &lt; 60</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Nodes with vulnerable perimeter configurations</p>
        </div>

        <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 relative overflow-hidden">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block font-display">Active Cyber Campaigns</span>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-indigo-400 tracking-tight">{cyberAlerts.length}</span>
            <span className="text-xs text-slate-400">active alerts</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Requires technical isolation check</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start font-sans">
        {/* Active Threats feed */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-display">Active Threat Feeds</h2>
          {cyberAlerts.map(alert => (
            <div key={alert.id} className="p-5 bg-slate-800/30 border border-slate-700/50 rounded-2xl flex gap-4">
              <div className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${getSeverityStyle(alert.severity)}`}>
                <Bug className="w-5 h-5" />
              </div>
              <div className="min-w-0 flex-1 space-y-1">
                <div className="flex items-center justify-between gap-3">
                  <span className="font-bold text-sm text-white truncate font-display">{alert.title}</span>
                  <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full shrink-0 ${getSeverityStyle(alert.severity)}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed mt-1">{alert.description}</p>
                <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-2">
                  <span>Exposure Region: {alert.region}</span>
                  <span>Affected: {alert.affectedSuppliers.length} suppliers</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CVE list & audits */}
        <div className="space-y-6">
          {/* Active CVEs */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-1.5 font-display">
              <Cpu className="w-4.5 h-4.5 text-indigo-400" />
              Active CVE Watchlist
            </h3>
            <div className="space-y-3">
              {activeCVEs.map((item) => (
                <div key={item.cve} className="p-2.5 bg-slate-900 rounded-xl border border-slate-800 space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300 font-bold">{item.cve}</span>
                    <span className="text-rose-400 font-semibold">{item.score}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{item.title}</p>
                  <div className="flex justify-between items-center text-[9px] font-semibold uppercase tracking-wider pt-1 mt-1 border-t border-slate-800/50">
                    <span className="text-slate-500">Status</span>
                    <span className={item.patchStatus === 'Overdue' ? 'text-rose-400' : 'text-slate-400'}>{item.patchStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Compliance Checklist */}
          <div className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-200 font-display">Vendor Compliance Criteria</h3>
            <p className="text-[11px] text-slate-500">Standard criteria audited quarterly on all suppliers.</p>
            <div className="space-y-2.5 pt-1 text-xs text-slate-300">
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" defaultChecked disabled className="rounded accent-indigo-500 bg-slate-950" />
                <span>MFA Enforcement on all endpoints</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" defaultChecked disabled className="rounded accent-indigo-500 bg-slate-950" />
                <span>Firmware vulnerability patch validation</span>
              </label>
              <label className="flex items-center gap-2.5 cursor-pointer">
                <input type="checkbox" defaultChecked={false} disabled className="rounded accent-indigo-500 bg-slate-950" />
                <span>Continuous penetration testing audits</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
