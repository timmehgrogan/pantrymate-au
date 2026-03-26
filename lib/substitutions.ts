// Common ingredient substitutions for Aussie home cooking
// Used in the Find Substitute feature — local lookup runs first, Claude AI is the fallback.

export const SUBSTITUTIONS: Record<string, string[]> = {
  butter: ['margarine', 'olive oil', 'coconut oil', 'vegetable oil'],
  eggs: ['yoghurt', 'banana', 'flaxseed', 'chia seeds'],
  milk: ['oat milk', 'almond milk', 'soy milk', 'cream', 'coconut milk'],
  cream: ['milk', 'coconut cream', 'yoghurt', 'sour cream', 'coconut milk'],
  'sour cream': ['Greek yoghurt', 'cream cheese', 'cream', 'yoghurt'],
  'greek yoghurt': ['sour cream', 'cream cheese', 'yoghurt'],
  yoghurt: ['sour cream', 'Greek yoghurt', 'cream'],
  flour: ['almond flour', 'oat flour', 'rice flour', 'cornflour'],
  'plain flour': ['self-raising flour', 'almond flour', 'oat flour'],
  'self-raising flour': ['plain flour', 'almond flour'],
  sugar: ['honey', 'maple syrup', 'raw sugar', 'brown sugar', 'coconut sugar'],
  'brown sugar': ['white sugar', 'coconut sugar', 'honey', 'raw sugar'],
  'caster sugar': ['sugar', 'raw sugar', 'brown sugar'],
  honey: ['maple syrup', 'golden syrup', 'sugar', 'agave'],
  'golden syrup': ['honey', 'maple syrup', 'treacle'],
  'olive oil': ['vegetable oil', 'coconut oil', 'butter', 'canola oil'],
  'vegetable oil': ['olive oil', 'coconut oil', 'canola oil', 'butter'],
  'coconut oil': ['vegetable oil', 'olive oil', 'butter'],
  'soy sauce': ['tamari', 'coconut aminos', 'worcestershire sauce'],
  'worcestershire sauce': ['soy sauce', 'tamari'],
  'tomato paste': ['tomato sauce', 'crushed tomatoes', 'passata'],
  'tomato sauce': ['crushed tomatoes', 'tomato paste', 'passata'],
  'crushed tomatoes': ['tomato paste', 'tomato sauce', 'passata'],
  'chicken stock': ['vegetable stock', 'beef stock'],
  'beef stock': ['chicken stock', 'vegetable stock'],
  'vegetable stock': ['chicken stock', 'beef stock'],
  vinegar: ['lemon juice', 'lime juice', 'white wine vinegar', 'apple cider vinegar'],
  'lemon juice': ['lime juice', 'vinegar', 'orange juice'],
  'lime juice': ['lemon juice', 'vinegar'],
  'baking powder': ['bicarb soda', 'self-raising flour'],
  'bicarb soda': ['baking powder'],
  'cocoa powder': ['drinking chocolate', 'carob powder'],
  'vanilla extract': ['vanilla essence', 'vanilla bean'],
  parsley: ['coriander', 'chives', 'basil', 'spinach'],
  coriander: ['parsley', 'basil', 'flat-leaf parsley'],
  basil: ['oregano', 'parsley', 'thyme', 'coriander'],
  oregano: ['basil', 'thyme', 'mixed herbs'],
  thyme: ['oregano', 'rosemary', 'mixed herbs'],
  rosemary: ['thyme', 'oregano', 'mixed herbs'],
  garlic: ['garlic powder', 'onion powder', 'shallots'],
  'garlic powder': ['fresh garlic', 'onion powder'],
  onion: ['shallots', 'spring onions', 'leek', 'onion powder'],
  'spring onions': ['chives', 'onion', 'shallots'],
  chives: ['spring onions', 'parsley', 'onion'],
  ginger: ['ground ginger', 'galangal'],
  'ground ginger': ['fresh ginger', 'mixed spice'],
  capsicum: ['zucchini', 'celery', 'carrot'],
  zucchini: ['capsicum', 'eggplant', 'cucumber'],
  eggplant: ['zucchini', 'mushrooms', 'capsicum'],
  mushrooms: ['eggplant', 'zucchini', 'capsicum'],
  spinach: ['kale', 'silverbeet', 'rocket', 'lettuce'],
  kale: ['spinach', 'silverbeet', 'cabbage'],
  'coconut milk': ['cream', 'milk', 'almond milk'],
  'coconut cream': ['thickened cream', 'coconut milk'],
  'peanut butter': ['almond butter', 'tahini', 'sunflower seed butter'],
  tahini: ['peanut butter', 'almond butter'],
  rice: ['quinoa', 'couscous', 'pasta'],
  pasta: ['rice', 'quinoa', 'egg noodles'],
  breadcrumbs: ['crushed crackers', 'oats', 'almond flour', 'cornflakes'],
  oats: ['quinoa flakes', 'breadcrumbs', 'rice flakes'],
  'white bread': ['rye bread', 'sourdough', 'wholemeal bread', 'multigrain bread', 'bread rolls'],
  'wholemeal bread': ['white bread', 'rye bread', 'sourdough', 'multigrain bread'],
  'rye bread': ['sourdough', 'wholemeal bread', 'white bread', 'multigrain bread'],
  sourdough: ['rye bread', 'white bread', 'wholemeal bread'],
  bread: ['rye bread', 'sourdough', 'wholemeal bread', 'bread rolls', 'pita bread'],
  'bread rolls': ['white bread', 'sourdough', 'wholemeal bread'],
  'pita bread': ['white bread', 'flatbread', 'tortilla wraps', 'naan'],
  'tortilla wraps': ['pita bread', 'flatbread', 'white bread'],
  flatbread: ['tortilla wraps', 'pita bread', 'naan'],
  naan: ['flatbread', 'pita bread', 'tortilla wraps'],
  mince: ['diced chicken', 'lentils', 'turkey mince'],
  'chicken breast': ['chicken thigh', 'turkey breast', 'tofu'],
  'chicken thigh': ['chicken breast', 'turkey thigh'],
  bacon: ['ham', 'prosciutto', 'turkey bacon'],
  ham: ['bacon', 'prosciutto', 'salami'],
  'thickened cream': ['cream', 'coconut cream', 'sour cream'],
};

/**
 * Find a substitute for a missing ingredient.
 * Returns a pantry-matched substitute if possible, otherwise the best general substitute.
 */
export function findLocalSubstitute(
  missingItem: string,
  pantryItemNames: string[]
): { substitute: string; inPantry: boolean } | null {
  const key = missingItem.toLowerCase().trim();
  const lowerPantry = pantryItemNames.map((n) => n.toLowerCase());

  function checkSubs(subs: string[]): { substitute: string; inPantry: boolean } | null {
    // Prefer subs that are already in the pantry
    const pantryMatch = subs.find((sub) =>
      lowerPantry.some(
        (p) => p.includes(sub.toLowerCase()) || sub.toLowerCase().includes(p)
      )
    );
    if (pantryMatch) return { substitute: pantryMatch, inPantry: true };
    // Fall back to first suggestion
    if (subs.length > 0) return { substitute: subs[0], inPantry: false };
    return null;
  }

  // Exact match
  if (SUBSTITUTIONS[key]) return checkSubs(SUBSTITUTIONS[key]);

  // Partial match (e.g. "self-raising flour" matches "flour")
  for (const [k, subs] of Object.entries(SUBSTITUTIONS)) {
    if (key.includes(k) || k.includes(key)) {
      const result = checkSubs(subs);
      if (result) return result;
    }
  }

  return null;
}
