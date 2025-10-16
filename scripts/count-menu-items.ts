// Count total menu items per restaurant using admin modules
// Run with: ts-node scripts/count-menu-items.ts

import getPanacheAdminMenu from '../src/lib/menus/admin/panache';
import getCafeAdminMenu from '../src/lib/menus/admin/cafe';
import getSymposiumAdminMenu from '../src/lib/menus/admin/symposium';

function count(label: string, items: any[]) {
  console.log(`${label}: ${items.length}`);
}

function main() {
  const panache = getPanacheAdminMenu();
  const cafe = getCafeAdminMenu();
  const symposium = getSymposiumAdminMenu();

  console.log('Total dishes per restaurant');
  count('Panache (1)', panache);
  count('Cafe After Hours (2)', cafe);
  count('Symposium (3)', symposium);
}

main();
