import React, { useMemo } from 'react';
import { Supplier } from '../types';
import { DollarSign, Landmark, TrendingUp, AlertTriangle, Coins, BarChart3, HelpCircle, Users } from 'lucide-react';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie } from 'recharts';

interface FinanceTabProps {
  suppliers: Supplier[];
}

export default function FinanceTab({ suppliers }: FinanceTabProps) {
  const stats = useMemo(() => {
    const totalSpend = suppliers.reduce((acc, s) => acc + s.spend, 0);
    const avgCreditScore = Math.round(suppliers.reduce((acc, s) => acc + s.creditScore, 0) / suppliers.length);
    
    // High dependency suppliers: we represent > 20% of their business
    const highDependencyCount = suppliers.filter(s => s.revenueDependency >= 20).length;
    
    // Bankruptcy Risk Grouping
    const highRiskBankruptcyCount = suppliers.filter(s => s.bankruptcyRisk === 'high').length;

    return {
      totalSpend,
      avgCreditScore,
      highDependencyCount,
      highRiskBankruptcyCount
    };
  }, [suppliers]);

  // Currency breakdown
  const currencyData = useMemo(() => {
    const counts: Record<string, number> = {};
    suppliers.forEach(s => {
      counts[s.currency] = (counts[s.currency] || 0) + s.spend;
    });

    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#6366f1'];
    return Object.entries(counts).map(([name, value], idx) => ({
      name,
      value: Math.round(value / 1000000), // Millions
      color: colors[idx % colors.length]
    }));
  }, [suppliers]);

  // Bankruptcy distribution for charts
  const bankruptcyDistribution = useMemo(() => {
    let low = 0;
    let med = 0;
    let high = 0;

    suppliers.forEach(s => {
      if (s.bankruptcyRisk === 'low') low++;
      else if (s.bankruptcyRisk === 'medium') med++;
      else high++;
    });

    return [
      { name: 'Low Risk', value: low, fill: '#10b981' },
      { name: 'Medium Risk', value: med, fill: '#f59e0b' },
      { name: 'High Hazard', value: high, fill: '#ef4444' }
    ];
  }, [suppliers]);

  const formatMoney = (amount: number) => {
    if (amount >= 1000000) {
      return `$${(amount / 1000000).toFixed(1)}M`;
    }
    return `$${(amount / 1000).toFixed(0)}K`;
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Intro Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-white font-sans">Financial Exposure & Solvency Audit</h1>
        <p className="text-sm text-slate-400">Monitoring outstanding spend concentration, contract solvency ratings, and currency inflation risk.</p>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Outstanding Spend */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">Aggregate Contract Spend</span>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">{formatMoney(stats.totalSpend)}</span>
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-0.5">
              <TrendingUp className="w-3 h-3" />
              USD
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Active outstanding purchase obligations</p>
        </div>

        {/* Average credit score */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">Average Credit Score</span>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">{stats.avgCreditScore}</span>
            <span className="text-xs text-slate-400 font-mono">/850 Dun &amp; Brad</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Rating index across the supplier ecosystem</p>
        </div>

        {/* Bankruptcy hazard */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">Bankruptcy Hazard</span>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-rose-400 tracking-tight">{stats.highRiskBankruptcyCount}</span>
            <span className="text-xs text-rose-500 font-semibold">critical nodes</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Suppliers flagged with severe liquidity debt</p>
        </div>

        {/* High Revenue Dependency */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 relative overflow-hidden">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">High Revenue Dependency</span>
          <div className="mt-2.5 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white tracking-tight">{stats.highDependencyCount}</span>
            <span className="text-xs text-slate-400 font-mono">nodes &gt;= 20%</span>
          </div>
          <p className="text-xs text-slate-500 mt-2">Suppliers highly vulnerable to our spend adjustments</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bankruptcy chart */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Bankruptcy Rating Distribution</h3>
            <p className="text-xs text-slate-500 mt-0.5">Classification of suppliers according to Dun &amp; Bradstreet credit scores.</p>
          </div>
          <div className="h-56 my-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bankruptcyDistribution} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={10} tickLine={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(255,255,255,0.01)' }}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '10px' }}
                />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                  {bankruptcyDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-500 text-center">
            Critical audit required for the high-hazard solvency nodes to secure manufacturing flow.
          </p>
        </div>

        {/* Currency Exposure breakdown */}
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-200">Currency Exposure Distribution</h3>
            <p className="text-xs text-slate-500 mt-0.5">Outstanding spend obligations denominated in foreign currencies.</p>
          </div>
          <div className="h-52 my-4 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={currencyData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={65}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {currencyData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '10px' }}
                  itemStyle={{ color: '#cbd5e1', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-3 gap-2 text-xs">
            {currencyData.map((item) => (
              <div key={item.name} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-slate-400 font-medium font-mono">{item.name}:</span>
                <span className="text-white font-mono font-bold ml-auto">${item.value}M</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
