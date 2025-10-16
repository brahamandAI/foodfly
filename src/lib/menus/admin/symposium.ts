// Symposium admin static menu built from provided raw text.
// It parses the raw menu into a flat list of items suitable for DB seeding.

type AdminMenuItem = {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
  isVeg: boolean;
  rating: number;
  preparationTime: string;
  image: string;
  isAvailable: boolean;
  type: 'VEG' | 'NON-VEG';
  variants?: string[];
  variantPrices?: number[];
};

const RAW_MENU = `SOUP

CREAM OF TOMATO SOUP - 325 


CAPPUCCINO OF WILD MUSHROOM - 375 


MINESTRONE SOUP - 325 


MANCHOW SOUP - 295/325 



HOT N SOUR SOUP - 295/325 


SWEET CORN SOUP - 295/325 


THAI LEMON CORRIANDER - 295/325 


ROASTED CHICKEN SOUP - 325 

SALAD

GREEN SALAD - 195 


GREEK SALAD - 225 


CUCHUMBER SALAD - 225 


SYMPOSIUM CASA SALAD - 435 


TEX MEX SALAD - 435 


CLASSIC CAESAR SALAD - 435 

EUROPEAN APPETIZERS

HUMMUS WITH PITA BREAD - 375 


BAKED FRIES - 455 


BAKED NACHOS - 495 


VEGGIE BAKED POTATO - 325 


BRUSCHETTE DI POMODORO - 395 


PHYLLO PIE CUP - 645 


CHILLI CHEESE TOAST - 425 


CHEESE BALL - 395 


FIERY GRILL CHICKEN - 695 


SPEIDINI DI POLLO CON PESTO - 695 


TAPENADE GLAZED CHICKEN - 695 


CILANTRO PEPPER FISH - 695 


FISH FINGER - 695 


GAMBERI AL VINO BIANCO - 999 

INDIAN (VEG) APPETIZERS

TANDOORI MOMOS VEG - 245 


TANDOORI KHUMB - 455 


TANDOORI BADAMI BROCCOLI - 495 


DAHI AAM PAPAD TIKKI - 525 


HARA BHARA KEBAB - 449 


VEGETABLE SEEKH KEBAB - 449 


BEETROOT SPINACH CHEESE TIKKI - 575 


TANDOORI SOYA CHAAP/MALAI - 495/525 


LEBANESE PANEER TIKKA - 575 


SYPOSIUM STYLE VEGETARIAN PLATTER - 799 

INDIAN (NON-VEG) APPETIZERS

TANDOORI CHICKEN MOMOS - 345 


TANDOORI CHICKEN HALF/AFGANI CHICKEN - 625/695 


TANDOORI CHICKEN WINGS - 595 


PUNJABI TANGRI KEBAB (04 PIECES) - 595 


CILANTRO GARLIC CHICKEN TIKKA - 625 


CHICKEN MALAI TIKKA - 625 


PAPRIKA MURG TIKKA - 625 


CHICKEN SEEKH KEBAB - 625 


MUTTON SEEKH KEBAB - 679 


MUTTON BURRAH CHAAP (03 PIECES) - 799 


AJWAINI LEMON FISH TIKKA - 699 


TANDOORI GARLIC PRAWNS - 999 


SYMPOSIUM STYLE NON-VEG PLATTER - 999 

ORIENTAL (VEG) APPETIZERS

CHILLI MUSHROOM - 495 


WOK TOSSED CHILLI PANEER - 525 


CRISPY SALT N PEPPER - 499 


SCALLIONS SPRING ROLL - 499 


MANCHURIAN BALL - 499 


CRISPY PEPPER CORN - 499 


VEG MOMO - 225 


HONEY CHILLI POTATO - 499 

ORIENTAL (NON-VEG) APPETIZERS

CHICKEN MOMOS - 355 


CHILLI GARLIC CHICKEN WINGS - 575 


DRUMS OF HEAVEN - 595 


WOK CHILLI CHICKEN - 595 


KUNG PAO CHICKEN - 595 


ORIENTAL CHICKEN SPRING ROLL - 595 


SPICY CHILLI GARLIC FISH - 699 


STIR FRIED FISH - 699 


HOT GARLIC PRAWNS - 999 

SANDWICH

VEGETABLES GRILLED SANDWICH - 295 


GRILLED PANEER SANDWICH - 325 


CHICKEN TIKKA/MALAI SANDWICH - 395 

BURGERS

ALOO TIKKI BURGER - 295 


PANEER TIKKA BURGER - 325 


CHICKEN TIKKA BURGER - 395 


BUTTER CHICKEN BURGER - 395 

ROLLS (9 INCH SINGLE)

PANEER TIKKA ROLL/MALAI - 245/295 


SOYA CHAAP ROLL/MALAI ROLL - 245/295 


CHICKEN SEEKH KEBAB ROLL - 325 


CHICKEN TIKKA ROLL/MALAI - 325/355 


DOUBLE EGG ROLL - 295 


EGG CHICKEN TIKKA ROLL - 325 

HOME MADE PASTA

SPINACH AND RICOTTA RAVIOLI - 595 


FETTUCCINI FUNGHI MISTI - 595 


GARGANELLI ALLA VERDURE - 595 


PENNE ARRABIATA VEG/NON-VEG - 525/625 


PENNE ALFREDO VEG/NON-VEG - 525/625 


SPAGHETTI AGLIO OLIO E PEPPERONCINO - 595 


LASAGNA VEG/NON-VEG - 595/695 


GARGANELLI POLO AL PESTO - 625 

PIZZA

PIZZA MARGHERITA - 555 


EXOTIC VEGETABLE PIZZA - 595 


BASILICO-E-BOCCONCINI PIZZA - 595 


PANEER TIKKA PIZZA - 595 


OLIVE CORN PIZZA - 595 


PANEER MAKHANI PIZZA - 595 


CHICKEN TIKKA PIZZA - 675 


PIZZA POLLO CON FUNGHI E POMODORI SECCHI - 675 


BUTTER CHICKEN PIZZA - 675 

EUROPEAN MAIN COURSE

BUTTER BEAN ROSTI - 595 


GRILLED MEDITERRANEAN VEGETABLES - 545 


BAKED VEG - 545 


SPEDINI VERDUREWITH SAFRON RICE - 595 


CHICKEN STROGANOFF WITH SAFFRON RICE - 725 


PAN SEARED CHICKEN BREAST - 725 


GRILLED CHICKEN WITH LIME THYME SAUCE - 725 


GRILLED RIVER SOLE - 999 


GRILLED BASA - 799 


GRILLED LAMB CHOPS - 945 


GRILLED PRAWNS - 1099 

SIZZLERS

ORIENTAL NOODLES SIZZLER - 625 


HOME MADE PASTA SIZZLER - 645 


BUTTER BEAN ROSTI SIZZLER - 645 


ORIENTAL VEG SIZZLER - 625 


GRILLED COTTAGE CHEESE SIZZLER - 645 


KUNG PAO CHICKEN NOODLE SIZZLER - 675 


GRILLED BASA FISH SIZZLER - 799 


PERI-PERI GRILLED CHICKEN SIZZLER - 675 


GRILLED SOLE SIZZLER - 999 


TEMPURA PRAWNS SIZZLER - 1299 

ORIENTAL MAIN COURSE

VEGETABLES IN BLACK BEAN SAUCE - 545 



BROCCOLI & MUSHROOM IN BLACK PEPPER SAUCE - 545 


SWEET N SOUR VEGETABLE - 545/625 



HAKKA NOODLES (VEG/NON-VEG) - 495/575 



THAI CURRY RED / GREEN (VEG/NON-VEG) - 545/575 


OYSTER CHILLI GARLIC CHICKEN - 625 


DICE CHICKEN IN BUTTER CHILLI OYSTER SAUCE - 625 


CHICKEN MANCHURIAN GREAVY - 625 

INDIAN MAIN COURSE (VEG)

KADAI PANEER - 595 


PANEER TIKKA BUTTER MASALA - 595 


PANEER LABABDAR - 595 


PANEER MAKHANI - 595 


KALAUNJI PANEER - 595 


PALAK PANEER - 595 


PANEER HARA DO PYAZA - 595 


MATAR PANEER - 595 


CORNS PALAK - 595 


MUSHROOM HARA DO PYAZA - 595 


SOYA CHAAP MASALA/MAKHANI/ACHARI - 595 


SYMPOSIUM STYLE DAL PALAK DUBALE TADKA - 525 


DAL TADKA - 525 


DAL MAKHANI - 595 


BOCCONCINI MUSHROOM PALAK - 595 


CHOLEY RAWALPINDI - 595 


JEERA ALOO MASALEDAAR - 495 


MATAR METHI MALAI - 595 


MUSHROOM MATAR MAKHANI - 595 




KASHMIRI MALAI KOFTA - 595 




DUM ALOO KASHMIRI/AMRITSARI - 575 



SADABAHAR JHALFREZI - 595 



TAWA FIRANGI SABZI - 595 

INDIAN MAIN COURSE (NON-VEG)

MURG MAKHAN WALA - 725 


MURG KALI MIRCH - 725 


MURG HARA DO PYAZAA - 725 


CHICKEN SAAGWALA - 725 


LABABDAR CHICKEN TIKKA - 725 


HOME STYLE CHICKEN CURRY - 725 


KADAI CHICKEN - 725 


CHICKEN RARA PUNJABI - 725 


MUTTON RARA - 899 


MUTTON ROGANJOSH - 899 


MUTTON DAHI WALA - 899 


SARSON FISH CURRY - 899 


GOAN PRAWN CURRY - 1099 

RICE & BREADS

HYDERABADI MATKA BIRYANI (MUTTON, CHICKEN & VEGETARIAN) - 795/645/575 


STEAMED RICE - 445 


JEERA RICE - 445 


VEG FRIED RICE/SINGAPURI/SICHWAN FRIED RICE - 495/525 


CHILLI BASIL FRIED RICE - 495 


CHICKEN FRIED RICE WITH EGG - 575 


TANDOORI ROTI (Plain, Butter & Missi) - 60/70/80 


NAAN (Plain, Butter & Garlic) - 70/80/90 


PARANTHA (Lachcha, Pudina & Mirchi, Chur-Chur) - 90/105/125 

SIDE DISHES/ADD ON'S

GARLIC BREAD - 295 (ADD ON CHEESE @45) 


THREE DIP NACHOS CHIPS - 395 


SAUTEED VEGETABLES - 245 


FRENCH FRIES - 245 


MASHED POTATO - 245 


HERB RICE - 245 


ROASTED BABY POTATO WITH HERBS - 245 


MASALA PEANUT - 195 


MASALA PAPAD - 195 


RAITA-MIX VEGETABLE/PINEAPPLE/BOONDI - 225 


ENGLISH VEGETABLE ADD ON - 99 



PAPAD ROASTED/FRIED - 95 



GRILLED CHICKEN - 225 

DESSERT

TIRAMISU IN A JAR - 449 


CHOCOLATE WARM CAKE - 325 


WARM CARROT CAKE - 425 


CHOICE OF ICE CREAMS-02 SCOOP (Chocolate, Butter scotch, Vanilla, Strawberry) - 275 


WALNUT BROWNIE WITH VANILA ICE CREAM - 395 


GULAB JAMUN (2 PIECES) - 245 

MOCKTAIL

MANGO MELON BALL - 215 


FIZZY ORANGE BERRY - 215 


PEACHY PASSION - 215 


LYCHEE BASIL - 215 


CUCUMBER COOLER - 215 


BANANA BRUST - 215 


MOJITO MANIA - 215 


BLUE BEACH LEMONADE - 215 


HAWAIIAN PINACOLADA - 215 


SPICY RUSSIAN MARY - 215 

SHAKE

MIX BERRIES SHAKE - 225 


NEUTELLA SHAKE - 225 


OREO COOKIES SHAKE - 225 


PEANUT BUTTER SHAKE - 225 


CHOCOLATE BROWNIE SHAKE - 225 


COLD COFFEE - 225 

SMOOTHIE

DAILY PLANET - 225 


ABSOLUTELY ALMOND - 225 


BERRY BERRY BOOM - 225 


NANA-BA-NANA - 225 

QUENCHERS

TONIC WATER - 105 


GINGERALE - 105 


AERATED DRINKS (COKE /SPRITE) - 75 


DIET COKE - 95 


CLUB SODA - 50 


FRESH LIME SODA - 105 


RED BULL - 225 


CANNED JUICES - 115 


MINERAL WATER - MRP 


BLACK TEA - 105 


GREEN TEA - 105 


ESPRESSO - 95 


CAPPUCCINO REGULAR - 125 


CAPPUCCINO KING SIZE - 150 


AMERICANO - 105 


CAFELATTE - 150`;

