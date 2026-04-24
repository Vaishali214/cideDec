# Phase 5 — Frontend Integration

## Overview
Wire the Supabase hooks from Phase 4 into existing components so all data persists.

---

## Step 5.1 — SmartSuggestions.tsx (Core Search Persistence)

**Where:** Inside the search submit handler (after `classify()` + `analyzeIntelligence()`)

**Add after all AI engines run:**

```typescript
// At the top of SmartSuggestions component:
import { useQueryHistory } from '../../hooks/useQueryHistory';
import { useNotifications } from '../../hooks/useNotifications';
import { useGamification } from '../../hooks/useGamification';
import { useSavedAnalyses } from '../../hooks/useSavedAnalyses';
import { useApp } from '../AppContext';

// Inside the component:
const { currentUser, isAuthenticated } = useApp();
const { saveQuery } = useQueryHistory();
const { addNotification } = useNotifications(currentUser?.id);
const { updateAfterQuery } = useGamification(currentUser?.id);
const { saveAnalysis } = useSavedAnalyses(currentUser?.id);

// In the search handler, AFTER all engines run:
const handleSearch = async (query: string) => {
  // ... existing classify, analyzeIntelligence, generateForecast, etc.

  // ── NEW: Persist to Supabase ──
  if (isAuthenticated && currentUser) {
    // 1. Save query + all results to query_history
    await saveQuery({
      query: query,
      domain: intelligence.domain,
      score: intelligence.score,
      confidence: intelligence.confidence,
      theme: intelligence.theme,
      result_summary: {
        summary: result.summary,
        kpis: result.kpis,
        charts: result.charts,
        modules: result.modules,
      },
      intelligence: intelligence as unknown as Record<string, unknown>,
      decision_dna: dna as unknown as Record<string, unknown>,
      ai_vs_human: aiVsHuman as unknown as Record<string, unknown>,
      timeline: timeline as unknown as Record<string, unknown>[],
    });

    // 2. Save notification (if the result has one)
    if (result.notif) {
      await addNotification({
        title: result.notif.title,
        body: result.notif.body,
        type: result.notif.type,
      });
    }

    // 3. Update gamification
    await updateAfterQuery(intelligence.score);
  }
};
```

**Add "Save Analysis" button in the results area:**

```tsx
{isAuthenticated && (
  <motion.button
    onClick={() => saveAnalysis({
      title: `Analysis: ${currentQuery}`,
      query: currentQuery,
      domain: intelligence.domain,
      full_result: { ...result, intelligence, dna, aiVsHuman, timeline },
    })}
    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 text-white text-[11px] font-bold"
    whileTap={{ scale: 0.96 }}
  >
    <Bookmark className="w-3.5 h-3.5" /> Save Analysis
  </motion.button>
)}
```

---

## Step 5.2 — MyProfile.tsx (Real Profile Data)

**Replace hardcoded profile with Supabase data:**

```typescript
import { useEffect, useState } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { useQueryHistory } from '../../hooks/useQueryHistory';
import { useGamification } from '../../hooks/useGamification';
import { useSavedAnalyses } from '../../hooks/useSavedAnalyses';
import { useApp } from '../AppContext';

export function MyProfile({ onNavigate }) {
  const { currentUser } = useApp();
  const userId = currentUser?.id;

  const { fetchProfile, updateProfile, uploadAvatar } = useProfile(userId);
  const { fetchHistory, getStats } = useQueryHistory();
  const { fetchGamification, ...gamification } = useGamification(userId);
  const { analyses, fetchSaved } = useSavedAnalyses(userId);

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [history, setHistory] = useState([]);

  // Load all profile data on mount
  useEffect(() => {
    const load = async () => {
      const [p, s, h] = await Promise.all([
        fetchProfile(),
        getStats(),
        fetchHistory(1, 10),
      ]);
      setProfile(p);
      setStats(s);
      setHistory(h.data);
      await fetchGamification();
      await fetchSaved();
    };
    load();
  }, []);

  // Profile edit handler
  const handleSave = async (fullName: string) => {
    await updateProfile({ full_name: fullName });
    const updated = await fetchProfile();
    setProfile(updated);
  };

  // Avatar upload handler
  const handleAvatarUpload = async (file: File) => {
    const { url, error } = await uploadAvatar(file);
    if (url) {
      const updated = await fetchProfile();
      setProfile(updated);
    }
  };

  // Render: use profile.full_name, profile.plan, stats.totalQueries,
  // gamification.level, gamification.badges, history[], analyses[]
}
```

