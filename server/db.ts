import { Supplier, RiskAlert, PlatformSettings, User } from '../src/types';

// Let's generate a list of 100 suppliers deterministically
const COUNTRIES = [
  { name: 'USA', region: 'North America', currency: 'USD' },
  { name: 'Germany', region: 'Europe', currency: 'EUR' },
  { name: 'China', region: 'Asia-Pacific', currency: 'CNY' },
  { name: 'India', region: 'Asia-Pacific', currency: 'INR' },
  { name: 'Japan', region: 'Asia-Pacific', currency: 'JPY' },
  { name: 'Mexico', region: 'North America', currency: 'MXN' },
  { name: 'Brazil', region: 'South America', currency: 'BRL' },
  { name: 'UK', region: 'Europe', currency: 'GBP' },
  { name: 'France', region: 'Europe', currency: 'EUR' },
  { name: 'South Africa', region: 'Africa', currency: 'ZAR' }
];

const INDUSTRIES = [
  'Semiconductors',
  'Logistics & Freight',
  'Chemicals',
  'Steel & Metallurgy',
  'Electronics Assembly',
  'Automotive Parts',
  'Industrial Packaging',
  'Pharmaceutical Ingredients',
  'Agriculture & Raw Materials'
];

const COMPANY_PREFIXES = [
  'Apex', 'Vortex', 'Nippon', 'Bharat', 'Samba', 'Azteca', 'Rhine', 'Silicon', 'Lumière', 'Cape',
  'Nova', 'Titan', 'Horizon', 'Delta', 'Quantum', 'Pacific', 'Global', 'Matrix', 'Atlas', 'Summit',
  'Zenith', 'Aero', 'Chronos', 'Solar', 'Infinity', 'Beacon', 'Pinnacle', 'Stellar', 'Prism', 'Vanguard'
];

const COMPANY_SUFFIXES = [
  'Technologies', 'Industries', 'Systems', 'Logistics', 'Manufacturing', 'Chemicals', 'Foundry', 'Solutions',
  'Energy', 'Dynamics', 'Resources', 'Components', 'Supply', 'Synthetics', 'Steel', 'Labs', 'Global', 'Group'
];

const OWNERS = [
  'Sarah Jenkins', 'Liam Patel', 'Sofia Rodriguez', 'Chen Wei', 'Marcus Aurelius', 'Elena Rostova', 'Kofi Mensah'
];

// Seed suppliers
function generateSuppliers(): Supplier[] {
  const list: Supplier[] = [];
  
  for (let i = 1; i <= 100; i++) {
    const prefix = COMPANY_PREFIXES[(i * 3) % COMPANY_PREFIXES.length];
    const suffix = COMPANY_SUFFIXES[(i * 7) % COMPANY_SUFFIXES.length];
    const countryObj = COUNTRIES[i % COUNTRIES.length];
    const industry = INDUSTRIES[(i * i) % INDUSTRIES.length];
    
    const name = `${prefix} ${suffix} ${i > 30 ? i : ''}`.trim();
    
    // Create base metrics out of 100
    const financialHealth = Math.floor(40 + (i * 13) % 56); // 40 - 95
    const cyberRating = Math.floor(35 + (i * 17) % 61); // 35 - 95
    const weatherExposure = Math.floor(10 + (i * 19) % 81); // 10 - 90 (lower is better, but here it represents rating of exposure)
    const esgRating = Math.floor(50 + (i * 23) % 46); // 50 - 95
    const deliveryPerformance = Math.floor(60 + (i * 29) % 38); // 60 - 97
    const operationalPerformance = Math.floor(55 + (i * 31) % 41); // 55 - 95
    
    // Status
    let status: 'active' | 'suspended' | 'under-review' = 'active';
    if (i % 25 === 0) status = 'suspended';
    else if (i % 14 === 0) status = 'under-review';
    
    // Spend and Revenue
    const spend = Math.floor(150000 + (i * 123456) % 9850000); // $150K - $10M
    const revenue = Math.floor(spend * (2 + (i % 4))); // Supplier overall revenue
    const revenueDependency = parseFloat(((spend / revenue) * 100).toFixed(1)); // % of their business we represent
    const creditScore = Math.floor(550 + (i * 11) % 281); // 550 - 830
    
    const bankruptcyRisk = creditScore < 620 ? 'high' : creditScore < 700 ? 'medium' : 'low';
    
    // Base risk calculation placeholder (recalculated by active weights)
    const riskScore = Math.floor(30 + (i * 7) % 55);
    
    // Last Audit
    const month = String(1 + (i % 12)).padStart(2, '0');
    const day = String(1 + (i * 7) % 28).padStart(2, '0');
    const lastAudit = `2025-${month}-${day}`;
    
    const owner = OWNERS[(i * 2) % OWNERS.length];
    
    // Create some historical risks
    const riskHistory = Array.from({ length: 6 }, (_, index) => {
      const offset = (index - 3) * 3 + (i % 4);
      return {
        date: `2026-0${1 + index}-15`,
        score: Math.max(10, Math.min(95, riskScore + offset))
      };
    });
    
    // Docs
    const documents = [
      { id: `doc-${i}-1`, name: 'ISO 9001 Certificate', type: 'Certification', uploadDate: '2025-01-10', status: 'approved' as const },
      { id: `doc-${i}-2`, name: 'Cyber Security Policy Audit', type: 'Security Audit', uploadDate: '2025-05-18', status: 'approved' as const },
      { id: `doc-${i}-3`, name: 'ESG Compliance Attestation', type: 'Compliance', uploadDate: '2024-11-04', status: (i % 15 === 0) ? 'expired' as const : 'approved' as const }
    ];
    
    // Contacts
    const contacts = [
      { name: `Jane ${prefix}`, role: 'Key Account Manager', email: `jane.${prefix.toLowerCase()}@${prefix.toLowerCase()}${countryObj.name.toLowerCase().substring(0, 3)}.com`, phone: `+${40 + i}-555-0192` },
      { name: `Alex ${suffix}`, role: 'Operations Lead', email: `alex.${suffix.toLowerCase()}@${prefix.toLowerCase()}${countryObj.name.toLowerCase().substring(0, 3)}.com`, phone: `+${40 + i}-555-0811` }
    ];
    
    list.push({
      id: `SUP-${String(i).padStart(3, '0')}`,
      name,
      country: countryObj.name,
      industry,
      status,
      riskScore,
      financialHealth,
      cyberRating,
      weatherExposure,
      esgRating,
      deliveryPerformance,
      operationalPerformance,
      lastAudit,
      relationshipOwner: owner,
      spend,
      revenue,
      revenueDependency,
      creditScore,
      bankruptcyRisk,
      currency: countryObj.currency,
      riskHistory,
      documents,
      contacts
    });
  }
  
  return list;
}

