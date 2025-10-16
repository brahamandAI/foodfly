import 'dotenv/config';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Pexels & Pixabay API configuration (primary → fallback)
const PEXELS_API_KEY = process.env.PEXELS_API_KEY;
const PEXELS_API_URL = 'https://api.pexels.com/v1';

const PIXABAY_API_KEY = process.env.PIXABAY_API_KEY;
const PIXABAY_API_URL = 'https://pixabay.com/api';

interface PexelsPhoto { id: number; src: { medium: string; large: string; large2x: string; small: string; tiny: string; }; alt: string; }
interface PixabayHit { id: number; webformatURL: string; largeImageURL: string; previewURL: string; tags: string; }

interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export class ImageService {
  private static normalizeDishName(name: string): string {
    let s = (name || '').toLowerCase();
    // remove parenthetical and trailing descriptors
    s = s.replace(/\([^)]*\)/g, ''); // remove ( ... )
    s = s.replace(/-\s*\d+.*/, ''); // remove price hints after dash
    s = s.replace(/[^a-z0-9\s]/g, ' ');
    s = s.replace(/\s+/g, ' ').trim();
    return s;
  }

  private static getCategoryKeywords(category: string): string[] {
    const c = (category || '').toLowerCase();
    if (c.includes('burger')) return ['burger'];
    if (c.includes('pizza')) return ['pizza'];
    if (c.includes('pasta')) return ['pasta'];
    if (c.includes('dessert')) return ['dessert', 'cake', 'sweets'];
    if (c.includes('soup')) return ['soup'];
    if (c.includes('salad')) return ['salad'];
    if (c.includes('appetizer') || c.includes('starter')) return ['appetizer'];
    if (c.includes('biryani') || c.includes('rice')) return ['biryani', 'rice'];
    if (c.includes('indian')) return ['indian food'];
    if (c.includes('oriental') || c.includes('chinese')) return ['asian food'];
    if (c.includes('european')) return ['european food'];
    return [];
  }

  private static buildQueryCandidates(dish: string, category: string): string[] {
    const dn = this.normalizeDishName(dish);
    const cat = (category || '').toLowerCase();
    const catWords = this.getCategoryKeywords(cat);

    const qualifiers = ['food', 'dish', 'meal', 'cuisine'];
    const drinkQualifiers = ['drink', 'beverage', 'glass'];
    const dessertQualifiers = ['dessert', 'sweet'];

    const isDrink = /\b(cola|coke|sprite|pepsi|soda|tea|coffee|shake|smoothie|mojito|juice|mocktail|beer|wine)\b/i.test(dn) || /beverage|drink/i.test(cat);
    const isDessert = /dessert|cake|brownie|ice cream|tiramisu|cheesecake|gulab|rasmalai|jalebi/i.test(dn) || /dessert/i.test(cat);

    const candidates: string[] = [];
    const baseWords = [dn, `${dn} ${cat}`].filter(Boolean);
    const kwCombos = catWords.map(kw => `${dn} ${kw}`);

    const withQualifiers = (arr: string[], quals: string[]) => arr.flatMap(s => quals.map(q => `${s} ${q}`));

    if (isDrink) {
      candidates.push(...withQualifiers(baseWords, drinkQualifiers));
    } else if (isDessert) {
      candidates.push(...withQualifiers(baseWords, dessertQualifiers));
    } else {
      candidates.push(...withQualifiers(baseWords, qualifiers));
    }

    candidates.push(...withQualifiers(kwCombos, isDrink ? drinkQualifiers : (isDessert ? dessertQualifiers : qualifiers)));
    candidates.push(...(isDrink ? drinkQualifiers : (isDessert ? dessertQualifiers : qualifiers)));
    if (cat) candidates.push(`${cat} food`);

    return Array.from(new Set(candidates)).filter(Boolean);
  }
  // Search Pexels
  static async searchPexels(query: string, count: number = 1, page: number = 1): Promise<PexelsPhoto[]> {
    const perPage = Math.max(1, Math.min(10, count));
    const resp = await fetch(`${PEXELS_API_URL}/search?query=${encodeURIComponent(query)}&per_page=${perPage}&page=${page}&orientation=landscape`, {
      headers: { 'Authorization': PEXELS_API_KEY || '' }
    });
    if (!resp.ok) throw new Error(`Pexels API error: ${resp.status}`);
    const raw = await resp.text();
    let json: any;
    try {
      json = JSON.parse(raw);
    } catch (e: any) {
      throw new Error(`Pexels JSON parse failed: status ${resp.status}. ${String(raw).slice(0, 120)}`);
    }
    // Filter out people/animals by tags/alt where possible
    const animals = /(dog|cat|animal|tiger|lion|goat|cow|monkey|horse|elephant|bird)/i;
    const people = /(person|people|man|woman|boy|girl|hand|portrait|face)/i;
    return (json.photos || []).filter((p: any) => {
      const txt = `${p.alt || ''}`;
      return !animals.test(txt) && !people.test(txt);
    });
  }

  // Search Pixabay
  static async searchPixabay(query: string, count: number = 1, page: number = 1): Promise<PixabayHit[]> {
    // Pixabay requires per_page between 3 and 200
    const perPage = Math.max(3, Math.min(20, count));
    const url = `${PIXABAY_API_URL}/?key=${encodeURIComponent(PIXABAY_API_KEY || '')}&q=${encodeURIComponent(query)}&category=food&image_type=photo&per_page=${perPage}&page=${page}&orientation=horizontal&safesearch=true`;
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`Pixabay API error: ${resp.status}`);
    const raw = await resp.text();
    let json: any;
    try {
      json = JSON.parse(raw);
    } catch (e: any) {
      throw new Error(`Pixabay JSON parse failed: status ${resp.status}. ${String(raw).slice(0, 120)}`);
    }
    const animals = /(dog|cat|animal|tiger|lion|goat|cow|monkey|horse|elephant|bird)/i;
    const people = /(person|people|man|woman|boy|girl|hand|portrait|face)/i;
    return (json.hits || []).filter((h: any) => {
      const txt = `${h.tags || ''}`;
      return !animals.test(txt) && !people.test(txt);
    });
  }

  /**
   * Download image from URL
   */
  static async downloadImage(imageUrl: string): Promise<Buffer> {
    try {
      const response = await fetch(imageUrl);
      if (!response.ok) {
        throw new Error(`Failed to download image: ${response.status}`);
      }
      
      const arrayBuffer = await response.arrayBuffer();
      return Buffer.from(arrayBuffer);
    } catch (error) {
      console.error('Error downloading image:', error);
      throw error;
    }
  }

  /**
   * Upload image to Cloudinary with optimization
   */
  static async uploadToCloudinary(
    imageBuffer: Buffer,
    folder: string = 'foodfly/menu',
    transformation: string = 'f_auto,q_auto,w_800,h_600,c_fill'
  ): Promise<CloudinaryUploadResult> {
    try {
      return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            folder,
            resource_type: 'image',
            timeout: 60000,
          },
          (error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result as CloudinaryUploadResult);
            }
          }
        );

        uploadStream.end(imageBuffer);
      });
    } catch (error) {
      console.error('Error uploading to Cloudinary:', error);
      throw error;
    }
  }

  /**
   * Generate optimized image URLs for different sizes
   */
  static generateOptimizedUrls(publicId: string, baseUrl: string) {
    return {
      thumbnail: `${baseUrl}/c_fill,w_200,h_200/${publicId}`,
      small: `${baseUrl}/c_fill,w_400,h_300/${publicId}`,
      medium: `${baseUrl}/c_fill,w_800,h_600/${publicId}`,
      large: `${baseUrl}/c_fill,w_1200,h_900/${publicId}`,
      original: baseUrl + '/' + publicId,
    };
  }

  /**
   * Complete pipeline: Search → Download → Upload → Return URLs
   */
  static async processMenuImage(
    foodItem: string,
    category: string,
    folder: string = 'foodfly/menu',
    options?: { avoidUrls?: string[]; randomize?: boolean; providerPreference?: 'pexels-first' | 'pixabay-first' }
  ): Promise<{
    public_id: string;
    urls: {
      thumbnail: string;
      small: string;
      medium: string;
      large: string;
      original: string;
    };
    metadata: {
      width: number;
      height: number;
      format: string;
      bytes: number;
    };
    sourceUrl: string;
  }> {
    try {
      // 1. Search via providers with preference (default pexels → pixabay)
      const candidates = this.buildQueryCandidates(foodItem, category);
      let imageUrl: string | null = null;
      const avoidArr = (options?.avoidUrls || []).filter(Boolean);
      const randomize = options?.randomize !== false; // default true
      const preferPixabay = options?.providerPreference === 'pixabay-first';
      for (const q of candidates) {
        // provider order: either pixabay → pexels or pexels → pixabay
        const tryPixabayFirst = async () => {
          if (!imageUrl && PIXABAY_API_KEY) {
            try {
              const page = randomize ? 1 + Math.floor(Math.random() * 5) : 1;
              const hits = await this.searchPixabay(q, 20, page);
              for (const h of hits) {
                // Prefer moderately-sized images to reduce Cloudinary upload failures/timeouts
                const url = h.webformatURL || h.largeImageURL || h.previewURL;
                if (url && !avoidArr.some(a => url.includes(a))) {
                  imageUrl = url;
                  return;
                }
              }
            } catch {}
          }
          if (!imageUrl && PEXELS_API_KEY) {
            try {
              const page = randomize ? 1 + Math.floor(Math.random() * 5) : 1;
              const photos = await this.searchPexels(q, 12, page);
              for (const p of photos) {
                // Prefer large/medium over very large variants
                const url = p.src.large || p.src.medium || p.src.large2x || p.src.small || p.src.tiny;
                if (url && !avoidArr.some(a => url.includes(a))) {
                  imageUrl = url;
                  return;
                }
              }
            } catch {}
          }
        };
        const tryPexelsFirst = async () => {
          if (!imageUrl && PEXELS_API_KEY) {
            try {
              const page = randomize ? 1 + Math.floor(Math.random() * 5) : 1;
              const photos = await this.searchPexels(q, 12, page);
              for (const p of photos) {
                const url = p.src.large || p.src.medium || p.src.large2x || p.src.small || p.src.tiny;
                if (url && !avoidArr.some(a => url.includes(a))) {
                  imageUrl = url;
                  return;
                }
              }
            } catch {}
          }
          if (!imageUrl && PIXABAY_API_KEY) {
            try {
              const page = randomize ? 1 + Math.floor(Math.random() * 5) : 1;
              const hits = await this.searchPixabay(q, 20, page);
              for (const h of hits) {
                const url = h.webformatURL || h.largeImageURL || h.previewURL;
                if (url && !avoidArr.some(a => url.includes(a))) {
                  imageUrl = url;
                  return;
                }
              }
            } catch {}
          }
        };
        if (preferPixabay) {
          await tryPixabayFirst();
        } else {
          await tryPexelsFirst();
        }
        if (imageUrl) break;
      }
      if (!imageUrl) throw new Error(`No images found for: ${foodItem} ${category}`);

      // 2. Download the image
      const imageBuffer = await this.downloadImage(imageUrl);

      // 3. Upload to Cloudinary with optimization
      const uploadResult = await this.uploadToCloudinary(
        imageBuffer,
        `${folder}/${category.toLowerCase().replace(/\s+/g, '-')}`,
        'f_auto,q_auto,w_800,h_600,c_fill'
      );

      // 4. Generate optimized URLs
      const baseUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/image/upload`;
      const urls = this.generateOptimizedUrls(uploadResult.public_id, baseUrl);

      return {
        public_id: uploadResult.public_id,
        urls,
        metadata: {
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format,
          bytes: uploadResult.bytes,
        },
        sourceUrl: imageUrl,
      };
    } catch (error) {
      console.error('Error processing menu image:', error);
      throw error;
    }
  }

  /**
   * Batch process multiple menu items
   */
  static async batchProcessMenuImages(
    menuItems: Array<{ name: string; category: string; id: string }>
  ): Promise<Record<string, any>> {
    const results: Record<string, any> = {};
    const batchSize = 5; // Process 5 at a time to avoid rate limits

    for (let i = 0; i < menuItems.length; i += batchSize) {
      const batch = menuItems.slice(i, i + batchSize);
      
      const batchPromises = batch.map(async (item) => {
        try {
          const result = await this.processMenuImage(item.name, item.category);
          return { id: item.id, success: true, data: result };
        } catch (error) {
          console.error(`Failed to process image for ${item.name}:`, error);
          return { id: item.id, success: false, error: error.message };
        }
      });

      const batchResults = await Promise.all(batchPromises);
      
      batchResults.forEach(result => {
        results[result.id] = result;
      });

      // Add delay between batches to respect rate limits
      if (i + batchSize < menuItems.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  /**
   * Delete image from Cloudinary
   */
  static async deleteImage(publicId: string): Promise<boolean> {
    try {
      const result = await cloudinary.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      console.error('Error deleting image from Cloudinary:', error);
      return false;
    }
  }

  /**
   * Get image analytics from Cloudinary
   */
  static async getImageAnalytics(publicId: string) {
    try {
      const result = await cloudinary.api.resource(publicId, {
        fields: 'public_id,bytes,format,width,height,created_at,url',
      });
      return result;
    } catch (error) {
      console.error('Error getting image analytics:', error);
      throw error;
    }
  }
}

// Utility functions for common food categories
export const FOOD_IMAGE_QUERIES = {
  'Bar Munchies': ['appetizer', 'snack', 'finger food'],
  'Soups': ['soup', 'broth', 'bisque'],
  'Salad Station': ['salad', 'fresh vegetables', 'healthy bowl'],
  'Appetizers': ['appetizer', 'starter', 'small plate'],
  'Main Course': ['main dish', 'entree', 'dinner plate'],
  'Sizzlers': ['sizzler', 'hot plate', 'sizzling dish'],
  'Pizza': ['pizza', 'italian pizza', 'wood fired pizza'],
  'Sandwiches': ['sandwich', 'sub', 'wrap'],
  'Burgers': ['burger', 'hamburger', 'cheeseburger'],
  'Rice & Biryani': ['biryani', 'rice dish', 'indian rice'],
  'Breads': ['naan', 'bread', 'flatbread'],
  'Desserts': ['dessert', 'sweet', 'cake'],
  'Beverages': ['drink', 'beverage', 'mocktail'],
};

export default ImageService;
