/**
 * Client-side image URL sanitization utility
 * Replaces Unsplash URLs with placeholders
 */

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