// Initial alerts
const initialAlerts: RiskAlert[] = [
  {
    id: 'ALT-001',
    type: 'weather',
    title: 'Category 4 Typhoon "In-fa" Approaching Asia Coast',
    description: 'Severe typhoon approaching the southeastern coast, impacting critical logistics hubs and electronics assemblers.',
    severity: 'critical',
    date: '2026-07-15',
    affectedSuppliers: ['SUP-003', 'SUP-013', 'SUP-023', 'SUP-033'],
    status: 'active',
    region: 'Asia-Pacific'
  },
  {
    id: 'ALT-002',
    type: 'cyber',
    title: 'Active Ransomware Campaign Targeting Automotive Suppliers',
    description: 'BlackByte variant targeting vulnerable VPN appliances in manufacturing operational technology (OT) systems.',
    severity: 'high',
    date: '2026-07-14',
    affectedSuppliers: ['SUP-006', 'SUP-016', 'SUP-046'],
    status: 'active',
    region: 'Europe'
  },
  {
    id: 'ALT-003',
    type: 'financial',
    title: 'Interest Rate Spike & Liquidity Squeeze in Emerging Markets',
    description: 'Sovereign debt strain causing severe local credit tightening, escalating operational and bankruptcy risk for smaller industrial suppliers.',
    severity: 'medium',
    date: '2026-07-12',
    affectedSuppliers: ['SUP-007', 'SUP-027', 'SUP-037', 'SUP-057'],
    status: 'monitoring',
    region: 'South America'
  },
  {
    id: 'ALT-004',
    type: 'geopolitical',
    title: 'New Trade Tariff Controls on Rare Earth Exports',
    description: 'Enactment of stricter bilateral quotas and permit restrictions for semiconductor and catalyst raw supplies.',
    severity: 'high',
    date: '2026-07-10',
    affectedSuppliers: ['SUP-001', 'SUP-011', 'SUP-021', 'SUP-061'],
    status: 'active',
    region: 'Asia-Pacific'
  },
  {
    id: 'ALT-005',
    type: 'weather',
    title: 'Extreme Drought Restricting Rhine River Cargo Capacities',
    description: 'Record low water levels requiring cargo barges to load at only 30% of standard capacity, introducing delays and surcharges.',
    severity: 'medium',
    date: '2026-07-08',
    affectedSuppliers: ['SUP-002', 'SUP-012', 'SUP-042', 'SUP-072'],
    status: 'monitoring',
    region: 'Europe'
  }
];

// Initial default settings
const defaultSettings: PlatformSettings = {
  organizationName: 'Global Enterprises Inc.',
  weights: {
    financial: 25,
    cyber: 25,
    weather: 20,
    esg: 15,
    operational: 15
  },
  alertThresholds: {
    critical: 75,
    high: 60,
    medium: 40
  }
};

