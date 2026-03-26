/**
 * Maps common food item names to emoji for display in pantry/shopping lists.
 */
export function getFoodEmoji(name: string): string {
  const n = name.toLowerCase();
  // Dairy
  if (n.includes('milk')) return '🥛';
  if (n.includes('cream') && !n.includes('ice')) return '🥛';
  if (n.includes('ice cream')) return '🍦';
  if (n.includes('cheese')) return '🧀';
  if (n.includes('butter')) return '🧈';
  if (n.includes('egg')) return '🥚';
  if (n.includes('yoghurt') || n.includes('yogurt')) return '🫙';
  // Meat
  if (n.includes('chicken')) return '🍗';
  if (n.includes('lamb') || n.includes('chop')) return '🍖';
  if (n.includes('beef') || n.includes('steak') || n.includes('mince')) return '🥩';
  if (n.includes('pork') || n.includes('bacon')) return '🥓';
  if (n.includes('sausage') || n.includes('snag')) return '🌭';
  if (n.includes('ham')) return '🍖';
  // Seafood
  if (n.includes('prawn') || n.includes('shrimp')) return '🦐';
  if (n.includes('fish') || n.includes('barramundi') || n.includes('flathead') || n.includes('salmon') || n.includes('tuna')) return '🐟';
  if (n.includes('crab') || n.includes('lobster')) return '🦞';
  // Vegetables
  if (n.includes('spinach') || n.includes('lettuce') || n.includes('kale')) return '🥬';
  if (n.includes('broccoli')) return '🥦';
  if (n.includes('carrot')) return '🥕';
  if (n.includes('potato')) return '🥔';
  if (n.includes('sweet potato')) return '🍠';
  if (n.includes('tomato')) return '🍅';
  if (n.includes('capsicum') || n.includes('pepper')) return '🫑';
  if (n.includes('zucchini') || n.includes('cucumber')) return '🥒';
  if (n.includes('corn')) return '🌽';
  if (n.includes('mushroom')) return '🍄';
  if (n.includes('pumpkin') || n.includes('squash')) return '🎃';
  if (n.includes('garlic')) return '🧄';
  if (n.includes('onion') || n.includes('leek') || n.includes('shallot')) return '🧅';
  if (n.includes('beetroot') || n.includes('beet')) return '🫙';
  if (n.includes('celery')) return '🥬';
  if (n.includes('pea')) return '🫛';
  if (n.includes('bean')) return '🫘';
  if (n.includes('avocado')) return '🥑';
  // Fruit
  if (n.includes('apple')) return '🍎';
  if (n.includes('banana')) return '🍌';
  if (n.includes('mango')) return '🥭';
  if (n.includes('orange') || n.includes('mandarin')) return '🍊';
  if (n.includes('strawberry') || n.includes('berry') || n.includes('blueberry') || n.includes('raspberry')) return '🍓';
  if (n.includes('lemon')) return '🍋';
  if (n.includes('lime')) return '🍋';
  if (n.includes('grape')) return '🍇';
  if (n.includes('watermelon') || n.includes('melon')) return '🍉';
  if (n.includes('passionfruit')) return '🍈';
  if (n.includes('kiwi')) return '🥝';
  if (n.includes('pineapple')) return '🍍';
  // Grains & Pantry
  if (n.includes('bread') || n.includes('toast')) return '🍞';
  if (n.includes('pasta') || n.includes('spaghetti') || n.includes('penne') || n.includes('fettuccine')) return '🍝';
  if (n.includes('rice')) return '🍚';
  if (n.includes('oat') || n.includes('muesli') || n.includes('cereal')) return '🌾';
  if (n.includes('flour')) return '🌾';
  if (n.includes('sugar') || n.includes('caster') || n.includes('icing')) return '🫙';
  if (n.includes('oil')) return '🫒';
  if (n.includes('honey')) return '🍯';
  if (n.includes('vegemite') || n.includes('marmite')) return '🫙';
  if (n.includes('sauce') || n.includes('ketchup')) return '🥫';
  if (n.includes('salt') || n.includes('pepper') || n.includes('spice') || n.includes('herb')) return '🧂';
  if (n.includes('vinegar')) return '🫙';
  if (n.includes('soy')) return '🫙';
  if (n.includes('coconut')) return '🥥';
  if (n.includes('peanut') || n.includes('almond') || n.includes('nut')) return '🥜';
  if (n.includes('chocolate') || n.includes('cocoa')) return '🍫';
  if (n.includes('biscuit') || n.includes('cookie') || n.includes('tim tam')) return '🍪';
  // Drinks
  if (n.includes('water')) return '💧';
  if (n.includes('juice')) return '🧃';
  if (n.includes('coffee')) return '☕';
  if (n.includes('tea')) return '🍵';
  // Canned
  if (n.includes('canned') || n.includes('crushed') || n.includes('passata') || n.includes('tin')) return '🥫';
  if (n.includes('stock') || n.includes('broth')) return '🍲';
  if (n.includes('chickpea') || n.includes('lentil')) return '🫘';
  // Default
  return '🛒';
}

