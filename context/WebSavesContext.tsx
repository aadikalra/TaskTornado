'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { supabase } from '@/lib/supabase/client';
import { Database } from '@/types/database.types';

type WebSave = Database['public']['Tables']['web_saves']['Row'];
type WebSaveInsert = Database['public']['Tables']['web_saves']['Insert'];
type WebSaveUpdate = Database['public']['Tables']['web_saves']['Update'];

interface WebSavesContextType {
  saves: WebSave[];
  loading: boolean;
  error: string | null;
  addSave: (url: string, title?: string) => Promise<void>;
  updateSave: (id: string, updates: { title?: string; url?: string }) => Promise<void>;
  deleteSave: (id: string) => Promise<void>;
  refreshSaves: () => Promise<void>;
}

const WebSavesContext = createContext<WebSavesContextType | undefined>(undefined);

export const WebSavesProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [saves, setSaves] = useState<WebSave[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSaves = useCallback(async () => {
    if (!user) {
      setSaves([]);
      setLoading(false);
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('web_saves')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (fetchError) throw fetchError;
      
      setSaves(data || []);
    } catch (err) {
      console.error('Error fetching web saves:', err);
      setError('Failed to load web saves');
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Fetch saves when user changes
  useEffect(() => {
    if (user) {
      fetchSaves();
    } else {
      // Clear saves when user logs out
      setSaves([]);
      setLoading(false);
    }
  }, [user, fetchSaves]);

  const addSave = async (url: string, title?: string) => {
    if (!user) throw new Error('User not authenticated');
    
    try {
      const { data, error: insertError } = await supabase
        .from('web_saves')
        .insert([{
          user_id: user.id,
          url,
          title: title || '',
        }])
        .select()
        .single();
      
      if (insertError) throw insertError;
      
      setSaves(prev => [data, ...prev]);
    } catch (err) {
      console.error('Error adding web save:', err);
      throw new Error('Failed to add web save');
    }
  };

  const updateSave = async (id: string, updates: { title?: string; url?: string }) => {
    if (!user) throw new Error('User not authenticated');
    
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
    } catch (err) {
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

  return (
    <WebSavesContext.Provider
      value={{
        saves,
        loading,
        error,
        addSave,
        updateSave,
        deleteSave,
        refreshSaves: fetchSaves,
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