const CATEGORY_ORDER = [
  'SOUP',
  'SALAD',
  'EUROPEAN APPETIZERS',
  'INDIAN (VEG) APPETIZERS',
  'INDIAN (NON-VEG) APPETIZERS',
  'ORIENTAL (VEG) APPETIZERS',
  'ORIENTAL (NON-VEG) APPETIZERS',
  'SANDWICH',
  'BURGERS',
  'ROLLS (9 INCH SINGLE)',
  'HOME MADE PASTA',
  'PIZZA',
  'EUROPEAN MAIN COURSE',
  'SIZZLERS',
  'ORIENTAL MAIN COURSE',
  'INDIAN MAIN COURSE (VEG)',
  'INDIAN MAIN COURSE (NON-VEG)',
  'RICE & BREADS',
  "SIDE DISHES/ADD ON'S",
  'DESSERT',
  'MOCKTAIL',
  'SHAKE',
  'SMOOTHIE',
  'QUENCHERS'
];

const upper = (s: string) => s.trim().toUpperCase();

const isCategoryLine = (line: string) => CATEGORY_ORDER.includes(upper(line));

const slugify = (s: string) => s
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

const containsAny = (name: string, tokens: string[]) => {
  const u = upper(name);
  return tokens.some(t => u.includes(t));
};

