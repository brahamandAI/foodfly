/**
 * Category image mapping → files in public/images/categories
 * Filenames may contain spaces; paths are encoded for next/image and browsers.
 */

function cat(filename: string): string {
  return `/images/categories/${encodeURIComponent(filename)}`;
}

export const categoryImageMap: Record<string, string> = {
  Soups: cat('soup.jpg'),

  Salads: cat('salad.jpg'),
  'Salad Station': cat('salad station.jpeg'),
  'Gourmet Healthy Salads': cat('gourment healthy salads.jpg'),

  'Bar Munchies': cat('bar munchies.avif'),
  'Bar Tidbits': cat('bar tidbits.jpg'),
  'European Appetizers': cat('European apetizers.webp'),
  'Continental Appetizers': cat('European apetizers.webp'),
  'Indian Appetizers (Veg)': cat('North-indian.jpg'),
  'Indian Appetizers (Non-Veg)': cat('chicken.jpg'),
  'Oriental Appetizers (Veg)': cat('Veg oriental.png'),
  'Oriental Appetizers (Non-Veg)': cat('oriental apetizers non veg.jpg'),
  'Oriental Appetizers': cat('Oriental.jpg'),
  'Oriental (Veg & Non-Veg)': cat('Oriental.jpg'),
  Oriental: cat('Oriental.jpg'),

  'Platters & Boards': cat('platters and boards.webp'),
  'Wholesome Sharing Platters': cat('wholesome sharing platters.jpg'),

  'Sourdough Toasts & Bruschettas': cat('Italian.jpg'),

  'Mediterranean (Veg & Non-Veg)': cat('Mediterranean veg and non veg.jpg'),
  'European (Veg & Non-Veg)': cat('European apetizers.webp'),
  'Clay Oven (Veg & Non-Veg)': cat('clay oven veg and non veg.jpg'),
  'Charcoal (Clay Oven)': cat('charcoal clay and oven.jpg'),

  Sandwiches: cat('sandwhich.jpg'),
  Burgers: cat('burger-2.jpg'),
  'Sandwiches & Burgers': cat('burger-2.jpg'),
  Rolls: cat('Rolls.jpg'),

  Pizza: cat('pizza-2.jpeg'),
  'Wood Fired Pizzas': cat('pizza-2.jpeg'),
  'Artisans Pizza & Pasta': cat('pizza-2.jpeg'),
  'Home Made Pasta': cat('pasta.jpg'),
  'Pizza & Pasta': cat('pizza-2.jpeg'),

  'Main Courses': cat('North-indian.jpg'),
  'Continental Main Course': cat('continental main course.png'),
  'European Main Course': cat('European main course.jpg'),
  'Indian Main Course (Veg)': cat('indian main course veg.png'),
  'Indian Main Course (Non-Veg)': cat('Indian main course Non veg.jpg'),
  'Indian Main Course': cat('indian main course.webp'),
  'Soulful Indian Delights': cat('soulful indian delights.jpg'),
  'Oriental Main Course': cat('oriental main course.jpg'),

  Sizzlers: cat('continental-sizzler-1.jpg'),
  'Continental & Sizzlers': cat('continental-sizzler-1.jpg'),

  'Rice & Biryani': cat('rice and biryani.jpg'),

  'Breads & Sides': cat('Breads and sides.jpeg'),

  'Dumplings & Sushi': cat('Chinese.jpg'),

  Desserts: cat('desserts.jpg'),

  Beverages: cat('Bevarages.jpg'),
  Mocktails: cat('Mocktails.webp'),
  'Mocktails & Juices': cat('Mocktails.webp'),
  'Shakes & Smoothies': cat('shakes.jpg'),
  Quenchers: cat('quenchers.png'),
  'Quenchers & Cafe': cat('quenchers.png'),

  default: cat('Fast-food.jpg'),
};

export function getCategoryImage(categoryName: string): string {
  return categoryImageMap[categoryName] || categoryImageMap['default'];
}
