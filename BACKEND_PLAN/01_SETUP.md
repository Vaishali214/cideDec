# Phase 1 — Supabase Project Setup

## Overview
Install the Supabase SDK, create the client singleton, and configure environment variables.

---

## Step 1.1 — Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **"New Project"**
3. Fill in:
   - **Name:** `cidedec`
   - **Database Password:** (save this — you'll need it for direct DB access)
   - **Region:** Choose closest to your users (e.g., `ap-south-1` for India)
4. Wait ~2 minutes for provisioning

---

## Step 1.2 — Get API Credentials

1. Go to **Settings → API** in your Supabase dashboard
2. Copy these two values:

```
Project URL:    https://xxxxx.supabase.co
Anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

> ⚠️ NEVER copy the `service_role` key — that bypasses all security.

---

## Step 1.3 — Install Supabase SDK

Run in your project root:

```bash
pnpm add @supabase/supabase-js
```

This adds the official Supabase JavaScript client (~50KB gzipped).

---

## Step 1.4 — Create Environment File

Create `.env.local` in the project root:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx
```

**Why `VITE_` prefix?** Vite only exposes env vars prefixed with `VITE_` to the client bundle.

Add to `.gitignore`:
```
.env.local
```

---

## Step 1.5 — Create Supabase Client Singleton

Create `src/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

// Read from environment variables (Vite exposes VITE_ prefixed vars)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    'Missing Supabase environment variables. ' +
    'Please create a .env.local file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
  );
}

// Single instance — reused across the entire app
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Persist session in localStorage (default behavior)
    persistSession: true,
    // Automatically refresh tokens before they expire
    autoRefreshToken: true,
    // Detect session from URL (for OAuth redirects)
    detectSessionInUrl: true,
  },
});
```

---

## Step 1.6 — Create Type Definitions File (Placeholder)

Create `src/lib/database.types.ts`:

```typescript
// This file will be auto-generated after we create the database schema.
// For now, define the basic types manually.
// Later, run: npx supabase gen types typescript --project-id YOUR_PROJECT_ID > src/lib/database.types.ts

export interface Profile {
  id: string;
  username: string;
  full_name: string;
  email: string;
  avatar_url: string | null;
  plan: 'Free' | 'Pro' | 'Enterprise';
  created_at: string;
  updated_at: string;
}

export interface QueryHistory {
  id: string;
  user_id: string;
  query: string;
  domain: string;
  score: number;
  confidence: number;
  theme: string;
  result_summary: Record<string, unknown>;
  intelligence: Record<string, unknown>;
  decision_dna: Record<string, unknown>;
  ai_vs_human: Record<string, unknown>;
  timeline: Record<string, unknown>[];
  created_at: string;
}

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: 'insight' | 'alert' | 'update' | 'success';
  read: boolean;
  created_at: string;
}

export interface SavedAnalysis {
  id: string;
  user_id: string;
  title: string;
  query: string;
  domain: string;
  full_result: Record<string, unknown>;
  notes: string;
  is_favorite: boolean;
  created_at: string;
  updated_at: string;
}

export interface ChatSession {
  id: string;
  user_id: string;
  title: string;
  context_domain: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessage {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface UserSettings {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  theme_preference: 'light' | 'dark' | 'system';
  language: string;
  display_preferences: Record<string, unknown>;
  updated_at: string;
}

export interface Gamification {
  id: string;
  user_id: string;
  total_score: number;
  total_queries: number;
  level: string;
  badges: string[];
  streak: number;
  last_query_date: string | null;
  updated_at: string;
}
```

---

## Step 1.7 — Verify Setup

Create a quick test in your browser console (or a temp component):

```typescript
import { supabase } from '../lib/supabase';

// Test connection
const { data, error } = await supabase.auth.getSession();
console.log('Supabase connected:', !error);
console.log('Session:', data);
```

If you see `Supabase connected: true`, Phase 1 is complete.

---

## Files Created in Phase 1

| File | Size | Purpose |
|---|---|---|
| `.env.local` | ~200 bytes | Supabase credentials |
| `src/lib/supabase.ts` | ~600 bytes | Client singleton |
| `src/lib/database.types.ts` | ~2.5 KB | TypeScript type definitions |

## Files Modified in Phase 1

| File | Change |
|---|---|
| `package.json` | Added `@supabase/supabase-js` dependency |
| `.gitignore` | Added `.env.local` |

---

## ✅ Phase 1 Checklist

- [ ] Supabase project created
- [ ] Project URL and Anon Key copied
- [ ] `@supabase/supabase-js` installed
- [ ] `.env.local` created with credentials
- [ ] `src/lib/supabase.ts` created
- [ ] `src/lib/database.types.ts` created
- [ ] Connection verified in browser
