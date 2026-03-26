import { useState, useCallback } from 'react';
import { PantryItem, AddPantryItemInput } from '@/types';

/**
 * usePantry — manages local pantry state.
 * In a production build this would sync to Supabase.
 * Swap out the state management below for the Supabase integration
 * once your credentials are configured in .env.
 */

// Generate a simple unique ID without external deps
function uid(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function usePantry() {
  const [items, setItems] = useState<PantryItem[]>([
    // Seed data so the app looks populated on first launch
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
  ]);

  const addItem = useCallback((input: AddPantryItemInput) => {
    const now = new Date().toISOString();
    const newItem: PantryItem = {
      id: uid(),
      user_id: 'local',
      ...input,
      created_at: now,
      updated_at: now,
    };
    setItems((prev) => [newItem, ...prev]);
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

  return { items, addItem, removeItem, updateQuantity };
}
