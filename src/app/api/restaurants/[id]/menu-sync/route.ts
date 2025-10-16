import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';
import MenuItem from '@/lib/backend/models/restaurantMenu.model';
import CategoryImage from '@/lib/backend/models/categoryImage.model';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const restaurantId = params.id;
    console.log('🔄 Syncing menu from DB for restaurant:', restaurantId);

    await connectDB();

    // Fetch current menu directly from the database so admin changes reflect immediately
    const dbMenuItems = await MenuItem.find({ restaurantId }).sort({ category: 1, name: 1 });

    // If DB has no items for this restaurant, fallback to static modules
    if (!dbMenuItems || dbMenuItems.length === 0) {
      const [CategoryImageModel, getSymposiumAdminMenu, getCafeAdminMenu, getPanacheAdminMenu] = await Promise.all([
        import('@/lib/backend/models/categoryImage.model').then(m => m.default),
        import('@/lib/menus/admin/symposium').then(m => m.default),
        import('@/lib/menus/admin/cafe').then(m => m.default),
        import('@/lib/menus/admin/panache').then(m => m.default)
      ]);

      const raw = restaurantId === '3' ? getSymposiumAdminMenu() : restaurantId === '2' ? getCafeAdminMenu() : getPanacheAdminMenu();
      const grouped: Record<string, any[]> = {};
      raw.forEach((item: any) => {
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push({
          _id: item._id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          image: item.image,
          category: item.category,
          isVeg: item.isVeg,
          rating: item.rating || 4.0,
          preparationTime: item.preparationTime || '15-20 mins',
          variants: item.variants || [],
          variantPrices: (item as any).variantPrices || []
        });
      });

      // Pull Cloudinary category images if available
      const catDocs = await CategoryImageModel.find({ restaurantId }).lean();
      const catImageMap: Record<string, string> = {};
      catDocs.forEach((c: any) => { catImageMap[c.category] = c.imageUrl; });

      const categories = Object.keys(grouped).map((catName) => ({
        name: catName,
        img: catImageMap[catName] || `/images/categories/${catName.toLowerCase().replace(/\s+/g, '-')}.jpg`,
        items: grouped[catName]
      }));

      const totalItems = categories.reduce((sum, cat: any) => sum + cat.items.length, 0);
      return NextResponse.json({
        categories,
        totalItems,
        totalCategories: categories.length,
        lastUpdated: new Date().toISOString(),
        source: 'static-fallback',
        debug: { restaurantId, totalMenuItems: raw.length, availableItems: totalItems }
      });
    }

    // Group items by category to match the customer menu structure
    const categorizedMenu: { [key: string]: { name: string; img: string; items: any[] } } = {};

    dbMenuItems.forEach((item: any) => {
      if (item.isAvailable === false) return; // Hide only when explicitly false
      const categoryName = item.category || 'Others';
      if (!categorizedMenu[categoryName]) {
        const slug = categoryName.toLowerCase().replace(/\s+/g, '-');
        categorizedMenu[categoryName] = {
          name: categoryName,
          img: `/images/categories/${slug}.jpg`,
          items: []
        };
      }

      categorizedMenu[categoryName].items.push({
        _id: item._id,
        name: item.name,
        description: item.description,
        price: item.price,
        image: item.image,
        category: categoryName,
        isVeg: item.isVeg,
        rating: item.rating || 4.0,
        preparationTime: item.preparationTime || '15-20 mins',
        variants: item.variants || [],
        variantPrices: (item as any).variantPrices || []
      });
    });

    // Pull Cloudinary category images if available
    const catDocs = await CategoryImage.find({ restaurantId }).lean();
    const catImageMap: Record<string, string> = {};
    catDocs.forEach((c: any) => { catImageMap[c.category] = c.imageUrl; });

    const categories = Object.values(categorizedMenu).map(cat => ({
      ...cat,
      img: catImageMap[cat.name] || cat.img
    }));
    const totalItems = categories.reduce((sum, cat: any) => sum + cat.items.length, 0);

    console.log(`✅ Synced menu from DB for restaurant ${restaurantId}: ${categories.length} categories, ${totalItems} available items`);

    return NextResponse.json({
      categories,
      totalItems,
      totalCategories: categories.length,
      lastUpdated: new Date().toISOString(),
      debug: {
        restaurantId,
        totalMenuItems: dbMenuItems.length,
        availableItems: totalItems
      }
    });

  } catch (error: any) {
    console.error('Menu sync error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
