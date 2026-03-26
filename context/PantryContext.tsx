import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { PantryItem, AddPantryItemInput } from '@/types';
import {
  supabase,
  getPantryItems,
  addPantryItem,
  updatePantryItem,
  deletePantryItem,
} from '@/lib/supabase';

function uid(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface PantryContextValue {
  items: PantryItem[];
  loading: boolean;
  addItem: (input: AddPantryItemInput) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
}

const PantryContext = createContext<PantryContextValue | null>(null);

export function PantryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<PantryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const userIdRef = useRef<string | null>(null);

  // Load pantry items from Supabase for the given user
  const loadItems = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const data = await getPantryItems(userId);
      setItems((data as PantryItem[]) ?? []);
    } catch (err) {
      console.error('Failed to load pantry items:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      userIdRef.current = session?.user?.id ?? null;
      if (userIdRef.current) {
        loadItems(userIdRef.current);
      } else {
        setItems([]);
        setLoading(false);
      }
    });

    // Listen for login / logout
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUserId = session?.user?.id ?? null;
      userIdRef.current = newUserId;
      if (newUserId) {
        loadItems(newUserId);
      } else {
        setItems([]);
      }
    });

    return () => subscription.unsubscribe();
  }, [loadItems]);

  const addItem = useCallback((input: AddPantryItemInput) => {
    const userId = userIdRef.current;
    if (!userId) return;

    // Optimistic: add a placeholder immediately
    const tempId = uid();
    const now = new Date().toISOString();
    const optimistic: PantryItem = {
      id: tempId,
      user_id: userId,
      ...input,
      created_at: now,
      updated_at: now,
    };
    setItems((prev) => [optimistic, ...prev]);

    // Persist to Supabase, then swap temp ID for the real UUID
    addPantryItem({ ...input, user_id: userId })
      .then((dbItem) => {
        setItems((prev) =>
          prev.map((i) => (i.id === tempId ? (dbItem as PantryItem) : i))
        );
      })
      .catch((err) => {
        console.error('Failed to save pantry item:', err);
        // Roll back optimistic update
        setItems((prev) => prev.filter((i) => i.id !== tempId));
      });
  }, []);

  const removeItem = useCallback((id: string) => {
    // Optimistic remove
    setItems((prev) => prev.filter((i) => i.id !== id));

    // Only delete from Supabase if it's a real UUID (not a temp local id)
    if (!id.startsWith('local-')) {
      deletePantryItem(id).catch((err) => {
        console.error('Failed to delete pantry item:', err);
        // Reload to reconcile state
        if (userIdRef.current) loadItems(userIdRef.current);
      });
    }
  }, [loadItems]);

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      if (quantity <= 0) {
        removeItem(id);
        return;
      }
      // Optimistic update
      setItems((prev) =>
        prev.map((i) =>
          i.id === id ? { ...i, quantity, updated_at: new Date().toISOString() } : i
        )
      );

      // Persist to Supabase
      if (!id.startsWith('local-')) {
        updatePantryItem(id, { quantity }).catch((err) => {
          console.error('Failed to update pantry item:', err);
        });
      }
    },
    [removeItem]
  );

  return (
    <PantryContext.Provider value={{ items, loading, addItem, removeItem, updateQuantity }}>
      {children}
    </PantryContext.Provider>
  );
}

export function usePantryContext(): PantryContextValue {
  const ctx = useContext(PantryContext);
  if (!ctx) throw new Error('usePantryContext must be used within PantryProvider');
  return ctx;
}
