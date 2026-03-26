import React, { createContext, useContext, useState, useCallback } from 'react';
import { PantryItem, AddPantryItemInput } from '@/types';

function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

const SEED_ITEMS: PantryItem[] = [
  {
    id: uid(),
    user_id: 'local',
    name: 'Full Cream Milk',
    brand: 'Dairy Farmers',
    category: 'fridge',
    quantity: 2,
    unit: 'L',
    expiry_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: uid(),
    user_id: 'local',
    name: 'Eggs',
    brand: 'Pace Farm',
    category: 'fridge',
    quantity: 12,
    unit: 'pcs',
    expiry_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: uid(),
    user_id: 'local',
    name: 'Cheddar Cheese',
    category: 'fridge',
    quantity: 400,
    unit: 'g',
    expiry_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: uid(),
    user_id: 'local',
    name: 'Chicken Breast',
    category: 'freezer',
    quantity: 1,
    unit: 'kg',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: uid(),
    user_id: 'local',
    name: 'Beef Mince',
    category: 'freezer',
    quantity: 500,
    unit: 'g',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: uid(),
    user_id: 'local',
    name: 'Spaghetti',
    category: 'pantry',
    quantity: 500,
    unit: 'g',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: uid(),
    user_id: 'local',
    name: 'Crushed Tomatoes',
    brand: 'Ardmona',
    category: 'pantry',
    quantity: 2,
    unit: 'cans',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: uid(),
    user_id: 'local',
    name: 'Rolled Oats',
    category: 'pantry',
    quantity: 1,
    unit: 'kg',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: uid(),
    user_id: 'local',
    name: 'Garlic',
    category: 'pantry',
    quantity: 1,
    unit: 'head',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: uid(),
    user_id: 'local',
    name: 'Olive Oil',
    category: 'pantry',
    quantity: 750,
    unit: 'ml',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

interface PantryContextValue {
  items: PantryItem[];
  addItem: (input: AddPantryItemInput) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
}

const PantryContext = createContext<PantryContextValue | null>(null);

export function PantryProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<PantryItem[]>(SEED_ITEMS);

  const addItem = useCallback((input: AddPantryItemInput) => {
    const now = new Date().toISOString();
    setItems((prev) => [
      { id: uid(), user_id: 'local', ...input, created_at: now, updated_at: now },
      ...prev,
    ]);
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setItems((prev) =>
      prev.map((i) =>
        i.id === id ? { ...i, quantity, updated_at: new Date().toISOString() } : i
      )
    );
  }, []);

  return (
    <PantryContext.Provider value={{ items, addItem, removeItem, updateQuantity }}>
      {children}
    </PantryContext.Provider>
  );
}

export function usePantryContext(): PantryContextValue {
  const ctx = useContext(PantryContext);
  if (!ctx) throw new Error('usePantryContext must be used within PantryProvider');
  return ctx;
}
