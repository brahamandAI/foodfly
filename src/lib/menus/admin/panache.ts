// Panache admin static menu loader
// Extracts the Panache (restaurantId "1") items from the admin menu route file.

import fs from 'fs';
import path from 'path';

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

let CACHED: AdminMenuItem[] | null = null;

function extractArrayByKey(fileContent: string, key: string): string {
  const marker = `"${key}": [`;
  const startIdx = fileContent.indexOf(marker);
  if (startIdx === -1) return '[]';
  const arrayStart = startIdx + marker.length - 1; // points at '['
  let depth = 0;
  let i = arrayStart;
  for (; i < fileContent.length; i += 1) {
    const ch = fileContent[i];
    if (ch === '[') depth += 1;
    else if (ch === ']') {
      depth -= 1;
      if (depth === 0) {
        // include closing bracket
        i += 1;
        break;
      }
    }
  }
  const jsonArrayText = fileContent.slice(arrayStart, i);
  return jsonArrayText.trim();
}

export function getPanacheAdminMenu(): AdminMenuItem[] {
  if (CACHED) return CACHED;
  // Read from the admin route file to avoid duplication
  const routeFile = path.join(process.cwd(), 'src', 'app', 'api', 'restaurant-admin', 'menu', 'route.ts');
  const content = fs.readFileSync(routeFile, 'utf8');
  const arrayText = extractArrayByKey(content, '1');
  try {
    const parsed: AdminMenuItem[] = JSON.parse(arrayText);
    CACHED = parsed;
    return parsed;
  } catch (e) {
    // Fallback to empty on parse issues
    return [];
  }
}

export default getPanacheAdminMenu;


