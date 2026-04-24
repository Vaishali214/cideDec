# Phase 4 — Data Persistence Hooks

## Overview
Create 5 custom hooks that handle all CRUD operations against Supabase tables.

---

## Step 4.1 — `useQueryHistory.ts`

```typescript
// src/hooks/useQueryHistory.ts
import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { QueryHistory } from '../lib/database.types';

interface QueryHistoryInsert {
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
}

interface QueryStats {
  totalQueries: number;
  averageScore: number;
  topDomain: string;
  recentQueries: QueryHistory[];
}

export function useQueryHistory() {
  const [loading, setLoading] = useState(false);

  // Save a query result to the database
  const saveQuery = useCallback(async (data: QueryHistoryInsert) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('query_history')
      .insert({ user_id: user.id, ...data });

    if (error) return { error: error.message };
    return { error: null };
  }, []);

  // Fetch paginated query history
  const fetchHistory = useCallback(async (
    page = 1,
    limit = 20
  ): Promise<{ data: QueryHistory[]; count: number }> => {
    setLoading(true);
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from('query_history')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to);

    setLoading(false);
    if (error) return { data: [], count: 0 };
    return { data: data as QueryHistory[], count: count ?? 0 };
  }, []);

  // Delete a query
  const deleteQuery = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('query_history')
      .delete()
      .eq('id', id);
    return { error: error?.message ?? null };
  }, []);

  // Get aggregated stats
  const getStats = useCallback(async (): Promise<QueryStats> => {
    const { data } = await supabase
      .from('query_history')
      .select('score, domain, query, created_at')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!data || data.length === 0) {
      return { totalQueries: 0, averageScore: 0, topDomain: 'general', recentQueries: [] };
    }

    const totalQueries = data.length;
    const averageScore = Math.round(data.reduce((s, q) => s + q.score, 0) / totalQueries);

    // Find most common domain
    const domainCounts: Record<string, number> = {};
    data.forEach(q => { domainCounts[q.domain] = (domainCounts[q.domain] || 0) + 1; });
    const topDomain = Object.entries(domainCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'general';

    return { totalQueries, averageScore, topDomain, recentQueries: data.slice(0, 5) as QueryHistory[] };
  }, []);

  return { saveQuery, fetchHistory, deleteQuery, getStats, loading };
}
```

---

## Step 4.2 — `useNotifications.ts`

```typescript
// src/hooks/useNotifications.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Notification } from '../lib/database.types';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Fetch all notifications on mount
  const fetchNotifications = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    setLoading(false);
    if (!error && data) {
      setNotifications(data as Notification[]);
    }
  }, [userId]);

  // Add a new notification
  const addNotification = useCallback(async (
    data: { title: string; body: string; type: 'insight' | 'alert' | 'update' | 'success' }
  ) => {
    if (!userId) return;

    const { data: inserted, error } = await supabase
      .from('notifications')
      .insert({ user_id: userId, ...data })
      .select()
      .single();

    if (!error && inserted) {
      setNotifications(prev => [inserted as Notification, ...prev].slice(0, 20));
    }
  }, [userId]);

  // Mark all as read
  const markAllRead = useCallback(async () => {
    if (!userId) return;

    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, [userId]);

  // Mark single as read
  const markRead = useCallback(async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  // Real-time subscription (Phase 6, but set up the hook now)
  useEffect(() => {
    if (!userId) return;

    fetchNotifications();

    // Subscribe to new notifications via Supabase Realtime
    let channel: RealtimeChannel;
    try {
      channel = supabase
        .channel(`notif-${userId}`)
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            const newNotif = payload.new as Notification;
            setNotifications(prev => [newNotif, ...prev].slice(0, 20));
          }
        )
        .subscribe();
    } catch (e) {
      // Realtime not available — fallback to polling in Phase 6
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [userId, fetchNotifications]);

  return { notifications, unreadCount, addNotification, markAllRead, markRead, loading };
}
```

---

## Step 4.3 — `useGamification.ts`

