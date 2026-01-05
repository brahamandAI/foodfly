import { verifyToken } from '@/lib/backend/middleware/auth';
import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';
import Order from '@/lib/backend/models/order.model';
import Cart from '@/lib/backend/models/cart.model';
import Notification from '@/lib/backend/models/notification.model';
import User from '@/lib/backend/models/user.model';
import { isWithinDeliveryRadius, getDistanceToRestaurant, MAX_DELIVERY_RADIUS_KM, RESTAURANT_NAMES, RESTAURANT_ADDRESSES, getRestaurantNumericId } from '@/lib/distanceService';
import { sanitizeImageUrl } from '@/lib/menuUtils';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const user = verifyToken(request);
    
    // Get query parameters
    const { searchParams } = new URL(request.url);
    const includeCancelled = searchParams.get('includeCancelled') === 'true';
    const status = searchParams.get('status');
    
    // Build query filter
    let queryFilter: any = { customerId: user._id };
    
    // Filter by specific status if provided
    if (status && status !== 'all') {
      queryFilter.status = status;
    } else if (!includeCancelled && status !== 'cancelled') {
      // By default, exclude cancelled orders unless specifically requested or filtering by cancelled
      queryFilter.status = { $ne: 'cancelled' };
    }

    // Get user's orders using customerId field
    const orders = await (Order as any).find(queryFilter)
      .sort({ createdAt: -1 })
      .limit(50);

    return NextResponse.json({
      orders: orders.map(order => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        customerId: order.customerId,
        customerEmail: order.customerEmail,
        restaurant: {
          _id: order.restaurantId,
          name: order.restaurantName
        },
        items: (order.items || []).map((item: any) => {
          const sanitizedItem = { ...item };
          // Sanitize image at root level if it exists
          if (sanitizedItem.image) {
            sanitizedItem.image = sanitizeImageUrl(sanitizedItem.image);
          }
          // Sanitize image in menuItem if it exists
          if (sanitizedItem.menuItem && sanitizedItem.menuItem.image) {
            sanitizedItem.menuItem.image = sanitizeImageUrl(sanitizedItem.menuItem.image);
          }
          return sanitizedItem;
        }),
        subtotal: order.subtotal,
        deliveryFee: order.deliveryFee,
        taxes: order.taxes,
        totalAmount: order.totalAmount,
        status: order.status,
        paymentMethod: order.paymentMethod,
        paymentStatus: order.paymentStatus,
        deliveryAddress: order.deliveryAddress,
        estimatedDeliveryTime: order.estimatedDeliveryTime,
        specialInstructions: order.specialInstructions,
        placedAt: order.placedAt,
        createdAt: order.createdAt,
        updatedAt: order.updatedAt
      })),
      message: 'Orders retrieved successfully'
    });

  } catch (error: any) {
    console.error('Get orders error:', error);
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const user = verifyToken(request);
    
    const { items, deliveryAddress, paymentMethod, specialInstructions, totalAmount, userLocation } = await request.json();

    if (!items || !Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Order items are required' },
        { status: 400 }
      );
    }

    if (!deliveryAddress) {
      return NextResponse.json(
        { error: 'Delivery address is required' },
        { status: 400 }
      );
    }

    // Group items by restaurant to handle multiple restaurants
    const itemsByRestaurant: Record<string, any[]> = {};
    items.forEach((item: any) => {
      const rid = item.restaurantId || 'default-restaurant';
      if (!itemsByRestaurant[rid]) {
        itemsByRestaurant[rid] = [];
      }
      itemsByRestaurant[rid].push(item);
    });

    const restaurantIds = Object.keys(itemsByRestaurant);
    
    // CRITICAL: Validate delivery radius (2km max) for EACH restaurant - MANDATORY CHECK
    let userCoordinates = null;
    
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      userCoordinates = {
        latitude: userLocation.latitude,
        longitude: userLocation.longitude
      };
      console.log('✅ Using provided location:', userCoordinates);
    } else if (deliveryAddress) {
      // Try multiple geocoding methods using Google Maps API for accuracy
      console.log('🔍 Attempting to geocode address...');
      
      // Use server-side API key (without HTTP referrer restrictions) if available
      // Otherwise fall back to the public key (which may have restrictions)
      const apiKey = process.env.GOOGLE_MAPS_API_KEY_SERVER || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
      console.log(`🔑 Google Maps API Key configured: ${apiKey ? 'YES' : 'NO'} ${apiKey && apiKey !== 'your_google_maps_api_key_here' ? '(valid format)' : '(missing or placeholder)'}`);
      console.log(`🔑 Using: ${process.env.GOOGLE_MAPS_API_KEY_SERVER ? 'Server-side key (no referrer restrictions)' : 'Public key (may have referrer restrictions)'}`);
      
      // Method 1: Try Google Maps API with full address
      if (apiKey && apiKey !== 'your_google_maps_api_key_here') {
        try {
          const fullAddress = `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.state}, ${deliveryAddress.pincode}, India`;
          console.log('🔍 Geocoding with Google Maps:', fullAddress);
          
          const geocodeResponse = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}&region=in`
          );
          
          const geocodeData = await geocodeResponse.json();
          
          if (geocodeData.status === 'OK' && geocodeData.results && geocodeData.results.length > 0) {
            const location = geocodeData.results[0].geometry.location;
            userCoordinates = {
              latitude: location.lat,
              longitude: location.lng
            };
            console.log('✅ Address geocoded successfully with Google Maps:', userCoordinates);
          } else {
            console.log(`⚠️ Google Maps geocoding failed: ${geocodeData.status} - ${geocodeData.error_message || 'No results'}`);
          }
        } catch (error) {
          console.error('❌ Google Maps geocoding error:', error);
        }
      } else {
        console.log('⚠️ Google Maps API key not configured or is placeholder');
      }
      
      // Method 2: Try Google Maps with simplified address (street + city) if first failed
      if (!userCoordinates && apiKey && apiKey !== 'your_google_maps_api_key_here') {
        try {
          // For Dwarka addresses, prioritize "Dwarka" in the address
          const simplifiedAddress = deliveryAddress.city.toLowerCase().includes('dwarka') 
            ? `${deliveryAddress.street}, Dwarka, New Delhi, ${deliveryAddress.pincode}, India`
            : `${deliveryAddress.street}, ${deliveryAddress.city}, New Delhi, ${deliveryAddress.pincode}, India`;
          console.log('🔍 Trying simplified Google Maps geocoding:', simplifiedAddress);
          
          const geocodeResponse = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(simplifiedAddress)}&key=${apiKey}&region=in`
          );
          
          const geocodeData = await geocodeResponse.json();
          
          if (geocodeData.status === 'OK' && geocodeData.results && geocodeData.results.length > 0) {
            const location = geocodeData.results[0].geometry.location;
            userCoordinates = {
              latitude: location.lat,
              longitude: location.lng
            };
            console.log('✅ Simplified address geocoded successfully with Google Maps:', userCoordinates);
          } else {
            console.log(`⚠️ Simplified Google Maps geocoding failed: ${geocodeData.status} - ${geocodeData.error_message || 'No results'}`);
          }
        } catch (error) {
          console.error('❌ Simplified Google Maps geocoding error:', error);
        }
      }
      
      // Method 3: Fallback to Nominatim if Google Maps not available
      if (!userCoordinates) {
        try {
          const fullAddress = `${deliveryAddress.street}, ${deliveryAddress.city}, ${deliveryAddress.state}, ${deliveryAddress.pincode}, India`;
          console.log('Trying Nominatim geocoding (fallback):', fullAddress);
          
          const geocodeResponse = await fetch(
            `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1&countrycodes=in`,
            {
              headers: { 'User-Agent': 'FoodFly-App' }
            }
          );
          
          const geocodeData = await geocodeResponse.json();
          
          if (geocodeData && geocodeData.length > 0) {
            userCoordinates = {
              latitude: parseFloat(geocodeData[0].lat),
              longitude: parseFloat(geocodeData[0].lon)
            };
            console.log('✅ Address geocoded successfully with Nominatim:', userCoordinates);
          }
        } catch (error) {
          console.error('Nominatim geocoding error:', error);
        }
      }
    }
    
    // CRITICAL: Validate delivery radius for EACH restaurant - MANDATORY CHECK
    console.log('🔍 Starting distance validation...', {
      hasUserCoordinates: !!userCoordinates,
      userCoordinates,
      restaurantIds,
      restaurantCount: restaurantIds.length,
      itemsByRestaurant: Object.keys(itemsByRestaurant).map(rid => ({
        restaurantId: rid,
        itemCount: itemsByRestaurant[rid].length,
        restaurantName: itemsByRestaurant[rid][0]?.restaurantName
      }))
    });
    
    if (userCoordinates) {
      // Additional validation: Check if coordinates are reasonable (within India bounds)
      const isWithinIndia = userCoordinates.latitude >= 6.5 && userCoordinates.latitude <= 37.1 &&
                            userCoordinates.longitude >= 68.1 && userCoordinates.longitude <= 97.4;
      
      if (!isWithinIndia) {
        console.error('❌ Coordinates outside India bounds:', userCoordinates);
        return NextResponse.json(
          { 
            error: 'Invalid delivery location',
            message: 'The provided address coordinates are invalid. Please enter a valid address in New Delhi.',
            suggestion: 'Please ensure your address is in New Delhi, India.'
          },
          { status: 400 }
        );
      }
      
      console.log('✅ Coordinates are within India bounds, proceeding with distance validation');
      
      // Validate distance for EACH restaurant
      for (const rid of restaurantIds) {
        const restaurantItems = itemsByRestaurant[rid];
        const rname = restaurantItems[0]?.restaurantName || RESTAURANT_NAMES[rid] || 'Restaurant';
        
        console.log(`🔍 Validating distance for restaurant: ${rname} (ID: ${rid})`);
        
        // Convert restaurant ID/name to numeric ID for distance calculation
        const numericId = getRestaurantNumericId(rname) || (RESTAURANT_NAMES[rid] ? rid : null);
        
        if (!numericId) {
          console.error(`❌ Cannot find numeric ID for restaurant: ${rname} (ID: ${rid})`);
          console.error('Available restaurant mappings:', {
            restaurantNames: Object.values(RESTAURANT_NAMES),
            restaurantIds: Object.keys(RESTAURANT_NAMES)
          });
          return NextResponse.json(
            { 
              error: 'Restaurant not found',
              message: `Unable to validate delivery distance for ${rname}. Please try again.`
            },
            { status: 400 }
          );
        }
        
        console.log(`✅ Found numeric ID for ${rname}: ${numericId}`);
        
        const canDeliver = isWithinDeliveryRadius(numericId, userCoordinates);
        const distance = getDistanceToRestaurant(numericId, userCoordinates);
        
        console.log('📏 Distance validation result:', {
          restaurant: rname,
          restaurantId: rid,
          numericId,
          distance: distance ? distance.toFixed(2) + 'km' : 'unknown',
          canDeliver,
          maxRadius: MAX_DELIVERY_RADIUS_KM + 'km',
          userCoords: userCoordinates
        });
        
        // STRICT VALIDATION: Reject if distance is greater than 2km OR if canDeliver is false
        if (!canDeliver || (distance && distance > MAX_DELIVERY_RADIUS_KM)) {
          const restaurantAddress = RESTAURANT_ADDRESSES[numericId] || 'our restaurant location';
          
          console.error(`❌ Distance validation FAILED for ${rname}:`, {
            distance: distance ? distance.toFixed(2) + 'km' : 'unknown',
            canDeliver,
            maxRadius: MAX_DELIVERY_RADIUS_KM + 'km'
          });
          
          return NextResponse.json(
            { 
              error: `We can't deliver to this location 😔`,
              message: `${rname} is ${distance ? distance.toFixed(1) : 'more than'}km away from your delivery address. To ensure your food arrives fresh and hot, we can only deliver within ${MAX_DELIVERY_RADIUS_KM}km.`,
              distance: distance ? distance.toFixed(1) : 'unknown',
              maxRadius: MAX_DELIVERY_RADIUS_KM,
              restaurantAddress,
              suggestion: `Please select a delivery address within ${MAX_DELIVERY_RADIUS_KM}km of ${rname}. Our restaurant is located at ${restaurantAddress}.`,
              addressInfo: {
                city: deliveryAddress.city,
                state: deliveryAddress.state,
                pincode: deliveryAddress.pincode
              }
            },
            { status: 400 }
          );
        }
        
        // Additional check: If distance is null or undefined, reject for safety
        if (!distance || distance === null) {
          console.error(`❌ Distance calculation failed for ${rname} - rejecting order`);
          return NextResponse.json(
            { 
              error: 'Unable to calculate delivery distance',
              message: `We couldn't calculate the distance to your address for ${rname}. Please try entering a more specific address.`,
              suggestion: 'Make sure to include complete address with area name, city, and correct pincode.'
            },
            { status: 400 }
          );
        }
        
        console.log(`✅ Distance validation PASSED for ${rname}: ${distance.toFixed(2)}km (within ${MAX_DELIVERY_RADIUS_KM}km limit)`);
      }
      
      console.log('✅✅✅ Distance validation passed for ALL restaurants - within 2km');
    } else {
      // Could not geocode - REJECT ORDER for safety
      console.error('❌ Could not geocode address - rejecting order for safety');
      console.error('Geocoding failure details:', {
        deliveryAddress,
        hasUserLocation: !!userLocation,
        userLocation
      });
      return NextResponse.json(
        { 
          error: 'Unable to verify delivery distance',
          message: `We couldn't verify if your address (${deliveryAddress.city}, ${deliveryAddress.state}) is within our 2km delivery radius. Please try entering a more specific address or contact support.`,
          suggestion: 'Make sure to include complete address with area name, city, and correct pincode. Our restaurants are located in Dwarka, New Delhi.'
        },
        { status: 400 }
      );
    }

    // Get user details
    const dbUser = await (User as any).findById(user._id);
    if (!dbUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Create separate orders for each restaurant
    const createdOrders = [];
    
    for (const rid of restaurantIds) {
      const restaurantItems = itemsByRestaurant[rid];
      const rname = restaurantItems[0]?.restaurantName || RESTAURANT_NAMES[rid] || 'Restaurant';
      
      // Calculate order totals for this restaurant
      const subtotal = restaurantItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const deliveryFee = subtotal >= 300 ? 0 : 40; // Free delivery above ₹300
      const taxes = Math.round(subtotal * 0.05); // 5% tax
      const calculatedTotal = subtotal + deliveryFee + taxes;

      // Generate unique order number
      const orderNumber = `ORD${Date.now()}${Math.random().toString(36).substr(2, 4).toUpperCase()}`;

      // Create new order for this restaurant
      const order = new Order({
        customerId: user._id,
        customerEmail: dbUser.email,
        restaurantId: rid,
        restaurantName: rname,
        orderNumber,
        items: restaurantItems.map((item: any) => ({
          menuItemId: item.menuItemId || item.id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          quantity: item.quantity,
          customizations: item.customizations || []
        })),
        subtotal,
        deliveryFee,
        taxes,
        totalAmount: calculatedTotal,
        status: 'pending',
        paymentMethod: paymentMethod || 'cod',
        paymentStatus: 'pending',
        deliveryAddress: {
          name: deliveryAddress.name,
          phone: deliveryAddress.phone,
          street: deliveryAddress.street,
          landmark: deliveryAddress.landmark || '',
          city: deliveryAddress.city,
          state: deliveryAddress.state,
          pincode: deliveryAddress.pincode
        },
        specialInstructions: specialInstructions || '',
        estimatedDeliveryTime: new Date(Date.now() + 45 * 60 * 1000), // 45 minutes from now
        placedAt: new Date()
      });

      await order.save();
      createdOrders.push(order);

      // Create order confirmation notification for restaurant admin
      const restaurantNotification = new Notification({
        userId: user._id, // In real app, this would be restaurant owner's ID
        type: 'order_confirmed',
        title: `New Order from ${rname}! 🎉`,
        message: `New order #${order.orderNumber} received. Total: ₹${calculatedTotal}`,
        priority: 'high',
        channels: ['app'],
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          restaurantId: rid,
          restaurantName: rname,
          totalAmount: calculatedTotal,
          estimatedDeliveryTime: order.estimatedDeliveryTime
        }
      });

      await restaurantNotification.save();
    }

    // Create customer notification for all orders
    const orderNotification = new Notification({
      userId: user._id,
      type: 'order_confirmed',
      title: 'Order placed successfully! 🎉',
      message: `Your ${createdOrders.length} order(s) have been placed and will be delivered in 30-45 minutes.`,
      priority: 'high',
      channels: ['app'],
      data: {
        orderIds: createdOrders.map(o => o._id),
        orderNumbers: createdOrders.map(o => o.orderNumber),
        totalAmount: createdOrders.reduce((sum, o) => sum + o.totalAmount, 0),
        estimatedDeliveryTime: createdOrders[0].estimatedDeliveryTime
      }
    });

    await orderNotification.save();

    // Clear user's cart after successful order
    await (Cart as any).findOneAndUpdate(
      { userId: user._id },
      { $set: { items: [] } }
    );

    // Return response with orderId for backward compatibility
    // For multiple orders, use the first order's ID
    const primaryOrder = createdOrders[0];
    
    return NextResponse.json({
      message: createdOrders.length > 1 
        ? `${createdOrders.length} orders placed successfully` 
        : 'Order placed successfully',
      orderId: primaryOrder._id.toString(), // For backward compatibility
      order: {
        _id: primaryOrder._id,
        orderNumber: primaryOrder.orderNumber,
        restaurantId: primaryOrder.restaurantId,
        restaurantName: primaryOrder.restaurantName,
        status: primaryOrder.status,
        totalAmount: primaryOrder.totalAmount,
        estimatedDeliveryTime: primaryOrder.estimatedDeliveryTime,
        createdAt: primaryOrder.createdAt
      },
      orders: createdOrders.map(order => ({
        _id: order._id,
        orderNumber: order.orderNumber,
        restaurantId: order.restaurantId,
        restaurantName: order.restaurantName,
        status: order.status,
        totalAmount: order.totalAmount,
        estimatedDeliveryTime: order.estimatedDeliveryTime,
        createdAt: order.createdAt
      }))
    });

  } catch (error: any) {
    console.error('Create order error:', error);
    if (error.message === 'No token provided' || error.message === 'Invalid token') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 