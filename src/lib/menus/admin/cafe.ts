// Cafe After Hours admin static menu (restaurantId "2")

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

const RAW_MENU = `BAR TIDBITS 


FRENCH FRIES (PLAIN/PERI PERI/CHEESEY) - ₹295/345 


GARLIC BREAD (PLAIN/CHEESE) - ₹295/345 


POTATO WEDGES (PLAIN/PERI PERI) - ₹295/345 


MUMBAIYA CORN BHEL - ₹295 


PEANUT MASALA - ₹275 


PERI PERI CHANA CHAT - ₹275 


CHICKEN 65 - ₹445 


GRILLED FISH SKEWERS - ₹495 


BEER BATTER FISH FINGERS - ₹575 


BUTTER CHICKEN PAV - ₹345 


KEEMA BAO - ₹445 


SOUPS 


THYME INFUSED WILD MUSHROOM SOUP - ₹295/345 


TOMATO BASIL SOUP (VEG/CHICKEN) - ₹295/345 


TIBETIAN THUPKA (VEG/CHICKEN) - ₹295/345 


SWEET CORN SOUP (VEG/CHICKEN) - ₹295/345 


MANCHOW SOUP (VEG/CHICKEN) - ₹295/345 


GOURMET HEALTHY SALADS 


FIGS AND APRICOT - ₹395 


FATTOUSH - ₹395 


WATERMELON FETA CHEESE - ₹395 


ZESTY AVOCADO QUINOA SALAD - ₹525 


FRESH GARDEN GREEN SALAD - ₹245 


CLASSIC CAESAR (VEG/CHICKEN) - ₹395/445 


WHOLESOME SHARING PLATTERS 


VEG MEZZE PLATTER - ₹895 


NON-VEG MEZZE PLATTER - ₹995 


TANDOORI VEG PLATTER - ₹895 


TANDOORI NON-VEG PLATTER - ₹995 


SOURDOUGH TOASTS/BRUSCHETTAS 


SCHEZWAN MUSHROOM SOURDOUGH TOAST - ₹495 


AVOCADO SOURDOUGH TOAST - ₹495 


MOZZARELLA & BASIL BRUSCHETTAS - ₹345 


SMOKE SALMON NICOISE TOAST - ₹795 


GRILLED ROSEMARY CHICKEN BRUSCHETTAS - ₹395 


MEDITERRANEAN 


CLASSIC FALAFEL - ₹695 


VEGETABLE SHISH TOUK - ₹695 


COTTAGE CHEESE SHAWARMA - ₹695 


PANEER CHELO KEBAB - ₹695 


CHICKEN SHISH TOUK - ₹795 


TURKISH ADANA KEBAB - ₹795 


CHICKEN SHAWARMA - ₹795 


CHICKEN CHELO KEBAB - ₹795 


EUROPEAN 


TEX-MEX LOADED NACHOS VEG - ₹495 


MEXICAN VEGETABLE QUESADILLAS - ₹495 


CREAMY EXOTIC VEG VOL-AU-VENT - ₹445 


PERI PERI ONION RINGS - ₹395 


PANEER TIKKA TACOS WITH ROASTED TOMATO SALSA - ₹495 


CHICKEN WINGS (BBQ/BUFFALO) - ₹595 


CHICKEN SAUSAGE & HAM VOL-AU-VENT - ₹495 


TEX-MEX LOADED NACHOS CHICKEN - ₹595 


KICK IN SPICY CHICKEN TACOS WITH ROASTED TOMATO SALSA - ₹595 


HARISSA CHICKEN STRIPS - ₹595 


CLASSIC FISH N CHIPS - ₹675 


BUTTER GARLIC TIGER PRAWNS - ₹795 


SMOKED CHICKEN QUESADILLAS - ₹595 


CLAY OVEN 


KHUMB KI GALOUTI - ₹595 


TANDOORI KHUMB RED CHEDDAR FONDUE - ₹495 


SOYA CHAP (ACHARI/MALAI/TANDOORI) - ₹475 


HARISSA PANEER TIKKA - ₹525 


PANEER TIKKA (DEGGI MIRCH/AFGHANI) - ₹525 


SADABAHAR MALAI SEEKH - ₹585 


PAPAD CRUSTED DAHI KE KEBAB - ₹495 


TANDOORI CHICKEN WINGS - ₹595 


BURRAH KEBAB - ₹895 


LUCKNOWEE MUTTON GALOUTI - ₹795 


GILAFI MUTTON SEEKH KEBAB - ₹695 


TANDOORI CHICKEN (HALF/FULL) - ₹475/745 


PESHAWARI CHICKEN TANGRI - ₹595 


BHATTI KA MURGH (HALF/FULL) - ₹475/745 


MURGH MALAI TIKKA - ₹595 


CHICKEN SHARABI TIKKA - ₹645 


MURGH SEEKH KEBAB - ₹595 


TANDOORI POMFRET - ₹1095 


KASAUNDI MACHCHI TIKKA - ₹745 


THAI RED CHICKEN TIKKA, WASABI TARTARE - ₹695 


ORIENTAL 


THAI STYLE SPRING ROLLS - ₹495 


CHEESE CIGAR ROLL WITH SPICY HARISSA - ₹595 


CRISPY FRIED CHILLY PANEER - ₹495 


KOREAN VEGETABLE SKEWERS - ₹495 


EXOTIC ASIAN GREENS (CHILLY GARLIC/BLACK BEAN/SCHEZWAN) - ₹495 


CRISPY THAI MUSHROOMS - ₹495 


HONEY CHILLY SESAME POTATO - ₹395 


SCHEZWAN STYLE SALT N PEPPER - ₹495 


CRISPY FRIED CORN KERNELS - ₹495 


GOLDEN FRIED MAGIC PRAWNS - ₹795 


SICHUAN STYLE BURNT GARLIC CHICKEN - ₹595 


CRISPY FRIED FISH (CHILLY GARLIC/SCHEZWAN) - ₹695 


TERIYAKI CHICKEN SKEWERS - ₹595 


THAI BASIL CHICKEN - ₹595 


ORIGINAL CHICKEN LOLLIPOP - ₹595 


CRISPY FRIED CHILLY CHICKEN - ₹595 


DUMPLINGS 


FUSION DUMPLINGS (VEG/CHICKEN) - ₹495/595 


THAI GREEN VEG DUMPLING - ₹495 


SPICY CORN & ASPARAGUS DUMPLING - ₹525 


WATERCHESTNUT AND CHEESE DUMPLING - ₹495 


CHICKEN THAI BASIL DUMPLING - ₹625 


SRIRACHA CHICKEN DUMPLING - ₹625 


PRAWN HAR GOW DUMPLING - ₹795 


SUSHIS 


VEG CALIFORNIA ROLL - ₹575 


AVOCADO & PHILADELPHIA CHEESE ROLL - ₹595 


ZUCCHINI ROLL WITH HERBS & CHEESE - ₹575 


AVOCADO CARROT CUCUMBER MAKI ROLL - ₹595 


ASPARAGUS TEMPURA PICKLED CARROTS - ₹595 


TEMPURA SHRIMP ROLL - ₹895 


SMOKE SALMON & PHILADELPHIA CHEESE ROLL - ₹895 


SPICY CHICKEN ROLL - ₹645 


TERIYAKI CHICKEN ROLL - ₹645 


CONTINENTAL MAINS 


GRILLED COTTAGE CHEESE STEAK (CHIPOTLE/PERI PERI/BBQ) - ₹595 


MODERN GRILLED CHICKEN (BLACK PEPPER/BBQ/PERI PERI) - ₹695 


HERB CRUSTED LAMB STEAK - ₹895 


CAJUN ANGEL SHRIMPS - ₹895 


MEDITERRANEAN GRILLED RED SNAPPER - ₹795 


PERUVIAN GRILLED FISH - ₹745 


SIZZLERS 


GRILLED COTTAGE CHEESE SIZZLER (CHIPOTLE/PERI PERI/BBQ) - ₹645 


ROASTED MEXICAN VEGETABLE SIZZLER - ₹645 


GRILLED CHICKEN SIZZLER (BLACK PEPPER/BBQ/PERI PERI) - ₹695 


TEX-MEX LAMB SIZZLER - ₹795 


GRILLED FISH SIZZLER - ₹795 


BUTTER GARLIC PRAWN SIZZLER - ₹895 


CRAFTED SANDWICHES/BURGERS 


CLUB SANDWICH (VEG/NON-VEG) - ₹395/495 


TUSCAN VEGETABLE MELT FOCACCIA - ₹445 


GARDEN VEGGIE BURGER - ₹445 


PERI PERI COTTAGE CHEESE BURGER - ₹445 


TEXAS PERI PERI CHICKEN FOCACCIA - ₹595 


NEWYORK STYLE SMOKE CHICKEN BURGER - ₹595 


CALIFORNIA LAMB BURGER - ₹695 


ARTISAN PIZZAS 


VEG 


ROCKET MARGHERITA CAPRESE - ₹495 


ROASTED VEGGIES - ₹595 


VEGETABLE CARNIVAL - ₹595 


QUATTRO FORMAGGIO - ₹645 


NON-VEG 


CLASSIC PEPPERONI - ₹695 


ALL THE MEATS - ₹695 


SPICY CHICKEN TIKKA - ₹695 


TEX-MEX PERI PERI CHICKEN - ₹695 


FLAVORSOME PASTA 


CHEESE SAUCE (VEG/CHICKEN) - ₹495/595 


ARABIATTA (VEG/CHICKEN) - ₹495/595 


ALFREDO (VEG/CHICKEN) - ₹495/595 


SPAGHETTI AGLIO E OLIO - ₹495 


VEG LASAGNA - ₹495 


SPAGHETTI WITH MEATBALLS - ₹695 


CHICKEN LASAGNA - ₹625 


MEAL BOWL 


KHOW SUEY (VEG/CHICKEN) - ₹495/595 


THAI RED/GREEN CURRY BOWL (VEG/CHICKEN/PRAWN) - ₹495/595/695 


MANCHURIAN BOWL (VEG/CHICKEN) - ₹495/595 


STIR FRIED MIX VEG BOWL (CHILLY GARLIC/BLACK BEAN/SCHEZWAN) - ₹495 


CHILLY PANEER BOWL - ₹495 


CHICKEN MONGOLIAN - ₹595 


FISH IN BLACK BEAN/XO SAUCE - ₹695 


PRAWN IN BLACK BEAN/XO SAUCE - ₹795 


CHILLY CHICKEN BOWL - ₹595 


RICE / NOODLES 


STEAMED RICE - ₹295 


PULAO (JEERA/PEAS) - ₹295/395 


FRIED RICE (VEG/CHICKEN) - ₹295/395 


BURNT GARLIC RICE (VEG/CHICKEN) - ₹375/475 


THAI FRIED RICE (VEG/CHICKEN) - ₹375/475 


HAKKA NOODLES (VEG/CHICKEN) - ₹375/475 


ASIAN NOODLES (VEG/CHICKEN) - ₹375/475 


PAN FRIED NOODLES (VEG/CHICKEN) - ₹375/475 


SOULFUL INDIAN DELIGHTS 


SUBZ HANDI BIRYANI - ₹595 


DOUBLE DAL TADKA - ₹495 


DAL MAKHNI - ₹545 


KHUMB MAKAI MASALA - ₹495 


AMRITSARI CHOLE - ₹495 


DUM ALOO KASHMIRI - ₹545 


PANEER (BUTTER MASALA/LABABDAR/KADHAI) - ₹545 


MAKHMALI PANEER KE KOFTE - ₹545 


SUBZ KHADA MASALA - ₹545 


MURGH HANDI BIRYANI - ₹695 


GOSHT BIRYANI - ₹795 


CHICKEN DAHIWALA - ₹595 


AFTER HOURS SPL CHICKEN CHANGEZI - ₹595 


MURGH MAKHNI (WITH BONE/BONELESS) - ₹595 


KADHAI CHICKEN - ₹595 


MURGH TIKKA MASALA - ₹595 


KADHAI JHEENGA MASALA - ₹795 


JOSH-E-ROGAN - ₹695 


RAHRA GOSHT - ₹695 


BREADS 


NAAN (PLAIN/BUTTER/GARLIC) - ₹95/115/125 


PARATHA (PUDINA/LACHHA) - ₹95 


MISSI ROTI - ₹95 


TANDOORI ROTI (PLAIN/BUTTER) - ₹45/75 


AMRITSARI KULCHA (ALOO/ONION/PANEER) - ₹145/195 


CHEESE JALAPENO NAAN - ₹125 


CHUR-CHUR NAAN/PARATHA - ₹195 


KEEMA PARATHA - ₹295 


ADD ONS 


GRILLED VEGETLES - ₹145 


MASH POTATO - ₹145 


RAITA (BOONDI/MIX VEG/PINEAPPLE) - ₹195/245 


BACON SLICE - ₹195 


GRILLED CHICKEN - ₹195 


CHICKEN SAUSAGE - ₹195 


CHICKEN HAM - ₹195 


DESSERT 


ANDAZ E BAYAAN - ₹395 


BLUEBERRY CHEESECAKE - ₹395 


RED VELVET BROWNIE WITH ICE CREAM - ₹345 


MEXICAN CHURROS - ₹395 


FRUITY NUTTY SUNDAE - ₹345 


APPLE PIE WITH ICE CREAM - ₹345 


TIRAMISU JAR - ₹495 


MOCHA MUD CAKE - ₹495`;