```typescript
// src/hooks/useGamification.ts
import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Gamification } from '../lib/database.types';

type UserLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert';

interface GamificationState {
  score: number;
  level: UserLevel;
  totalQueries: number;
  badges: string[];
  streak: number;
}

export function useGamification(userId: string | undefined) {
  const [state, setState] = useState<GamificationState>({
    score: 0, level: 'beginner', totalQueries: 0, badges: [], streak: 0,
  });

  // Fetch current gamification state
  const fetchGamification = useCallback(async () => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('gamification')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!error && data) {
      const g = data as Gamification;
      setState({
        score: g.total_score,
        level: g.level as UserLevel,
        totalQueries: g.total_queries,
        badges: g.badges,
        streak: g.streak,
      });
    }
  }, [userId]);

  // Update after a query — add score, compute badges, update streak
  const updateAfterQuery = useCallback(async (queryScore: number) => {
    if (!userId) return;

    // Fetch current state
    const { data: current } = await supabase
      .from('gamification')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (!current) return;

    const g = current as Gamification;
    const today = new Date().toISOString().split('T')[0];
    const lastDate = g.last_query_date;

    // Calculate new values
    const newTotalScore = g.total_score + queryScore;
    const newTotalQueries = g.total_queries + 1;
    const avg = newTotalScore / newTotalQueries;

    // Streak logic
    let newStreak = g.streak;
    if (lastDate === today) {
      // Same day — keep streak
    } else {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      newStreak = lastDate === yesterday ? g.streak + 1 : 1;
    }

    // Level
    const newLevel: UserLevel =
      avg >= 80 ? 'expert' :
      avg >= 65 ? 'advanced' :
      avg >= 45 ? 'intermediate' : 'beginner';

    // Badges
    const newBadges = [...g.badges];
    if (newTotalQueries >= 1 && !newBadges.includes('First Search')) newBadges.push('First Search');
    if (newTotalQueries >= 5 && !newBadges.includes('Explorer')) newBadges.push('Explorer');
    if (newTotalQueries >= 10 && !newBadges.includes('Analyst')) newBadges.push('Analyst');
    if (avg >= 70 && !newBadges.includes('Precision Thinker')) newBadges.push('Precision Thinker');
    if (avg >= 85 && !newBadges.includes('Domain Expert')) newBadges.push('Domain Expert');
    if (newTotalScore >= 500 && !newBadges.includes('Power User')) newBadges.push('Power User');
    if (newStreak >= 7 && !newBadges.includes('Week Warrior')) newBadges.push('Week Warrior');

    // Update in DB
    await supabase
      .from('gamification')
      .update({
        total_score: newTotalScore,
        total_queries: newTotalQueries,
        level: newLevel,
        badges: newBadges,
        streak: Math.min(newStreak, 30),
        last_query_date: today,
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId);

    // Update local state
    setState({
      score: newTotalScore,
      level: newLevel,
      totalQueries: newTotalQueries,
      badges: newBadges,
      streak: Math.min(newStreak, 30),
    });
  }, [userId]);

  return { ...state, fetchGamification, updateAfterQuery };
}
```

---

## Step 4.4 — `useSavedAnalyses.ts`

```typescript
// src/hooks/useSavedAnalyses.ts
import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { SavedAnalysis } from '../lib/database.types';

interface SaveAnalysisInput {
  title: string;
  query: string;
  domain: string;
  full_result: Record<string, unknown>;
  notes?: string;
}

export function useSavedAnalyses(userId: string | undefined) {
  const [analyses, setAnalyses] = useState<SavedAnalysis[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchSaved = useCallback(async () => {
    if (!userId) return;
    setLoading(true);

    const { data } = await supabase
      .from('saved_analyses')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    setLoading(false);
    if (data) setAnalyses(data as SavedAnalysis[]);
  }, [userId]);

  const saveAnalysis = useCallback(async (input: SaveAnalysisInput) => {
    if (!userId) return;

    const { data, error } = await supabase
      .from('saved_analyses')
      .insert({ user_id: userId, ...input })
      .select()
      .single();

    if (!error && data) {
      setAnalyses(prev => [data as SavedAnalysis, ...prev]);
    }
    return { error: error?.message ?? null };
  }, [userId]);

  const toggleFavorite = useCallback(async (id: string) => {
    const analysis = analyses.find(a => a.id === id);
    if (!analysis) return;

    await supabase
      .from('saved_analyses')
      .update({ is_favorite: !analysis.is_favorite })
      .eq('id', id);

    setAnalyses(prev =>
      prev.map(a => a.id === id ? { ...a, is_favorite: !a.is_favorite } : a)
    );
  }, [analyses]);

  const deleteAnalysis = useCallback(async (id: string) => {
    await supabase.from('saved_analyses').delete().eq('id', id);
    setAnalyses(prev => prev.filter(a => a.id !== id));
  }, []);

  return { analyses, loading, fetchSaved, saveAnalysis, toggleFavorite, deleteAnalysis };
}
```

---

## Step 4.5 — `useChatSessions.ts`

