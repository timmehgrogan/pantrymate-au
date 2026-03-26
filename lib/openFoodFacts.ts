import { OpenFoodFactsProduct } from '@/types';

const BASE_URL = 'https://world.openfoodfacts.org/api/v2';
const AU_BASE_URL = 'https://au.openfoodfacts.org/api/v2';

/**
 * Look up a product barcode using the Open Food Facts API.
 * Tries the Australian database first, then falls back to the world database.
 */
export async function lookupBarcode(barcode: string): Promise<OpenFoodFactsProduct | null> {
  // Try AU database first
  try {
    const result = await fetchProduct(AU_BASE_URL, barcode);
    if (result) return result;
  } catch {
    // AU lookup failed, try world database
  }

  // Fall back to world database
  try {
    const result = await fetchProduct(BASE_URL, barcode);
    return result;
  } catch (error) {
    console.error('Open Food Facts lookup failed:', error);
    return null;
  }
}

async function fetchProduct(baseUrl: string, barcode: string): Promise<OpenFoodFactsProduct | null> {
  const response = await fetch(
    `${baseUrl}/product/${encodeURIComponent(barcode)}?fields=product_name,brands,image_url,categories_tags`,
    {
      headers: {
        'User-Agent': 'PantryMateAU/1.0 (timmehgrogan@github; contact@pantrymate.au)',
      },
    }
  );

  if (!response.ok) return null;

  const json = await response.json();

  if (json.status !== 1 || !json.product) return null;

  const p = json.product;
  const name = p.product_name?.trim();
  if (!name) return null;

  return {
    barcode,
    name,
    brand: p.brands?.split(',')[0]?.trim() || undefined,
    image_url: p.image_url || undefined,
    categories: p.categories_tags?.slice(0, 5) || [],
  };
}

/**
 * Search Open Food Facts for products by name (useful for manual entry).
 */
export async function searchProducts(query: string): Promise<OpenFoodFactsProduct[]> {
  try {
    const response = await fetch(
      `${AU_BASE_URL}/search?search_terms=${encodeURIComponent(query)}&page_size=10&fields=code,product_name,brands,image_url`,
      {
        headers: {
          'User-Agent': 'PantryMateAU/1.0 (timmehgrogan@github; contact@pantrymate.au)',
        },
      }
    );

    if (!response.ok) return [];

    const json = await response.json();

    return (json.products ?? [])
      .filter((p: Record<string, string>) => p.product_name?.trim())
      .map((p: Record<string, string>) => ({
        barcode: p.code,
        name: p.product_name.trim(),
        brand: p.brands?.split(',')[0]?.trim() || undefined,
        image_url: p.image_url || undefined,
      }));
  } catch {
    return [];
  }
}