const inferVeg = (name: string, category: string, variantLabel?: string): boolean => {
  const cat = upper(category);
  if (cat.includes('(NON-VEG)')) return false;
  if (cat.includes('(VEG)')) return true;
  const u = upper(name + ' ' + (variantLabel || ''));
  const nonVegHints = ['CHICKEN', 'MUTTON', 'LAMB', 'FISH', 'PRAWN', 'PRAWNS', 'EGG', 'BEEF', 'PORK', 'SOLEG', 'BASA'];
  if (containsAny(u, nonVegHints)) return false;
  // Explicit veg hints
  const vegHints = ['VEG', 'PANEER', 'CORN', 'BROCCOLI', 'MUSHROOM', 'VEGETABLE', 'VEGETARIAN', 'ALOO', 'PALAK'];
  if (containsAny(u, vegHints)) return true;
  // Default veg for salads, soups without meat hints, breads, desserts, mocktails, shakes, smoothies
  const defaultVegCats = ['SALAD', 'SOUP', 'RICE & BREADS', 'DESSERT', 'MOCKTAIL', 'SHAKE', 'SMOOTHIE', 'QUENCHERS', 'PIZZA'];
  if (defaultVegCats.some(c => cat.startsWith(c))) return true;
  return true; // bias veg unless meat keyword found
};

