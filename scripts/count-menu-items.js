// Count total dishes per restaurant without TypeScript runtime
// Usage: node scripts/count-menu-items.js

const fs = require('fs');
const path = require('path');

function readFile(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function countIdsInRange(text, startMarker, endMarker) {
  const start = text.indexOf(startMarker);
  if (start === -1) return 0;
  const end = text.indexOf(endMarker, start + startMarker.length);
  const slice = end !== -1 ? text.slice(start, end) : text.slice(start);
  const matches = slice.match(/"_id"\s*:\s*"/g);
  return matches ? matches.length : 0;
}

function countRawMenuLines(fileText) {
  const startMarker = 'const RAW_MENU = `';
  const start = fileText.indexOf(startMarker);
  if (start === -1) return 0;
  const after = start + startMarker.length;
  const end = fileText.indexOf('`;', after);
  if (end === -1) return 0;
  const block = fileText.slice(after, end);
  const lines = block.split(/\r?\n/);
  // Count lines that look like Dish Name - price pattern (ignore category headers)
  const dishLines = lines.filter((l) => /\s-\s*\d/.test(l));
  return dishLines.length;
}

function main() {
  const adminRoutePath = path.join(process.cwd(), 'src', 'app', 'api', 'restaurant-admin', 'menu', 'route.ts');
  const adminText = readFile(adminRoutePath);
  const panacheCount = countIdsInRange(adminText, '"1": [', '"2": [');
  const cafeCount = countIdsInRange(adminText, '"2": [', '"3": [');

  const symposiumModulePath = path.join(process.cwd(), 'src', 'lib', 'menus', 'admin', 'symposium.ts');
  const symposiumText = readFile(symposiumModulePath);
  const symposiumCount = countRawMenuLines(symposiumText);

  console.log('Total dishes per restaurant (dish lines):');
  console.log(`Panache (1): ${panacheCount}`);
  console.log(`Cafe After Hours (2): ${cafeCount}`);
  console.log(`Symposium (3): ${symposiumCount}`);
}

main();


