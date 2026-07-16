import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { dbStore } from './server/db';
import { GoogleGenAI } from '@google/genai';

const isProduction = process.env.NODE_ENV === 'production';
const PORT = 3000;

// Lazy initialization of Gemini client to prevent startup crashes if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      try {
        aiClient = new GoogleGenAI({
          apiKey,
          httpOptions: {
            headers: {
              'User-Agent': 'aistudio-build',
            },
          },
        });
      } catch (err) {
        console.error('Error initializing Gemini client:', err);
      }
    }
  }
  return aiClient;
}

async function startServer() {
  const app = express();

  // Basic Middlewares
  app.use(express.json());

  // Simple Session Store in cookies or request headers for simulation
  // For simplicity, we can pass a 'x-user-role' header to simulate roles
  app.use((req, res, next) => {
    const userEmail = req.headers['x-user-email'] as string || 'procurement@enterprise.com';
    const user = dbStore.getUserByEmail(userEmail);
    if (user) {
      (req as any).user = user;
    } else {
      (req as any).user = dbStore.getUsers()[1]; // Default to Procurement Manager
    }
    next();
  });

  // API ROUTE: Authentication Details
  app.get('/api/auth/me', (req, res) => {
    res.json({ user: (req as any).user });
  });

  app.post('/api/auth/login', (req, res) => {
    const { email } = req.body;
    const user = dbStore.getUserByEmail(email);
    if (user) {
      res.json({ success: true, user });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials. Please use one of the seed emails: admin@enterprise.com, procurement@enterprise.com, analyst@enterprise.com, supplier@zenith.com, or viewer@enterprise.com.' });
    }
  });

  // API ROUTE: Get all suppliers
  app.get('/api/suppliers', (req, res) => {
    const { search, country, industry, status, minRisk, maxRisk } = req.query;
    let list = dbStore.getSuppliers();

    // Filter by search
    if (search) {
      const q = (search as string).toLowerCase();
      list = list.filter(s =>
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.country.toLowerCase().includes(q) ||
        s.industry.toLowerCase().includes(q) ||
        s.relationshipOwner.toLowerCase().includes(q)
      );
    }

    // Filter by country
    if (country) {
      list = list.filter(s => s.country === country);
    }

    // Filter by industry
    if (industry) {
      list = list.filter(s => s.industry === industry);
    }

    // Filter by status
    if (status) {
      list = list.filter(s => s.status === status);
    }

    // Filter by risk range
    if (minRisk) {
      list = list.filter(s => s.riskScore >= parseInt(minRisk as string));
    }
    if (maxRisk) {
      list = list.filter(s => s.riskScore <= parseInt(maxRisk as string));
    }

    res.json({ suppliers: list });
  });

  // API ROUTE: Get single supplier
  app.get('/api/suppliers/:id', (req, res) => {
    const supplier = dbStore.getSupplierById(req.params.id);
    if (supplier) {
      res.json({ supplier });
    } else {
      res.status(404).json({ error: 'Supplier not found' });
    }
  });

  // API ROUTE: Update supplier
  app.patch('/api/suppliers/:id', (req, res) => {
    const user = (req as any).user;
    if (user.role === 'Viewer') {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    const updated = dbStore.updateSupplier(req.params.id, req.body);
    if (updated) {
      res.json({ success: true, supplier: updated });
    } else {
      res.status(404).json({ error: 'Supplier not found' });
    }
  });

  // API ROUTE: Add supplier
  app.post('/api/suppliers', (req, res) => {
    const user = (req as any).user;
    if (user.role !== 'Admin' && user.role !== 'Procurement Manager') {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    const { name, country, industry, status, financialHealth, cyberRating, weatherExposure, esgRating, deliveryPerformance, operationalPerformance, lastAudit, relationshipOwner, spend, revenue, revenueDependency, creditScore, bankruptcyRisk, currency } = req.body;

    if (!name || !country || !industry) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const newSup = dbStore.addSupplier({
      name,
      country,
      industry,
      status: status || 'active',
      financialHealth: financialHealth || 80,
      cyberRating: cyberRating || 80,
      weatherExposure: weatherExposure || 30,
      esgRating: esgRating || 80,
      deliveryPerformance: deliveryPerformance || 90,
      operationalPerformance: operationalPerformance || 90,
      lastAudit: lastAudit || new Date().toISOString().substring(0, 10),
      relationshipOwner: relationshipOwner || user.name,
      spend: spend || 500000,
      revenue: revenue || 2000000,
      revenueDependency: revenueDependency || 25,
      creditScore: creditScore || 720,
      bankruptcyRisk: bankruptcyRisk || 'low',
      currency: currency || 'USD'
    });

    res.status(211).json({ success: true, supplier: newSup });
  });

  // API ROUTE: Get all alerts
  app.get('/api/alerts', (req, res) => {
    res.json({ alerts: dbStore.getAlerts() });
  });

  // API ROUTE: Add alert
  app.post('/api/alerts', (req, res) => {
    const user = (req as any).user;
    if (user.role === 'Viewer') {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    const { type, title, description, severity, affectedSuppliers, status, region } = req.body;

    if (!type || !title || !description || !severity) {
      return res.status(400).json({ error: 'Missing required parameters' });
    }

    const newAlert = dbStore.addAlert({
      type,
      title,
      description,
      severity,
      date: new Date().toISOString().substring(0, 10),
      affectedSuppliers: affectedSuppliers || [],
      status: status || 'active',
      region: region || 'Global'
    });

    res.json({ success: true, alert: newAlert });
  });

  // API ROUTE: Update alert status
  app.patch('/api/alerts/:id/status', (req, res) => {
    const user = (req as any).user;
    if (user.role === 'Viewer') {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    const { status } = req.body;
    const updated = dbStore.updateAlertStatus(req.params.id, status);
    if (updated) {
      res.json({ success: true, alert: updated });
    } else {
      res.status(404).json({ error: 'Alert not found' });
    }
  });

  // API ROUTE: Delete alert
  app.delete('/api/alerts/:id', (req, res) => {
    const user = (req as any).user;
    if (user.role !== 'Admin') {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    dbStore.deleteAlert(req.params.id);
    res.json({ success: true });
  });

  // API ROUTE: Get platform settings
  app.get('/api/settings', (req, res) => {
    res.json({ settings: dbStore.getSettings() });
  });

  // API ROUTE: Update platform settings
  app.patch('/api/settings', (req, res) => {
    const user = (req as any).user;
    if (user.role !== 'Admin' && user.role !== 'Procurement Manager') {
      return res.status(403).json({ error: 'Unauthorized role' });
    }

    const updated = dbStore.updateSettings(req.body);
    res.json({ success: true, settings: updated });
  });

  // API ROUTE: Export Suppliers as CSV
  app.get('/api/export', (req, res) => {
    const suppliers = dbStore.getSuppliers();
    
    // Create CSV header
    const headers = [
      'ID', 'Name', 'Country', 'Industry', 'Status', 'Risk Score',
      'Financial Health', 'Cyber Rating', 'Weather Exposure', 'ESG Rating',
      'Delivery Performance', 'Relationship Owner', 'Spend (USD)', 'Bankruptcy Risk'
    ];
    
    const rows = suppliers.map(s => [
      s.id,
      `"${s.name.replace(/"/g, '""')}"`,
      s.country,
      s.industry,
      s.status,
      s.riskScore,
      s.financialHealth,
      s.cyberRating,
      s.weatherExposure,
      s.esgRating,
      s.deliveryPerformance,
      s.relationshipOwner,
      s.spend,
      s.bankruptcyRisk
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=suppliers_risk_matrix.csv');
    res.status(200).send(csvContent);
  });

  // API ROUTE: Gemini AI Recommendation Helper (Server-side)
  app.post('/api/ai/recommend', async (req, res) => {
    const { supplierId, actionType, customPrompt } = req.body;
    
    const supplier = supplierId ? dbStore.getSupplierById(supplierId) : null;
    const settings = dbStore.getSettings();
    const activeAlerts = dbStore.getAlerts().filter(a => a.status === 'active');

    // Build default response templates in case Gemini API Key is not set or fails
    const mockAnalysis = `### Executive Risk Analysis: ${supplier ? supplier.name : 'Global Network'}
    
**Risk Score Status:** ${supplier ? `${supplier.riskScore}/100` : 'Overall Portfolio Health Monitoring'}

#### Key Risk Identifiers
1. **Financial Assessment:** Credit Rating at ${supplier ? supplier.creditScore : 'Moderate'}. Bankruptcy hazard is flaggged as **${supplier ? supplier.bankruptcyRisk.toUpperCase() : 'MEDIUM'}** under the updated framework.
2. **Cyber Vulnerability:** Cyber resilience rating sits at **${supplier ? supplier.cyberRating : '82'}/100**. Vulnerable external surface discovered on core supplier ERP modules.
3. **Environmental Footprint:** Operational exposure to severe typhoons and coastal storms in **${supplier ? supplier.country : 'Global Region'}** is high.

#### Actionable Mitigations
* **Diversification Policy:** Establish dual-sourcing contracts for crucial parts to mitigate reliance on a single geographic node.
* **Cyber Remediation Plan:** Require mandatory multi-factor authentication (MFA) and VPN upgrades within 30 days for this vendor's network integrations.
* **Financial Escrow:** Restructure billing cycles to quarterly milestone terms instead of advanced bulk payments.

*Note: This report is generated dynamically by the Global Supply Chain Analytics Engine.*`;

    const mockEmail = `Subject: URGENT: Mandatory Cybersecurity Audits & Remediation Requirements

Dear Partner Management Team,

As part of our commitment to secure operational ecosystems, our Continuous Threat Monitoring center has identified critical exposures relating to VPN interfaces and firmware configurations in your automotive and electronic component supply facilities.

To preserve the status of our active partnership and prevent supply disruptions, please complete the following items:
1. Conduct an immediate patch sweep of all firewall endpoints within 48 hours.
2. Provide a formal remediation report signed by your Chief Information Security Officer (CISO) by next Friday.

We appreciate your swift collaboration in safeguarding our integrated global value chains.

Best regards,
Procurement Risk Operations Division
${settings.organizationName}`;

    // Try to call real Gemini API
    const gemini = getGeminiClient();
    if (gemini) {
      try {
        let promptText = '';
        if (actionType === 'email' && supplier) {
          promptText = `Draft a professional procurement warning email to the supplier "${supplier.name}" located in ${supplier.country} (Industry: ${supplier.industry}). The email must address their risk score of ${supplier.riskScore}/100, highlighting their specific ratings: Cyber Rating: ${supplier.cyberRating}/100, Financial Health: ${supplier.financialHealth}/100, and last audit date: ${supplier.lastAudit}. Demand concrete actions and schedule a follow-up meeting. Sign off as "Global Risk Management Team". Keep the tone polite, firm, and corporate.`;
        } else if (actionType === 'mitigate' && supplier) {
          promptText = `Provide 3 concrete, specific, and actionable mitigation actions for supplier "${supplier.name}" based on their metrics: Risk Score is ${supplier.riskScore}/100, Financial Health is ${supplier.financialHealth}/100, Cyber Rating is ${supplier.cyberRating}/100, Weather Exposure is ${supplier.weatherExposure}/100. Detail exactly what step the procurement manager should take next (e.g., dual-sourcing, escrow agreements, technical firewalls). Use bullet points and professional formatting.`;
        } else {
          // General chat or report
          const supDetails = supplier ? `Supplier: ${supplier.name}, Country: ${supplier.country}, Industry: ${supplier.industry}, Risk Score: ${supplier.riskScore}/100 (Cyber: ${supplier.cyberRating}, Financial: ${supplier.financialHealth}, Weather: ${supplier.weatherExposure}, ESG: ${supplier.esgRating}, Delivery: ${supplier.deliveryPerformance}).` : 'General global supply network context.';
          promptText = `You are a world-class Global Supply Chain Risk Expert. Assist with the following query: "${customPrompt || 'Generate an executive supply chain risk overview report.'}".
          Context:
          - Active Global Alerts: ${JSON.stringify(activeAlerts.map(a => ({ title: a.title, severity: a.severity, type: a.type })))}
          - Risk Weight settings: Financial: ${settings.weights.financial}%, Cyber: ${settings.weights.cyber}%, Weather: ${settings.weights.weather}%, ESG: ${settings.weights.esg}%, Operational: ${settings.weights.operational}%
          - ${supDetails}
          Provide a highly executive, polished, and structured response using beautiful Markdown formatting. Do not include introductory conversational fluff like "Here is your response". Go straight to the professional analysis.`;
        }

        const response = await gemini.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: promptText,
        });

        const generatedText = response.text;
        if (generatedText) {
          return res.json({ success: true, text: generatedText, usedRealAI: true });
        }
      } catch (err) {
        console.error('Gemini call failed, falling back to local simulation:', err);
      }
    }

    // Fallback response (simulates Gemini with high fidelity)
    res.json({
      success: true,
      text: actionType === 'email' ? mockEmail : mockAnalysis,
      usedRealAI: false
    });
  });

  // Serve static assets and SPA fallback in production, or mount Vite dev server in development
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT} (Production: ${isProduction})`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
});