**Key UI changes:**
| Section | Before (mock) | After (Supabase) |
|---|---|---|
| Name / email | From `currentUser` in context (mock) | From `profiles` table |
| Query count | Not tracked | From `gamification.total_queries` |
| Recent queries | None | From `query_history` (last 10) |
| Saved analyses | None | From `saved_analyses` table |
| Badges | Not persisted | From `gamification.badges` |
| Avatar | None | From Supabase Storage |

---

## Step 5.3 — SettingsPanel.tsx (Persistent Settings)

```typescript
import { useEffect, useState } from 'react';
import { useProfile } from '../../hooks/useProfile';
import { useApp } from '../AppContext';

export function SettingsPanel({ onClose, onNavigate }) {
  const { currentUser } = useApp();
  const { fetchSettings, updateSettings } = useProfile(currentUser?.id);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    fetchSettings().then(setSettings);
  }, []);

  const handleToggle = async (key: string, value: boolean) => {
    await updateSettings({ [key]: value });
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleThemeChange = async (theme: 'light' | 'dark' | 'system') => {
    await updateSettings({ theme_preference: theme });
    setSettings(prev => ({ ...prev, theme_preference: theme }));
  };

  // Render settings with real values from DB
  // On toggle/change → updateSettings() → persists to user_settings table
}
```

---

## Step 5.4 — AIAssistantModal.tsx (Persistent Chat)

```typescript
import { useEffect } from 'react';
import { useChatSessions } from '../../hooks/useChatSessions';
import { useApp } from '../AppContext';

// Inside AIAssistantModal:
const { currentUser } = useApp();
const {
  sessions, messages, activeSession,
  fetchSessions, createSession, fetchMessages,
  sendMessage, saveAssistantMessage,
} = useChatSessions(currentUser?.id);

// On modal open:
useEffect(() => {
  fetchSessions();
}, []);

// When user sends a message:
const handleSend = async (content: string) => {
  // Create session if none active
  let sessionId = activeSession;
  if (!sessionId) {
    const session = await createSession();
    if (!session) return;
    sessionId = session.id;
  }

  // Save user message to DB
  await sendMessage(sessionId, content);

  // Generate AI response (existing client-side logic)
  const aiResponse = generateResponse(content); // existing function

  // Save assistant message to DB
  await saveAssistantMessage(sessionId, aiResponse);
};

// Session sidebar — list sessions, click to load messages:
const handleSelectSession = async (sessionId: string) => {
  await fetchMessages(sessionId);
};
```

---

## Step 5.5 — Dashboard.tsx (Real Aggregated Data)

```typescript
import { useQueryHistory } from '../../hooks/useQueryHistory';
import { useGamification } from '../../hooks/useGamification';

// Replace hardcoded KPIs with real stats:
const { getStats } = useQueryHistory();
const [stats, setStats] = useState(null);

useEffect(() => {
  getStats().then(setStats);
}, []);

// Map stats to KPI cards:
// stats.totalQueries → "Total Searches"
// stats.averageScore → "Avg Query Score"
// stats.topDomain → "Top Domain"
// stats.recentQueries → recent activity list
```

---

## Step 5.6 — Navigation.tsx (Real Notifications)

**Replace mock notification state with Supabase hook:**

```typescript
// Remove from AppContext: notifications, addNotification, markAllRead, unreadCount
// Instead, use the hook directly in Navigation:

import { useNotifications } from '../../hooks/useNotifications';
import { useApp } from '../AppContext';

export function Navigation(...) {
  const { currentUser } = useApp();
  const {
    notifications, unreadCount, markAllRead,
  } = useNotifications(currentUser?.id);

  // Bell icon + dropdown now uses real data from Supabase
  // markAllRead() updates the DB
  // New notifications appear in real-time (Phase 6)
}
```

---

## ✅ Phase 5 Checklist

- [ ] SmartSuggestions: queries persist to `query_history` on search
- [ ] SmartSuggestions: notifications persist to `notifications` table
- [ ] SmartSuggestions: gamification updates on each search
- [ ] SmartSuggestions: "Save Analysis" button added
- [ ] MyProfile: real profile, history, stats, badges from DB
- [ ] MyProfile: avatar upload to Supabase Storage
- [ ] SettingsPanel: read/write settings from DB
- [ ] AIAssistantModal: chat sessions + messages persist
- [ ] Dashboard: real aggregated stats from query_history
- [ ] Navigation: real notifications from DB with real-time updates
