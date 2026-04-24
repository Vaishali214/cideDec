import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { ChatSessionRow, ChatMessageRow } from '../lib/database.types';

export function useChatSessions(userId: string | undefined) {
  const [sessions, setSessions] = useState<ChatSessionRow[]>([]);
  const [messages, setMessages] = useState<ChatMessageRow[]>([]);
  const [activeSession, setActiveSession] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from('chat_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (data) setSessions(data as ChatSessionRow[]);
  }, [userId]);

  const createSession = useCallback(async (domain = 'general') => {
    if (!userId) return null;

    const { data, error } = await supabase
      .from('chat_sessions')
      .insert({ user_id: userId, context_domain: domain })
      .select()
      .single();

    if (error || !data) return null;
    const session = data as ChatSessionRow;
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
      setMessages(data as ChatMessageRow[]);
      setActiveSession(sessionId);
    }
  }, []);

  const sendMessage = useCallback(async (sessionId: string, content: string) => {
    // Insert user message
    const { data: userMsg } = await supabase
      .from('chat_messages')
      .insert({ session_id: sessionId, role: 'user' as const, content })
      .select()
      .single();

    if (userMsg) {
      setMessages(prev => [...prev, userMsg as ChatMessageRow]);
    }

    // Update session title from first message if still default
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
    } else {
      // Just update the timestamp
      await supabase
        .from('chat_sessions')
        .update({ updated_at: new Date().toISOString() })
        .eq('id', sessionId);
    }

    return userMsg as ChatMessageRow;
  }, [sessions]);

  const saveAssistantMessage = useCallback(async (
    sessionId: string,
    content: string,
    metadata: Record<string, unknown> = {}
  ) => {
    const { data } = await supabase
      .from('chat_messages')
      .insert({ session_id: sessionId, role: 'assistant' as const, content, metadata })
      .select()
      .single();

    if (data) {
      setMessages(prev => [...prev, data as ChatMessageRow]);
    }
  }, []);

  const deleteSession = useCallback(async (sessionId: string) => {
    await supabase.from('chat_sessions').delete().eq('id', sessionId);
    setSessions(prev => prev.filter(s => s.id !== sessionId));
    if (activeSession === sessionId) {
      setActiveSession(null);
      setMessages([]);
    }
  }, [activeSession]);

  return {
    sessions, messages, activeSession,
    fetchSessions, createSession, fetchMessages,
    sendMessage, saveAssistantMessage, setActiveSession,
    deleteSession,
  };
}
