import React, { useState, useMemo } from 'react';
import { Supplier, User, UserRole, SupplierDocument } from '../types';
import {
  Search,
  Filter,
  Plus,
  Globe,
  Download,
  X,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  FileText,
  Mail,
  Zap,
  Calendar,
  AlertTriangle,
  ArrowUpDown,
  Building2,
  Lock,
  ChevronRight,
  ChevronLeft
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

interface SupplierTabProps {
  suppliers: Supplier[];
  currentUser: User;
  onAddSupplier: (supplier: any) => Promise<any>;
  onUpdateSupplier: (id: string, updated: any) => Promise<any>;
  selectedSupplierId: string | null;
  setSelectedSupplierId: (id: string | null) => void;
}

export default function SupplierTab({
  suppliers,
  currentUser,
  onAddSupplier,
  onUpdateSupplier,
  selectedSupplierId,
  setSelectedSupplierId
}: SupplierTabProps) {
  // Filter/Search states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('All');
  const [selectedIndustry, setSelectedIndustry] = useState('All');
  const [selectedRiskTier, setSelectedRiskTier] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');

  // Sorting state
  const [sortField, setSortField] = useState<keyof Supplier>('riskScore');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [aiPanel, setAiPanel] = useState<{ isOpen: boolean; type: 'email' | 'mitigate'; text: string; loading: boolean }>({
    isOpen: false,
    type: 'email',
    text: '',
    loading: false
  });

  // Unique lists for dropdown filters
  const countries = useMemo(() => ['All', ...Array.from(new Set(suppliers.map(s => s.country)))], [suppliers]);
  const industries = useMemo(() => ['All', ...Array.from(new Set(suppliers.map(s => s.industry)))], [suppliers]);

  // Sort and filter logic
  const filteredSuppliers = useMemo(() => {
    let list = [...suppliers];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.relationshipOwner.toLowerCase().includes(q)
      );
    }

    if (selectedCountry !== 'All') {
      list = list.filter(s => s.country === selectedCountry);
    }

    if (selectedIndustry !== 'All') {
      list = list.filter(s => s.industry === selectedIndustry);
    }

    if (selectedStatus !== 'All') {
      list = list.filter(s => s.status === selectedStatus);
    }

    if (selectedRiskTier !== 'All') {
      list = list.filter(s => {
        if (selectedRiskTier === 'Low') return s.riskScore < 40;
        if (selectedRiskTier === 'Medium') return s.riskScore >= 40 && s.riskScore < 60;
        if (selectedRiskTier === 'High') return s.riskScore >= 60 && s.riskScore < 75;
        if (selectedRiskTier === 'Critical') return s.riskScore >= 75;
        return true;
      });
    }

    // Apply sorting
    list.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc'
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return 0;
    });

    return list;
  }, [suppliers, searchQuery, selectedCountry, selectedIndustry, selectedRiskTier, selectedStatus, sortField, sortDirection]);

  // Pagination slicing
  const paginatedSuppliers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSuppliers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSuppliers, currentPage]);

  const totalPages = Math.ceil(filteredSuppliers.length / itemsPerPage);

  const handleSort = (field: keyof Supplier) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
    setCurrentPage(1);
  };

  const selectedSupplier = useMemo(() => {
    return suppliers.find(s => s.id === selectedSupplierId) || null;
  }, [suppliers, selectedSupplierId]);

  // Download CSV trigger
  const handleExportCSV = () => {
    window.open('/api/export', '_blank');
  };

  // Run AI query for draft email or risk mitigations
  const handleAiAction = async (type: 'email' | 'mitigate') => {
    if (!selectedSupplier) return;
    setAiPanel({ isOpen: true, type, text: '', loading: true });
    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-email': currentUser.email
        },
        body: JSON.stringify({
          supplierId: selectedSupplier.id,
          actionType: type
        })
      });
      const data = await res.json();
      if (data.success) {
        setAiPanel({ isOpen: true, type, text: data.text, loading: false });
      } else {
        setAiPanel({ isOpen: true, type, text: 'AI failed to respond. Please try again.', loading: false });
      }
    } catch (err) {
      setAiPanel({ isOpen: true, type, text: 'Connection timed out. Express is compiling assets.', loading: false });
    }
  };

  // Form states for new supplier
  const [newSupForm, setNewSupForm] = useState({
    name: '',
    country: 'USA',
    industry: 'Semiconductors',
    spend: 1000000,
    revenue: 5000000,
    creditScore: 720,
    financialHealth: 80,
    cyberRating: 80,
    weatherExposure: 25,
    esgRating: 80,
    deliveryPerformance: 90
  });

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await onAddSupplier(newSupForm);
    setIsAddModalOpen(false);
    // Reset form
    setNewSupForm({
      name: '',
      country: 'USA',
      industry: 'Semiconductors',
      spend: 1000000,
      revenue: 5000000,
      creditScore: 720,
      financialHealth: 80,
      cyberRating: 80,
      weatherExposure: 25,
      esgRating: 80,
      deliveryPerformance: 90
    });
  };

  const getRiskColor = (score: number) => {
    if (score < 40) return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (score < 60) return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    if (score < 75) return 'text-orange-400 bg-orange-500/10 border-orange-500/20';
    return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
  };

  const canWrite = currentUser.role === 'Admin' || currentUser.role === 'Procurement Manager';

  return (
    <div className="space-y-6 font-sans relative">
      {/* Search and Filters Strip */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-5 space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search by supplier name, reference ID, or relationship owner..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-700 transition"
            />
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="px-4 py-2.5 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-xs font-semibold rounded-xl text-slate-300 hover:text-white transition flex items-center gap-2"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Matrix</span>
            </button>

            {canWrite ? (
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded-xl text-white transition flex items-center gap-2 shadow-lg shadow-blue-500/20"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Onboard Supplier</span>
              </button>
            ) : (
              <div className="text-[11px] text-slate-500 flex items-center gap-1.5 px-3 py-2 bg-slate-950/50 rounded-xl border border-slate-800/50">
                <Lock className="w-3.5 h-3.5 text-slate-600" />
                <span>Write actions locked</span>
              </div>
            )}
          </div>
        </div>

        {/* Dropdowns strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 pt-2 border-t border-slate-800/50">
          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Country</label>
            <select
              value={selectedCountry}
              onChange={(e) => { setSelectedCountry(e.target.value); setCurrentPage(1); }}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-slate-700 font-medium"
            >
              {countries.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Industry</label>
            <select
              value={selectedIndustry}
              onChange={(e) => { setSelectedIndustry(e.target.value); setCurrentPage(1); }}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-slate-700 font-medium"
            >
              {industries.map(i => <option key={i} value={i}>{i}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Risk Severity</label>
            <select
              value={selectedRiskTier}
              onChange={(e) => { setSelectedRiskTier(e.target.value); setCurrentPage(1); }}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-slate-700 font-medium"
            >
              <option value="All">All Tiers</option>
              <option value="Low">Low (0-39)</option>
              <option value="Medium">Medium (40-59)</option>
              <option value="High">High (60-74)</option>
              <option value="Critical">Critical (75+)</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-1">Node Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => { setSelectedStatus(e.target.value); setCurrentPage(1); }}
              className="w-full p-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-slate-700 font-medium"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="under-review">Under Review</option>
            </select>
          </div>

          <div className="col-span-2 sm:col-span-1 flex items-end">
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCountry('All');
                setSelectedIndustry('All');
                setSelectedRiskTier('All');
                setSelectedStatus('All');
                setCurrentPage(1);
              }}
              className="w-full py-2 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-xs font-semibold rounded-lg text-slate-400 hover:text-white transition"
            >
              Reset Filters
            </button>
          </div>
        </div>
      </div>

      {/* Main Table vs Detail Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Table Panel */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col justify-between">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800/80 bg-slate-950/40 text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="p-4 cursor-pointer hover:text-slate-300" onClick={() => handleSort('name')}>
                    <span className="flex items-center gap-1">Node / ID <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-slate-300" onClick={() => handleSort('country')}>
                    <span className="flex items-center gap-1">Origin <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="p-4 cursor-pointer hover:text-slate-300" onClick={() => handleSort('industry')}>
                    <span className="flex items-center gap-1">Industry <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="p-4 text-center cursor-pointer hover:text-slate-300" onClick={() => handleSort('riskScore')}>
                    <span className="flex items-center gap-1 justify-center">Risk Score <ArrowUpDown className="w-3 h-3" /></span>
                  </th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/50 text-xs">
                {paginatedSuppliers.length > 0 ? (
                  paginatedSuppliers.map((sup) => (
                    <tr
                      key={sup.id}
                      onClick={() => setSelectedSupplierId(sup.id)}
                      className={`hover:bg-slate-950/40 transition cursor-pointer ${
                        selectedSupplierId === sup.id ? 'bg-blue-500/5 border-l-2 border-l-blue-500' : ''
                      }`}
                    >
                      <td className="p-4">
                        <div className="font-semibold text-slate-200">{sup.name}</div>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">{sup.id}</div>
                      </td>
                      <td className="p-4 text-slate-400">
                        <span className="flex items-center gap-1.5">
                          <Globe className="w-3.5 h-3.5 text-slate-600" />
                          {sup.country}
                        </span>
                      </td>
                      <td className="p-4 text-slate-400 truncate max-w-[120px]">{sup.industry}</td>
                      <td className="p-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-mono font-bold border ${getRiskColor(sup.riskScore)}`}>
                          {sup.riskScore}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full ${
                          sup.status === 'active'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : sup.status === 'suspended'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}>
                          {sup.status.replace('-', ' ')}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="p-12 text-center text-slate-500 font-medium">
                      No global suppliers found matching selected query criteria.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Table Pagination bar */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-800/80 bg-slate-950/20 flex items-center justify-between text-xs text-slate-400">
              <span>
                Showing <strong className="text-slate-200">{Math.min(filteredSuppliers.length, (currentPage - 1) * itemsPerPage + 1)}-{Math.min(filteredSuppliers.length, currentPage * itemsPerPage)}</strong> of <strong className="text-slate-200">{filteredSuppliers.length}</strong> nodes
              </span>
              <div className="flex items-center gap-1">
                <button
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  className="p-2 bg-slate-950 border border-slate-800 rounded-lg hover:bg-slate-900 transition disabled:opacity-30 text-slate-400"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="px-3 text-slate-300 font-mono">
                  {currentPage} / {totalPages}
                </span>
                <button
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  className="p-2 bg-slate-950 border border-slate-800 rounded-lg hover:bg-slate-900 transition disabled:opacity-30 text-slate-400"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Side Panel */}
        <div className="lg:col-span-1 bg-slate-900 border border-slate-800/80 rounded-2xl p-5 min-h-[400px]">
          {selectedSupplier ? (
            <div className="space-y-6">
              {/* Profile Card Header */}
              <div className="flex items-start justify-between border-b border-slate-800/50 pb-4">
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-white truncate">{selectedSupplier.name}</h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-1 flex items-center gap-2">
                    <span>ID: {selectedSupplier.id}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Globe className="w-3 h-3 text-slate-600" /> {selectedSupplier.country}
                    </span>
                  </p>
                </div>
                <button
                  onClick={() => setSelectedSupplierId(null)}
                  className="p-1.5 bg-slate-950 border border-slate-800 rounded-lg hover:bg-slate-800 transition text-slate-500 hover:text-slate-300 shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Dynamic Risk Score Dial */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/60 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">Node Risk Level</span>
                  <div className="text-xl font-bold mt-1 text-slate-200">
                    {selectedSupplier.riskScore >= 75 ? 'Critical Risk' : selectedSupplier.riskScore >= 60 ? 'High Risk' : selectedSupplier.riskScore >= 40 ? 'Medium Risk' : 'Low Risk'}
                  </div>
                </div>
                <span className={`px-4 py-2 rounded-2xl text-xl font-bold font-mono border ${getRiskColor(selectedSupplier.riskScore)}`}>
                  {selectedSupplier.riskScore}
                </span>
              </div>

              {/* Breakdown metrics */}
              <div className="space-y-3.5">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">Subcategory Audit Ratings</span>
                
                {/* Financial Health */}
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono">
                    <span>Financial Health Rating</span>
                    <span className="font-bold text-white">{selectedSupplier.financialHealth}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500" style={{ width: `${selectedSupplier.financialHealth}%` }} />
                  </div>
                </div>

                {/* Cyber Rating */}
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono">
                    <span>Cybersecurity Resilience</span>
                    <span className="font-bold text-white">{selectedSupplier.cyberRating}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${selectedSupplier.cyberRating}%` }} />
                  </div>
                </div>

                {/* Weather Exposure */}
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono">
                    <span>Weather Exposure (hazard score)</span>
                    <span className="font-bold text-white">{selectedSupplier.weatherExposure}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-500" style={{ width: `${selectedSupplier.weatherExposure}%` }} />
                  </div>
                </div>

                {/* ESG Rating */}
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono">
                    <span>ESG Sustainability Rating</span>
                    <span className="font-bold text-white">{selectedSupplier.esgRating}/100</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-500" style={{ width: `${selectedSupplier.esgRating}%` }} />
                  </div>
                </div>

                {/* Delivery Rating */}
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1 font-mono">
                    <span>Delivery SLA Performance</span>
                    <span className="font-bold text-white">{selectedSupplier.deliveryPerformance}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-950 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-500" style={{ width: `${selectedSupplier.deliveryPerformance}%` }} />
                  </div>
                </div>
              </div>

              {/* History area chart */}
              <div className="pt-2">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block mb-3">6-Month Risk History</span>
                <div className="h-28">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={selectedSupplier.riskHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                      <XAxis dataKey="date" tickFormatter={(val) => val.substring(5, 7)} stroke="#475569" fontSize={9} />
                      <YAxis domain={[0, 100]} stroke="#475569" fontSize={9} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="score" stroke="#3b82f6" fill="rgba(59, 130, 246, 0.1)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Documents lists */}
              <div className="space-y-2 border-t border-slate-800/50 pt-4">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 block">Compliance Documentation</span>
                {selectedSupplier.documents.map((doc) => (
                  <div key={doc.id} className="p-2 bg-slate-950 rounded-lg flex items-center justify-between border border-slate-800/30">
                    <div className="flex items-center gap-2 min-w-0">
                      <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                      <span className="text-xs text-slate-300 truncate">{doc.name}</span>
                    </div>
                    <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono ${
                      doc.status === 'approved' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {doc.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>

              {/* Owner and Auditing */}
              <div className="p-3 bg-slate-950 rounded-xl space-y-2 border border-slate-800/30 text-xs text-slate-400">
                <div className="flex justify-between">
                  <span>Relationship Owner:</span>
                  <strong className="text-slate-200">{selectedSupplier.relationshipOwner}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Last Audited:</span>
                  <strong className="text-slate-200">{selectedSupplier.lastAudit}</strong>
                </div>
              </div>

              {/* Action items leveraging AI assistant endpoints */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800/50">
                <button
                  onClick={() => handleAiAction('email')}
                  className="py-2 px-3 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-[11px] font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition"
                >
                  <Mail className="w-3.5 h-3.5 text-blue-400" />
                  <span>Draft AI Warning</span>
                </button>
                <button
                  onClick={() => handleAiAction('mitigate')}
                  className="py-2 px-3 bg-slate-950 border border-slate-800 hover:border-slate-700 rounded-xl text-[11px] font-semibold text-slate-300 flex items-center justify-center gap-1.5 transition"
                >
                  <Zap className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Mitigate Risk AI</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
              <Building2 className="w-12 h-12 text-slate-800 mb-3" />
              <p className="text-sm font-semibold">No Supplier Selected</p>
              <p className="text-xs text-slate-600 mt-1 max-w-[200px]">Click a row in the matrix table to view their compliance documents, contacts, history and run AI mitigations.</p>
            </div>
          )}
        </div>
      </div>

      {/* AI recommendation panel overlays */}
      {aiPanel.isOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 flex items-center gap-1">
                <Zap className="w-3 h-3" />
                Vanguard AI Recommendation Engine
              </span>
              <button
                onClick={() => setAiPanel(prev => ({ ...prev, isOpen: false }))}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto pr-1 min-h-[300px] text-sm text-slate-300 leading-relaxed">
              {aiPanel.loading ? (
                <div className="h-full flex flex-col items-center justify-center py-12">
                  <div className="w-10 h-10 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                  <p className="text-xs text-slate-500 mt-4">Analysing metrics and querying server-side Gemini 3.5...</p>
                </div>
              ) : (
                <div className="whitespace-pre-wrap font-sans bg-slate-950 p-5 rounded-xl border border-slate-800 text-xs">
                  {aiPanel.text}
                </div>
              )}
            </div>

            <div className="border-t border-slate-800 pt-4 mt-4 flex justify-between items-center text-xs text-slate-500">
              <span>Powered by Gemini 3.5 Flash server proxy</span>
              <button
                onClick={() => setAiPanel(prev => ({ ...prev, isOpen: false }))}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-white transition text-xs"
              >
                Acknowledge & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboard Supplier Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
              <h3 className="text-sm font-semibold text-white">Onboard New Supply Node</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Supplier Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Atlas Steel Works"
                    value={newSupForm.name}
                    onChange={(e) => setNewSupForm(prev => ({ ...prev, name: e.target.value }))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-slate-700"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Country of Origin</label>
                  <select
                    value={newSupForm.country}
                    onChange={(e) => setNewSupForm(prev => ({ ...prev, country: e.target.value }))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="USA">USA</option>
                    <option value="Germany">Germany</option>
                    <option value="China">China</option>
                    <option value="India">India</option>
                    <option value="Japan">Japan</option>
                    <option value="Mexico">Mexico</option>
                    <option value="Brazil">Brazil</option>
                    <option value="UK">UK</option>
                    <option value="France">France</option>
                    <option value="South Africa">South Africa</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Core Industry</label>
                  <select
                    value={newSupForm.industry}
                    onChange={(e) => setNewSupForm(prev => ({ ...prev, industry: e.target.value }))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none"
                  >
                    <option value="Semiconductors">Semiconductors</option>
                    <option value="Logistics & Freight">Logistics & Freight</option>
                    <option value="Chemicals">Chemicals</option>
                    <option value="Steel & Metallurgy">Steel & Metallurgy</option>
                    <option value="Electronics Assembly">Electronics Assembly</option>
                    <option value="Automotive Parts">Automotive Parts</option>
                    <option value="Industrial Packaging">Industrial Packaging</option>
                    <option value="Pharmaceutical Ingredients">Pharmaceutical Ingredients</option>
                    <option value="Agriculture & Raw Materials">Agriculture & Raw Materials</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-400 block mb-1">Contract Outstanding Spend (USD)</label>
                  <input
                    type="number"
                    value={newSupForm.spend}
                    onChange={(e) => setNewSupForm(prev => ({ ...prev, spend: parseInt(e.target.value) }))}
                    className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white focus:outline-none focus:border-slate-700"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Financial Health (0-100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newSupForm.financialHealth}
                    onChange={(e) => setNewSupForm(prev => ({ ...prev, financialHealth: parseInt(e.target.value) }))}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Cyber rating (0-100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newSupForm.cyberRating}
                    onChange={(e) => setNewSupForm(prev => ({ ...prev, cyberRating: parseInt(e.target.value) }))}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-slate-400 block mb-1">Weather exposure (0-100)</label>
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={newSupForm.weatherExposure}
                    onChange={(e) => setNewSupForm(prev => ({ ...prev, weatherExposure: parseInt(e.target.value) }))}
                    className="w-full p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-950 hover:bg-slate-900 border border-slate-800 text-xs font-semibold rounded-lg text-slate-400 hover:text-white transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-xs font-bold rounded-lg text-white transition"
                >
                  Onboard Node
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
