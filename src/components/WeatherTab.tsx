import React, { useState, useMemo } from 'react';
import { Supplier, RiskAlert, User } from '../types';
import { CloudLightning, MapPin, ShieldAlert, CheckCircle, Zap, ShieldCheck, X, Users, Thermometer, Flame, Droplets, Lock } from 'lucide-react';

interface WeatherTabProps {
  suppliers: Supplier[];
  alerts: RiskAlert[];
  currentUser: User;
  onAddAlert: (newAlert: any) => Promise<any>;
  onUpdateAlertStatus: (id: string, status: 'active' | 'mitigated' | 'monitoring') => Promise<any>;
  onDeleteAlert: (id: string) => Promise<any>;
}

export default function WeatherTab({
  suppliers,
  alerts,
  currentUser,
  onAddAlert,
  onUpdateAlertStatus,
  onDeleteAlert
}: WeatherTabProps) {
  const [isSimulating, setIsSimulating] = useState(false);

  // Form states for the weather alert simulator
  const [stormType, setStormType] = useState('Coastal Flood');
  const [targetRegion, setTargetRegion] = useState('Asia-Pacific');
  const [severity, setSeverity] = useState<'critical' | 'high' | 'medium' | 'low'>('high');
  const [customDescription, setCustomDescription] = useState('Category 5 severe typhoon forming offshore, introducing extreme container logistics constraints.');

  // Group weather alerts
  const weatherAlerts = useMemo(() => {
    return alerts.filter(a => a.type === 'weather');
  }, [alerts]);

  // Handle triggering simulated storm
  const handleTriggerSim = async (e: React.FormEvent) => {
    e.preventDefault();

    // Map region to countries
    const REGION_COUNTRIES: Record<string, string[]> = {
      'Asia-Pacific': ['China', 'India', 'Japan'],
      'Europe': ['Germany', 'UK', 'France'],
      'North America': ['USA', 'Mexico'],
      'South America': ['Brazil'],
      'Africa': ['South Africa']
    };

    const targetCountries = REGION_COUNTRIES[targetRegion] || [];
    const affectedSuppliers = suppliers
      .filter(s => targetCountries.includes(s.country))
      .slice(0, 4)
      .map(s => s.id);

    await onAddAlert({
      type: 'weather',
      title: `${stormType} Emergency: Severe ${severity.toUpperCase()} disruption in ${targetRegion}`,
      description: customDescription,
      severity,
      affectedSuppliers,
      status: 'active',
      region: targetRegion
    });

    setIsSimulating(false);
  };

  const getSeverityStyle = (sev: string) => {
    if (sev === 'critical') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    if (sev === 'high') return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    if (sev === 'medium') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
  };

  const canWrite = currentUser.role === 'Admin' || currentUser.role === 'Procurement Manager' || currentUser.role === 'Risk Analyst';

  return (
    <div className="space-y-6 font-sans">
      {/* Intro Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white font-sans">Climate & Weather Disruptions Hub</h1>
          <p className="text-sm text-slate-400">Continuous environmental threat feed mapped against active production facilities.</p>
        </div>
        
        {canWrite ? (
          <button
            onClick={() => setIsSimulating(true)}
            className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded-xl text-white transition flex items-center gap-2 shadow-lg shadow-blue-500/20 shrink-0"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Simulate Climate Event</span>
          </button>
        ) : (
          <div className="text-[11px] text-slate-500 flex items-center gap-1.5 px-3 py-2 bg-slate-950/50 rounded-xl border border-slate-800/50 shrink-0">
            <Lock className="w-3.5 h-3.5 text-slate-600" />
            <span>Simulation restricted</span>
          </div>
        )}
      </div>

      {/* Grid: Alerts Feed + Affected Nodes Map list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Alerts List */}
        <div className="lg:col-span-2 space-y-4">
          {weatherAlerts.length > 0 ? (
            weatherAlerts.map((alert) => (
              <div
                key={alert.id}
                className={`p-5 bg-slate-900 border rounded-2xl flex flex-col sm:flex-row gap-4 transition hover:border-slate-700 ${
                  alert.status === 'mitigated' ? 'border-slate-800/40 opacity-75' : 'border-slate-800'
                }`}
              >
                {/* Visual Icon Badge */}
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center shrink-0 ${getSeverityStyle(alert.severity)}`}>
                  <CloudLightning className="w-6 h-6" />
                </div>

                {/* Content */}
                <div className="flex-1 space-y-2 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <h3 className="font-bold text-sm text-white truncate">{alert.title}</h3>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full ${getSeverityStyle(alert.severity)}`}>
                        {alert.severity.toUpperCase()}
                      </span>
                      <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                        alert.status === 'active' ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {alert.status.toUpperCase()}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">{alert.description}</p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-slate-500 font-mono">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      Region: {alert.region}
                    </span>
                    <span>•</span>
                    <span>Issued: {alert.date}</span>
                    {alert.affectedSuppliers.length > 0 && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1 text-slate-400 font-semibold">
                          <Users className="w-3.5 h-3.5" />
                          {alert.affectedSuppliers.length} affected suppliers
                        </span>
                      </>
                    )}
                  </div>

                  {/* Action buttons (only write accessible) */}
                  {alert.status === 'active' && canWrite && (
                    <div className="pt-3 border-t border-slate-800/40 mt-3 flex justify-end gap-2">
                      <button
                        onClick={() => onUpdateAlertStatus(alert.id, 'mitigated')}
                        className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-800 text-[11px] font-semibold rounded-lg text-emerald-400 border border-emerald-950 hover:border-emerald-900 transition flex items-center gap-1"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Mitigate Disruption</span>
                      </button>
                      {currentUser.role === 'Admin' && (
                        <button
                          onClick={() => onDeleteAlert(alert.id)}
                          className="px-3 py-1.5 hover:bg-rose-950/20 text-[11px] font-semibold rounded-lg text-rose-500 border border-transparent hover:border-rose-950/50 transition"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-2xl text-slate-500 font-medium">
              No weather alerts identified in active trade regions.
            </div>
          )}
        </div>

        {/* Side panel describing current climate categories */}
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200">Environmental Exposure Mappings</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              We monitor natural disasters using continuous satellite data and meteorology alerts. The risk score weights adjust exposure rates to protect capital spend.
            </p>

            <div className="space-y-3.5 pt-2">
              <div className="flex items-start gap-2.5">
                <Thermometer className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-slate-300 block">Heatwaves & Drought</strong>
                  <span className="text-slate-500 leading-none">Rhine river barge routing and agricultural shortages.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Flame className="w-5 h-5 text-orange-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-slate-300 block">Wildfire Risk Vectors</strong>
                  <span className="text-slate-500 leading-none">Severe operations threat for Western US and Brazilian supply routes.</span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Droplets className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <strong className="text-slate-300 block">Severe Typhoons & Floodings</strong>
                  <span className="text-slate-500 leading-none">Core semiconductor foundries and logistics lanes in Asia-Pacific coastlines.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Modal overlay */}
      {isSimulating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-1.5">
                <Zap className="w-4.5 h-4.5 text-blue-400 animate-pulse" />
                Climate Disruption Simulator
              </h3>
              <button
                onClick={() => setIsSimulating(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleTriggerSim} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Environmental Threat Type</label>
                <select
                  value={stormType}
                  onChange={(e) => setStormType(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                >
                  <option value="Category 5 Severe Typhoon">Category 5 Severe Typhoon</option>
                  <option value="Flash Coastal Flooding">Flash Coastal Flooding</option>
                  <option value="Out of Control Wildfire">Out of Control Wildfire</option>
                  <option value="Extreme Hydroelectric Drought">Extreme Hydroelectric Drought</option>
                  <option value="Severe Tectonic Earthquake">Severe Tectonic Earthquake</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Target Trade Region</label>
                  <select
                    value={targetRegion}
                    onChange={(e) => setTargetRegion(e.target.value)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="Asia-Pacific">Asia-Pacific</option>
                    <option value="Europe">Europe</option>
                    <option value="North America">North America</option>
                    <option value="South America">South America</option>
                    <option value="Africa">Africa</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Disruption Severity</label>
                  <select
                    value={severity}
                    onChange={(e) => setSeverity(e.target.value as any)}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="critical">Critical Disruption</option>
                    <option value="high">High Disruption</option>
                    <option value="medium">Medium Disruption</option>
                    <option value="low">Low Disruption</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-400 block mb-1">Intelligence Description</label>
                <textarea
                  required
                  rows={3}
                  value={customDescription}
                  onChange={(e) => setCustomDescription(e.target.value)}
                  className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-slate-700 resize-none font-sans"
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsSimulating(false)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs font-semibold rounded-lg text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded-lg text-white transition flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Trigger Alert</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
