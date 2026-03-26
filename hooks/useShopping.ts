import { useState, useCallback } from 'react';
import { ShoppingItem, AddShoppingItemInput } from '@/types';

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function useShopping() {
  const [items, setItems] = useState<ShoppingItem[]>([]);

  const addItem = useCallback((input: AddShoppingItemInput) => {
    const now = new Date().toISOString();
    const newItem: ShoppingItem = {
      id: uid(),
      user_id: 'local',
      is_checked: false,
      created_at: now,
      ...input,
    };
    setItems((prev) => {
      // Avoid duplicates from same recipe
      const exists = prev.some(
        (i) =>
          i.name.toLowerCase() === input.name.toLowerCase() &&
          i.recipe_id === input.recipe_id
      );
      if (exists) return prev;
      return [newItem, ...prev];
    });
  }, []);

  const toggleItem = useCallback((id: string) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, is_checked: !i.is_checked } : i))
    );
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clearChecked = useCallback(() => {
    setItems((prev) => prev.filter((i) => !i.is_checked));
  }, []);

  return { items, addItem, toggleItem, removeItem, clearChecked };
}
