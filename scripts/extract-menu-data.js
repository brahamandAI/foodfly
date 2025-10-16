// Script to extract complete menu data from RestaurantMenuGrid.tsx
const fs = require('fs');
const path = require('path');

// Read the RestaurantMenuGrid.tsx file
const filePath = path.join(__dirname, '../src/components/RestaurantMenuGrid.tsx');
const content = fs.readFileSync(filePath, 'utf8');

// Extract Panache menu data (restaurant ID '1')
const panacheStart = content.indexOf("'1': { // Panache - Complete Menu");
const panacheEnd = content.indexOf("'2': { // Cafe After Hours");

const panacheMenuSection = content.substring(panacheStart, panacheEnd);

// Extract categories for Panache
const categoryRegex = /{\s*name: '([^']+)',\s*img: '[^']*',\s*items: \[([\s\S]*?)\]\s*}/g;
let match;
const panacheCategories = [];

console.log('=== PANACHE RESTAURANT CATEGORIES ===');
while ((match = categoryRegex.exec(panacheMenuSection)) !== null) {
  const categoryName = match[1];
  const itemsSection = match[2];
  
  // Count items in this category
  const itemMatches = itemsSection.match(/_id: '[^']+'/g);
  const itemCount = itemMatches ? itemMatches.length : 0;
  
  console.log(`${categoryName}: ${itemCount} items`);
  panacheCategories.push({
    name: categoryName,
    itemCount: itemCount
  });
}

console.log(`\nTOTAL PANACHE CATEGORIES: ${panacheCategories.length}`);
console.log(`TOTAL ITEMS: ${panacheCategories.reduce((sum, cat) => sum + cat.itemCount, 0)}`);

// Extract Cafe After Hours menu data (restaurant ID '2')
const cafeStart = content.indexOf("'2': { // Cafe After Hours");
const cafeEnd = content.indexOf("'3': { // Symposium");

const cafeMenuSection = content.substring(cafeStart, cafeEnd);
const cafeCategories = [];

console.log('\n=== CAFE AFTER HOURS CATEGORIES ===');
categoryRegex.lastIndex = 0; // Reset regex
while ((match = categoryRegex.exec(cafeMenuSection)) !== null) {
  const categoryName = match[1];
  const itemsSection = match[2];
  
  // Count items in this category
  const itemMatches = itemsSection.match(/_id: '[^']+'/g);
  const itemCount = itemMatches ? itemMatches.length : 0;
  
  console.log(`${categoryName}: ${itemCount} items`);
  cafeCategories.push({
    name: categoryName,
    itemCount: itemCount
  });
}

console.log(`\nTOTAL CAFE CATEGORIES: ${cafeCategories.length}`);
console.log(`TOTAL ITEMS: ${cafeCategories.reduce((sum, cat) => sum + cat.itemCount, 0)}`);

// Extract Symposium menu data (restaurant ID '3')
const symposiumStart = content.indexOf("'3': { // Symposium");
const symposiumEnd = content.indexOf("default:");

const symposiumMenuSection = content.substring(symposiumStart, symposiumEnd);
const symposiumCategories = [];

console.log('\n=== SYMPOSIUM RESTAURANT CATEGORIES ===');
categoryRegex.lastIndex = 0; // Reset regex
while ((match = categoryRegex.exec(symposiumMenuSection)) !== null) {
  const categoryName = match[1];
  const itemsSection = match[2];
  
  // Count items in this category
  const itemMatches = itemsSection.match(/_id: '[^']+'/g);
  const itemCount = itemMatches ? itemMatches.length : 0;
  
  console.log(`${categoryName}: ${itemCount} items`);
  symposiumCategories.push({
    name: categoryName,
    itemCount: itemCount
  });
}

console.log(`\nTOTAL SYMPOSIUM CATEGORIES: ${symposiumCategories.length}`);
console.log(`TOTAL ITEMS: ${symposiumCategories.reduce((sum, cat) => sum + cat.itemCount, 0)}`);