```typescript
// src/hooks/useChatSessions.ts
import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ChatSession, ChatMessage } from '../lib/database.types';

export function useChatSessions(userId: string | undefined) {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (data) setSessions(data as ChatSession[]);
  }, [userId]);

  const createSession = useCallback(async (domain = 'general') => {
    if (!userId) return null;

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({ user_id: userId, context_domain: domain })
      .select()
      .single();

    if (error || !data) return null;
    const session = data as ChatSession;
    setSessions(prev => [session, ...prev]);
    setActiveSession(session.id);
    setMessages([]);
    return session;
  }, [userId]);

  const fetchMessages = useCallback(async (sessionId: string) => {
    const { data } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('session_id', sessionId)
      .order('created_at', { ascending: true });

    if (data) {
      setMessages(data as ChatMessage[]);
      setActiveSession(sessionId);
    }
  }, []);

  const sendMessage = useCallback(async (sessionId: string, content: string) => {
    // Insert user message
    const { data: userMsg } = await supabase
      .from('chat_messages')
      .insert({ session_id: sessionId, role: 'user', content })
      .select()
      .single();

    if (userMsg) {
      setMessages(prev => [...prev, userMsg as ChatMessage]);
    }

    // Update session title from first message
    const sessionData = sessions.find(s => s.id === sessionId);
    if (sessionData?.title === 'New Chat') {
      const title = content.length > 50 ? content.slice(0, 50) + '...' : content;
      await supabase
        .from('chat_sessions')
        .update({ title, updated_at: new Date().toISOString() })
        .eq('id', sessionId);

      setSessions(prev =>
        prev.map(s => s.id === sessionId ? { ...s, title } : s)
      );
    }

    // Update session timestamp
    await supabase
      .from('chat_sessions')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', sessionId);

    return userMsg as ChatMessage;
  }, [sessions]);

  const saveAssistantMessage = useCallback(async (sessionId: string, content: string, metadata = {}) => {
    const { data } = await supabase
      .from('chat_messages')
      .insert({ session_id: sessionId, role: 'assistant', content, metadata })
      .select()
      .single();

    if (data) {
      setMessages(prev => [...prev, data as ChatMessage]);
    }
  }, []);

  return {
    sessions, messages, activeSession,
    fetchSessions, createSession, fetchMessages,
    sendMessage, saveAssistantMessage, setActiveSession,
  };
}
```

---

## Step 4.6 — `useProfile.ts`

```typescript
// src/hooks/useProfile.ts
import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile, UserSettings } from '../lib/database.types';

export function useProfile(userId: string | undefined) {

  const fetchProfile = useCallback(async (): Promise<Profile | null> => {
    if (!userId) return null;
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    return data as Profile | null;
  }, [userId]);

  const updateProfile = useCallback(async (
    updates: Partial<Pick<Profile, 'full_name' | 'avatar_url' | 'username'>>
  ) => {
    if (!userId) return { error: 'Not authenticated' };
    const { error } = await supabase
      .from('profiles')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', userId);
    return { error: error?.message ?? null };
  }, [userId]);

  const fetchSettings = useCallback(async (): Promise<UserSettings | null> => {
    if (!userId) return null;
    const { data } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    return data as UserSettings | null;
  }, [userId]);

  const updateSettings = useCallback(async (
    updates: Partial<Omit<UserSettings, 'id' | 'user_id'>>
  ) => {
    if (!userId) return;
    await supabase
      .from('user_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
  }, [userId]);

  // Upload avatar to Supabase Storage
  const uploadAvatar = useCallback(async (file: File) => {
    if (!userId) return { url: null, error: 'Not authenticated' };

    const ext = file.name.split('.').pop();
    const path = `${userId}/avatar.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true });

    if (uploadError) return { url: null, error: uploadError.message };

    const { data: urlData } = supabase.storage
      .from('avatars')
      .getPublicUrl(path);

    // Update profile with new avatar URL
    await updateProfile({ avatar_url: urlData.publicUrl });

    return { url: urlData.publicUrl, error: null };
  }, [userId, updateProfile]);

  return { fetchProfile, updateProfile, fetchSettings, updateSettings, uploadAvatar };
}
```

---

## ✅ Phase 4 Checklist

- [ ] `src/hooks/useQueryHistory.ts` — save, fetch, delete, stats
- [ ] `src/hooks/useNotifications.ts` — fetch, add, markAllRead, markRead, realtime
- [ ] `src/hooks/useGamification.ts` — fetch, updateAfterQuery (score, badges, streak, level)
- [ ] `src/hooks/useSavedAnalyses.ts` — save, fetch, toggleFavorite, delete
- [ ] `src/hooks/useChatSessions.ts` — create, fetch, sendMessage, saveAssistant
- [ ] `src/hooks/useProfile.ts` — fetchProfile, updateProfile, settings, avatar upload
