# CideDec — Smart AI Suggestions & Decision Intelligence Module

## System & Architectural Prompt

You are an expert full-stack developer and AI system architect building **CideDec**, an enterprise-grade **Emotion-Aware Decision Intelligence Platform**. CideDec helps students, job seekers, and business strategists analyze career paths, educational fields, ATS resume match scores, market trends, financial ROI, and bias detection using advanced AI analytics.

---

## Technical Stack & Configuration

### Frontend
- **Framework**: React 18.3 + TypeScript + Vite 6.3
- **Styling**: Tailwind CSS v4 + Radix UI Primitives + Lucide React Icons
- **Animations**: Framer Motion (Motion v12) + Canvas Confetti
- **Visualization**: Recharts (Area, Pie, Bar, Radar, Composed Charts)
- **PDF & File Parsing**: JSZip, PDF.js

### Backend
- **Server**: Node.js + Express (ES Modules)
- **Database**: SQLite3 (`server/database.sqlite`) with parameterized transactions
- **Authentication**: JWT (JSON Web Tokens) with `bcryptjs` password hashing
- **Security**: Helmet headers, CORS policies, Express Rate Limiting, Winston Audit Logging, Gzip Compression

---

## Core Application Modules & Pages

### 1. Self Discovery (`src/app/pages/StudentJourneyPage.tsx`)
Interactive multi-step assessment mapping a student's journey:
- Class 10 & 12 stream, subjects, marks, and interests.
- Personality traits, thinking styles, and problem-solving preferences.
- Generates personalized career match percentages, top course recommendations, and 5-year future self trajectory simulations.

### 2. Field Explorer & AI Insights (`src/app/pages/AIInsights.tsx`, `src/app/components/HomePage.tsx`)
Comprehensive field analysis and query engine:
- Multi-intent query processor with domain categorization (Science, Engineering, Arts, Business).
- Sentiment score gauge (0–100), query quality score, and 5-year optimistic/projected/conservative forecasts.
- Emotion-aware query processing and bias risk detector (Representation, Algorithmic, Assessment bias).

### 3. ATS Resume Intelligence (`src/app/pages/ATSIntelligence.tsx`)
Job applicant matching & resume optimization suite:
- PDF/Word resume upload with instant text parsing.
- Match score calculator against target job descriptions.
- Missing keyword identifier, hard vs. soft skill distribution, and ATS formatting check.

### 4. Financial & Market Analysis (`src/app/pages/FinancialAnalysis.tsx`, `src/app/pages/MarketAnalysis.tsx`)
Economic forecasting and competitive matrix:
- 3-Year & 5-Year projected ROI on education/career investments.
- Student Acquisition Cost (SAC) & Lifetime Value (LTV) models.
- Competitor market share distribution & market TAM charts.

### 5. Side-by-Side Comparison Matrix (`src/app/pages/Comparison.tsx`)
Direct comparison of fields, courses, or career tracks across metrics:
- Market demand, average salary, risk score, ROI, difficulty, and completion rate.

### 6. AI Assistant Modal & Search Chat (`src/app/components/AIAssistantModal.tsx`, `src/app/components/AISearchChat.tsx`)
Interactive conversational intelligence interface:
- Voice input speech recognition (`webkitSpeechRecognition`).
- Pre-built quick prompt templates (Computer Science, Mathematics, Data Science, Medical, Business).
- Real-time streaming response simulator with expandable rationale chips.

---

## Database Schema (`server/db.js` / SQLite)

- **`users`**: `id`, `email`, `password_hash`, `full_name`, `role`, `created_at`
- **`user_profiles`**: `user_id`, `avatar_url`, `education_level`, `target_role`, `interests`, `updated_at`
- **`query_history`**: `id`, `user_id`, `query_text`, `category`, `domain`, `sentiment_score`, `bias_score`, `created_at`
- **`saved_suggestions`**: `id`, `user_id`, `suggestion_title`, `metadata_json`, `saved_at`
- **`notifications`**: `id`, `user_id`, `type`, `title`, `body`, `read`, `created_at`
- **`user_settings`**: `user_id`, `theme`, `email_alerts`, `ai_mode`, `privacy_level`

---

## Express Backend API Routes

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/register` | Create a new user account | ❌ No |
| `POST` | `/api/auth/login` | Authenticate user & issue JWT | ❌ No |
| `GET` | `/api/auth/me` | Fetch current authenticated user | ✅ Yes |
| `GET` | `/api/profiles/me` | Get user profile details | ✅ Yes |
| `PUT` | `/api/profiles/me` | Update user profile | ✅ Yes |
| `GET` | `/api/history` | Retrieve user search history | ✅ Yes |
| `POST` | `/api/history` | Record query in history | ✅ Yes |
| `GET` | `/api/saved` | Fetch saved recommendations | ✅ Yes |
| `POST` | `/api/saved` | Save a recommendation | ✅ Yes |
| `DELETE` | `/api/saved/:id` | Remove saved recommendation | ✅ Yes |
| `GET` | `/api/notifications` | Get user notifications | ✅ Yes |
| `PUT` | `/api/notifications/read` | Mark notifications as read | ✅ Yes |
| `GET` | `/health` | Server health check endpoint | ❌ No |

---

## How to Run the Application

### Combined Frontend & Backend Dev Server
```bash
node start.js
```
- Frontend: `http://localhost:5173/`
- Backend API: `http://localhost:3001/`

### Individual Commands
- **Frontend Dev**: `npm run dev`
- **Backend Server**: `cd server && npm start`
- **Production Build**: `npm run build`
