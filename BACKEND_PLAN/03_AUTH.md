# Phase 3 — Authentication Migration

## Overview
Replace the mock `MOCK_USERS` / `login()` / `register()` in `AppContext.tsx` with real Supabase Auth.

---

## What Changes

| Current (Mock) | New (Supabase) |
|---|---|
| `MOCK_USERS` object in memory | Supabase `auth.users` table (managed) |
| `login(username, password)` | `supabase.auth.signInWithPassword({ email, password })` |
| `register({username, email, fullName, password})` | `supabase.auth.signUp({ email, password, options: { data: { username, full_name } } })` |
| `logout()` | `supabase.auth.signOut()` |
| Session lost on refresh | Session persisted in localStorage by Supabase |
| No email verification | Real email verification (configurable) |

---

## Step 3.1 — Create `useAuth` Hook

Create `src/hooks/useAuth.ts`:

```typescript
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';
import type { Profile } from '../lib/database.types';

interface AuthState {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
}

interface SignUpData {
  username: string;
  email: string;
  fullName: string;
  password: string;
}

export function useAuth() {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    loading: true, // true until initial session check completes
  });

  // Fetch the profile from public.profiles for a given user ID
  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error.message);
      return null;
    }
    return data as Profile;
  }, []);

  // Listen for auth state changes (login, logout, token refresh)
  useEffect(() => {
    // 1. Check existing session on mount
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const profile = await fetchProfile(session.user.id);
        setState({ user: session.user, profile, session, loading: false });
      } else {
        setState({ user: null, profile: null, session: null, loading: false });
      }
    });

    // 2. Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' && session?.user) {
          // Small delay to allow the trigger to create the profile
          await new Promise(r => setTimeout(r, 500));
          const profile = await fetchProfile(session.user.id);
          setState({ user: session.user, profile, session, loading: false });
        } else if (event === 'SIGNED_OUT') {
          setState({ user: null, profile: null, session: null, loading: false });
        } else if (event === 'TOKEN_REFRESHED' && session?.user) {
          setState(prev => ({ ...prev, session, user: session.user }));
        }
      }
    );

    // 3. Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  // Sign up with email + password + metadata
  const signUp = useCallback(async (data: SignUpData) => {
    const { data: authData, error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          username: data.username,
          full_name: data.fullName,
        },
      },
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, user: authData.user };
  }, []);

  // Sign in with email + password
  const signIn = useCallback(async (email: string, password: string) => {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { ok: false, error: error.message };
    }

    return { ok: true, user: authData.user };
  }, []);

  // Sign out
  const signOut = useCallback(async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Sign out error:', error.message);
    }
  }, []);

  // Refresh profile data (call after profile updates)
  const refreshProfile = useCallback(async () => {
    if (state.user) {
      const profile = await fetchProfile(state.user.id);
      setState(prev => ({ ...prev, profile }));
    }
  }, [state.user, fetchProfile]);

  return {
    user: state.user,
    profile: state.profile,
    session: state.session,
    loading: state.loading,
    isAuthenticated: !!state.session,
    signUp,
    signIn,
    signOut,
    refreshProfile,
  };
}
```

---

## Step 3.2 — Update `AppContext.tsx`

Replace the entire auth section. Key changes:

**Remove:**
- `MOCK_USERS` record
- `login()` function (fake delay + mock check)
- `register()` function (fake delay + mock insert)
- `logout()` function (in-memory reset)

**Add:**
- Import and use `useAuth()` hook
- `onAuthStateChange` listener
- Profile fetch on auth change

```typescript
// NEW AppContext.tsx — key auth section changes

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';

// AuthUser type — now matches the Profile from Supabase
export interface AuthUser {
  id: string;        // ← NEW: UUID from auth.users
  username: string;
  email: string;
  fullName: string;
  plan: string;
  avatarUrl?: string; // ← NEW
}

// Inside AppProvider:
export function AppProvider({ children }: { children: ReactNode }) {
  const auth = useAuth();

  // Map Supabase profile → AuthUser for backward compatibility
  const currentUser: AuthUser | null = auth.profile
    ? {
        id: auth.profile.id,
        username: auth.profile.username,
        email: auth.profile.email,
        fullName: auth.profile.full_name,
        plan: auth.profile.plan,
        avatarUrl: auth.profile.avatar_url ?? undefined,
      }
    : null;

  // Login — now calls Supabase
  const login = useCallback(async (email: string, password: string) => {
    return auth.signIn(email, password);
  }, [auth]);

  // Register — now calls Supabase
  const register = useCallback(async (data: {
    username: string; email: string; fullName: string; password: string
  }) => {
    return auth.signUp(data);
  }, [auth]);

  // Logout — now calls Supabase
  const logout = useCallback(async () => {
    await auth.signOut();
    setLastQuery('');
    setPendingQuery('');
    setIsSignedOut(false);
  }, [auth]);

  // ... rest of state (notifications, lastQuery, etc.) stays the same
  // but notifications will be fetched from DB in Phase 4
}
```

