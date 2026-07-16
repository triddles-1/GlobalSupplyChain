# Vanguard Supply Chain Risk Management Platform

Vanguard is an enterprise-grade, full-stack risk command tower designed to monitor, audit, and mitigate vulnerabilities across global trade routes and supplier networks in real-time. By integrating financial solvency datasets, cybersecurity CVE telemetry, climate hazard feeds, and continuous ESG scoring, Vanguard empowers procurement leaders and security analysts to protect capital and guarantee business continuity.

---

## 🚀 Core Capabilities

- **Mathematical Risk Recalibration**: Dynamic risk scoring engine built on adjustable coefficient weights (Financial, Cyber, Climate, ESG, Operational) mapped instantly to all supply chain nodes.
- **Continuous Threat Hubs**: Real-time tracking boards for active weather disruptions, severe typhoons, wildfire threats, and active CVE perimeter exploits.
- **Financial Solvency Audits**: Granular tracking of aggregate contract spend, foreign currency exposures, and Dun & Bradstreet credit default distributions.
- **Role-Based Simulation (RBAC)**: Single Sign-On (SSO) identity switching to test views and write-permissions for Administrators, Procurement Managers, Security Analysts, Supplier Contacts, and Executive Viewers.
- **Gemini Intelligence Copilot**: Server-side AI assistant powered by Gemini to formulate response workflows, draft warning notifications, and summarize global network vulnerabilities.

---

## 🗺️ Architectural Walkthrough & Core Tabs

### 1. Executive Dashboard (`/` Tab)
- **High-Level KPI Panel**: View active supply nodes, average risk scores, critical alert counts, and exposed capital metrics.
- **Aesthetic Data Charts**: Immersive visualization panels rendering Portfolio Risk Distribution (Pie Chart) and Regional Financial Exposure (Bar Chart).
- **Intervention Feeds**: Quick access to the highest-risk suppliers and active strategic threats requiring direct operational action.

### 2. Suppliers Matrix (`/suppliers` Tab)
- **Dynamic Ledger**: Filter and search through 100 seed suppliers by industry, country, status, or risk threshold.
- **Surgical Audit Drawer**: Select any supplier to slide open an immersive performance pane showing their individual risk coefficient scores, financial credit ratings, delivery delay metrics, and contract details.
- **Asset Registration**: Authorized roles can register new supply facilities or update existing profiles in place.

### 3. Risk Model Engine (`/risk` Tab)
- **Active Risk Formula**: See the exact mathematical formula calculating current risk quotients.
- **Coefficient Sliders**: Drag and modify weight variables. The system recalculates risk vectors on the fly across the entire active network.
- **Index Reference**: Track country risk averages across active manufacturing bases.

### 4. Climate Disruptions Hub (`/weather` Tab)
- **Disruption Simulator**: Trigger mock environmental disasters (e.g., *Typhoon Hinnamnor in APAC* or *Wildfires in Pacific Northwest*) to observe impact correlations on specific suppliers.
- **Active Threat Stream**: Flag and mitigate active weather disruptions, restoring operational lanes once cleared.

### 5. Cyber Threat Center (`/cyber` Tab)
- **CVE Watchlist**: Monitor high-risk CVE vulnerabilities and their patch statuses.
- **Resilience Ratings**: Quick-scan cybersecurity scores and perimeter compliance requirements (MFA, validation checks).

### 6. Financial Solvency Audit (`/finance` Tab)
- **Exposure Ledger**: Track currency allocations, contract dependencies, and bankruptcy hazards.
- **Credit Distribution**: Breakdown of D&B ratings across low, medium, and high credit risk buckets.

### 7. Gemini Intelligence Copilot (`/ai` Tab)
- **Mitigation Prompts**: One-click prompt shortcuts to summarize network health, recommend dual-sourcing steps, or draft supplier warning emails.
- **Freeform AI Chat**: Chat directly with the Gemini model regarding supplier risk strategies and dual-sourcing recommendations.

### 8. System Settings & RBAC (`/settings` Tab)
- **SSO Profile Switcher**: Instantly shift sessions between several corporate roles:
  - **Admin**: Full read/write and simulation privileges.
  - **Procurement Manager**: Full supplier management and risk weighting adjustments.
  - **Security Analyst**: Focus on cybersecurity watchlists and weather telemetry.
  - **Supplier Contact**: Limited partner access.
  - **Executive Viewer**: View-only mode for portfolio statistics.

---

## 🛠️ Getting Started & Run Instructions

### 1. Prerequisites
- Node.js (v18+)
- Gemini API Key (optional, required to enable the Intelligence Copilot's live answers)

### 2. Environment Variables Setup
Create a `.env` file in the root directory (based on `.env.example`):
```env
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Dependency Installation
Install all base dependencies configured in the package manifest:
```bash
npm install
```

### 4. Running in Development Mode
To boot the full-stack system (comprising the client-side Vite application and the server-side Express API routes proxy):
```bash
npm run dev
```
The application will boot and bind to **http://localhost:3000**.

### 5. Production Compilations
To compile static client-side bundles and the Node/Express server for deployment:
```bash
npm run build
npm start
```

---

## 🛰️ Technical Framework & Security

- **Client Stack**: React 18, Vite, Tailwind CSS, Lucide Icons, Recharts (Dynamic Visualization).
- **Backend Stack**: Node.js, Express, TSX, esbuild.
- **AI Stack**: `@google/genai` TypeScript SDK (server-side, keeping your secret keys safe from the client/browser).
- **State Store**: High-performance local memory database mirroring a durable database, maintaining seed datasets across role-switching simulations.
