// ─── Pantry ────────────────────────────────────────────────────────────────

export type PantryCategory = 'fridge' | 'freezer' | 'pantry';

export interface PantryItem {
  id: string;
  user_id: string;
  name: string;
  brand?: string;
  barcode?: string;
  category: PantryCategory;
  quantity: number;
  unit: string;
  expiry_date?: string;        // ISO date string
  image_url?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface AddPantryItemInput {
  name: string;
  brand?: string;
  barcode?: string;
  category: PantryCategory;
  quantity: number;
  unit: string;
  expiry_date?: string;
  image_url?: string;
  notes?: string;
}

// ─── Recipes ────────────────────────────────────────────────────────────────

export interface RecipeIngredient {
  name: string;
  amount: string;
  unit: string;
  optional?: boolean;
}

export interface Recipe {
  id: string;
  name: string;
  description: string;
  image_url?: string;
  prep_time_minutes: number;
  cook_time_minutes: number;
  servings: number;
  difficulty: 'easy' | 'medium' | 'hard';
  tags: string[];
  ingredients: RecipeIngredient[];
  instructions: string[];
  is_ai_generated?: boolean;
}

export interface RecipeWithMatch extends Recipe {
  matchedIngredients: string[];
  missingIngredients: string[];
  matchScore: number;             // 0–100
}

// ─── Shopping ────────────────────────────────────────────────────────────────

export interface ShoppingItem {
  id: string;
  user_id: string;
  name: string;
  quantity: number;
  unit: string;
  recipe_id?: string;
  recipe_name?: string;
  is_checked: boolean;
  created_at: string;
}

export interface AddShoppingItemInput {
  name: string;
  quantity: number;
  unit: string;
  recipe_id?: string;
  recipe_name?: string;
}

// ─── Barcode / Open Food Facts ───────────────────────────────────────────────

export interface OpenFoodFactsProduct {
  barcode: string;
  name: string;
  brand?: string;
  image_url?: string;
  categories?: string[];
  nutriments?: Record<string, number>;
}

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface UserProfile {
  id: string;
  email: string;
  display_name?: string;
  avatar_url?: string;
  is_premium: boolean;
  created_at: string;
}