// Users
const initialUsers: User[] = [
  { id: 'usr-1', email: 'admin@enterprise.com', name: 'Chief Security Officer', role: 'Admin' },
  { id: 'usr-2', email: 'procurement@enterprise.com', name: 'Sarah Patel', role: 'Procurement Manager' },
  { id: 'usr-3', email: 'analyst@enterprise.com', name: 'David Jenkins', role: 'Risk Analyst' },
  { id: 'usr-4', email: 'supplier@zenith.com', name: 'Kenji Sato', role: 'Supplier', supplierId: 'SUP-005' },
  { id: 'usr-5', email: 'viewer@enterprise.com', name: 'Executive Viewer', role: 'Viewer' }
];

class DatabaseStore {
  private suppliers: Supplier[];
  private alerts: RiskAlert[];
  private settings: PlatformSettings;
  private users: User[];

  constructor() {
    this.suppliers = generateSuppliers();
    this.alerts = initialAlerts;
    this.settings = defaultSettings;
    this.users = initialUsers;
    this.recalculateAllRiskScores();
  }

  // Recalculates supplier risk scores dynamically based on weights and exposure values
  public recalculateAllRiskScores() {
    const { weights } = this.settings;
    this.suppliers = this.suppliers.map(sup => {
      // Financial Component: 100 - financialHealth
      const finComponent = 100 - sup.financialHealth;
      // Cyber Component: 100 - sup.cyberRating
      const cybComponent = 100 - sup.cyberRating;
      // Weather Component: exposure
      const weaComponent = sup.weatherExposure;
      // ESG Component: 100 - esgRating
      const esgComponent = 100 - sup.esgRating;
      // Operational/Delivery Component: 100 - deliveryPerformance
      const opeComponent = 100 - sup.deliveryPerformance;

      const weightedScore = (
        (weights.financial * finComponent) +
        (weights.cyber * cybComponent) +
        (weights.weather * weaComponent) +
        (weights.esg * esgComponent) +
        (weights.operational * opeComponent)
      ) / 100;

      const riskScore = Math.min(100, Math.max(0, Math.round(weightedScore)));

      // Update history if current doesn't match last entry
      const history = [...sup.riskHistory];
      if (history.length > 0) {
        history[history.length - 1].score = riskScore;
      }

      return {
        ...sup,
        riskScore
      };
    });
  }

  public getSuppliers() {
    return this.suppliers;
  }

  public getSupplierById(id: string) {
    return this.suppliers.find(s => s.id === id);
  }

  public updateSupplier(id: string, updated: Partial<Supplier>) {
    this.suppliers = this.suppliers.map(s => {
      if (s.id === id) {
        const next = { ...s, ...updated } as Supplier;
        return next;
      }
      return s;
    });
    this.recalculateAllRiskScores();
    return this.getSupplierById(id);
  }

  public addSupplier(supplier: Omit<Supplier, 'id' | 'riskScore' | 'riskHistory' | 'documents' | 'contacts'>) {
    const id = `SUP-${String(this.suppliers.length + 1).padStart(3, '0')}`;
    const newSup: Supplier = {
      ...supplier,
      id,
      riskScore: 50,
      riskHistory: [
        { date: '2026-05-15', score: 45 },
        { date: '2026-06-15', score: 50 }
      ],
      documents: [
        { id: `doc-${id}-1`, name: 'ISO 9001 Certificate', type: 'Certification', uploadDate: '2026-07-01', status: 'pending' }
      ],
      contacts: [
        { name: 'Contact Representative', role: 'Support', email: 'support@supplier.com', phone: '+1-555-0000' }
      ]
    };
    this.suppliers.push(newSup);
    this.recalculateAllRiskScores();
    return newSup;
  }

  public getAlerts() {
    return this.alerts;
  }

  public addAlert(alert: Omit<RiskAlert, 'id'>) {
    const id = `ALT-${String(this.alerts.length + 1).padStart(3, '0')}`;
    const newAlert: RiskAlert = {
      ...alert,
      id
    };
    this.alerts.unshift(newAlert);
    return newAlert;
  }

  public updateAlertStatus(id: string, status: 'active' | 'mitigated' | 'monitoring') {
    this.alerts = this.alerts.map(a => {
      if (a.id === id) {
        return { ...a, status };
      }
      return a;
    });
    return this.alerts.find(a => a.id === id);
  }

  public deleteAlert(id: string) {
    this.alerts = this.alerts.filter(a => a.id !== id);
    return true;
  }

  public getSettings() {
    return this.settings;
  }

  public updateSettings(newSettings: Partial<PlatformSettings>) {
    if (newSettings.organizationName) {
      this.settings.organizationName = newSettings.organizationName;
    }
    if (newSettings.weights) {
      this.settings.weights = { ...this.settings.weights, ...newSettings.weights };
    }
    if (newSettings.alertThresholds) {
      this.settings.alertThresholds = { ...this.settings.alertThresholds, ...newSettings.alertThresholds };
    }
    this.recalculateAllRiskScores();
    return this.settings;
  }

  public getUsers() {
    return this.users;
  }

  public getUserById(id: string) {
    return this.users.find(u => u.id === id);
  }

  public getUserByEmail(email: string) {
    return this.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  }
}

export const dbStore = new DatabaseStore();
