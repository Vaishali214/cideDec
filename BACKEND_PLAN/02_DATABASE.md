# Phase 2 — Database Schema (PostgreSQL)

## Overview
Create all 8 tables in Supabase with Row Level Security, triggers, and indexes.

**Run this SQL in:** Supabase Dashboard → SQL Editor → New Query → Paste → Run

---

## Entity Relationship Diagram

```
auth.users (Supabase built-in)
    │
    │ ON INSERT trigger → handle_new_user()
    ▼
┌─────────────┐
│  profiles    │ ←── 1 per user (auto-created)
│  (1:1)       │
└──────┬──────┘
       │ ON INSERT trigger → handle_new_profile()
       │     → auto-creates user_settings
       │     → auto-creates gamification
       │     → auto-creates welcome notification
       │
       ├────────────► query_history      (1:many)
       ├────────────► notifications      (1:many)
       ├────────────► saved_analyses     (1:many)
       ├────────────► chat_sessions      (1:many)
       │                  └──────────► chat_messages (1:many)
       ├────────────► user_settings      (1:1)
       └────────────► gamification       (1:1)
```

---

## Step 2.1 — Profiles Table

**Purpose:** Extends `auth.users` with app-specific fields (username, plan, avatar).

```sql
-- ============================================
-- TABLE 1: profiles
-- ============================================
CREATE TABLE public.profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username    TEXT UNIQUE NOT NULL,
  full_name   TEXT NOT NULL DEFAULT '',
  email       TEXT NOT NULL,
  avatar_url  TEXT,
  plan        TEXT NOT NULL DEFAULT 'Free'
              CHECK (plan IN ('Free', 'Pro', 'Enterprise')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can only read their own profile
CREATE POLICY "profiles_select_own"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- RLS Policy: Users can only update their own profile
CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policy: Allow insert during registration
CREATE POLICY "profiles_insert_own"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Trigger: Auto-create profile when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

**What happens on signup:**
1. User calls `supabase.auth.signUp({ email, password, options: { data: { username: 'vaish', full_name: 'Vaishali' } } })`
2. Supabase creates a row in `auth.users`
3. The trigger fires `handle_new_user()`
4. A `profiles` row is auto-created with username + full_name from the metadata

---

## Step 2.2 — Query History Table

**Purpose:** Stores every search query and its complete AI-generated results.

```sql
-- ============================================
-- TABLE 2: query_history
-- ============================================
CREATE TABLE public.query_history (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  query           TEXT NOT NULL,
  domain          TEXT NOT NULL DEFAULT 'general',
  score           INTEGER NOT NULL DEFAULT 0,
  confidence      INTEGER NOT NULL DEFAULT 0,
  theme           TEXT NOT NULL DEFAULT 'neutral',
  result_summary  JSONB DEFAULT '{}'::jsonb,
  intelligence    JSONB DEFAULT '{}'::jsonb,
  decision_dna    JSONB DEFAULT '{}'::jsonb,
  ai_vs_human     JSONB DEFAULT '{}'::jsonb,
  timeline        JSONB DEFAULT '[]'::jsonb,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.query_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "query_history_select_own"
  ON public.query_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "query_history_insert_own"
  ON public.query_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "query_history_delete_own"
  ON public.query_history FOR DELETE
  USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_qh_user      ON public.query_history(user_id);
CREATE INDEX idx_qh_domain    ON public.query_history(domain);
CREATE INDEX idx_qh_created   ON public.query_history(created_at DESC);
```

**JSONB columns explained:**
- `result_summary` — KPIs array + chart specs (the `QueryResult` minus intelligence)
- `intelligence` — Full `QueryIntelligence` object (score, theme, bias flags, scenarios, etc.)
- `decision_dna` — `DecisionDNAData` (riskLevel, decisionStyle, traits, thinkingDepth)
- `ai_vs_human` — `AIvsHumanData` (ai points, human points, conflicts, trust meter)
- `timeline` — `TimelineNode[]` (5-node consequence timeline)

---

## Step 2.3 — Notifications Table

**Purpose:** Stores bell notifications triggered by queries and system events.

```sql
-- ============================================
-- TABLE 3: notifications
-- ============================================
CREATE TABLE public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL DEFAULT '',
  type        TEXT NOT NULL DEFAULT 'update'
              CHECK (type IN ('insight', 'alert', 'update', 'success')),
  read        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_select_own"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "notif_insert_own"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "notif_update_own"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "notif_delete_own"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id);

-- Index for fetching unread notifications quickly
CREATE INDEX idx_notif_user    ON public.notifications(user_id);
CREATE INDEX idx_notif_unread  ON public.notifications(user_id, read)
  WHERE NOT read;
```

---

## Step 2.4 — Saved Analyses Table

**Purpose:** Lets users bookmark/save query results for later review.

```sql
-- ============================================
-- TABLE 4: saved_analyses
-- ============================================
CREATE TABLE public.saved_analyses (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  query       TEXT NOT NULL,
  domain      TEXT NOT NULL DEFAULT 'general',
  full_result JSONB DEFAULT '{}'::jsonb,
  notes       TEXT DEFAULT '',
  is_favorite BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.saved_analyses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "saved_all_own"
  ON public.saved_analyses FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_saved_user ON public.saved_analyses(user_id);
```

---

## Step 2.5 — Chat Sessions & Messages Tables

**Purpose:** Persists AI Assistant chat conversations across page refreshes.

```sql
-- ============================================
-- TABLE 5: chat_sessions
-- ============================================
CREATE TABLE public.chat_sessions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title           TEXT NOT NULL DEFAULT 'New Chat',
  context_domain  TEXT DEFAULT 'general',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "sessions_all_own"
  ON public.chat_sessions FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_sessions_user ON public.chat_sessions(user_id);

-- ============================================
-- TABLE 6: chat_messages
-- ============================================
CREATE TABLE public.chat_messages (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id  UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  role        TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
  content     TEXT NOT NULL,
  metadata    JSONB DEFAULT '{}'::jsonb,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Messages are accessed through their parent session's ownership
CREATE POLICY "messages_select_via_session"
  ON public.chat_messages FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
        AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE POLICY "messages_insert_via_session"
  ON public.chat_messages FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.chat_sessions
      WHERE chat_sessions.id = chat_messages.session_id
        AND chat_sessions.user_id = auth.uid()
    )
  );

CREATE INDEX idx_messages_session ON public.chat_messages(session_id, created_at);
```

---

## Step 2.6 — User Settings Table

**Purpose:** Persists user preferences (theme, notifications, language).

```sql
-- ============================================
-- TABLE 7: user_settings
-- ============================================
CREATE TABLE public.user_settings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_notifications   BOOLEAN NOT NULL DEFAULT true,
  push_notifications    BOOLEAN NOT NULL DEFAULT false,
  theme_preference      TEXT NOT NULL DEFAULT 'light'
                        CHECK (theme_preference IN ('light', 'dark', 'system')),
  language              TEXT NOT NULL DEFAULT 'en',
  display_preferences   JSONB DEFAULT '{}'::jsonb,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_all_own"
  ON public.user_settings FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

---

## Step 2.7 — Gamification Table

**Purpose:** Tracks user score, level, badges, streak across sessions.

```sql
-- ============================================
-- TABLE 8: gamification
-- ============================================
CREATE TABLE public.gamification (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  total_score     INTEGER NOT NULL DEFAULT 0,
  total_queries   INTEGER NOT NULL DEFAULT 0,
  level           TEXT NOT NULL DEFAULT 'beginner',
  badges          TEXT[] NOT NULL DEFAULT '{}',
  streak          INTEGER NOT NULL DEFAULT 0,
  last_query_date DATE,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.gamification ENABLE ROW LEVEL SECURITY;

CREATE POLICY "gami_select_own"
  ON public.gamification FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "gami_update_own"
  ON public.gamification FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "gami_insert_own"
  ON public.gamification FOR INSERT
  WITH CHECK (auth.uid() = user_id);
```

---

## Step 2.8 — Auto-Setup Trigger

**Purpose:** When a profile is created, auto-create settings + gamification + welcome notification.

```sql
-- ============================================
-- TRIGGER: Auto-create child rows on profile creation
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  -- Create default settings
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id);

  -- Create gamification record
  INSERT INTO public.gamification (user_id)
  VALUES (NEW.id);

  -- Create welcome notification
  INSERT INTO public.notifications (user_id, title, body, type)
  VALUES (
    NEW.id,
    'Welcome to CideDec!',
    'Start exploring decisions with AI-powered intelligence. Try searching for "3-year ROI forecast" or "How to become a doctor".',
    'success'
  );

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();
```

**Full signup chain:**
```
User signs up → auth.users row created
  → handle_new_user() trigger fires
    → profiles row created
      → handle_new_profile() trigger fires
        → user_settings row created
        → gamification row created
        → welcome notification created
```

---

## Step 2.9 — Enable Realtime (Optional for Phase 6)

```sql
-- Enable realtime for notifications table (for live bell updates)
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
```

---

## How to Run This SQL

1. Open your Supabase Dashboard
2. Go to **SQL Editor** (left sidebar)
3. Click **"New Query"**
4. Copy-paste each step's SQL block one at a time (or all together)
5. Click **"Run"** (Ctrl+Enter)
6. Verify in **Table Editor** — you should see all 8 tables

---

## ✅ Phase 2 Checklist

- [ ] `profiles` table created with RLS + trigger
- [ ] `query_history` table created with RLS + indexes
- [ ] `notifications` table created with RLS + indexes
- [ ] `saved_analyses` table created with RLS
- [ ] `chat_sessions` table created with RLS
- [ ] `chat_messages` table created with RLS (via session)
- [ ] `user_settings` table created with RLS
- [ ] `gamification` table created with RLS
- [ ] `handle_new_user()` trigger active
- [ ] `handle_new_profile()` trigger active
- [ ] All 8 tables visible in Table Editor
- [ ] Test: create a user via Auth → verify profile + settings + gamification + notification auto-created
