import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNotifications } from '../hooks/useNotifications';

/* ─── Types ─────────────────────────────────────────────── */
export interface AppNotification {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  type: 'insight' | 'alert' | 'update' | 'success';
}

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  fullName: string;
  plan: string;
  avatarUrl?: string;
}

interface AppContextValue {
  /* ── auth ── */
  isAuthenticated: boolean;
  currentUser: AuthUser | null;
  authLoading: boolean;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (data: { username: string; email: string; fullName: string; password: string }) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;

  /* ── search-gate: query typed before login ── */
  pendingQuery: string;
  setPendingQuery: (q: string) => void;

  /* ── notifications ── */
  notifications: AppNotification[];
  addNotification: (n: Omit<AppNotification, 'id' | 'read' | 'time'>) => void;
  markAllRead: () => void;
  unreadCount: number;

  /* ── last query (sign-out UX) ── */
  lastQuery: string;
  setLastQuery: (q: string) => void;

  /* ── sign-out confirmation overlay ── */
  isSignedOut: boolean;
  signOut: () => void;
  cancelSignOut: () => void;
}

const AppContext = createContext<AppContextValue | null>(null);

/* ─── Provider ───────────────────────────────────────────── */
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

  // Notifications from Supabase
  const notifHook = useNotifications(currentUser?.id);

  // Map DB notifications → AppNotification format for backward compatibility
  const notifications: AppNotification[] = notifHook.notifications.map(n => ({
    id: n.id,
    title: n.title,
    body: n.body,
    time: formatTimeAgo(n.created_at),
    read: n.read,
    type: n.type,
  }));

  const [pendingQuery, setPendingQuery] = useState('');
  const [lastQuery, setLastQuery] = useState('');
  const [isSignedOut, setIsSignedOut] = useState(false);

  // Login — calls Supabase Auth
  const login = useCallback(async (email: string, password: string): Promise<{ ok: boolean; error?: string }> => {
    const result = await auth.signIn(email, password);
    return result;
  }, [auth]);

  // Register — calls Supabase Auth
  const register = useCallback(async (data: {
    username: string; email: string; fullName: string; password: string;
  }): Promise<{ ok: boolean; error?: string }> => {
    const result = await auth.signUp(data);
    return result;
  }, [auth]);

  // Logout — calls Supabase Auth + resets local state
  const logout = useCallback(async () => {
    await auth.signOut();
    setLastQuery('');
    setPendingQuery('');
    setIsSignedOut(false);
  }, [auth]);

  // Add notification via Supabase
  const addNotification = useCallback((n: Omit<AppNotification, 'id' | 'read' | 'time'>) => {
    notifHook.addNotification({
      title: n.title,
      body: n.body,
      type: n.type,
    });
  }, [notifHook]);

  const markAllRead = useCallback(() => {
    notifHook.markAllRead();
  }, [notifHook]);

  const signOut = useCallback(() => setIsSignedOut(true), []);
  const cancelSignOut = useCallback(() => setIsSignedOut(false), []);

  return (
    <AppContext.Provider value={{
      isAuthenticated: auth.isAuthenticated,
      currentUser,
      authLoading: auth.loading,
      login, register, logout,
      pendingQuery, setPendingQuery,
      notifications, addNotification, markAllRead,
      unreadCount: notifHook.unreadCount,
      lastQuery, setLastQuery,
      isSignedOut, signOut, cancelSignOut,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

/* ─── Helper ─────────────────────────────────────────────── */
function formatTimeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return 'Just now';
  if (min < 60) return `${min} min ago`;
  const hr = Math.floor(diff / 3600000);
  if (hr < 24) return `${hr} hr ago`;
  const day = Math.floor(diff / 86400000);
  if (day < 7) return `${day}d ago`;
  return new Date(timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
}
