import { useCallback } from 'react';
import { supabase } from '../lib/supabase';
import type { Profile, UserSettingsRow } from '../lib/database.types';

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

  const fetchSettings = useCallback(async (): Promise<UserSettingsRow | null> => {
    if (!userId) return null;
    const { data } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    return data as UserSettingsRow | null;
  }, [userId]);

  const updateSettings = useCallback(async (
    updates: Partial<Omit<UserSettingsRow, 'id' | 'user_id'>>
  ) => {
    if (!userId) return;
    await supabase
      .from('user_settings')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('user_id', userId);
  }, [userId]);

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

    await updateProfile({ avatar_url: urlData.publicUrl });

    return { url: urlData.publicUrl, error: null };
  }, [userId, updateProfile]);

  return { fetchProfile, updateProfile, fetchSettings, updateSettings, uploadAvatar };
}
