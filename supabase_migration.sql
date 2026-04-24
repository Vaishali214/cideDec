-- ════════════════════════════════════════════════════════════
-- CideDec — Supabase Database Migration
-- Run this in: Supabase Dashboard → SQL Editor → New Query → Run
-- ════════════════════════════════════════════════════════════

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

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, full_name, email)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

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

CREATE POLICY "qh_select_own" ON public.query_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "qh_insert_own" ON public.query_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "qh_delete_own" ON public.query_history FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_qh_user    ON public.query_history(user_id);
CREATE INDEX idx_qh_domain  ON public.query_history(domain);
CREATE INDEX idx_qh_created ON public.query_history(created_at DESC);

-- ============================================
-- TABLE 3: notifications
-- ============================================
CREATE TABLE public.notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL DEFAULT '',
  type        TEXT NOT NULL DEFAULT 'update' CHECK (type IN ('insight', 'alert', 'update', 'success')),
  read        BOOLEAN NOT NULL DEFAULT false,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "notif_select_own" ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "notif_insert_own" ON public.notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "notif_update_own" ON public.notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "notif_delete_own" ON public.notifications FOR DELETE USING (auth.uid() = user_id);

CREATE INDEX idx_notif_user   ON public.notifications(user_id);
CREATE INDEX idx_notif_unread ON public.notifications(user_id, read) WHERE NOT read;

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

CREATE POLICY "saved_all_own" ON public.saved_analyses FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_saved_user ON public.saved_analyses(user_id);

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

CREATE POLICY "sessions_all_own" ON public.chat_sessions FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

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

CREATE POLICY "messages_select_via_session" ON public.chat_messages FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.chat_sessions
    WHERE chat_sessions.id = chat_messages.session_id AND chat_sessions.user_id = auth.uid()
  ));

CREATE POLICY "messages_insert_via_session" ON public.chat_messages FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.chat_sessions
    WHERE chat_sessions.id = chat_messages.session_id AND chat_sessions.user_id = auth.uid()
  ));

CREATE INDEX idx_messages_session ON public.chat_messages(session_id, created_at);

-- ============================================
-- TABLE 7: user_settings
-- ============================================
CREATE TABLE public.user_settings (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email_notifications   BOOLEAN NOT NULL DEFAULT true,
  push_notifications    BOOLEAN NOT NULL DEFAULT false,
  theme_preference      TEXT NOT NULL DEFAULT 'light' CHECK (theme_preference IN ('light', 'dark', 'system')),
  language              TEXT NOT NULL DEFAULT 'en',
  display_preferences   JSONB DEFAULT '{}'::jsonb,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "settings_all_own" ON public.user_settings FOR ALL
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

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

CREATE POLICY "gami_select_own" ON public.gamification FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "gami_update_own" ON public.gamification FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "gami_insert_own" ON public.gamification FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ============================================
-- TRIGGER: Auto-create child rows on profile creation
-- ============================================
CREATE OR REPLACE FUNCTION public.handle_new_profile()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id) VALUES (NEW.id);
  INSERT INTO public.gamification (user_id) VALUES (NEW.id);
  INSERT INTO public.notifications (user_id, title, body, type)
  VALUES (NEW.id, 'Welcome to CideDec!', 'Start exploring decisions with AI-powered intelligence.', 'success');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_profile();

-- ============================================
-- REALTIME: Enable for notifications
-- ============================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
