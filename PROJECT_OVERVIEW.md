# CideDec — Smart AI Suggestions Module
## Full Project Overview

> **Last analysed:** 23 April 2026  
> **Project path:** `Smart AI Suggestions Module cidedec/`  
> **Dev server:** `http://localhost:65185`

---

## Table of Contents
1. [Tech Stack](#1-tech-stack)
2. [Project Structure](#2-project-structure)
3. [Frontend — App Shell & Routing](#3-frontend--app-shell--routing)
4. [Frontend — Pages](#4-frontend--pages)
5. [Frontend — Components](#5-frontend--components)
6. [Frontend — UI Primitives](#6-frontend--ui-primitives)
7. [Frontend — Styling & Design System](#7-frontend--styling--design-system)
8. [AI Intelligence Engine](#8-ai-intelligence-engine)
9. [State Management (AppContext)](#9-state-management-appcontext)
10. [Current Database / Data Layer](#10-current-database--data-layer)
11. [Build & Tooling](#11-build--tooling)
12. [Key Data Flows](#12-key-data-flows)

---

## 1. Tech Stack

| Layer | Technology | Version |
|---|---|---|
| Framework | **React** | 18.3.1 |
| Language | **TypeScript** | via Vite |
| Build tool | **Vite** | 6.3.5 |
| Styling | **TailwindCSS v4** | 4.1.12 |
| Animation | **Motion (Framer)** | 12.23.24 |
| Charts | **Recharts** | 2.15.2 |
| Icons | **Lucide React** | 0.487.0 |
| UI Primitives | **Radix UI** (full suite) | various |
| Routing | **React Router** | 7.13.0 |
| Form handling | **React Hook Form** | 7.55.0 |
| Notifications | **Sonner** | 2.0.3 |
| Drag & Drop | **React DnD** | 16.0.1 |
| Package manager | **pnpm** (workspace) | — |

> **No real backend.** All logic, data, and auth is handled client-side in-memory (see §10).

---

## 2. Project Structure

```
Smart AI Suggestions Module cidedec/
├── index.html
├── vite.config.ts              # Vite + Tailwind + React plugins; @ alias → /src
├── package.json
├── pnpm-workspace.yaml
├── postcss.config.mjs
├── default_shadcn_theme.css
├── guidelines/
└── src/
    ├── main.tsx                # React root mount
    ├── app/
    │   ├── App.tsx             # Root component + routing switch
    │   ├── AppContext.tsx      # Global state (auth, notifications, queries)
    │   ├── components/         # Reusable UI + intelligence modules
    │   └── pages/              # Full page views (auth-gated)
    └── styles/
        ├── index.css
        ├── theme.css           # Design tokens (CSS vars, dark mode)
        ├── tailwind.css
        └── fonts.css
```

---

## 3. Frontend — App Shell & Routing

### `App.tsx`
Top-level shell. Manages:

- **Page union type** — `'home' | 'dashboard' | 'market' | 'financial' | 'comparison' | 'insights' | 'profile' | 'privacy'`
- **`guardedNavigate(page)`** — blocks non-home pages if unauthenticated; redirects to `<SmartSuggestions>`
- **Settings panel** — slide-in `<SettingsPanel>` overlay (auth-gated)
- **Sign-out confirmation overlay** — animated modal with last-query display

#### Route → Component Map

| Page key | Component | Auth required |
|---|---|---|
| `home` | `SmartSuggestions` | ❌ public |
| `dashboard` | `Dashboard` | ✅ |
| `market` | `MarketAnalysis` | ✅ |
| `financial` | `FinancialAnalysis` | ✅ |
| `comparison` | `Comparison` | ✅ |
| `insights` | `AIInsights` | ✅ |
| `profile` | `MyProfile` | ✅ |
| `privacy` | `PrivacySecurity` | ✅ |

---

## 4. Frontend — Pages

All pages live in `src/app/pages/` and receive `onNavigate` as a prop.

### `Dashboard.tsx` (13.7 KB)
- KPI cards: Revenue ₹42.8L, Market Share 24.6%, Active Users 1.24M, Risk Score 38/100
- 12-month custom SVG revenue bar chart
- Animated market share donut chart
- Quick stats row: Gross Margin, CAC, NPS, Churn, LTV:CAC, Break-Even
- Business Health panel with 3 progress bar scores
- Navigation cards to Market, Financial, Comparison

### `MarketAnalysis.tsx` (15.3 KB)
- SWOT analysis, TAM/SAM/SOM, competitor matrix, growth forecast (Recharts)

### `FinancialAnalysis.tsx` (13.5 KB)
- ROI & IRR analysis, cash flow charts, feasibility scoring, financial ratio tables

### `Comparison.tsx` (13.5 KB)
- Year-over-year trends, interfirm benchmarking, scenario panels

### `AIInsights.tsx` (29 KB)
- AI strategic recommendations, risk assessment scoring, priority action plans

### `MyProfile.tsx` (21.5 KB)
- User details, query history, plan display (Free / Pro / Enterprise)

### `SettingsPanel.tsx` (21.2 KB)
- Slide-in overlay: notification prefs, display settings, account links

### `PrivacySecurity.tsx` (11 KB)
- Privacy controls, security options, data management

### `LoginPage.tsx` (10 KB)
- Standalone login page (also accessible via `SearchAuthModal`)

---

## 5. Frontend — Components

All in `src/app/components/`.

### ⭐ `SmartSuggestions.tsx` (100 KB — Core Module)

The heart of the application. Renders the full decision-intelligence interface.

**Panels rendered:**

| Section | Description |
|---|---|
| Hero search bar | AI search input with voice icon + quick-prompt chips |
| Quick prompts | 6 pre-built prompts across all domains |
| `ExplainableAIPanel` | Quality score ring, confidence meter, 4 reasoning tabs |
| `KeywordHeatmap` | Per-word strength (green/amber/red) |
| `FutureImpactRow` | Future impact score + alternative perspectives |
| `GamificationBar` | Level, streak, badges, total points |
| KPI cards | 4 dynamic KPIs based on query result |
| `ChartRenderer` | Recharts area/bar/line/pie/radar |
| Forecast section | 3-chart 5-year projection panel |
| Module deep-links | 6 analysis modules (Market, Financial, Risk, Strategy, Comparison, Forecast) |
| Suggestion cards | 6 static action cards |
| `DecisionDNA` | Cognitive profile fingerprint card |
| `AIvsHumanThinking` | AI vs human reasoning comparison |
| `DecisionTimeline` | 5-node interactive consequence timeline |
| `AIAssistantModal` | Full-screen AI chat overlay |

**Internal engines:**

| Function | Purpose |
|---|---|
| `classify(query)` | Regex-based domain router → picks response template |
| `analyzeIntelligence(query)` | Full `QueryIntelligence` object (score, bias flags, alternatives, scenarios) |
| `generateForecast(query, intel)` | 5-year projection chart specs (3 charts) |
| `computeGamification(queries, score)` | Level + badge calculation |
| `themeConfig(theme)` | Maps quality theme → Tailwind class sets |

**Domain classification:**

| Domain | Sample keywords |
|---|---|
| `finance` | roi, revenue, irr, npv, margin, profit |
| `marketing` | market, brand, campaign, seo |
| `technology` | tech, saas, software, ai, digital |
| `strategy` | strategy, growth, expansion, competitive |
| `risk` | risk, threat, mitigation, compliance |
| `career` | career, job, salary, engineer, developer |
| `education` | degree, college, course, certification |
| `health` | doctor, medical, healthcare, hospital |
| `personal` | skill, habit, motivation, mindset |

---

### `Navigation.tsx` (12.5 KB)
Sticky top navbar:
- CideDec brand logo (custom SVG) + plan badge
- Sign In button (unauthenticated)
- Bell icon → notification dropdown (max 12, mark-all-read)
- Profile dropdown → Profile, Settings, Privacy, Sign Out

### `DecisionDNA.tsx` (8.4 KB)
Cognitive fingerprint card. Generated per query.

| Field | Values |
|---|---|
| `riskLevel` | Low / Medium / High |
| `decisionStyle` | Conservative / Balanced / Aggressive |
| `industryFocus` | e.g. "Finance & Investment" |
| `thinkingDepth` | 0–98 (animated SVG ring) |
| `traits` | e.g. ["Analytical", "Bold", "Growth-Oriented"] |

### `AIvsHumanThinking.tsx` (17.5 KB)
Split-panel comparison:
- **AI side:** 3 data-driven action points + supporting data + confidence %
- **Human side:** Intuitive considerations + emotional factors + key concerns
- **Trust meter:** Animated bar showing AI% vs Human% split
- **Conflict detection:** Expandable list with severity (low/medium/high)

### `DecisionTimeline.tsx` (17.3 KB)
5-node interactive consequence timeline.

```typescript
interface TimelineNode {
  label: string           // "Month 1", "Month 3", "Month 6", "Year 1", "Year 2"
  title: string           // Phase name
  positive: string[]      // Positive outcomes
  negative: string[]      // Potential risks
  netImpact: 'positive' | 'neutral' | 'negative'
  revenueChange: string
  riskChange: 'Low' | 'Medium' | 'High'
  narrative: string       // Long-form narrative paragraph
}
```

- Animated progress bar connects nodes
- Clicking a node reveals detail panel with narrative, positive/negative lists, revenue & risk badges

### `AIAssistantModal.tsx` (66.2 KB — Largest file)
Full-screen AI chat interface (Vercel-style):
- Chat history with streamed-style AI responses
- Input bar with send button
- Context-aware responses based on domain

### Other Components

| Component | Size | Purpose |
|---|---|---|
| `AISearchChat.tsx` | 16 KB | In-page search-to-chat transition |
| `SearchAuthModal.tsx` | 17.2 KB | Auth gate when unauthenticated user searches |
| `ApplyNowModal.tsx` | 19.4 KB | Plan upgrade / application multi-step modal |
| `SuggestionCard.tsx` | 4.9 KB | Static action suggestion cards |
| `SuggestionModal.tsx` | 10.9 KB | Detail modal for a suggestion card |
| `FloatingParticles.tsx` | 5.8 KB | Canvas ambient particle animation (hero bg) |
| `ModalAnimation.tsx` | 12.7 KB | Reusable modal entry/exit animation wrapper |
| `figma/ImageWithFallback.tsx` | 1.2 KB | Image with graceful fallback |

---

## 6. Frontend — UI Primitives

Located in `src/app/components/ui/` — **54 files** (full Radix UI + shadcn set).

| Category | Components |
|---|---|
| Layout | card, separator, scroll-area, resizable, sidebar |
| Overlays | dialog, drawer, sheet, alert-dialog, popover, tooltip, hover-card |
| Navigation | navigation-menu, menubar, breadcrumb, pagination, tabs |
| Forms | form, input, textarea, select, checkbox, radio-group, switch, slider, label, input-otp |
| Feedback | alert, badge, progress, skeleton, sonner |
| Data | table, chart |
| Actions | button, toggle, toggle-group, dropdown-menu, context-menu, command |
| Media | avatar, aspect-ratio, carousel, accordion, collapsible |
| Special | aurora-background, v0-ai-chat, login-signup, modal-pricing, project-showcase, demo |
| Utils | `utils.ts` (cn helper), `use-mobile.ts` (breakpoint hook) |

---

## 7. Frontend — Styling & Design System

### Design Language
- **Monochrome B&W** — Primary: `zinc-900` (black), `white`, `zinc-100–400` (grays)
- **Colour accents** — Only in charts and query-quality theming (emerald, amber, red, blue, violet)
- **Glassmorphism** — `bg-white/80 backdrop-blur-sm` on dashboard cards
- **Micro-animations** — Motion on virtually every interactive element

### CSS Files

| File | Purpose |
|---|---|
| `src/styles/index.css` | Global resets, base styles |
| `src/styles/theme.css` | CSS custom properties (design tokens) — light + dark mode |
| `src/styles/tailwind.css` | `@import "tailwindcss"` entry |
| `src/styles/fonts.css` | Font-face declarations |

### Key Design Tokens (`theme.css`)

```css
--primary: #030213;          /* Near-black brand colour */
--background: #ffffff;       /* White base */
--muted: #ececf0;            /* Light grey surfaces */
--radius: 0.625rem;          /* Base border radius */
--font-size: 16px;           /* Root font size */
```

### Query Quality Themes (6 tiers)

| Theme | Score range | Label |
|---|---|---|
| `strong-green` | ≥ 85 | Excellent |
| `green` | 68–84 | Strong |
| `golden` | 52–67 | Good |
| `neutral` | 40–51 | Moderate |
| `red` | 22–39 | Weak |
| `weak-red` | < 22 | Very Weak |

---

## 8. AI Intelligence Engine

All AI logic is **100% client-side** — no API calls. Pure TypeScript functions.

### Pipeline (triggered on search submit)

```
User query submitted
  ↓
classify(query)              → picks response template (business or universal)
  ↓
analyzeIntelligence(query)   → QueryIntelligence object:
  • Word count + keyword scoring (0–98)
  • Bias flag detection (vague / incomplete / misleading / ambiguous)
  • Keyword heatmap data
  • Auto-enhanced query suggestion
  • Alternative perspective links (3 per domain)
  • Knowledge gap identification
  • Future impact score
  • 5 scenario simulations
  ↓
generateForecast(query, intel) → 3 × 5-year projection ChartSpecs
  ↓
generateDecisionDNA(...)       → DecisionDNAData
  ↓
generateAIvsHuman(...)         → AIvsHumanData
  ↓
generateTimeline(...)          → TimelineNode[]
  ↓
All panels render with staggered Motion animations
```

### Scoring Algorithm

```
Base score: 35
+ 10 × (number of strong domain keywords matched)
+  8 if word count > 2
+  8 if word count > 5
+  7 if query contains numbers
+  4 if query contains punctuation
+  6 if domain != "general"
→ Clamped to [5, 98]
```

### Gamification Engine

| Level | Avg score threshold |
|---|---|
| Beginner | < 45 |
| Intermediate | 45–64 |
| Advanced | 65–79 |
| Expert | ≥ 80 |

**Badges:** First Search, Explorer (5q), Analyst (10q), Precision Thinker (avg ≥ 70), Domain Expert (avg ≥ 85), Power User (total ≥ 500 pts).

---

## 9. State Management (AppContext)

**File:** `src/app/AppContext.tsx`  
**Pattern:** React Context + `useState` + `useCallback` — no Redux or Zustand.

### Context Shape

```typescript
{
  // Auth
  isAuthenticated: boolean
  currentUser: AuthUser | null     // { username, email, fullName, plan }
  login(username, password): Promise<{ok, error?}>
  register(data): Promise<{ok, error?}>
  logout(): void

  // Search gate
  pendingQuery: string
  setPendingQuery(q): void

  // Notifications (max 12)
  notifications: AppNotification[]
  addNotification(n): void
  markAllRead(): void
  unreadCount: number

  // Sign-out UX
  lastQuery: string
  setLastQuery(q): void
  isSignedOut: boolean
  signOut(): void
  cancelSignOut(): void
}
```

---

## 10. Current Database / Data Layer

> ⚠️ **There is NO real database.** All data is in-memory JavaScript that resets on page refresh.

### Authentication Store (`MOCK_USERS` in `AppContext.tsx`)

| Username | Password | Plan |
|---|---|---|
| `vaishali` | `DecisionAI@123` | Pro |
| `admin` | `admin123` | Enterprise |
| `demo` | `demo` | Free |

- `register()` adds users to this object at runtime (lost on refresh)
- Email + username uniqueness enforced at registration
- Simulates 900ms async delay

### Notification Seed Data (3 items on load)

| ID | Title | Type | Read |
|---|---|---|---|
| n1 | New Market Insight | insight | false |
| n2 | Risk Alert | alert | false |
| n3 | Analysis Complete | update | true |

### Response Template Map (Query "DB")

**Business (`responseMap`):**

| Key | Triggered by |
|---|---|
| `roi` | roi, return, break-even, irr, npv, invest |
| `market` | market, trend, tam, share, segment, competitor |
| `risk` | risk, threat, danger, vulnerability |
| `strategy` | strategy, recommend, growth plan, rural |
| `financial` | financial, margin, profit, cash, ratio |
| `comparison` | compare, prior, last year, yoy, benchmark |
| `default` | fallback |

**Universal (`universalMap`):**

| Key | Triggered by |
|---|---|
| `career` | career, job, salary, engineer, developer |
| `education` | degree, college, course, certification |
| `health` | doctor, mbbs, medical, hospital |
| `personal` | skill, improve, habit, mindset, life |

### Static Datasets

| Dataset | Size |
|---|---|
| 6 suggestion cards | Static array in `SmartSuggestions.tsx` |
| 6 quick prompts | Static array in `SmartSuggestions.tsx` |
| 6 analysis modules | Static record in `SmartSuggestions.tsx` |
| Dashboard KPIs | Static array in `Dashboard.tsx` |
| 12-month revenue data | Static array in `Dashboard.tsx` |
| Timeline narratives | 3 template sets in `DecisionTimeline.tsx` |
| AI vs Human templates | Conditional branches in `AIvsHumanThinking.tsx` |

---

## 11. Build & Tooling

### Scripts
```json
"dev":   "vite"        // Start dev server
"build": "vite build"  // Production bundle
```

### Vite Config
```typescript
plugins: [react(), tailwindcss()]
resolve: { alias: { '@': './src' } }
assetsInclude: ['**/*.svg', '**/*.csv']
```

### Key Dependencies

| Package | Role |
|---|---|
| `motion` | All animations (page transitions, modals, charts) |
| `recharts` | Area, Bar, Line, Pie, Radar charts |
| `lucide-react` | All icons |
| `react-router` v7 | Client-side routing |
| `@radix-ui/*` | Accessible UI primitives (full suite) |
| `tailwind-merge` + `clsx` | Conditional class composition |
| `class-variance-authority` | Component variant system |
| `sonner` | Toast notifications |
| `react-hook-form` | Form state management |
| `date-fns` | Date formatting |
| `canvas-confetti` | Celebration animations |
| `embla-carousel-react` | Carousel component |

---

## 12. Key Data Flows

### Search Flow
```
User types query → submits
  ├─ NOT authenticated → SearchAuthModal (pendingQuery saved in context)
  │     └─ Login success → pendingQuery replayed automatically
  └─ Authenticated →
        classify(query) → result template
        analyzeIntelligence(query) → quality score
        generateForecast(query, intel) → 5-yr charts
        generateDecisionDNA(...) → DNA card
        generateAIvsHuman(...) → comparison panel
        generateTimeline(...) → 5-node timeline
        addNotification(result.notif) → bell updates
        setLastQuery(query) → stored for sign-out UX
        → All panels animate in with staggered delays
```

### Auth Flow
```
Sign In:
  login(username, password) → 900ms delay → check MOCK_USERS
  → isAuthenticated=true, currentUser set
  → guardedNavigate unlocks all pages

Sign Out:
  signOut() → isSignedOut=true → overlay shown
  confirm → logout() → all state reset
  cancel → overlay dismissed
```

### Notification Flow
```
Query submitted with result.notif defined
  → addNotification({title, body, type})
  → prepended to notifications[] (max 12)
  → unreadCount increments → Bell dot shows
  → markAllRead() → all read:true → dot clears
```

---

## Summary — What's Missing / Suggested Next Steps

| Area | Current | Needs |
|---|---|---|
| **Backend** | None | Node.js/Express or Next.js API routes |
| **Database** | Mock JS objects | PostgreSQL / Supabase / Firebase |
| **Real AI** | Regex + static templates | OpenAI / Gemini API integration |
| **Auth** | Mock credentials, no JWT | Supabase Auth / NextAuth / Clerk |
| **Persistence** | Resets on refresh | User sessions, query history in DB |
| **Real data** | Hardcoded KPIs | Live analytics API or data warehouse |
| **Deployment** | Dev server only | Vercel / Netlify production deploy |
