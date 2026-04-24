import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { NotificationRow } from '../lib/database.types';
import type { RealtimeChannel } from '@supabase/supabase-js';

export function useNotifications(userId: string | undefined) {
  const [notifications, setNotifications] = useState<NotificationRow[]>([]);
  const [loading, setLoading] = useState(true);

  const unreadCount = notifications.filter(n => !n.read).length;

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
      setNotifications(data as NotificationRow[]);
    }
  }, [userId]);

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
      setNotifications(prev => [inserted as NotificationRow, ...prev].slice(0, 20));
    }
  }, [userId]);

  const markAllRead = useCallback(async () => {
    if (!userId) return;

    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('user_id', userId)
      .eq('read', false);

    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, [userId]);

  const markRead = useCallback(async (id: string) => {
    await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', id);

    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  }, []);

  // Fetch on mount + subscribe to real-time inserts
  useEffect(() => {
    if (!userId) {
      setNotifications([]);
      setLoading(false);
      return;
    }

    fetchNotifications();

    let channel: RealtimeChannel | undefined;
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
            const newNotif = payload.new as NotificationRow;
            setNotifications(prev => [newNotif, ...prev].slice(0, 20));
          }
        )
        .subscribe();
    } catch {
      // Realtime not available — graceful fallback
    }

    return () => {
      if (channel) supabase.removeChannel(channel);
    };
  }, [userId, fetchNotifications]);

  return { notifications, unreadCount, addNotification, markAllRead, markRead, loading };
}
