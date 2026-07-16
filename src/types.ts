export type UserRole = 'Admin' | 'Procurement Manager' | 'Risk Analyst' | 'Supplier' | 'Viewer';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  supplierId?: string; // set if role is 'Supplier'
}

export interface SupplierContact {
  name: string;
  role: string;
  email: string;
  phone: string;
}

export interface SupplierDocument {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  status: 'approved' | 'pending' | 'expired';
}

export interface RiskScoreHistory {
  date: string;
  score: number;
}

export interface Supplier {
  id: string;
  name: string;
  country: string;
  industry: string;
  status: 'active' | 'suspended' | 'under-review';
  riskScore: number; // 0 - 100
  financialHealth: number; // 0 - 100 (higher is better)
  cyberRating: number; // 0 - 100 (higher is better)
  weatherExposure: number; // 0 - 100 (lower is better, meaning less exposed, but let's treat as rating out of 100)
  esgRating: number; // 0 - 100
  deliveryPerformance: number; // 0 - 100
  operationalPerformance: number; // 0 - 100
  lastAudit: string;
  relationshipOwner: string;
  spend: number;
  revenue: number;
  revenueDependency: number; // % of their business we represent
  creditScore: number; // 300 - 850
  bankruptcyRisk: 'low' | 'medium' | 'high';
  currency: string;
  riskHistory: RiskScoreHistory[];
  documents: SupplierDocument[];
  contacts: SupplierContact[];
}

export interface RiskAlert {
  id: string;
  type: 'weather' | 'cyber' | 'financial' | 'geopolitical';
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  date: string;
  affectedSuppliers: string[]; // Supplier IDs
  status: 'active' | 'mitigated' | 'monitoring';
  region: string;
}

export interface PlatformSettings {
  organizationName: string;
  weights: {
    financial: number;
    cyber: number;
    weather: number;
    esg: number;
    operational: number;
  };
  alertThresholds: {
    critical: number;
    high: number;
    medium: number;
  };
}