**What stays the same:**
- `pendingQuery` / `setPendingQuery` — still in-memory (search gate UX)
- `lastQuery` / `setLastQuery` — still in-memory (sign-out UX)
- `isSignedOut` / `signOut` / `cancelSignOut` — still in-memory (overlay UX)
- Notification state shape — same, but source changes in Phase 4

---

## Step 3.3 — Update `SearchAuthModal.tsx`

**Key changes:**

1. **Login form:** Change from username → **email** + password
2. **Register form:** Keep username, email, fullName, password
3. **Error display:** Show Supabase error messages directly
4. **Remove fake delay:** Supabase provides real async

```typescript
// Login form changes:

// BEFORE (mock):
const handleLogin = async () => {
  const result = await login(username, password);
  // ...
};

// AFTER (Supabase):
const handleLogin = async () => {
  setLoading(true);
  const result = await login(email, password);  // email instead of username
  setLoading(false);
  if (!result.ok) {
    setError(result.error ?? 'Login failed');
    return;
  }
  onAuthSuccess();
};

// Register form changes:

// BEFORE (mock):
const handleRegister = async () => {
  const result = await register({ username, email, fullName, password });
  // ...
};

// AFTER (Supabase):
const handleRegister = async () => {
  setLoading(true);
  const result = await register({ username, email, fullName, password });
  setLoading(false);
  if (!result.ok) {
    setError(result.error ?? 'Registration failed');
    return;
  }
  onAuthSuccess();
};
```

**Form field changes:**
| Login (Before) | Login (After) |
|---|---|
| Username input | **Email** input (type="email") |
| Password input | Password input (same) |

| Register (Before) | Register (After) |
|---|---|
| Username input | Username input (same) |
| Email input | Email input (same) |
| Full Name input | Full Name input (same) |
| Password input | Password input (same, min 6 chars for Supabase) |

---

## Step 3.4 — Session Persistence

**Before (mock):** Refreshing the page = logged out. Always.

**After (Supabase):**
- Supabase stores the session JWT in `localStorage` automatically
- On app load, `supabase.auth.getSession()` restores the session
- The `loading` state in `useAuth` prevents flickering (shows nothing until session is checked)
- `onAuthStateChange` handles token refresh transparently

**Add to App.tsx — loading state:**
```typescript
function AppShell() {
  const { loading } = useApp(); // ← add loading from auth

  // Show nothing (or a spinner) until auth state is determined
  if (loading) {
    return (
      <div className="size-full flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-zinc-300 border-t-zinc-900 rounded-full animate-spin" />
      </div>
    );
  }

  // ... rest of AppShell
}
```

---

## Step 3.5 — Configure Supabase Auth Settings

In Supabase Dashboard → **Authentication → Settings:**

| Setting | Recommended Value | Why |
|---|---|---|
| Enable email signup | ✅ On | Primary auth method |
| Confirm email | ❌ Off (for dev) | Faster development; enable for production |
| Minimum password length | 6 | Supabase default |
| Enable email change | ✅ On | Let users update email |
| Mailer OTP expiration | 3600 (1hr) | Default |
| Site URL | `http://localhost:65185` | For redirects |
| Redirect URLs | `http://localhost:65185` | For OAuth callbacks |

---

## ✅ Phase 3 Checklist

- [ ] `src/hooks/useAuth.ts` created
- [ ] `AppContext.tsx` updated — `MOCK_USERS` removed
- [ ] `AppContext.tsx` — `login()` calls `supabase.auth.signInWithPassword()`
- [ ] `AppContext.tsx` — `register()` calls `supabase.auth.signUp()`
- [ ] `AppContext.tsx` — `logout()` calls `supabase.auth.signOut()`
- [ ] `SearchAuthModal.tsx` — login uses email (not username)
- [ ] `SearchAuthModal.tsx` — shows Supabase error messages
- [ ] `App.tsx` — loading spinner while auth state resolves
- [ ] Supabase Auth settings configured
- [ ] Test: Register → profile auto-created → login → refresh → still logged in → logout
