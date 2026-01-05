/**
 * Shared utility functions for menu formatting
 * Ensures consistency across all menu endpoints
 */

// Sanitize image URLs - replace any Unsplash URLs with placeholder
export function sanitizeImageUrl(imageUrl: string | undefined | null): string {
  if (!imageUrl) {
    return '/images/placeholder.svg';
  }
  
  // Check if it's an Unsplash URL
  if (imageUrl.includes('images.unsplash.com') || imageUrl.includes('unsplash.com')) {
    return '/images/placeholder.svg';
  }
  
  // Check for malformed URLs (like the one in the error: fit=crop concatenated with category path)
  if (imageUrl.includes('fit=crop') && imageUrl.includes('categories/')) {
    return '/images/placeholder.svg';
  }
  
  // Check for any URL that starts with https://images.unsplash.com
  if (imageUrl.startsWith('https://images.unsplash.com') || imageUrl.startsWith('http://images.unsplash.com')) {
    return '/images/placeholder.svg';
  }
  
  return imageUrl;
}

export function formatMenuCategories(menuCategories: any[]): any[] {
  if (!menuCategories || !Array.isArray(menuCategories)) {
    return [];
  }

  return menuCategories.map((cat: any) => ({
    name: cat.name,
    items: (cat.items || []).map((item: any) => ({
      _id: item._id,
      name: item.name,
      price: typeof item.price === 'number' 
        ? item.price 
        : (typeof item.price === 'string' 
          ? item.price 
          : item.price?.toString() || '0'),
      description: item.description || '',
      isVeg: item.isVeg !== undefined ? item.isVeg : true,
      image: sanitizeImageUrl(item.image),
      isAvailable: item.isAvailable !== undefined ? item.isAvailable : true,
      category: item.category || cat.name
    }))
  }));
}