const parsePrices = (pricePart: string): number[] => {
  const trimmed = pricePart.replace(/[^0-9/]/g, '');
  if (!trimmed) return [];
  return trimmed.split('/').map(p => parseInt(p, 10)).filter(n => !isNaN(n));
};

const extractVariantLabels = (name: string, category: string, priceCount: number): string[] => {
  const uName = upper(name);
  // Parentheses variant list
  const parenMatch = name.match(/\(([^)]+)\)/);
  if (parenMatch) {
    const inside = parenMatch[1]
      .replace(/&/g, ',')
      .replace(/\s+/g, ' ')
      .trim();
    const parts = inside.split(',').map(s => s.trim()).filter(Boolean);
    if (parts.length === priceCount) return parts;
  }
  // Explicit tokens
  if (uName.includes('VEG/NON-VEG')) return ['Veg', 'Non-Veg'];
  if (uName.includes('HALF/FULL') || uName.includes('HALF/AFGANI')) return ['Half', uName.includes('AFGANI') ? 'Afgani' : 'Full'];
  if (upper(category).startsWith('SOUP') && priceCount === 2) return ['Veg', 'Chicken'];
  // Name contains X/Y pattern near end
  const slashIdx = name.lastIndexOf('/');
  if (slashIdx > -1) {
    const before = name.slice(0, slashIdx);
    const after = name.slice(slashIdx + 1);
    // Try to take the last token of before and the first token of after
    const lastToken = before.trim().split(' ').pop() || 'Option 1';
    const firstToken = after.trim().split(' ')[0] || 'Option 2';
    return [capitalize(lastToken), capitalize(firstToken)].slice(0, priceCount);
  }
  // Fallback generic labels
  return Array.from({ length: priceCount }, (_, i) => `Option ${i + 1}`);
};

