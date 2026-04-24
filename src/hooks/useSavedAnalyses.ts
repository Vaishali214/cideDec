import { useState, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { SavedAnalysisRow, SavedAnalysisInsert } from '../lib/database.types';

export function useSavedAnalyses(userId: string | undefined) {
  const [analyses, setAnalyses] = useState<SavedAnalysisRow[]>([]);
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
    if (data) setAnalyses(data as SavedAnalysisRow[]);
  }, [userId]);

  const saveAnalysis = useCallback(async (input: SavedAnalysisInsert) => {
    if (!userId) return { error: 'Not authenticated' };

    const { data, error } = await supabase
      .from('saved_analyses')
      .insert({ ...input, user_id: userId })
      .select()
      .single();

    if (!error && data) {
      setAnalyses(prev => [data as SavedAnalysisRow, ...prev]);
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