const CATEGORY_ORDER = [
  'BAR TIDBITS',
  'SOUPS',
  'GOURMET HEALTHY SALADS',
  'WHOLESOME SHARING PLATTERS',
  'SOURDOUGH TOASTS/BRUSCHETTAS',
  'MEDITERRANEAN',
  'EUROPEAN',
  'CLAY OVEN',
  'ORIENTAL',
  'DUMPLINGS',
  'SUSHIS',
  'CONTINENTAL MAINS',
  'SIZZLERS',
  'CRAFTED SANDWICHES/BURGERS',
  'ARTISAN PIZZAS',
  'FLAVORSOME PASTA',
  'MEAL BOWL',
  'RICE / NOODLES',
  'SOULFUL INDIAN DELIGHTS',
  'BREADS',
  'ADD ONS',
  'DESSERT'
];

let CACHED: AdminMenuItem[] | null = null;

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9\s/-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim();
}

function isNonVegName(name: string): boolean {
  const n = name.toUpperCase();
  const nonVegKeywords = [
    'CHICKEN','MUTTON','LAMB','FISH','PRAWN','JHEENGA','SHRIMP','EGG','HAM','BACON','SAUSAGE','PEPPERONI','MEAT','GOSHT','MURGH','POMFRET','SALMON','TANGRI','KEEMA'
  ];
  return nonVegKeywords.some(k => n.includes(k));
}