const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

const cleanName = (name: string) => name.replace(/\s+/g, ' ').trim();

function buildItemsFromLine(namePart: string, pricePart: string, category: string, counterStart: number): AdminMenuItem[] {
  const prices = parsePrices(pricePart);
  const baseName = cleanName(namePart);
  if (prices.length <= 1) {
    const price = prices[0] || 0;
    const isVeg = inferVeg(baseName, category);
    const id = `symposium_${slugify(baseName)}_${counterStart}`;
    return [
      {
        _id: id,
        name: baseName,
        description: '',
        price,
        category,
        isVeg,
        rating: 4.5,
        preparationTime: '15-20 mins',
        image: '/images/placeholder-food.jpg',
        isAvailable: true,
        type: isVeg ? 'VEG' : 'NON-VEG'
      }
    ];
  }

  const labels = extractVariantLabels(baseName, category, prices.length);
  const items: AdminMenuItem[] = [];
  for (let i = 0; i < prices.length; i += 1) {
    const label = labels[i] || `Option ${i + 1}`;
    const variantName = `${baseName} (${label})`;
    const isVeg = inferVeg(baseName, category, label);
    const id = `symposium_${slugify(baseName)}_${slugify(label)}_${counterStart + i}`;
    items.push({
      _id: id,
      name: variantName,
      description: '',
      price: prices[i],
      category,
      isVeg,
      rating: 4.5,
      preparationTime: '15-20 mins',
      image: '/images/placeholder-food.jpg',
      isAvailable: true,
      type: isVeg ? 'VEG' : 'NON-VEG'
    });
  }
  return items;
}

let CACHED_MENU: AdminMenuItem[] | null = null;

export function getSymposiumAdminMenu(): AdminMenuItem[] {
  if (CACHED_MENU) return CACHED_MENU;
  const lines = RAW_MENU.split(/\r?\n/);
  let currentCategory = '';
  let counter = 1;
  const items: AdminMenuItem[] = [];
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;
    if (isCategoryLine(line)) {
      currentCategory = line.trim();
      continue;
    }
    const sepIdx = line.indexOf(' - ');
    if (sepIdx === -1 || !currentCategory) continue;
    const namePart = line.slice(0, sepIdx).trim();
    const pricePart = line.slice(sepIdx + 3).trim();
    // Handle special MRP case
    if (/MRP/i.test(pricePart)) {
      const baseName = cleanName(namePart);
      const isVeg = inferVeg(baseName, currentCategory);
      items.push({
        _id: `symposium_${slugify(baseName)}_${counter++}`,
        name: baseName,
        description: 'Priced at MRP',
        price: 0,
        category: currentCategory,
        isVeg,
        rating: 4.5,
        preparationTime: '15-20 mins',
        image: '/images/placeholder-food.jpg',
        isAvailable: true,
        type: isVeg ? 'VEG' : 'NON-VEG'
      });
      continue;
    }
    const built = buildItemsFromLine(namePart, pricePart, currentCategory, counter);
    items.push(...built);
    counter += built.length;
  }
  CACHED_MENU = items;
  return CACHED_MENU;
}

export default getSymposiumAdminMenu;


