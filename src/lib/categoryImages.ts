/**
 * Category Image Mapping
 * Maps menu categories to images in public/images/categories
 */

export const categoryImageMap: Record<string, string> = {
  // Soups
  'Soups': '/images/categories/Chinese.jpg',
  
  // Salads
  'Salads': '/images/categories/desserts.jpg',
  'Salad Station': '/images/categories/desserts.jpg',
  'Gourmet Healthy Salads': '/images/categories/desserts.jpg',
  
  // Appetizers
  'Bar Munchies': '/images/categories/Fast-food.jpg',
  'Bar Tidbits': '/images/categories/Fast-food.jpg',
  'European Appetizers': '/images/categories/European.jpg',
  'Continental Appetizers': '/images/categories/European.jpg',
  'Indian Appetizers (Veg)': '/images/categories/North-indian.jpg',
  'Indian Appetizers (Non-Veg)': '/images/categories/chicken.jpg',
  'Oriental Appetizers (Veg)': '/images/categories/Oriental.jpg',
  'Oriental Appetizers (Non-Veg)': '/images/categories/Oriental.jpg',
  'Oriental Appetizers': '/images/categories/Oriental.jpg',
  'Oriental': '/images/categories/Oriental.jpg',
  
  // Platters
  'Platters & Boards': '/images/categories/North-indian.jpg',
  'Wholesome Sharing Platters': '/images/categories/North-indian.jpg',
  
  // Toasts & Bruschettas
  'Sourdough Toasts & Bruschettas': '/images/categories/Italian.jpg',
  
  // Small Plates
  'Mediterranean (Veg & Non-Veg)': '/images/categories/European.jpg',
  'European (Veg & Non-Veg)': '/images/categories/European.jpg',
  'Clay Oven (Veg & Non-Veg)': '/images/categories/Mughlai.jpg',
  'Charcoal (Clay Oven)': '/images/categories/Mughlai.jpg',
  
  // Sandwiches & Burgers
  'Sandwiches': '/images/categories/sandwhich.jpg',
  'Burgers': '/images/categories/burger-2.jpg',
  'Sandwiches & Burgers': '/images/categories/burger-2.jpg',
  'Rolls': '/images/categories/sandwhich.jpg',
  
  // Pizza & Pasta
  'Pizza': '/images/categories/pizza-2.jpeg',
  'Wood Fired Pizzas': '/images/categories/pizza-2.jpeg',
  'Artisans Pizza & Pasta': '/images/categories/pizza-2.jpeg',
  'Home Made Pasta': '/images/categories/pasta.jpg',
  'Pizza & Pasta': '/images/categories/pizza-2.jpeg',
  
  // Main Courses
  'Main Courses': '/images/categories/North-indian.jpg',
  'Continental Main Course': '/images/categories/European.jpg',
  'European Main Course': '/images/categories/European.jpg',
  'Indian Main Course (Veg)': '/images/categories/North-indian.jpg',
  'Indian Main Course (Non-Veg)': '/images/categories/chicken.jpg',
  'Indian Main Course': '/images/categories/North-indian.jpg',
  'Soulful Indian Delights': '/images/categories/North-indian.jpg',
  'Oriental Main Course': '/images/categories/Oriental.jpg',
  
  // Sizzlers
  'Sizzlers': '/images/categories/European.jpg',
  'Continental & Sizzlers': '/images/categories/European.jpg',
  
  // Rice & Biryani
  'Rice & Biryani': '/images/categories/North-indian.jpg',
  
  // Breads
  'Breads & Sides': '/images/categories/North-indian.jpg',
  
  // Dumplings & Sushi
  'Dumplings & Sushi': '/images/categories/Oriental.jpg',
  
  // Desserts
  'Desserts': '/images/categories/desserts.jpg',
  
  // Beverages
  'Beverages': '/images/categories/Bevarages.jpg',
  'Mocktails': '/images/categories/Bevarages.jpg',
  'Mocktails & Juices': '/images/categories/Bevarages.jpg',
  'Shakes & Smoothies': '/images/categories/shakes.jpg',
  'Quenchers': '/images/categories/Bevarages.jpg',
  'Quenchers & Cafe': '/images/categories/Bevarages.jpg',
  
  // Default fallback
  'default': '/images/categories/Fast-food.jpg'
};

/**
 * Get image for a category
 */
export function getCategoryImage(categoryName: string): string {
  return categoryImageMap[categoryName] || categoryImageMap['default'];
}

