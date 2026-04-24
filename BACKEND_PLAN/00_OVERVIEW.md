# CideDec — Supabase Backend & Database Plan

## Master Overview

This document is the index for the full backend migration plan. Each phase has its own detailed file.

---

## Architecture Summary

```
┌──────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                    │
│  Vite + React 18 + TailwindCSS + Motion + Recharts       │
│                                                          │
│  src/lib/supabase.ts  ←── Supabase Client (singleton)    │
│  src/hooks/*           ←── Data access hooks              │
│  src/app/AppContext    ←── Auth state from Supabase       │
└──────────────┬───────────────────────────────────────────┘
               │  HTTPS (Supabase JS SDK)
               ▼
┌──────────────────────────────────────────────────────────┐
│                   SUPABASE (BaaS)                        │
│                                                          │
│  ┌─────────┐  ┌──────────┐  ┌─────────┐  ┌───────────┐  │
│  │  Auth    │  │ Database │  │ Storage │  │ Realtime  │  │
│  │(GoTrue) │  │(Postgres)│  │ (S3)    │  │(WebSocket)│  │
│  └─────────┘  └──────────┘  └─────────┘  └───────────┘  │
│                                                          │
│  8 Tables · RLS on all · 2 Triggers · Indexes            │
└──────────────────────────────────────────────────────────┘
```

---

## Phase List

| Phase | File | What it covers |
|---|---|---|
| **Phase 1** | `01_SETUP.md` | Supabase project creation, SDK install, client init, env vars |
| **Phase 2** | `02_DATABASE.md` | All 8 tables — full SQL, RLS policies, triggers, indexes, ER diagram |
| **Phase 3** | `03_AUTH.md` | Replace mock auth with Supabase Auth — exact code changes |
| **Phase 4** | `04_HOOKS.md` | 6 custom data hooks — full TypeScript code for each |
| **Phase 5** | `05_FRONTEND.md` | Frontend integration — wire hooks into existing components |
| **Phase 6** | `06_REALTIME.md` | Real-time notifications, avatar uploads, session persistence |

---

## Database Tables (8)

| # | Table | Purpose | Rows per user |
|---|---|---|---|
| 1 | `profiles` | User profile (extends auth.users) | 1 |
| 2 | `query_history` | Every search query + results | ~10–50/month |
| 3 | `notifications` | Bell notifications | ~5–20/month |
| 4 | `saved_analyses` | Bookmarked analyses | ~2–10/month |
| 5 | `chat_sessions` | AI chat conversations | ~1–5/month |
| 6 | `chat_messages` | Messages within chats | ~10–100/session |
| 7 | `user_settings` | Preferences & config | 1 |
| 8 | `gamification` | Score, level, badges, streak | 1 |

---

## New Files to Create (10)

| File | Purpose |
|---|---|
| `src/lib/supabase.ts` | Supabase client singleton |
| `src/lib/database.types.ts` | Auto-generated TypeScript types |
| `.env.local` | Supabase URL + Anon Key |
| `src/hooks/useAuth.ts` | Auth hook |
| `src/hooks/useQueryHistory.ts` | Query CRUD + stats |
| `src/hooks/useNotifications.ts` | Notification CRUD + realtime |
| `src/hooks/useGamification.ts` | Gamification read/update |
| `src/hooks/useSavedAnalyses.ts` | Saved analyses CRUD |
| `src/hooks/useChatSessions.ts` | Chat sessions + messages |
| `src/hooks/useProfile.ts` | Profile + settings CRUD |

## Files to Modify (7)

| File | Changes |
|---|---|
| `package.json` | Add `@supabase/supabase-js` |
| `AppContext.tsx` | Replace mock auth → Supabase Auth |
| `SearchAuthModal.tsx` | Email-based auth + Supabase errors |
| `SmartSuggestions.tsx` | Persist queries, notifications, gamification |
| `MyProfile.tsx` | Real data from DB |
| `SettingsPanel.tsx` | Read/write settings from DB |
| `AIAssistantModal.tsx` | Persist chat sessions + messages |

---

## Prerequisites

1. **Create a Supabase account** at [supabase.com](https://supabase.com)
2. **Create a new project** (choose a region close to your users)
3. **Copy the Project URL and Anon Key** from Settings → API
4. Have Node.js 18+ and pnpm installed
