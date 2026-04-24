import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { QueryHistoryRow, QueryHistoryInsert } from '../lib/database.types';

interface QueryStats {
  totalQueries: number;
  averageScore: number;
  topDomain: string;
  recentQueries: QueryHistoryRow[];
}

export function useQueryHistory() {
  const [loading, setLoading] = useState(false);

  const saveQuery = useCallback(async (data: QueryHistoryInsert) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { error: 'Not authenticated' };

    const { error } = await supabase
      .from('query_history')
      .insert({ ...data, user_id: user.id });

    if (error) return { error: error.message };
    return { error: null };
  }, []);

  const fetchHistory = useCallback(async (
    page = 1,
    limit = 20
  ): Promise<{ data: QueryHistoryRow[]; count: number }> => {
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
    return { data: (data ?? []) as QueryHistoryRow[], count: count ?? 0 };
  }, []);

  const deleteQuery = useCallback(async (id: string) => {
    const { error } = await supabase
      .from('query_history')
      .delete()
      .eq('id', id);
    return { error: error?.message ?? null };
  }, []);

  const getStats = useCallback(async (): Promise<QueryStats> => {
    const { data } = await supabase
      .from('query_history')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);

    if (!data || data.length === 0) {
      return { totalQueries: 0, averageScore: 0, topDomain: 'general', recentQueries: [] };
    }

    const totalQueries = data.length;
    const averageScore = Math.round(
      data.reduce((s, q) => s + (q as QueryHistoryRow).score, 0) / totalQueries
    );

    const domainCounts: Record<string, number> = {};
    data.forEach(q => {
      const d = (q as QueryHistoryRow).domain;
      domainCounts[d] = (domainCounts[d] || 0) + 1;
    });
    const topDomain = Object.entries(domainCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0] ?? 'general';

    return {
      totalQueries,
      averageScore,
      topDomain,
      recentQueries: (data.slice(0, 5) as QueryHistoryRow[]),
    };
  }, []);

  return { saveQuery, fetchHistory, deleteQuery, getStats, loading };
}
