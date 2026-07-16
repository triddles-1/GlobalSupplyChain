import React, { useMemo } from 'react';
import { Supplier, RiskAlert } from '../types';
import {
  TrendingUp,
  AlertOctagon,
  Award,
  Zap,
  Globe,
  Building,
  DollarSign,
  ShieldAlert,
  ArrowRight,
  ShieldCheck,
  Activity,
  CalendarDays
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area
} from 'recharts';

interface DashboardTabProps {
  suppliers: Supplier[];
  alerts: RiskAlert[];
  setActiveTab: (tab: string) => void;
  setSelectedSupplierId: (id: string | null) => void;
}

export default function DashboardTab({ suppliers, alerts, setActiveTab, setSelectedSupplierId }: DashboardTabProps) {
  // Compute dashboard metrics
  const stats = useMemo(() => {
    const total = suppliers.length;
    
    // High risk suppliers are score >= 60
    const highRiskList = suppliers.filter(s => s.riskScore >= 65);
    const avgRisk = Math.round(suppliers.reduce((acc, s) => acc + s.riskScore, 0) / total);
    
    const activeAlertCount = alerts.filter(a => a.status === 'active').length;
    const criticalAlertCount = alerts.filter(a => a.status === 'active' && a.severity === 'critical').length;
    
    // Financial exposure (sum of spend on high-risk suppliers)
    const totalExposure = suppliers
      .filter(s => s.riskScore >= 65)
      .reduce((acc, s) => acc + s.spend, 0);

    return {
      total,
      highRiskCount: highRiskList.length,
      avgRisk,
      activeAlertCount,
      criticalAlertCount,
      totalExposure
    };
  }, [suppliers, alerts]);

  // Risk distribution data
  const riskDistributionData = useMemo(() => {
    let low = 0; // 0-39
    let med = 0; // 40-59
    let high = 0; // 60-74
    let crit = 0; // 75+

    suppliers.forEach(s => {
      if (s.riskScore < 40) low++;
      else if (s.riskScore < 60) med++;
      else if (s.riskScore < 75) high++;
      else crit++;
    });

    return [
      { name: 'Low (0-39)', value: low, color: '#10b981' },
      { name: 'Medium (40-59)', value: med, color: '#f59e0b' },
      { name: 'High (60-74)', value: high, color: '#f97316' },
      { name: 'Critical (75+)', value: crit, color: '#ef4444' }
    ];
  }, [suppliers]);

  // Financial Exposure by region
  const regionalExposureData = useMemo(() => {
    const regionalSpend: Record<string, number> = {};
    const REGION_MAP: Record<string, string> = {
      'USA': 'North America',
      'Germany': 'Europe',
      'China': 'Asia-Pacific',
      'India': 'Asia-Pacific',
      'Japan': 'Asia-Pacific',
      'Mexico': 'North America',
      'Brazil': 'South America',
      'UK': 'Europe',
      'France': 'Europe',
      'South Africa': 'Africa'
    };

    suppliers.forEach(s => {
      const region = REGION_MAP[s.country] || 'Other';
      regionalSpend[region] = (regionalSpend[region] || 0) + s.spend;
    });

    return Object.entries(regionalSpend).map(([name, value]) => ({
      name,
      value: Math.round(value / 1000000) // Millions USD
    }));
  }, [suppliers]);

  // Top 5 Highest Risk Suppliers
  const highestRiskSuppliers = useMemo(() => {
    return [...suppliers]
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, 5);
  }, [suppliers]);

  // Format currency
  const formatMoney = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  return (
    <div className="space-y-8 font-sans pb-12">
      {/* Overview Head */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white">Risk Command Dashboard</h1>
          <p className="text-sm text-slate-400">Continuous enterprise threat intelligence, metrics, and risk heatmaps.</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-mono">Data refreshed 1 min ago</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Suppliers */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover:scale-125 transition-transform" />
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Supply Nodes</span>
            <Building className="w-4.5 h-4.5 text-blue-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">{stats.total}</span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              100% Core
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Monitored Tier 1 & Tier 2 global facilities</p>
        </div>

        {/* High Risk Nodes */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-rose-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Nodes At High Risk</span>
            <AlertOctagon className="w-4.5 h-4.5 text-rose-500 animate-pulse" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">{stats.highRiskCount}</span>
            <span className="text-xs text-rose-400 font-mono font-semibold px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/20">
              Score &gt;= 65
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Require immediate secondary-source audit</p>
        </div>

        {/* Average Risk Score */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Average Risk Score</span>
            <Award className="w-4.5 h-4.5 text-amber-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">{stats.avgRisk}</span>
            <span className="text-xs text-slate-400 font-mono">/ 100 max</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Weighted average of cyber, financial & weather</p>
        </div>

        {/* Total Exposure */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Risk Exposure (High Risk)</span>
            <DollarSign className="w-4.5 h-4.5 text-emerald-400" />
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">{formatMoney(stats.totalExposure)}</span>
            <span className="text-xs text-slate-400 font-mono">outstanding spend</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Aggregate capital exposed to high-risk nodes</p>
        </div>
      </div>

      {/* Interactive Charts Section (Bento Grid) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Risk Distribution Chart */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Portfolio Risk Distribution</h3>
            <p className="text-xs text-slate-500 mt-1">Allocation of suppliers across four severity stages.</p>
          </div>
          <div className="h-48 my-4">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={riskDistributionData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {riskDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '10px' }}
                  itemStyle={{ color: '#cbd5e1', fontSize: '12px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs">
            {riskDistributionData.map((item) => (
              <div key={item.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-400 font-medium truncate">{item.name}:</span>
                <span className="text-white font-mono font-bold ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Regional Financial Exposure Bar Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-200">Financial Exposure by Region</h3>
                <p className="text-xs text-slate-500 mt-1">Aggregate outstanding supply spend grouped by global trade region.</p>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded border border-slate-700">
                IN USD MILLIONS
              </span>
            </div>
          </div>
          <div className="h-56 my-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={regionalExposureData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.02)' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '10px' }}
                  itemStyle={{ color: '#cbd5e1', fontSize: '12px' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {regionalExposureData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3b82f6' : '#10b981'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-500 text-center">
            Critical concentrations detected in Asia-Pacific and North American logistics corridors.
          </p>
        </div>
      </div>

      {/* Two Columns: Recent Alerts & High Risk Suppliers list */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Active Alerts */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Active Strategic Threat Feed</h3>
              <p className="text-xs text-slate-500 mt-0.5">Recent weather alerts, cyber exposures, and tariffs.</p>
            </div>
            <button
              onClick={() => setActiveTab('weather')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 hover:underline"
            >
              Alerts Hub
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {alerts.slice(0, 4).map((alert) => (
              <div
                key={alert.id}
                className="p-3 bg-slate-950 border border-slate-800/60 rounded-xl flex gap-3.5 hover:border-slate-700 transition"
              >
                <div className={`p-2 rounded-lg shrink-0 flex items-center justify-center border ${
                  alert.severity === 'critical'
                    ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                    : alert.severity === 'high'
                    ? 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                    : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                }`}>
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-xs text-slate-200 truncate">{alert.title}</span>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full shrink-0 ${
                      alert.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 line-clamp-1 mt-1">{alert.description}</p>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 font-mono">
                    <span>Region: {alert.region}</span>
                    <span>{alert.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Highest Risk Suppliers list */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-slate-200">Critical Supplier Interventions</h3>
              <p className="text-xs text-slate-500 mt-0.5">Top suppliers exceeding immediate risk thresholds.</p>
            </div>
            <button
              onClick={() => setActiveTab('suppliers')}
              className="text-xs text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1 hover:underline"
            >
              Full Matrix
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>

          <div className="space-y-3">
            {highestRiskSuppliers.map((sup) => (
              <div
                key={sup.id}
                onClick={() => {
                  setSelectedSupplierId(sup.id);
                  setActiveTab('suppliers');
                }}
                className="p-3 bg-slate-950 border border-slate-800/60 rounded-xl flex items-center justify-between gap-4 hover:border-slate-700 transition cursor-pointer group"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-xs text-slate-200 group-hover:text-blue-400 transition-colors truncate">
                      {sup.name}
                    </span>
                    <span className="text-[10px] text-slate-500 font-mono">({sup.id})</span>
                  </div>
                  <div className="flex items-center gap-3 text-[10px] text-slate-400 mt-1 font-mono">
                    <span className="flex items-center gap-1 text-slate-500">
                      <Globe className="w-3 h-3" /> {sup.country}
                    </span>
                    <span>•</span>
                    <span className="truncate">{sup.industry}</span>
                  </div>
                </div>
                
                <div className="text-right shrink-0">
                  <div className="flex items-center gap-1.5 justify-end">
                    <span className="text-[11px] font-mono text-slate-400">Score:</span>
                    <span className={`text-sm font-mono font-bold ${
                      sup.riskScore >= 75
                        ? 'text-rose-400'
                        : 'text-amber-400'
                    }`}>
                      {sup.riskScore}
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-0.5 font-mono">
                    Spend: {formatMoney(sup.spend)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
