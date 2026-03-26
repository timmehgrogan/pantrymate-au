import Anthropic from '@anthropic-ai/sdk';
import { PantryCategory, PantryItem, Recipe } from '@/types';

const apiKey = process.env.EXPO_PUBLIC_ANTHROPIC_API_KEY;

function getClient(): Anthropic {
  if (!apiKey || apiKey.startsWith('sk-ant-your')) {
    throw new Error(
      'Claude API key not configured. Add EXPO_PUBLIC_ANTHROPIC_API_KEY to your .env file.'
    );
  }
  return new Anthropic({ apiKey, dangerouslyAllowBrowser: true });
}

// ── Recipe Generation ──────────────────────────────────────────────────────────

/**
 * Generate a recipe using Claude API.
 * Pass the user's pantry as context for best results.
 */
export async function generateRecipeWithAI(prompt: string): Promise<Recipe | null> {
  const client = getClient();

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
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [{ role: 'user', content: prompt }],
  });

  const content = message.content[0];
  if (content.type !== 'text') return null;

  const text = content.text.trim();
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) return null;

  return JSON.parse(text.slice(jsonStart, jsonEnd + 1)) as Recipe;
}

// ── Photo Food Identification ──────────────────────────────────────────────────

/**
 * Use Claude Vision to identify a food item from a photo.
 * Returns name, suggested pantry category, quantity and unit.
 */
export async function identifyFoodFromPhoto(base64Image: string): Promise<{
  name: string;
  category: PantryCategory;
  quantity: number;
  unit: string;
} | null> {
  const client = getClient();

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 256,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: 'image/jpeg',
              data: base64Image,
            },
          },
          {
            type: 'text',
            text: `Identify the food item in this photo for an Australian pantry app.
Respond ONLY with a JSON object (no markdown, no explanation):
{
  "name": "Food name in Australian English (e.g. capsicum not bell pepper, coriander not cilantro)",
  "category": "fridge" or "freezer" or "pantry",
  "quantity": 1,
  "unit": "pcs" or "g" or "kg" or "ml" or "L" or "bunch" or "pack"
}`,
          },
        ],
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') return null;

  const text = content.text.trim();
  const jsonStart = text.indexOf('{');
  const jsonEnd = text.lastIndexOf('}');
  if (jsonStart === -1 || jsonEnd === -1) return null;

  return JSON.parse(text.slice(jsonStart, jsonEnd + 1));
}

// ── Ingredient Substitution ────────────────────────────────────────────────────

/**
 * Ask Claude to suggest the best substitute for a missing ingredient
 * based on what the user actually has in their pantry.
 */
export async function findSubstituteWithAI(
  missingItem: string,
  pantryItems: Pick<PantryItem, 'name' | 'category'>[]
): Promise<string | null> {
  const client = getClient();

  const pantryList = pantryItems.map((i) => i.name).join(', ') || 'nothing';

  const message = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 100,
    messages: [
      {
        role: 'user',
        content: `I need to make a recipe that calls for "${missingItem}" but I don't have it.
My current pantry: ${pantryList}

Suggest the BEST substitute — prefer something from my pantry if possible.
Reply with ONLY a short plain sentence under 15 words, e.g. "Use Greek yoghurt instead — already in your pantry!"`,
      },
    ],
  });

  const content = message.content[0];
  if (content.type !== 'text') return null;
  return content.text.trim();
}
