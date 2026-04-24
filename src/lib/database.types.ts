/* ═══════════════════════════════════════════════
   Supabase Database Types
   Auto-generate later with: npx supabase gen types typescript
   For now these are hand-written to match our schema.
═══════════════════════════════════════════════ */

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

export interface QueryHistoryRow {
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

export type QueryHistoryInsert = Omit<QueryHistoryRow, 'id' | 'created_at'>;

export interface NotificationRow {
  id: string;
  user_id: string;
  title: string;
  body: string;
  type: 'insight' | 'alert' | 'update' | 'success';
  read: boolean;
  created_at: string;
}

export type NotificationInsert = Omit<NotificationRow, 'id' | 'read' | 'created_at'>;

export interface SavedAnalysisRow {
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

export type SavedAnalysisInsert = Omit<SavedAnalysisRow, 'id' | 'is_favorite' | 'created_at' | 'updated_at'>;

export interface ChatSessionRow {
  id: string;
  user_id: string;
  title: string;
  context_domain: string;
  created_at: string;
  updated_at: string;
}

export interface ChatMessageRow {
  id: string;
  session_id: string;
  role: 'user' | 'assistant';
  content: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface UserSettingsRow {
  id: string;
  user_id: string;
  email_notifications: boolean;
  push_notifications: boolean;
  theme_preference: 'light' | 'dark' | 'system';
  language: string;
  display_preferences: Record<string, unknown>;
  updated_at: string;
}

export interface GamificationRow {
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
