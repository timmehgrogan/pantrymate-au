import Anthropic from '@anthropic-ai/sdk';
import { Recipe } from '@/types';

const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

/**
 * Generate a recipe using Claude API.
 * Requires EXPO_PUBLIC_ANTHROPIC_API_KEY to be set in .env.
 * This is a paid feature — users need a premium account.
 */
export async function generateRecipeWithAI(prompt: string): Promise<Recipe | null> {
  if (!apiKey || apiKey.startsWith('sk-ant-your')) {
    throw new Error(
      'Claude API key not configured. Add EXPO_PUBLIC_ANTHROPIC_API_KEY to your .env file.'
    );
  }

  const client = new Anthropic({ apiKey });

  const systemPrompt = `You are an expert Australian recipe generator for the PantryMate AU app.
Generate practical, delicious recipes for Australian families.
Always respond with a single valid JSON object matching this exact TypeScript type:

{
  "id": string (unique, prefix with "ai-"),
  "name": string,
  "description": string (1-2 sentences),
  "prep_time_minutes": number,
  "cook_time_minutes": number,
  "servings": number,
  "difficulty": "easy" | "medium" | "hard",
  "tags": string[] (3-6 tags like "family", "quick", "vegetarian"),
  "ingredients": Array<{ "name": string, "amount": string, "unit": string, "optional"?: boolean }>,
  "instructions": string[] (clear step-by-step),
  "is_ai_generated": true
}

Use Australian ingredient names and measurements (e.g. "capsicum" not "bell pepper", "coriander" not "cilantro", grams/litres). Only respond with the JSON object, no markdown.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') return null;

  const text = content.text.trim();
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) return null;

  const recipe = JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as Recipe;
  return recipe;
}
