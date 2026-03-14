'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';
import { getPlanTier, TIER_LIMITS } from '@/lib/planTier';

type WebSave = Database['public']['Tables']['web_saves']['Row'];
type WebSaveInsert = Database['public']['Tables']['web_saves']['Insert'];
type WebSaveUpdate = Database['public']['Tables']['web_saves']['Update'];
type WebSaveFolder = Database['public']['Tables']['web_save_folders']['Row'];

interface WebSavesContextType {
  saves: WebSave[];
  folders: WebSaveFolder[];
  loading: boolean;
  error: string | null;
  addSave: (url: string, title?: string, folderId?: string | null) => Promise<void>;
  updateSave: (id: string, updates: { title?: string; url?: string; folder_id?: string | null }) => Promise<void>;
  deleteSave: (id: string) => Promise<void>;
  createFolder: (name: string) => Promise<WebSaveFolder>;
  deleteFolder: (id: string) => Promise<void>;
  refreshSaves: () => Promise<void>; // actually refreshes both saves and folders
}

const WebSavesContext = createContext<WebSavesContextType | undefined>(undefined);

export const WebSavesProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [saves, setSaves] = useState<WebSave[]>([]);
  const [folders, setFolders] = useState<WebSaveFolder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSavesAndFolders = useCallback(async () => {
    if (!user) {
      setSaves([]);
      setFolders([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [savesResponse, foldersResponse] = await Promise.all([
        supabase
          .from('web_saves')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false }),
        supabase
          .from('web_save_folders')
          .select('*')
          .eq('user_id', user.id)
          .order('name', { ascending: true })
      ]);

      if (savesResponse.error) throw savesResponse.error;
      if (foldersResponse.error) throw foldersResponse.error;

      setSaves(savesResponse.data || []);
      setFolders(foldersResponse.data || []);
    } catch (err) {
      console.error('Error fetching web saves data:', err);
      setError('Failed to load web saves');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch saves when user changes
  useEffect(() => {
    if (user) {
      fetchSavesAndFolders();
    } else {
      // Clear saves when user logs out
      setSaves([]);
      setFolders([]);
      setLoading(false);
    }
  }, [user, fetchSavesAndFolders]);

  const addSave = async (url: string, title?: string, folderId?: string | null) => {
    if (!user) throw new Error('User not authenticated');

    // ─── Plan tier: limit total saved links ─────────────────────────────
    const tier = getPlanTier();
    const limits = TIER_LIMITS[tier];
    if (limits.webSaves !== Infinity && saves.length >= limits.webSaves) {
      throw new Error(`PLAN_LIMIT:The free plan includes up to ${limits.webSaves} saved links — upgrade to Pro for unlimited.`);
    }

    // ─── Plan tier: folders are Pro+ only ───────────────────────────────
    if (folderId && !limits.webSaveFolders) {
      throw new Error('PLAN_LIMIT:Organizing saves into folders is a Pro feature — upgrade to unlock.');
    }

    try {
      const { data, error: insertError } = await supabase
        .from('web_saves')
        .insert([{
          user_id: user.id,
          url,
          title: title || '',
          folder_id: folderId || null,
        }])
        .select()
        .single();

      if (insertError) {
        console.error('Supabase insert error:', JSON.stringify(insertError, null, 2));
        throw new Error(insertError.message || 'Failed to add web save');
      }

      setSaves(prev => [data, ...prev]);
    } catch (err: any) {
      if (err?.message?.startsWith('PLAN_LIMIT:')) throw err;
      console.error('Error adding web save:', err?.message || JSON.stringify(err));
      throw err;
    }
  };

  const updateSave = async (id: string, updates: { title?: string; url?: string; folder_id?: string | null }) => {
    if (!user) throw new Error('User not authenticated');

    // ─── Plan tier: moving to folders is Pro+ only ─────────────────────
    if (updates.folder_id) {
      const tier = getPlanTier();
      const limits = TIER_LIMITS[tier];
      if (!limits.webSaveFolders) {
        throw new Error('PLAN_LIMIT:Organizing saves into folders is a Pro feature — upgrade to unlock.');
      }
    }

    try {
      const { data, error: updateError } = await supabase
        .from('web_saves')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (updateError) throw updateError;

      setSaves(prev => prev.map(save =>
        save.id === id ? { ...save, ...data } : save
      ));
    } catch (err: any) {
      if (err?.message?.startsWith('PLAN_LIMIT:')) throw err;
      console.error('Error updating web save:', err);
      throw new Error('Failed to update web save');
    }
  };

  const deleteSave = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error: deleteError } = await supabase
        .from('web_saves')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setSaves(prev => prev.filter(save => save.id !== id));
    } catch (err) {
      console.error('Error deleting web save:', err);
      throw new Error('Failed to delete web save');
    }
  };

  const createFolder = async (name: string) => {
    if (!user) throw new Error('User not authenticated');

    // ─── Plan tier: folders are Pro+ only ───────────────────────────────
    const tier = getPlanTier();
    const limits = TIER_LIMITS[tier];
    if (!limits.webSaveFolders) {
      throw new Error('PLAN_LIMIT:Organizing saves into folders is a Pro feature — upgrade to unlock.');
    }

    try {
      const { data, error: insertError } = await supabase
        .from('web_save_folders')
        .insert({ user_id: user.id, name })
        .select()
        .single();

      if (insertError) throw insertError;
      setFolders(prev => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)));
      return data;
    } catch (err: any) {
      if (err?.message?.startsWith('PLAN_LIMIT:')) throw err;
      console.error('Error creating folder:', err);
      throw new Error('Failed to create folder');
    }
  };

  const deleteFolder = async (id: string) => {
    if (!user) throw new Error('User not authenticated');

    try {
      const { error: deleteError } = await supabase
        .from('web_save_folders')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (deleteError) throw deleteError;

      setFolders(prev => prev.filter(f => f.id !== id));
      // update saves locally as ON DELETE SET NULL works in db
      setSaves(prev => prev.map(s => s.folder_id === id ? { ...s, folder_id: null } : s));
    } catch (err) {
      console.error('Error deleting folder:', err);
      throw new Error('Failed to delete folder');
    }
  };

  return (
    <WebSavesContext.Provider
      value={{
        saves,
        folders,
        loading,
        error,
        addSave,
        updateSave,
        deleteSave,
        createFolder,
        deleteFolder,
        refreshSaves: fetchSavesAndFolders,
      }}
    >
      {children}
    </WebSavesContext.Provider>
  );
};

export const useWebSaves = (): WebSavesContextType => {
  const context = useContext(WebSavesContext);
  if (context === undefined) {
    throw new Error('useWebSaves must be used within a WebSavesProvider');
  }
  return context;
};
