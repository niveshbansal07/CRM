# 🏟️ TRACKFIELD CRM

> **Full 3-Tier B2B SaaS CRM Platform** — React + Vite + TailwindCSS  
> **41 files · Production-ready · Zero dependencies beyond npm install**

---

## 🚀 Quick Start — 3 Commands

```bash
cd trackfield-crm
npm install
npm run dev
# → Open http://localhost:5173
```

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Dashboard |
|------|-------|----------|-----------|
| **Super Admin (You)** | `owner@trackfield.io` | `trackfield123` | `/admin` |
| **Company Admin** | `admin@nexora.io` | `admin123` | `/company` |
| **Company Admin** | `admin@bluewave.com` | `admin123` | `/company` |
| **Company Admin** | `admin@edupathacademy.in` | `admin123` | `/company` |
| **Company Admin** | `admin@finvault.co` | `admin123` | `/company` |
| **Sales User** | `rohan@nexora.io` | `user123` | `/user` |
| **Manager** | `kavya@nexora.io` | `user123` | `/user` |
| **Support** | `aditya@nexora.io` | `user123` | `/user` |
| **Finance** | `meera@nexora.io` | `user123` | `/user` |

---

## 🏗️ Architecture

```
Super Admin (TrackField Owner — owner@trackfield.io)
    ├── Dashboard        — KPIs, revenue, company overview
    ├── Companies        — Full CRUD, module toggle per company
    ├── All Users        — Cross-company user management + suspend
    ├── Plans            — Subscription tiers, plan changes
    ├── Analytics        — Revenue, conversion, industry charts
    └── Activity Log     — Platform-wide audit trail

Company Admin (Your Client — admin@company.com)
    ├── Dashboard        — Company KPIs, funnel, team perf
    ├── Employees        — Add/edit/remove + Role Permissions Matrix
    ├── Leads            — Table & Kanban views, assign, filter
    ├── Deals            — Pipeline board & table, probability tracking
    ├── Contacts         — Contact database, grid & list views, tags
    ├── Calendar         — Monthly view, events, upcoming tasks
    ├── Payments         — Invoice tracking, paid/pending
    ├── Automation       — Visual workflow builder
    ├── Reports          — Team perf, charts, lead funnel
    ├── Module Control   — 🔥 Dynamic Visibility Engine toggle
    └── Settings         — Company info, module names, notifications, security

User Dashboard (Employee — user@company.com)
    ├── Dashboard        — Role-aware welcome, tasks, quick nav
    ├── My Leads         — Assigned leads with call/email actions
    ├── My Deals         — Pipeline with stage update
    ├── Tasks            — Complete/add/filter tasks
    ├── Contacts         — Contact directory
    └── Tickets          — Support ticket management (support role)
```

---

## 🔥 Key Features

### Dynamic Visibility Engine
```
Admin disables Payments module
  → Company cannot see Payments

Company hides Deals from Sales Intern
  → That user never sees Deals tab
```
Try it: Login as Company Admin → Module Control → toggle off "Leads" → login as Sales User → Leads tab is gone.

### Role Permission Matrix
- Per-role × per-module × per-action (view/create/edit/delete)
- Fully configurable by Company Admin in Employees → Role Permissions tab

### Notification System
- Real-time badge counter on bell icon
- Per-notification dismiss
- Mark all as read
- Type-colored icons

### Calendar
- Full monthly grid with event dots
- Click any day to see/add events
- Next 7 days sidebar
- Color-coded by event type

---

## 📁 File Structure (41 files)

```
trackfield-crm/
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── README.md
└── src/
    ├── main.jsx
    ├── App.jsx
    ├── index.css
    ├── context/AuthContext.jsx          ← All state + CRUD
    ├── data/mockData.js                 ← 5 companies, 12 users, leads, deals...
    ├── components/
    │   ├── Layout/
    │   │   ├── Layout.jsx
    │   │   ├── Sidebar.jsx              ← Role-aware, module-filtered
    │   │   └── Header.jsx               ← Notifications panel
    │   └── common/index.jsx             ← StatCard, Badge, Modal, etc.
    └── pages/
        ├── Login.jsx                    ← Demo account quick-fill
        ├── SuperAdmin/
        │   ├── Dashboard.jsx
        │   ├── Companies.jsx
        │   ├── Users.jsx
        │   ├── Plans.jsx
        │   ├── Analytics.jsx
        │   └── ActivityLog.jsx          ← NEW
        ├── CompanyAdmin/
        │   ├── Dashboard.jsx
        │   ├── Employees.jsx            ← + Permissions Matrix tab
        │   ├── Leads.jsx
        │   ├── Deals.jsx
        │   ├── Contacts.jsx             ← NEW (grid + list + tags)
        │   ├── Calendar.jsx             ← NEW (monthly calendar)
        │   ├── Payments.jsx
        │   ├── Automation.jsx
        │   ├── Reports.jsx
        │   ├── ModuleControl.jsx
        │   └── Settings.jsx             ← Full settings panel
        └── UserDashboard/
            ├── Dashboard.jsx
            ├── MyLeads.jsx
            ├── MyDeals.jsx
            ├── Tasks.jsx
            ├── Contacts.jsx
            └── Tickets.jsx
```

---

## 🎨 Tech Stack

| Library | Version | Purpose |
|---------|---------|---------|
| React | 18 | UI |
| React Router | 6 | Client routing |
| Recharts | 2 | Charts |
| Lucide React | latest | Icons |
| Tailwind CSS | 3 | Styling |
| Vite | 5 | Build |
| Fonts | Barlow Condensed + DM Sans + JetBrains Mono | Typography |

