import { createClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import 'react-native-url-polyfill/auto';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

/**
 * Custom storage adapter using Expo SecureStore for secure token persistence.
 */
const ExpoSecureStoreAdapter = {
  getItem: (key: string) => SecureStore.getItemAsync(key),
  setItem: (key: string, value: string) => SecureStore.setItemAsync(key, value),
  removeItem: (key: string) => SecureStore.deleteItemAsync(key),
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: ExpoSecureStoreAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// ─── Database helpers ─────────────────────────────────────────────────────────

export async function getPantryItems(userId: string) {
  const { data, error } = await supabase
    .from('pantry_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function addPantryItem(item: Record<string, unknown>) {
  const { data, error } = await supabase.from('pantry_items').insert(item).select().single();
  if (error) throw error;
  return data;
}

export async function updatePantryItem(id: string, updates: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('pantry_items')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePantryItem(id: string) {
  const { error } = await supabase.from('pantry_items').delete().eq('id', id);
  if (error) throw error;
}

export async function getShoppingItems(userId: string) {
  const { data, error } = await supabase
    .from('shopping_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}

export async function upsertShoppingItem(item: Record<string, unknown>) {
  const { data, error } = await supabase
    .from('shopping_items')
    .upsert(item)
    .select()
    .single();
  if (error) throw error;
  return data;
}