function parsePrices(text: string): number[] {
  const cleaned = text.replace(/[^0-9/]/g, '');
  return cleaned.split('/').filter(Boolean).map(v => parseInt(v, 10)).filter(n => Number.isFinite(n));
}

function extractVariantLabels(name: string): { base: string; variants: string[] } {
  const match = name.match(/^(.*)\(([^)]+)\)\s*$/);
  if (!match) return { base: name.trim(), variants: [] };
  const base = match[1].trim();
  const variants = match[2].split('/').map(v => v.trim()).filter(Boolean);
  return { base, variants };
}

function buildItem(category: string, line: string): AdminMenuItem | null {
  // Parse lines like: NAME - ₹295/345
  const match = line.match(/^(.*?)\s-\s*₹?\s*([0-9/]+)/);
  if (!match) return null;
  const namePart = match[1].trim();
  const pricePart = match[2].trim();
  const prices = parsePrices(pricePart);
  let { base, variants } = extractVariantLabels(namePart);
  const baseName = base.replace(/\s+\|\s+.*/, '').trim();

  const isNonVeg = isNonVegName(baseName);
  const isVeg = !isNonVeg;

  // Determine price and variantPrices
  let price = prices[0] || 0;
  let variantPrices: number[] | undefined = undefined;
  if (variants.length > 0) {
    variantPrices = variants.map((_, idx) => {
      if (prices.length === 0) return price;
      if (idx < prices.length) return prices[idx];
      return prices[prices.length - 1];
    });
  } else if (prices.length > 1) {
    // Multiple prices without declared variants – keep first as base price
    price = prices[0];
  }

  const id = `2::${slugify(category)}::${slugify(baseName)}`;

  return {
    _id: id,
    name: baseName,
    description: '',
    price,
    category,
    isVeg,
    rating: 4.5,
    preparationTime: '15-20 mins',
    image: '',
    isAvailable: true,
    type: isVeg ? 'VEG' : 'NON-VEG',
    variants: variants.length ? variants : undefined,
    variantPrices
  };
}

export function getCafeAdminMenu(): AdminMenuItem[] {
  if (CACHED) return CACHED;
  const items: AdminMenuItem[] = [];
  let currentCategory: string | null = null;

  const lines = RAW_MENU.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  for (const rawLine of lines) {
    const line = rawLine.replace(/\s+/g, ' ').trim();
    if (CATEGORY_ORDER.includes(line.toUpperCase())) {
      currentCategory = line.toUpperCase();
      continue;
    }
    if (!currentCategory) continue;
    // Expect item lines to contain a hyphen separating name and price
    if (line.includes('₹') || / - \d/.test(line) || / - ₹/.test(line)) {
      const item = buildItem(currentCategory, line);
      if (item) items.push(item);
    }
  }

  CACHED = items;
  return items;
}

export default getCafeAdminMenu;