---

## 🔄 Backend Integration Checklist

When ready to add a real backend:
- [ ] Replace `login()` in `AuthContext.jsx` with JWT API call
- [ ] Replace all CRUD functions with `fetch`/`axios` calls  
- [ ] Add token storage: `localStorage.setItem('token', ...)`
- [ ] Add `Authorization: Bearer <token>` header to requests
- [ ] Replace mock data arrays with API-fetched state

---

*TRACKFIELD CRM — Built for B2B SaaS dominance 🚀*


> **Full 3-Tier B2B SaaS CRM Platform** — Built with React + Vite + TailwindCSS

---

## 🚀 Quick Start

```bash
# 1. Navigate into the project
cd trackfield-crm

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# 4. Open browser
http://localhost:5173
```

---

## 🔑 Demo Login Credentials

| Role | Email | Password | Access |
|------|-------|----------|--------|
| **Super Admin** (You) | `owner@trackfield.io` | `trackfield123` | Full platform control |
| **Company Admin** | `admin@nexora.io` | `admin123` | Nexora Solutions CRM |
| **Company Admin** | `admin@bluewave.com` | `admin123` | BlueWave Retail CRM |
| **Company Admin** | `admin@edupathacademy.in` | `admin123` | EduPath Academy CRM |
| **Company Admin** | `admin@finvault.co` | `admin123` | FinVault Capital CRM |
| **Sales User** | `rohan@nexora.io` | `user123` | Sales dashboard |
| **Manager** | `kavya@nexora.io` | `user123` | Manager dashboard |
| **Support** | `aditya@nexora.io` | `user123` | Support dashboard |
| **Finance** | `meera@nexora.io` | `user123` | Finance dashboard |

---

## 🧭 Architecture

```
Super Admin (TrackField Owner)
    ├── Manage all companies
    ├── Control platform features
    ├── Set subscription plans
    └── Global analytics

Company Admin (Client)
    ├── Manage team members
    ├── Toggle modules (Dynamic Visibility Engine)
    ├── Configure role permissions
    ├── Lead & deal management
    └── Company analytics

User (Employee)
    ├── Role-based dashboard
    ├── Only sees what company allows
    └── Executes daily CRM work
```

---

## 📁 Project Structure

```
trackfield-crm/
├── index.html
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
├── package.json
└── src/
    ├── main.jsx
    ├── App.jsx                          # Routes + Role-based redirects
    ├── index.css                        # Design system + Global styles
    ├── context/
    │   └── AuthContext.jsx              # Central state + all CRUD
    ├── data/
    │   └── mockData.js                  # All mock data
    ├── components/
    │   ├── Layout/
    │   │   ├── Layout.jsx               # App shell
    │   │   ├── Sidebar.jsx              # Role-aware sidebar
    │   │   └── Header.jsx               # Top bar
    │   └── common/
    │       └── index.jsx                # Reusable components
    └── pages/
        ├── Login.jsx                    # Login with demo accounts
        ├── SuperAdmin/
        │   ├── Dashboard.jsx            # Platform overview
        │   ├── Companies.jsx            # Company CRUD + modules
        │   ├── Users.jsx                # Global user management
        │   ├── Plans.jsx                # Subscription management
        │   └── Analytics.jsx            # Platform analytics
        ├── CompanyAdmin/
        │   ├── Dashboard.jsx            # Company overview
        │   ├── Employees.jsx            # Team + permissions matrix
        │   ├── Leads.jsx                # Lead CRM (Table + Kanban)
        │   ├── Deals.jsx                # Pipeline (Board + Table)
        │   ├── Automation.jsx           # Workflow builder
        │   ├── Reports.jsx              # Analytics
        │   ├── ModuleControl.jsx        # 🔥 Dynamic Visibility Engine
        │   ├── Payments.jsx             # Invoice tracking
        │   └── Settings.jsx             # Company settings
        └── UserDashboard/
            ├── Dashboard.jsx            # Role-aware home
            ├── MyLeads.jsx              # User's leads
            ├── MyDeals.jsx              # User's deals
            ├── Tasks.jsx                # Task management
            ├── Contacts.jsx             # Contact directory
            └── Tickets.jsx             # Support tickets
```

---

## 🔥 Key Features

### Dynamic Visibility Engine
- Super Admin disables a module → Company cannot see it
- Company Admin disables a module → All employees lose access instantly
- User's role restricts what actions they can perform

### Permission Matrix
- Per-role, per-module, per-action (view/create/edit/delete) control
- Configurable by Company Admin in Settings > Role Permissions

### Pipeline Views
- **Leads**: Table view + Kanban board by status
- **Deals**: Pipeline board + Table view with probability tracking

### 3-Tier Control
```
Admin → controls platform features
Company → controls employee visibility
User → only executes
```

---

## 🎨 Tech Stack

| Tech | Purpose |
|------|---------|
| React 18 | UI Framework |
| React Router 6 | Client-side routing |
| Vite | Build tool |
| Tailwind CSS | Utility styling |
| Recharts | Charts & analytics |
| Lucide React | Icons |
| DM Sans + Barlow Condensed + JetBrains Mono | Typography |

---

## 🔄 Adding Real Backend

To connect a real backend:
1. Replace `AuthContext.jsx` login with API calls
2. Replace mock data with API fetches
3. All CRUD functions in `AuthContext.jsx` map 1:1 to REST endpoints
4. Add JWT token storage in `localStorage`

---

Built with ❤️ — TRACKFIELD CRM Platform