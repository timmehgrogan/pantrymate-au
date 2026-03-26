import { useState, useCallback } from 'react';
import { Recipe } from '@/types';
import { generateRecipeWithAI } from '@/lib/claudeApi';

export function useRecipes() {
  const [aiRecipes, setAiRecipes] = useState<Recipe[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateAIRecipe = useCallback(async (prompt: string) => {
    setIsGenerating(true);
    setError(null);
    try {
      const recipe = await generateRecipeWithAI(prompt);
      if (recipe) {
        setAiRecipes((prev) => [recipe, ...prev]);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to generate recipe';
      setError(message);
      throw err;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const removeAiRecipe = useCallback((id: string) => {
    setAiRecipes((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return { aiRecipes, generateAIRecipe, removeAiRecipe, isGenerating, error };
}
