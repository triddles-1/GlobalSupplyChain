import React, { useState, useMemo } from 'react';
import { Supplier, PlatformSettings, User } from '../types';
import { ShieldCheck, ShieldAlert, Sliders, RefreshCw, BarChart3, HelpCircle, Info, Lock } from 'lucide-react';

interface RiskCenterTabProps {
  suppliers: Supplier[];
  settings: PlatformSettings;
  currentUser: User;
  onUpdateSettings: (newSettings: any) => Promise<any>;
}

export default function RiskCenterTab({ suppliers, settings, currentUser, onUpdateSettings }: RiskCenterTabProps) {
  const [financialWeight, setFinancialWeight] = useState(settings.weights.financial);
  const [cyberWeight, setCyberWeight] = useState(settings.weights.cyber);
  const [weatherWeight, setWeatherWeight] = useState(settings.weights.weather);
  const [esgWeight, setEsgWeight] = useState(settings.weights.esg);
  const [operationalWeight, setOperationalWeight] = useState(settings.weights.operational);
  const [saving, setSaving] = useState(false);

  const totalWeights = useMemo(() => {
    return financialWeight + cyberWeight + weatherWeight + esgWeight + operationalWeight;
  }, [financialWeight, cyberWeight, weatherWeight, esgWeight, operationalWeight]);

  // Country Risk Averages
  const countryAverages = useMemo(() => {
    const counts: Record<string, { sum: number; count: number }> = {};
    suppliers.forEach(s => {
      if (!counts[s.country]) {
        counts[s.country] = { sum: 0, count: 0 };
      }
      counts[s.country].sum += s.riskScore;
      counts[s.country].count += 1;
    });

    return Object.entries(counts).map(([name, data]) => ({
      name,
      avg: Math.round(data.sum / data.count)
    })).sort((a, b) => b.avg - a.avg);
  }, [suppliers]);

  const handleRecalibrate = async () => {
    if (totalWeights !== 100) return;
    setSaving(true);
    try {
      await onUpdateSettings({
        weights: {
          financial: financialWeight,
          cyber: cyberWeight,
          weather: weatherWeight,
          esg: esgWeight,
          operational: operationalWeight
        }
      });
    } catch (err) {
      console.error('Failed to update weights:', err);
    } finally {
      setSaving(false);
    }
  };

  const getRiskColor = (score: number) => {
    if (score < 40) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score < 60) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    if (score < 75) return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  const canWrite = currentUser.role === 'Admin' || currentUser.role === 'Procurement Manager';

  return (
    <div className="space-y-6 font-sans">
      {/* Intro Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans">Mathematical Risk Scoring Model</h1>
        <p className="text-sm text-slate-400">Recalibrate component coefficient weights to instantly calculate risk vectors across global nodes.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Sliders Configuration */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800/80 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-800/60 pb-3">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="w-4.5 h-4.5 text-blue-400" />
              Weight Adjustments
            </span>
            <div className={`text-xs font-mono font-bold px-2.5 py-1 rounded-lg border ${
              totalWeights === 100
                ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/20'
                : 'bg-rose-500/15 text-rose-400 border-rose-500/20'
            }`}>
              Total Weight: {totalWeights}%
            </div>
          </div>

          <div className="space-y-5">
            {/* Financial Weight */}
            <div>
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="font-semibold text-slate-300">Financial Instability Coefficient</span>
                <span className="font-mono text-blue-400">{financialWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                disabled={!canWrite}
                value={financialWeight}
                onChange={(e) => setFinancialWeight(parseInt(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer disabled:opacity-40"
              />
              <p className="text-[10px] text-slate-500 mt-1">Calculates risk using bankruptcy ratings and low credit scores.</p>
            </div>

            {/* Cyber Weight */}
            <div>
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="font-semibold text-slate-300">Cyber Vulnerability Coefficient</span>
                <span className="font-mono text-blue-400">{cyberWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                disabled={!canWrite}
                value={cyberWeight}
                onChange={(e) => setCyberWeight(parseInt(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer disabled:opacity-40"
              />
              <p className="text-[10px] text-slate-500 mt-1">Calculates risk using vulnerability CVE exposure levels.</p>
            </div>

            {/* Weather Weight */}
            <div>
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="font-semibold text-slate-300">Climate Exposure Coefficient</span>
                <span className="font-mono text-blue-400">{weatherWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                disabled={!canWrite}
                value={weatherWeight}
                onChange={(e) => setWeatherWeight(parseInt(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer disabled:opacity-40"
              />
              <p className="text-[10px] text-slate-500 mt-1">Calculates risk using natural storm, wildfire and coastal typhoon proximity scores.</p>
            </div>

            {/* ESG Weight */}
            <div>
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="font-semibold text-slate-300">ESG Non-Compliance Coefficient</span>
                <span className="font-mono text-blue-400">{esgWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                disabled={!canWrite}
                value={esgWeight}
                onChange={(e) => setEsgWeight(parseInt(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer disabled:opacity-40"
              />
              <p className="text-[10px] text-slate-500 mt-1">Calculates risk using human-rights audits and regulatory non-compliance scores.</p>
            </div>

            {/* Operational Weight */}
            <div>
              <div className="flex justify-between items-center mb-1 text-xs">
                <span className="font-semibold text-slate-300">Operational Inefficiency Coefficient</span>
                <span className="font-mono text-blue-400">{operationalWeight}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="5"
                disabled={!canWrite}
                value={operationalWeight}
                onChange={(e) => setOperationalWeight(parseInt(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer disabled:opacity-40"
              />
              <p className="text-[10px] text-slate-500 mt-1">Calculates risk using delivery delay frequencies and SLA deficit metrics.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800/60 flex items-center justify-between">
            {totalWeights !== 100 ? (
              <span className="text-[11px] text-rose-400 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> Coefficient parameters must sum exactly to 100%. Current sum: {totalWeights}%
              </span>
            ) : (
              <span className="text-[11px] text-slate-500">Parameters verified mathematically. Redundant rounding eliminated.</span>
            )}

            {canWrite ? (
              <button
                disabled={totalWeights !== 100 || saving}
                onClick={handleRecalibrate}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white transition flex items-center gap-2 shadow-lg shadow-blue-500/20 disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${saving ? 'animate-spin' : ''}`} />
                <span>{saving ? 'Recalculating...' : 'Recalibrate Engine'}</span>
              </button>
            ) : (
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 px-3 py-2 bg-slate-950/50 rounded-xl border border-slate-800/50">
                <Lock className="w-3.5 h-3.5 text-slate-600" />
                <span>Adjustments locked for {currentUser.role}</span>
              </div>
            )}
          </div>
        </div>

        {/* Side panel describing formula and country weights */}
        <div className="space-y-6">
          {/* Formula box */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold text-slate-200">The Active Risk Formula</h3>
            <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl text-center">
              <code className="text-xs font-mono text-emerald-400 block break-words">
                Risk = ({financialWeight}% &times; Fin) + ({cyberWeight}% &times; Cyb) + ({weatherWeight}% &times; Wea) + ({esgWeight}% &times; ESG) + ({operationalWeight}% &times; Ope)
              </code>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Where each variable is normalised as a risk deficit (e.g. <code className="font-mono bg-slate-950 px-1 py-0.5 rounded text-blue-400">Fin = 100 - Health</code>). Dynamic calculation occurs instantly on the express server.
            </p>
          </div>

          {/* Country Level averages */}
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5">
            <h3 className="text-sm font-semibold text-slate-200 mb-4 flex items-center gap-1.5">
              <BarChart3 className="w-4.5 h-4.5 text-indigo-400" />
              Country Risk Indexes
            </h3>
            <div className="space-y-3">
              {countryAverages.map((item) => (
                <div key={item.name} className="flex items-center justify-between gap-4">
                  <span className="text-xs text-slate-400 font-medium">{item.name}</span>
                  <div className="flex-1 max-w-[120px] h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-600" style={{ width: `${item.avg}%` }} />
                  </div>
                  <span className={`text-[11px] font-mono font-bold px-2 py-0.5 rounded border ${getRiskColor(item.avg)}`}>
                    {item.avg} avg
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
