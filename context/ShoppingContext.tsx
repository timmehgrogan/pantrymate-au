import React, { createContext, useContext, useState, useCallback } from 'react';
import { ShoppingItem, AddShoppingItemInput } from '@/types';

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

interface ShoppingContextValue {
  items: ShoppingItem[];
  addItem: (input: AddShoppingItemInput) => void;
  toggleItem: (id: string) => void;
  removeItem: (id: string) => void;
  clearChecked: () => void;
}

const ShoppingContext = createContext<ShoppingContextValue | null>(null);

export function ShoppingProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<ShoppingItem[]>([]);

  const addItem = useCallback((input: AddShoppingItemInput) => {
    const now = new Date().toISOString();
    setItems((prev) => {
      const exists = prev.some(
        (i) =>
          i.name.toLowerCase() === input.name.toLowerCase() &&
          i.recipe_id === input.recipe_id
      );
      if (exists) return prev;
      return [
        { id: uid(), user_id: 'local', is_checked: false, created_at: now, ...input },
        ...prev,
      ];
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

  return (
    <ShoppingContext.Provider value={{ items, addItem, toggleItem, removeItem, clearChecked }}>
      {children}
    </ShoppingContext.Provider>
  );
}

export function useShoppingContext(): ShoppingContextValue {
  const ctx = useContext(ShoppingContext);
  if (!ctx) throw new Error('useShoppingContext must be used within ShoppingProvider');
  return ctx;
}