/**
 * Maps a shopping item name to a supermarket aisle category.
 */
export type AisleCategory =
  | 'Produce'
  | 'Meat & Seafood'
  | 'Dairy & Eggs'
  | 'Pantry Staples'
  | 'Bakery'
  | 'Frozen'
  | 'Other';

export function getAisleCategory(name: string): AisleCategory {
  const n = name.toLowerCase();
  if (
    n.includes('spinach') || n.includes('lettuce') || n.includes('kale') ||
    n.includes('broccoli') || n.includes('carrot') || n.includes('potato') ||
    n.includes('tomato') || n.includes('capsicum') || n.includes('zucchini') ||
    n.includes('corn') || n.includes('mushroom') || n.includes('pumpkin') ||
    n.includes('garlic') || n.includes('onion') || n.includes('leek') ||
    n.includes('celery') || n.includes('pea') || n.includes('bean') ||
    n.includes('avocado') || n.includes('apple') || n.includes('banana') ||
    n.includes('mango') || n.includes('orange') || n.includes('strawberry') ||
    n.includes('berry') || n.includes('lemon') || n.includes('lime') ||
    n.includes('grape') || n.includes('melon') || n.includes('kiwi') ||
    n.includes('beetroot') || n.includes('herb') || n.includes('parsley') ||
    n.includes('coriander') || n.includes('mint') || n.includes('thyme') ||
    n.includes('rosemary') || n.includes('ginger')
  ) return 'Produce';

  if (
    n.includes('chicken') || n.includes('beef') || n.includes('lamb') ||
    n.includes('pork') || n.includes('mince') || n.includes('steak') ||
    n.includes('sausage') || n.includes('bacon') || n.includes('ham') ||
    n.includes('prawn') || n.includes('fish') || n.includes('barramundi') ||
    n.includes('flathead') || n.includes('salmon') || n.includes('tuna') ||
    n.includes('seafood') || n.includes('chop') || n.includes('snag')
  ) return 'Meat & Seafood';

  if (
    n.includes('milk') || n.includes('cream') || n.includes('cheese') ||
    n.includes('butter') || n.includes('egg') || n.includes('yoghurt') ||
    n.includes('yogurt') || n.includes('sour cream') || n.includes('feta') ||
    n.includes('parmesan') || n.includes('mozzarella') || n.includes('gruyère')
  ) return 'Dairy & Eggs';

  if (
    n.includes('bread') || n.includes('roll') || n.includes('bun') ||
    n.includes('wrap') || n.includes('bagel') || n.includes('pita') ||
    n.includes('scroll') || n.includes('loaf')
  ) return 'Bakery';

  if (
    n.includes('frozen') || n.includes('ice cream') || n.includes('ice block')
  ) return 'Frozen';

  if (
    n.includes('pasta') || n.includes('spaghetti') || n.includes('rice') ||
    n.includes('oat') || n.includes('flour') || n.includes('sugar') ||
    n.includes('oil') || n.includes('sauce') || n.includes('honey') ||
    n.includes('vegemite') || n.includes('salt') || n.includes('pepper') ||
    n.includes('spice') || n.includes('vinegar') || n.includes('soy') ||
    n.includes('stock') || n.includes('coconut') || n.includes('canned') ||
    n.includes('tin') || n.includes('passata') || n.includes('chickpea') ||
    n.includes('lentil') || n.includes('breadcrumb') || n.includes('cornflour') ||
    n.includes('baking') || n.includes('bicarb') || n.includes('chocolate') ||
    n.includes('cocoa') || n.includes('golden syrup') || n.includes('condensed') ||
    n.includes('mirin') || n.includes('oyster') || n.includes('sesame') ||
    n.includes('worcestershire') || n.includes('tabasco') || n.includes('mustard')
  ) return 'Pantry Staples';

  return 'Other';
}
