import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import { ShoppingItem, AddShoppingItemInput } from '@/types';
import { supabase, getShoppingItems, upsertShoppingItem } from '@/lib/supabase';

function uid(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface ShoppingContextValue {
  items: ShoppingItem[];
  loading: boolean;
  addItem: (input: AddShoppingItemInput) => void;
  toggleItem: (id: string) => void;
  removeItem: (id: string) => void;
  clearChecked: () => void;
}

const ShoppingContext = createContext<ShoppingContextValue | null>(null);

export function ShoppingProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ShoppingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const userIdRef = useRef<string | null>(null);

  const loadItems = useCallback(async (userId: string) => {
    setLoading(true);
    try {
      const data = await getShoppingItems(userId);
      setItems((data as ShoppingItem[]) ?? []);
    } catch (err) {
      console.error('Failed to load shopping items:', err);
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      userIdRef.current = session?.user?.id ?? null;
      if (userIdRef.current) {
        loadItems(userIdRef.current);
      } else {
        setItems([]);
        setLoading(false);
      }
    });

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

  const addItem = useCallback((input: AddShoppingItemInput) => {
    const userId = userIdRef.current;
    if (!userId) return;

    // Prevent duplicate (same name + recipe)
    setItems((prev) => {
      const exists = prev.some(
        (i) =>
          i.name.toLowerCase() === input.name.toLowerCase() &&
          i.recipe_id === input.recipe_id
      );
      if (exists) return prev;

      const tempId = uid();
      const now = new Date().toISOString();
      const optimistic: ShoppingItem = {
        id: tempId,
        user_id: userId,
        is_checked: false,
        created_at: now,
        ...input,
      };

      // Persist in background
      upsertShoppingItem({ ...input, user_id: userId, is_checked: false })
        .then((dbItem) => {
          setItems((p) => p.map((i) => (i.id === tempId ? (dbItem as ShoppingItem) : i)));
        })
        .catch((err) => {
          console.error('Failed to save shopping item:', err);
          setItems((p) => p.filter((i) => i.id !== tempId));
        });

      return [optimistic, ...prev];
    });
  }, []);

  const toggleItem = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((i) => {
        if (i.id !== id) return i;
        const updated = { ...i, is_checked: !i.is_checked };

        // Persist toggle to Supabase
        if (!id.startsWith('local-')) {
          supabase
            .from('shopping_items')
            .update({ is_checked: updated.is_checked })
            .eq('id', id)
            .then(({ error }) => {
              if (error) console.error('Failed to toggle shopping item:', error);
            });
        }

        return updated;
      })
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));

    if (!id.startsWith('local-')) {
      supabase
        .from('shopping_items')
        .delete()
        .eq('id', id)
        .then(({ error }) => {
          if (error) console.error('Failed to remove shopping item:', error);
        });
    }
  }, []);

  const clearChecked = useCallback(() => {
    const userId = userIdRef.current;
    setItems((prev) => {
      const checkedIds = prev.filter((i) => i.is_checked && !i.id.startsWith('local-')).map((i) => i.id);

      if (userId && checkedIds.length > 0) {
        supabase
          .from('shopping_items')
          .delete()
          .in('id', checkedIds)
          .then(({ error }) => {
            if (error) console.error('Failed to clear checked items:', error);
          });
      }

      return prev.filter((i) => !i.is_checked);
    });
  }, []);

  return (
    <ShoppingContext.Provider value={{ items, loading, addItem, toggleItem, removeItem, clearChecked }}>
      {children}
    </ShoppingContext.Provider>
  );
}

export function useShoppingContext(): ShoppingContextValue {
  const ctx = useContext(ShoppingContext);
  if (!ctx) throw new Error('useShoppingContext must be used within ShoppingProvider');
  return ctx;
}
