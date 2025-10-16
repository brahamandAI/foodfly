import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/backend/database';
import getSymposiumAdminMenu from '@/lib/menus/admin/symposium';
import getPanacheAdminMenu from '@/lib/menus/admin/panache';
import getCafeAdminMenu from '@/lib/menus/admin/cafe';

// Force dynamic rendering for this route
export const dynamic = 'force-dynamic';

// COMPLETE ORIGINAL MENU DATA - EXACT COPY from RestaurantMenuGrid.tsx
// All items set as AVAILABLE by default with proper status management
let adminMenuData: { [restaurantId: string]: any[] } = {
  "1": [
    {
      "_id": "panache_munch_001",
      "name": "French Fries Plain/Peri Peri/Cheesy",
      "description": "Crispy golden fries with choice of seasoning",
      "price": 145,
      "category": "Bar Munchies",
      "isVeg": true,
      "rating": 4.3,
      "preparationTime": "10-15 mins",
      "image": "/images/categories/Bar Munchies/french-fries.jpg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_munch_002",
      "name": "Garlic Bread Plain/Cheese",
      "description": "Fresh garlic bread with optional cheese",
      "price": 145,
      "category": "Bar Munchies",
      "isVeg": true,
      "rating": 4.4,
      "preparationTime": "8-12 mins",
      "image": "/images/categories/Bar Munchies/Garlic-Bread-4.webp",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_munch_003",
      "name": "Potato Wedges Plain/Peri Peri",
      "description": "Crispy potato wedges with seasoning",
      "price": 145,
      "category": "Bar Munchies",
      "isVeg": true,
      "rating": 4.2,
      "preparationTime": "12-18 mins",
      "image": "/images/categories/Bar Munchies/Potato Wedges Plain.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_munch_004",
      "name": "Chilly Cheese Toast",
      "description": "Spicy cheese toast with green chilies",
      "price": 145,
      "category": "Bar Munchies",
      "isVeg": true,
      "rating": 4.5,
      "preparationTime": "8-12 mins",
      "image": "/images/categories/sandwhich.jpg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_munch_005",
      "name": "Peanut Masala",
      "description": "Spiced roasted peanuts",
      "price": 145,
      "category": "Bar Munchies",
      "isVeg": true,
      "rating": 4.1,
      "preparationTime": "5-8 mins",
      "image": "/images/categories/Bar Munchies/Peanut Masala.webp",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_munch_006",
      "name": "Masala Papad",
      "description": "Crispy papad with masala",
      "price": 145,
      "category": "Bar Munchies",
      "isVeg": true,
      "rating": 4,
      "preparationTime": "3-5 mins",
      "image": "/images/categories/North-indian.jpg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_munch_007",
      "name": "American Corn Chat",
      "description": "Sweet corn with tangy chat masala",
      "price": 145,
      "category": "Bar Munchies",
      "isVeg": true,
      "rating": 4.3,
      "preparationTime": "8-12 mins",
      "image": "/images/categories/Fast-food.jpg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_munch_008",
      "name": "Hummus with Falafel",
      "description": "Creamy hummus served with falafel",
      "price": 195,
      "category": "Bar Munchies",
      "isVeg": true,
      "rating": 4.6,
      "preparationTime": "12-18 mins",
      "image": "/images/categories/Bar Munchies.jpg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_munch_009",
      "name": "Hummus with Pita",
      "description": "Creamy hummus served with pita bread",
      "price": 195,
      "category": "Bar Munchies",
      "isVeg": true,
      "rating": 4.5,
      "preparationTime": "10-15 mins",
      "image": "/images/categories/Bar Munchies.jpg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_munch_010",
      "name": "Loaded Nachos (Veg/Chicken)",
      "description": "Crispy tortilla chips topped with cheese and salsa",
      "price": 195,
      "category": "Bar Munchies",
      "isVeg": false,
      "rating": 4.7,
      "preparationTime": "15-20 mins",
      "image": "/images/categories/Bar Munchies.jpg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "panache_munch_011",
      "name": "Bruschettas (Tomato/Chicken)",
      "description": "Toasted bread with fresh toppings",
      "price": 195,
      "category": "Bar Munchies",
      "isVeg": false,
      "rating": 4.4,
      "preparationTime": "12-18 mins",
      "image": "/images/categories/Bar Munchies.jpg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "panache_munch_012",
      "name": "Cheesy Cigar Rolls (Veg/Chicken)",
      "description": "Crispy cigar rolls filled with cheese",
      "price": 195,
      "category": "Bar Munchies",
      "isVeg": false,
      "rating": 4.5,
      "preparationTime": "15-20 mins",
      "image": "/images/categories/Bar Munchies.jpg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "panache_soup_001",
      "name": "Almond Broccoli Soup",
      "description": "Creamy almond and broccoli soup",
      "price": 145,
      "category": "Soups",
      "isVeg": true,
      "rating": 4.4,
      "preparationTime": "15-20 mins",
      "image": "/images/categories/soups.jpg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_soup_002",
      "name": "Cream of Tomato Veg/Chicken",
      "description": "Creamy tomato soup with choice of base",
      "price": 145,
      "category": "Soups",
      "isVeg": false,
      "rating": 4.3,
      "preparationTime": "12-18 mins",
      "image": "/images/categories/soups.jpg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "panache_soup_003",
      "name": "Sweet Corn Soup Veg/Chicken",
      "description": "Sweet corn soup with choice of base",
      "price": 145,
      "category": "Soups",
      "isVeg": false,
      "rating": 4.2,
      "preparationTime": "12-18 mins",
      "image": "/images/categories/soups/Sweet Corn Soup.jpg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "panache_soup_004",
      "name": "Manchow Soup Veg/Chicken",
      "description": "Spicy manchow soup with choice of base",
      "price": 145,
      "category": "Soups",
      "isVeg": false,
      "rating": 4.5,
      "preparationTime": "15-20 mins",
      "image": "/images/categories/soups/Manchow Soup.jpg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "panache_salad_001",
      "name": "Greek Salad (Veg/Chicken)",
      "description": "Fresh Greek salad with feta and olives",
      "price": 245,
      "category": "Salad Station",
      "isVeg": false,
      "rating": 4.6,
      "preparationTime": "10-15 mins",
      "image": "/images/categories/European.jpg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "panache_salad_002",
      "name": "Quinoa Apple Vinaigrette Salad",
      "description": "Healthy quinoa salad with apple vinaigrette",
      "price": 345,
      "category": "Salad Station",
      "isVeg": true,
      "rating": 4.7,
      "preparationTime": "12-18 mins",
      "image": "/images/categories/Salad station/Fresh Garden Green Salad.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_salad_003",
      "name": "Classic Caesar Veg/Chicken",
      "description": "Classic Caesar salad with choice of base",
      "price": 245,
      "category": "Salad Station",
      "isVeg": false,
      "rating": 4.5,
      "preparationTime": "10-15 mins",
      "image": "/images/categories/Salad station/Classic Caesar.jpg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "panache_salad_004",
      "name": "Fresh Garden Green Salad",
      "description": "Fresh garden vegetables with light dressing",
      "price": 195,
      "category": "Salad Station",
      "isVeg": true,
      "rating": 4.3,
      "preparationTime": "8-12 mins",
      "image": "/images/categories/Salad station/Fresh Garden Green Salad.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_board_001",
      "name": "Mediterranean Platter Veg",
      "description": "Assorted Mediterranean vegetarian items",
      "price": 595,
      "category": "Mediterranean and Tandoori Boards",
      "isVeg": true,
      "rating": 4.8,
      "preparationTime": "20-25 mins",
      "image": "/images/categories/Mediterranean and Tandoori Boards.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_board_002",
      "name": "Mediterranean Platter Non-Veg",
      "description": "Assorted Mediterranean non-vegetarian items",
      "price": 695,
      "category": "Mediterranean and Tandoori Boards",
      "isVeg": false,
      "rating": 4.9,
      "preparationTime": "25-30 mins",
      "image": "/images/categories/Mediterranean and Tandoori Boards.jpeg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "panache_board_003",
      "name": "Tandoori Veg Platter",
      "description": "Assorted tandoori vegetarian items",
      "price": 595,
      "category": "Mediterranean and Tandoori Boards",
      "isVeg": true,
      "rating": 4.7,
      "preparationTime": "20-25 mins",
      "image": "/images/categories/Mediterranean and Tandoori Boards/Tandoori Veg Platter.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_board_004",
      "name": "Tandoori Non-Veg Platter",
      "description": "Assorted tandoori non-vegetarian items",
      "price": 695,
      "category": "Mediterranean and Tandoori Boards",
      "isVeg": false,
      "rating": 4.8,
      "preparationTime": "25-30 mins",
      "image": "/images/categories/Mediterranean and Tandoori Boards/Tandoori Non-Veg Platter.jpeg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "panache_app_cont_001",
      "name": "Mushroom Duplex",
      "description": "Stuffed mushrooms with cheese and herbs",
      "price": 275,
      "category": "Appetizers Continental",
      "isVeg": true,
      "rating": 4.5,
      "preparationTime": "15-20 mins",
      "image": "/images/categories/Appetizers Continentaljpg.jpg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_app_cont_002",
      "name": "Fried Mozzarella Sticks",
      "description": "Crispy fried mozzarella cheese sticks",
      "price": 275,
      "category": "Appetizers Continental",
      "isVeg": true,
      "rating": 4.6,
      "preparationTime": "12-18 mins",
      "image": "/images/categories/Appetizers Continentaljpg.jpg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_app_cont_003",
      "name": "Crispy Onion Rings",
      "description": "Crispy battered onion rings",
      "price": 245,
      "category": "Appetizers Continental",
      "isVeg": true,
      "rating": 4.3,
      "preparationTime": "10-15 mins",
      "image": "/images/categories/Appetizers Continentaljpg.jpg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_app_cont_004",
      "name": "Veg Pita Pockets",
      "description": "Fresh vegetables in pita bread",
      "price": 245,
      "category": "Appetizers Continental",
      "isVeg": true,
      "rating": 4.4,
      "preparationTime": "12-18 mins",
      "image": "/images/categories/Appetizers Continentaljpg.jpg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_app_cont_005",
      "name": "Peri Peri Chicken Wings",
      "description": "Spicy peri peri chicken wings",
      "price": 375,
      "category": "Appetizers Continental",
      "isVeg": false,
      "rating": 4.7,
      "preparationTime": "18-25 mins",
      "image": "/images/categories/chicken.jpg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "panache_app_cont_006",
      "name": "Fish N Chips",
      "description": "Classic fish and chips with tartar sauce",
      "price": 445,
      "category": "Appetizers Continental",
      "isVeg": false,
      "rating": 4.6,
      "preparationTime": "15-20 mins",
      "image": "/images/categories/Appetizers Continentaljpg.jpg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "panache_app_cont_007",
      "name": "Crispy Chicken Tenders",
      "description": "Crispy breaded chicken tenders",
      "price": 375,
      "category": "Appetizers Continental",
      "isVeg": false,
      "rating": 4.5,
      "preparationTime": "15-20 mins",
      "image": "/images/categories/Appetizers Continentaljpg.jpg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "panache_app_cont_008",
      "name": "Grilled Tiger Prawns",
      "description": "Grilled tiger prawns with herbs",
      "price": 625,
      "category": "Appetizers Continental",
      "isVeg": false,
      "rating": 4.8,
      "preparationTime": "20-25 mins",
      "image": "/images/categories/Appetizers Continentaljpg.jpg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "panache_char_001",
      "name": "Bharwan Mushroom",
      "description": "Stuffed mushrooms cooked in tandoor",
      "price": 275,
      "category": "Charcoal",
      "isVeg": true,
      "rating": 4.4,
      "preparationTime": "18-25 mins",
      "image": "/images/categories/Charcoal.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_char_002",
      "name": "Surkh Paneer Tikka",
      "description": "Red spiced paneer tikka from tandoor",
      "price": 275,
      "category": "Charcoal",
      "isVeg": true,
      "rating": 4.5,
      "preparationTime": "15-20 mins",
      "image": "/images/categories/Main Course/Paneer Butter Masala.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_char_003",
      "name": "Badami Veg Seekh",
      "description": "Almond-flavored vegetarian seekh kebab",
      "price": 275,
      "category": "Charcoal",
      "isVeg": true,
      "rating": 4.3,
      "preparationTime": "20-25 mins",
      "image": "/images/categories/Charcoal.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_char_004",
      "name": "Dahi Ke Sholay",
      "description": "Yogurt-based kebabs from tandoor",
      "price": 275,
      "category": "Charcoal",
      "isVeg": true,
      "rating": 4.4,
      "preparationTime": "15-20 mins",
      "image": "/images/categories/Charcoal.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_char_005",
      "name": "Soya Chap Tandoori/Malai/Achari",
      "description": "Soya chap with choice of marinade",
      "price": 275,
      "category": "Charcoal",
      "isVeg": true,
      "rating": 4.2,
      "preparationTime": "18-25 mins",
      "image": "/images/categories/Charcoal.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_char_006",
      "name": "Malai Broccoli",
      "description": "Creamy broccoli cooked in tandoor",
      "price": 295,
      "category": "Charcoal",
      "isVeg": true,
      "rating": 4.5,
      "preparationTime": "15-20 mins",
      "image": "/images/categories/Charcoal.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_char_007",
      "name": "Charcoal Dumplings (Veg/Chicken)",
      "description": "Dumplings cooked in charcoal tandoor",
      "price": 275,
      "category": "Charcoal",
      "isVeg": false,
      "rating": 4.6,
      "preparationTime": "20-25 mins",
      "image": "/images/categories/Charcoal.jpeg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "panache_char_008",
      "name": "Mutton Galouti Kebab",
      "description": "Tender mutton galouti kebab",
      "price": 545,
      "category": "Charcoal",
      "isVeg": false,
      "rating": 4.8,
      "preparationTime": "25-30 mins",
      "image": "/images/categories/Charcoal.jpeg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "panache_char_009",
      "name": "Gilafi Mutton Seekh Kebab",
      "description": "Mutton seekh kebab with herbs",
      "price": 545,
      "category": "Charcoal",
      "isVeg": false,
      "rating": 4.7,
      "preparationTime": "25-30 mins",
      "image": "/images/categories/Charcoal/Gilafi Mutton Seekh Kebab.jpeg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "panache_char_010",
      "name": "Tandoori Chicken Half/Full",
      "description": "Classic tandoori chicken",
      "price": 345,
      "category": "Charcoal",
      "isVeg": false,
      "rating": 4.9,
      "preparationTime": "30-35 mins",
      "image": "/images/categories/Charcoal/andoori Chicken.jpg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "panache_char_011",
      "name": "Bhatti Ka Murgh Half/Full",
      "description": "Traditional bhatti style chicken",
      "price": 345,
      "category": "Charcoal",
      "isVeg": false,
      "rating": 4.8,
      "preparationTime": "30-35 mins",
      "image": "/images/categories/Charcoal/Bhatti Ka Murgh .jpg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "panache_char_012",
      "name": "Murgh Malai Tikka",
      "description": "Creamy chicken tikka from tandoor",
      "price": 375,
      "category": "Charcoal",
      "isVeg": false,
      "rating": 4.7,
      "preparationTime": "20-25 mins",
      "image": "/images/categories/Charcoal/Murgh Malai Tikkajpg.jpg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "panache_char_013",
      "name": "Murgh Angara",
      "description": "Spicy angara chicken tikka",
      "price": 375,
      "category": "Charcoal",
      "isVeg": false,
      "rating": 4.6,
      "preparationTime": "20-25 mins",
      "image": "/images/categories/Charcoal.jpeg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "panache_char_014",
      "name": "Kandhari Jhinga",
      "description": "Kandhari style prawns from tandoor",
      "price": 625,
      "category": "Charcoal",
      "isVeg": false,
      "rating": 4.9,
      "preparationTime": "25-30 mins",
      "image": "/images/categories/Charcoal.jpeg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "panache_char_015",
      "name": "Amritsari Fish Tikka",
      "description": "Amritsari style fish tikka",
      "price": 525,
      "category": "Charcoal",
      "isVeg": false,
      "rating": 4.7,
      "preparationTime": "20-25 mins",
      "image": "/images/categories/Charcoal.jpeg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "panache_oriental_001",
      "name": "Classic Thai Spring Rolls",
      "description": "Fresh Thai spring rolls with dipping sauce",
      "price": 245,
      "category": "Oriental",
      "isVeg": true,
      "rating": 4.4,
      "preparationTime": "12-18 mins",
      "image": "/images/categories/Oriental.jpg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_oriental_002",
      "name": "Schezwan Chilly Paneer",
      "description": "Spicy schezwan style paneer",
      "price": 275,
      "category": "Oriental",
      "isVeg": true,
      "rating": 4.5,
      "preparationTime": "15-20 mins",
      "image": "/images/categories/Main Course/Paneer Butter Masala.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_oriental_003",
      "name": "Chilly Garlic Mushrooms",
      "description": "Spicy garlic mushrooms",
      "price": 275,
      "category": "Oriental",
      "isVeg": true,
      "rating": 4.3,
      "preparationTime": "12-18 mins",
      "image": "/images/categories/Oriental.jpg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_oriental_004",
      "name": "Sesame Honey Chilly Potato",
      "description": "Crispy potatoes with honey chilly sauce",
      "price": 245,
      "category": "Oriental",
      "isVeg": true,
      "rating": 4.4,
      "preparationTime": "15-20 mins",
      "image": "/images/categories/Oriental.jpg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_oriental_005",
      "name": "Crispy Veg Salt N Pepper",
      "description": "Crispy vegetables with salt and pepper",
      "price": 245,
      "category": "Oriental",
      "isVeg": true,
      "rating": 4.2,
      "preparationTime": "12-18 mins",
      "image": "/images/categories/Oriental.jpg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_oriental_006",
      "name": "Crispy Fried Peppery Corn",
      "description": "Crispy fried corn with pepper",
      "price": 245,
      "category": "Oriental",
      "isVeg": true,
      "rating": 4.3,
      "preparationTime": "10-15 mins",
      "image": "/images/categories/Oriental.jpg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_oriental_007",
      "name": "Classic Veg Dumplings (Steamed/Pan Tossed)",
      "description": "Fresh vegetable dumplings",
      "price": 275,
      "category": "Oriental",
      "isVeg": true,
      "rating": 4.6,
      "preparationTime": "15-20 mins",
      "image": "/images/categories/Oriental.jpg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_oriental_008",
      "name": "Crispy Golden Prawns",
      "description": "Crispy golden fried prawns",
      "price": 595,
      "category": "Oriental",
      "isVeg": false,
      "rating": 4.8,
      "preparationTime": "18-25 mins",
      "image": "/images/categories/Oriental.jpg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "panache_oriental_009",
      "name": "Wok Tossed Chilly Prawns",
      "description": "Wok tossed prawns with chilly sauce",
      "price": 595,
      "category": "Oriental",
      "isVeg": false,
      "rating": 4.7,
      "preparationTime": "20-25 mins",
      "image": "/images/categories/Oriental.jpg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "panache_oriental_010",
      "name": "Chilly Garlic Fish",
      "description": "Fish in chilly garlic sauce",
      "price": 475,
      "category": "Oriental",
      "isVeg": false,
      "rating": 4.6,
      "preparationTime": "18-25 mins",
      "image": "/images/categories/Oriental.jpg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "panache_oriental_011",
      "name": "Five Spiced Drums of Heaven",
      "description": "Five spiced chicken drumsticks",
      "price": 345,
      "category": "Oriental",
      "isVeg": false,
      "rating": 4.5,
      "preparationTime": "20-25 mins",
      "image": "/images/categories/Oriental.jpg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "panache_oriental_012",
      "name": "Classic Chilly Chicken",
      "description": "Classic chilly chicken",
      "price": 345,
      "category": "Oriental",
      "isVeg": false,
      "rating": 4.7,
      "preparationTime": "18-25 mins",
      "image": "/images/categories/Oriental.jpg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "panache_oriental_013",
      "name": "Classic Chicken Dumplings (Steamed/Pan Tossed)",
      "description": "Chicken dumplings with choice of cooking",
      "price": 345,
      "category": "Oriental",
      "isVeg": false,
      "rating": 4.6,
      "preparationTime": "15-20 mins",
      "image": "/images/categories/Oriental.jpg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "panache_main_001",
      "name": "Butter Chicken",
      "description": "Creamy tomato-based curry with tender chicken",
      "price": 445,
      "category": "Main Course",
      "isVeg": false,
      "rating": 4.8,
      "preparationTime": "25-30 mins",
      "image": "/images/categories/Main Course.jpeg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "panache_main_002",
      "name": "Paneer Butter Masala",
      "description": "Creamy cottage cheese curry in rich tomato gravy",
      "price": 345,
      "category": "Main Course",
      "isVeg": true,
      "rating": 4.7,
      "preparationTime": "20-25 mins",
      "image": "/images/categories/Main Course/Paneer Butter Masala.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_main_003",
      "name": "Dal Makhani",
      "description": "Creamy black lentils slow-cooked to perfection",
      "price": 245,
      "category": "Main Course",
      "isVeg": true,
      "rating": 4.6,
      "preparationTime": "30-35 mins",
      "image": "/images/categories/Main Course.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_main_004",
      "name": "Chicken Tikka Masala",
      "description": "Tender chicken tikka in rich masala gravy",
      "price": 445,
      "category": "Main Course",
      "isVeg": false,
      "rating": 4.7,
      "preparationTime": "25-30 mins",
      "image": "/images/categories/Main Course.jpeg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "panache_main_005",
      "name": "Veg Biryani",
      "description": "Aromatic rice with mixed vegetables and spices",
      "price": 295,
      "category": "Main Course",
      "isVeg": true,
      "rating": 4.5,
      "preparationTime": "30-35 mins",
      "image": "/images/categories/Main Course.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_main_006",
      "name": "Chicken Biryani",
      "description": "Aromatic rice with tender chicken and spices",
      "price": 395,
      "category": "Main Course",
      "isVeg": false,
      "rating": 4.8,
      "preparationTime": "30-35 mins",
      "image": "/images/categories/Main Course.jpeg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "panache_dessert_001",
      "name": "Tiramisu",
      "description": "Classic Italian dessert with coffee and mascarpone",
      "price": 325,
      "category": "Desserts",
      "isVeg": true,
      "rating": 4.7,
      "preparationTime": "5-10 mins",
      "image": "/images/categories/Desserts.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_dessert_002",
      "name": "Chocolate Brownie",
      "description": "Warm chocolate brownie with vanilla ice cream",
      "price": 195,
      "category": "Desserts",
      "isVeg": true,
      "rating": 4.6,
      "preparationTime": "5-8 mins",
      "image": "/images/categories/Desserts.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_dessert_003",
      "name": "Gulab Jamun",
      "description": "Sweet milk dumplings in sugar syrup",
      "price": 145,
      "category": "Desserts",
      "isVeg": true,
      "rating": 4.5,
      "preparationTime": "3-5 mins",
      "image": "/images/categories/Desserts.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_dessert_004",
      "name": "Rasmalai",
      "description": "Soft cottage cheese patties in sweetened milk",
      "price": 165,
      "category": "Desserts",
      "isVeg": true,
      "rating": 4.6,
      "preparationTime": "5-8 mins",
      "image": "/images/categories/Desserts.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_bev_001",
      "name": "Masala Chai",
      "description": "Traditional Indian spiced tea",
      "price": 95,
      "category": "Beverages",
      "isVeg": true,
      "rating": 4.4,
      "preparationTime": "3-5 mins",
      "image": "/images/categories/Beverages.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_bev_002",
      "name": "Coffee",
      "description": "Filter coffee with milk",
      "price": 95,
      "category": "Beverages",
      "isVeg": true,
      "rating": 4.3,
      "preparationTime": "3-5 mins",
      "image": "/images/categories/Beverages.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_bev_003",
      "name": "Lassi (Sweet/Salty)",
      "description": "Refreshing yogurt-based drink",
      "price": 125,
      "category": "Beverages",
      "isVeg": true,
      "rating": 4.5,
      "preparationTime": "5-8 mins",
      "image": "/images/categories/Beverages.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "panache_bev_004",
      "name": "Fresh Lime Soda",
      "description": "Refreshing lime soda with mint",
      "price": 95,
      "category": "Beverages",
      "isVeg": true,
      "rating": 4.2,
      "preparationTime": "3-5 mins",
      "image": "/images/categories/Beverages.jpeg",
      "isAvailable": true,
      "type": "VEG"
    }
  ],
      "2": [
    
        {
            "_id": "cafe_001",
            "name": "French Fries (Plain/Peri Peri/Cheesy)",
            "description": "Crispy golden fries with choice of seasoning",
            "price": 295,
            "category": "Bar Tidbits",
            "isVeg": true,
            "rating": 4.5,
            "preparationTime": "15-25 mins",
            "image": "/images/categories/Bar Munchies/french-fries.jpg",
            "isAvailable": true,
            "type": "VEG",
            "variants": [
                "Plain",
                "Peri Peri",
                "Cheesy"
            ],
            "variantPrices": [
                295,
                345,
                345
            ]
        },
        {
            "_id": "cafe_002",
            "name": "Garlic Bread (Plain/Cheese)",
            "description": "Fresh garlic bread with optional cheese",
            "price": 295,
            "category": "Bar Tidbits",
            "isVeg": true,
            "rating": 4.2,
            "preparationTime": "15-25 mins",
            "image": "/images/categories/Bar Munchies/Garlic-Bread-4.webp",
            "isAvailable": true,
            "type": "VEG",
            "variants": [
                "Plain",
                "Cheese"
            ],
            "variantPrices": [
                295,
                345
            ]
        },
        {
            "_id": "cafe_003",
            "name": "Potato Wedges (Plain/Peri Peri)",
            "description": "Crispy potato wedges with seasoning",
            "price": 295,
            "category": "Bar Tidbits",
            "isVeg": true,
            "rating": 4.5,
            "preparationTime": "15-25 mins",
            "image": "/images/categories/Bar Munchies/Potato Wedges Plain.jpeg",
            "isAvailable": true,
            "type": "VEG",
            "variants": [
                "Plain",
                "Peri Peri"
            ],
            "variantPrices": [
                295,
                345
            ]
        },
        {
            "_id": "cafe_004",
            "name": "Mumbaiya Corn Bhel",
            "description": "Mumbai style corn bhel with tangy spices",
            "price": 295,
            "category": "Bar Tidbits",
            "isVeg": true,
            "rating": 4.2,
            "preparationTime": "15-25 mins",
            "image": "/images/categories/Bar Munchies/American Corn Chat.jpg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_005",
            "name": "Peanut Masala",
            "description": "Spiced roasted peanuts",
            "price": 275,
            "category": "Bar Tidbits",
            "isVeg": true,
            "rating": 4.4,
            "preparationTime": "15-25 mins",
            "image": "/images/categories/Bar Munchies/Peanut Masala.webp",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_006",
            "name": "Peri Peri Chana Chat",
            "description": "Spicy chickpea chat with peri peri seasoning",
            "price": 275,
            "category": "Bar Tidbits",
            "isVeg": true,
            "rating": 4.7,
            "preparationTime": "15-25 mins",
            "image": "/images/dishes/chana-chat.jpg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_007",
            "name": "Chicken 65",
            "description": "Spicy South Indian style fried chicken",
            "price": 445,
            "category": "Bar Tidbits",
            "isVeg": false,
            "rating": 4.4,
            "preparationTime": "15-25 mins",
            "image": "/images/categories/Oriental/Classic Chilly Chicken.jpeg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_008",
            "name": "Grilled Fish Skewers",
            "description": "Tender grilled fish on skewers",
            "price": 495,
            "category": "Bar Tidbits",
            "isVeg": false,
            "rating": 4.6,
            "preparationTime": "15-25 mins",
            "image": "/images/dishes/fish-skewers.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_009",
            "name": "Beer Batter Fish Fingers",
            "description": "Crispy beer battered fish fingers",
            "price": 575,
            "category": "Bar Tidbits",
            "isVeg": false,
            "rating": 4.2,
            "preparationTime": "15-25 mins",
            "image": "/images/dishes/fish-fingers.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_010",
            "name": "Butter Chicken Pav",
            "description": "Butter chicken served with pav bread",
            "price": 345,
            "category": "Bar Tidbits",
            "isVeg": false,
            "rating": 4.7,
            "preparationTime": "15-25 mins",
            "image": "/images/categories/Main Course/Butter Chicken.jpeg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_011",
            "name": "Keema Bao",
            "description": "Steamed bao with spiced minced meat",
            "price": 445,
            "category": "Bar Tidbits",
            "isVeg": false,
            "rating": 4.4,
            "preparationTime": "15-25 mins",
            "image": "/images/dishes/keema-bao.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_012",
            "name": "Thyme Infused Wild Mushroom Soup",
            "description": "Aromatic wild mushroom soup with fresh thyme",
            "price": 295,
            "category": "Soups",
            "isVeg": true,
            "rating": 4.6,
            "preparationTime": "15-25 mins",
            "image": "/images/dishes/mushroom-soup.jpg",
            "isAvailable": true,
            "type": "VEG",
            "variants": [
                "Regular",
                "Large"
            ],
            "variantPrices": [
                295,
                345
            ]
        },
        {
            "_id": "cafe_013",
            "name": "Tomato Basil Soup (Veg/Chicken)",
            "description": "Classic tomato basil soup",
            "price": 295,
            "category": "Soups",
            "isVeg": true,
            "rating": 4.4,
            "preparationTime": "15-25 mins",
            "image": "/images/categories/soups/Cream of Tomato.webp",
            "isAvailable": true,
            "type": "VEG",
            "variants": [
                "Veg",
                "Chicken"
            ],
            "variantPrices": [
                295,
                345
            ]
        },
        {
            "_id": "cafe_014",
            "name": "Tibetan Thupka (Veg/Chicken)",
            "description": "Traditional Tibetan noodle soup",
            "price": 295,
            "category": "Soups",
            "isVeg": true,
            "rating": 4.5,
            "preparationTime": "15-25 mins",
            "image": "/images/dishes/thupka.jpg",
            "isAvailable": true,
            "type": "VEG",
            "variants": [
                "Veg",
                "Chicken"
            ],
            "variantPrices": [
                295,
                345
            ]
        },
        {
            "_id": "cafe_015",
            "name": "Sweet Corn Soup (Veg/Chicken)",
            "description": "Creamy sweet corn soup",
            "price": 295,
            "category": "Soups",
            "isVeg": true,
            "rating": 4.3,
            "preparationTime": "15-25 mins",
            "image": "/images/categories/soups/Sweet Corn Soup.jpg",
            "isAvailable": true,
            "type": "VEG",
            "variants": [
                "Veg",
                "Chicken"
            ],
            "variantPrices": [
                295,
                345
            ]
        },
        {
            "_id": "cafe_016",
            "name": "Manchow Soup (Veg/Chicken)",
            "description": "Spicy Indo-Chinese soup",
            "price": 295,
            "category": "Soups",
            "isVeg": true,
            "rating": 4.4,
            "preparationTime": "15-25 mins",
            "image": "/images/categories/soups/Manchow Soup.jpg",
            "isAvailable": true,
            "type": "VEG",
            "variants": [
                "Veg",
                "Chicken"
            ],
            "variantPrices": [
                295,
                345
            ]
        },
        {
            "_id": "cafe_017",
            "name": "Figs and Apricot",
            "description": "Fresh salad with figs and apricots",
            "price": 395,
            "category": "Gourmet Healthy Salads",
            "isVeg": true,
            "rating": 4.5,
            "preparationTime": "10-15 mins",
            "image": "/images/dishes/figs-apricot-salad.jpg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_018",
            "name": "Fattoush",
            "description": "Middle Eastern mixed vegetable salad",
            "price": 395,
            "category": "Gourmet Healthy Salads",
            "isVeg": true,
            "rating": 4.4,
            "preparationTime": "10-15 mins",
            "image": "/images/dishes/fattoush.jpg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_019",
            "name": "Watermelon Feta Cheese",
            "description": "Refreshing watermelon and feta cheese salad",
            "price": 395,
            "category": "Gourmet Healthy Salads",
            "isVeg": true,
            "rating": 4.6,
            "preparationTime": "10-15 mins",
            "image": "/images/dishes/watermelon-feta.jpg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_020",
            "name": "Zesty Avocado Quinoa Salad",
            "description": "Healthy quinoa salad with avocado",
            "price": 525,
            "category": "Gourmet Healthy Salads",
            "isVeg": true,
            "rating": 4.7,
            "preparationTime": "10-15 mins",
            "image": "/images/dishes/avocado-quinoa-salad.jpg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_021",
            "name": "Fresh Garden Green Salad",
            "description": "Mixed green salad with fresh vegetables",
            "price": 245,
            "category": "Gourmet Healthy Salads",
            "isVeg": true,
            "rating": 4.2,
            "preparationTime": "10-15 mins",
            "image": "/images/categories/Salad station/Fresh Garden Green Salad.jpeg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_022",
            "name": "Classic Caesar (Veg/Chicken)",
            "description": "Traditional Caesar salad",
            "price": 395,
            "category": "Gourmet Healthy Salads",
            "isVeg": true,
            "rating": 4.5,
            "preparationTime": "10-15 mins",
            "image": "/images/categories/Salad station/Classic Caesar.jpg",
            "isAvailable": true,
            "type": "VEG",
            "variants": [
                "Veg",
                "Chicken"
            ],
            "variantPrices": [
                395,
                445
            ]
        },
        {
            "_id": "cafe_023",
            "name": "Veg Mezze Platter",
            "description": "Assorted vegetarian mezze platter",
            "price": 895,
            "category": "Wholesome Sharing Platters",
            "isVeg": true,
            "rating": 4.6,
            "preparationTime": "20-30 mins",
            "image": "/images/categories/Mediterranean and Tandoori Boards/Mediterranean Platter Veg.jpg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_024",
            "name": "Non-Veg Mezze Platter",
            "description": "Assorted non-vegetarian mezze platter",
            "price": 995,
            "category": "Wholesome Sharing Platters",
            "isVeg": false,
            "rating": 4.7,
            "preparationTime": "20-30 mins",
            "image": "/images/categories/Mediterranean and Tandoori Boards/Mediterranean Platter Non-Veg.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_025",
            "name": "Tandoori Veg Platter",
            "description": "Assorted tandoori vegetarian items",
            "price": 895,
            "category": "Wholesome Sharing Platters",
            "isVeg": true,
            "rating": 4.5,
            "preparationTime": "25-35 mins",
            "image": "/images/categories/Mediterranean and Tandoori Boards/Tandoori Veg Platter.jpeg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_026",
            "name": "Tandoori Non-Veg Platter",
            "description": "Assorted tandoori non-vegetarian items",
            "price": 995,
            "category": "Wholesome Sharing Platters",
            "isVeg": false,
            "rating": 4.8,
            "preparationTime": "25-35 mins",
            "image": "/images/categories/Mediterranean and Tandoori Boards/Tandoori Non-Veg Platter.jpeg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_027",
            "name": "Schezwan Mushroom Sourdough Toast",
            "description": "Spicy schezwan mushroom on sourdough",
            "price": 495,
            "category": "Sourdough Toasts/Bruschettas",
            "isVeg": true,
            "rating": 4.4,
            "preparationTime": "15-20 mins",
            "image": "/images/dishes/schezwan-mushroom-toast.jpg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_028",
            "name": "Avocado Sourdough Toast",
            "description": "Fresh avocado on artisanal sourdough",
            "price": 495,
            "category": "Sourdough Toasts/Bruschettas",
            "isVeg": true,
            "rating": 4.6,
            "preparationTime": "15-20 mins",
            "image": "/images/dishes/avocado-toast.jpg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_029",
            "name": "Mozzarella & Basil Bruschettas",
            "description": "Classic Italian bruschetta with mozzarella",
            "price": 345,
            "category": "Sourdough Toasts/Bruschettas",
            "isVeg": true,
            "rating": 4.5,
            "preparationTime": "15-20 mins",
            "image": "/images/dishes/mozzarella-basil-bruschetta.jpg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_030",
            "name": "Smoked Salmon Nicoise Toast",
            "description": "Premium smoked salmon on sourdough",
            "price": 795,
            "category": "Sourdough Toasts/Bruschettas",
            "isVeg": false,
            "rating": 4.8,
            "preparationTime": "15-20 mins",
            "image": "/images/dishes/salmon-nicoise-toast.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_031",
            "name": "Grilled Rosemary Chicken Bruschettas",
            "description": "Herb-crusted chicken on crispy bread",
            "price": 395,
            "category": "Sourdough Toasts/Bruschettas",
            "isVeg": false,
            "rating": 4.4,
            "preparationTime": "15-20 mins",
            "image": "/images/dishes/rosemary-chicken-bruschetta.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_032",
            "name": "Classic Falafel",
            "description": "Traditional Middle Eastern falafel",
            "price": 695,
            "category": "Mediterranean",
            "isVeg": true,
            "rating": 4.5,
            "preparationTime": "20-25 mins",
            "image": "/images/dishes/falafel.jpg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_033",
            "name": "Vegetable Shish Taouk",
            "description": "Grilled vegetable skewers Mediterranean style",
            "price": 695,
            "category": "Mediterranean",
            "isVeg": true,
            "rating": 4.4,
            "preparationTime": "20-25 mins",
            "image": "/images/dishes/veg-shish-taouk.jpg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_034",
            "name": "Cottage Cheese Shawarma",
            "description": "Spiced cottage cheese in pita bread",
            "price": 695,
            "category": "Mediterranean",
            "isVeg": true,
            "rating": 4.6,
            "preparationTime": "20-25 mins",
            "image": "/images/dishes/paneer-shawarma.jpg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_035",
            "name": "Paneer Chelo Kebab",
            "description": "Persian style paneer kebab with rice",
            "price": 695,
            "category": "Mediterranean",
            "isVeg": true,
            "rating": 4.5,
            "preparationTime": "25-30 mins",
            "image": "/images/dishes/paneer-chelo-kebab.jpg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_036",
            "name": "Chicken Shish Taouk",
            "description": "Marinated grilled chicken skewers",
            "price": 795,
            "category": "Mediterranean",
            "isVeg": false,
            "rating": 4.7,
            "preparationTime": "25-30 mins",
            "image": "/images/dishes/chicken-shish-taouk.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_037",
            "name": "Turkish Adana Kebab",
            "description": "Spicy Turkish minced meat kebab",
            "price": 795,
            "category": "Mediterranean",
            "isVeg": false,
            "rating": 4.6,
            "preparationTime": "25-30 mins",
            "image": "/images/dishes/adana-kebab.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_038",
            "name": "Chicken Shawarma",
            "description": "Traditional Middle Eastern chicken wrap",
            "price": 795,
            "category": "Mediterranean",
            "isVeg": false,
            "rating": 4.8,
            "preparationTime": "20-25 mins",
            "image": "/images/dishes/chicken-shawarma.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_039",
            "name": "Chicken Chelo Kebab",
            "description": "Persian style chicken kebab with rice",
            "price": 795,
            "category": "Mediterranean",
            "isVeg": false,
            "rating": 4.7,
            "preparationTime": "25-30 mins",
            "image": "/images/dishes/chicken-chelo-kebab.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_040",
            "name": "Tex-Mex Loaded Nachos Veg",
            "description": "Loaded vegetarian nachos with cheese and jalapeños",
            "price": 495,
            "category": "European",
            "isVeg": true,
            "rating": 4.4,
            "preparationTime": "15-20 mins",
            "image": "/images/dishes/veg-nachos.jpg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_041",
            "name": "Mexican Vegetable Quesadillas",
            "description": "Grilled tortillas with vegetables and cheese",
            "price": 495,
            "category": "European",
            "isVeg": true,
            "rating": 4.5,
            "preparationTime": "15-20 mins",
            "image": "/images/dishes/veg-quesadillas.jpg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_042",
            "name": "Creamy Exotic Veg Vol-Au-Vent",
            "description": "Puff pastry filled with creamy vegetables",
            "price": 445,
            "category": "European",
            "isVeg": true,
            "rating": 4.3,
            "preparationTime": "20-25 mins",
            "image": "/images/dishes/veg-vol-au-vent.jpg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_043",
            "name": "Peri Peri Onion Rings",
            "description": "Crispy onion rings with peri peri seasoning",
            "price": 395,
            "category": "European",
            "isVeg": true,
            "rating": 4.2,
            "preparationTime": "15-20 mins",
            "image": "/images/dishes/peri-peri-onion-rings.jpg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_044",
            "name": "Paneer Tikka Tacos with Roasted Tomato Salsa",
            "description": "Indian fusion tacos with paneer tikka",
            "price": 495,
            "category": "European",
            "isVeg": true,
            "rating": 4.6,
            "preparationTime": "20-25 mins",
            "image": "/images/dishes/paneer-tikka-tacos.jpg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_045",
            "name": "Chicken Wings (BBQ/Buffalo)",
            "description": "Crispy chicken wings with choice of sauce",
            "price": 595,
            "category": "European",
            "isVeg": false,
            "rating": 4.7,
            "preparationTime": "20-25 mins",
            "image": "/images/dishes/chicken-wings.jpg",
            "isAvailable": true,
            "type": "NON-VEG",
            "variants": [
                "BBQ",
                "Buffalo"
            ],
            "variantPrices": [
                595,
                595
            ]
        },
        {
            "_id": "cafe_046",
            "name": "Chicken Sausage & Ham Vol-Au-Vent",
            "description": "Puff pastry with chicken sausage and ham",
            "price": 495,
            "category": "European",
            "isVeg": false,
            "rating": 4.4,
            "preparationTime": "20-25 mins",
            "image": "/images/dishes/chicken-vol-au-vent.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_047",
            "name": "Tex-Mex Loaded Nachos Chicken",
            "description": "Loaded chicken nachos with cheese and jalapeños",
            "price": 595,
            "category": "European",
            "isVeg": false,
            "rating": 4.6,
            "preparationTime": "15-20 mins",
            "image": "/images/dishes/chicken-nachos.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_048",
            "name": "Kick In Spicy Chicken Tacos with Roasted Tomato Salsa",
            "description": "Spicy chicken tacos with fresh salsa",
            "price": 595,
            "category": "European",
            "isVeg": false,
            "rating": 4.7,
            "preparationTime": "20-25 mins",
            "image": "/images/dishes/spicy-chicken-tacos.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_049",
            "name": "Harissa Chicken Strips",
            "description": "Spicy harissa marinated chicken strips",
            "price": 595,
            "category": "European",
            "isVeg": false,
            "rating": 4.5,
            "preparationTime": "20-25 mins",
            "image": "/images/dishes/harissa-chicken-strips.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_050",
            "name": "Classic Fish N Chips",
            "description": "Traditional beer battered fish with chips",
            "price": 675,
            "category": "European",
            "isVeg": false,
            "rating": 4.6,
            "preparationTime": "25-30 mins",
            "image": "/images/dishes/fish-and-chips.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_051",
            "name": "Butter Garlic Tiger Prawns",
            "description": "Succulent prawns in butter garlic sauce",
            "price": 795,
            "category": "European",
            "isVeg": false,
            "rating": 4.8,
            "preparationTime": "20-25 mins",
            "image": "/images/dishes/butter-garlic-prawns.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_052",
            "name": "Smoked Chicken Quesadillas",
            "description": "Grilled tortillas with smoked chicken and cheese",
            "price": 595,
            "category": "European",
            "isVeg": false,
            "rating": 4.6,
            "preparationTime": "15-20 mins",
            "image": "/images/dishes/smoked-chicken-quesadillas.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_053",
            "name": "Khumb Ki Galouti",
            "description": "Mushroom galouti kebab",
            "price": 595,
            "category": "Clay Oven",
            "isVeg": true,
            "rating": 4.6,
            "preparationTime": "25-30 mins",
            "image": "/images/dishes/khumb-galouti.jpg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_054",
            "name": "Tandoori Khumb Red Cheddar Fondue",
            "description": "Tandoori mushroom with red cheddar fondue",
            "price": 495,
            "category": "Clay Oven",
            "isVeg": true,
            "rating": 4.5,
            "preparationTime": "25-30 mins",
            "image": "/images/dishes/tandoori-khumb-fondue.jpg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_055",
            "name": "Soya Chap (Achari/Malai/Tandoori)",
            "description": "Soya chap in three different preparations",
            "price": 475,
            "category": "Clay Oven",
            "isVeg": true,
            "rating": 4.4,
            "preparationTime": "25-30 mins",
            "image": "/images/dishes/soya-chap.jpg",
            "isAvailable": true,
            "type": "VEG",
            "variants": [
                "Achari",
                "Malai",
                "Tandoori"
            ],
            "variantPrices": [
                475,
                475,
                475
            ]
        },
        {
            "_id": "cafe_056",
            "name": "Harissa Paneer Tikka",
            "description": "Spicy harissa marinated paneer tikka",
            "price": 525,
            "category": "Clay Oven",
            "isVeg": true,
            "rating": 4.7,
            "preparationTime": "25-30 mins",
            "image": "/images/dishes/harissa-paneer-tikka.jpg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_057",
            "name": "Paneer Tikka (Deggi Mirch/Afghani)",
            "description": "Classic paneer tikka in two styles",
            "price": 525,
            "category": "Clay Oven",
            "isVeg": true,
            "rating": 4.6,
            "preparationTime": "25-30 mins",
            "image": "/images/categories/Charcoal/Surkh Paneer Tikka.jpeg",
            "isAvailable": true,
            "type": "VEG",
            "variants": [
                "Deggi Mirch",
                "Afghani"
            ],
            "variantPrices": [
                525,
                525
            ]
        },
        {
            "_id": "cafe_058",
            "name": "Sadabahar Malai Seekh",
            "description": "Creamy vegetarian seekh kebab",
            "price": 585,
            "category": "Clay Oven",
            "isVeg": true,
            "rating": 4.5,
            "preparationTime": "25-30 mins",
            "image": "/images/dishes/malai-seekh.jpg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_059",
            "name": "Papad Crusted Dahi Ke Kebab",
            "description": "Yogurt kebab with papad crust",
            "price": 495,
            "category": "Clay Oven",
            "isVeg": true,
            "rating": 4.3,
            "preparationTime": "25-30 mins",
            "image": "/images/dishes/dahi-kebab.jpg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_060",
            "name": "Tandoori Chicken Wings",
            "description": "Spicy tandoori chicken wings",
            "price": 595,
            "category": "Clay Oven",
            "isVeg": false,
            "rating": 4.7,
            "preparationTime": "25-30 mins",
            "image": "/images/dishes/tandoori-chicken-wings.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_061",
            "name": "Burrah Kebab",
            "description": "Premium mutton burrah kebab",
            "price": 895,
            "category": "Clay Oven",
            "isVeg": false,
            "rating": 4.8,
            "preparationTime": "30-35 mins",
            "image": "/images/dishes/burrah-kebab.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_062",
            "name": "Lucknowi Mutton Galouti",
            "description": "Melt-in-mouth Lucknowi galouti kebab",
            "price": 795,
            "category": "Clay Oven",
            "isVeg": false,
            "rating": 4.9,
            "preparationTime": "30-35 mins",
            "image": "/images/dishes/mutton-galouti.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_063",
            "name": "Gilafi Mutton Seekh Kebab",
            "description": "Colorful mutton seekh kebab",
            "price": 695,
            "category": "Clay Oven",
            "isVeg": false,
            "rating": 4.6,
            "preparationTime": "25-30 mins",
            "image": "/images/dishes/gilafi-seekh.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_064",
            "name": "Tandoori Chicken (Half/Full)",
            "description": "Classic tandoori chicken",
            "price": 475,
            "category": "Clay Oven",
            "isVeg": false,
            "rating": 4.7,
            "preparationTime": "30-35 mins",
            "image": "/images/categories/Charcoal/andoori Chicken.jpg",
            "isAvailable": true,
            "type": "NON-VEG",
            "variants": [
                "Half",
                "Full"
            ],
            "variantPrices": [
                475,
                745
            ]
        },
        {
            "_id": "cafe_065",
            "name": "Peshawari Chicken Tangri",
            "description": "Peshawari style chicken drumsticks",
            "price": 595,
            "category": "Clay Oven",
            "isVeg": false,
            "rating": 4.6,
            "preparationTime": "25-30 mins",
            "image": "/images/dishes/peshawari-tangri.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_066",
            "name": "Bhatti Ka Murgh (Half/Full)",
            "description": "Clay oven roasted chicken",
            "price": 475,
            "category": "Clay Oven",
            "isVeg": false,
            "rating": 4.8,
            "preparationTime": "30-35 mins",
            "image": "/images/dishes/bhatti-murgh.jpg",
            "isAvailable": true,
            "type": "NON-VEG",
            "variants": [
                "Half",
                "Full"
            ],
            "variantPrices": [
                475,
                745
            ]
        },
        {
            "_id": "cafe_067",
            "name": "Murgh Malai Tikka",
            "description": "Creamy chicken malai tikka",
            "price": 595,
            "category": "Clay Oven",
            "isVeg": false,
            "rating": 4.7,
            "preparationTime": "25-30 mins",
            "image": "/images/dishes/murgh-malai-tikka.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_068",
            "name": "Chicken Sharabi Tikka",
            "description": "Wine marinated chicken tikka",
            "price": 645,
            "category": "Clay Oven",
            "isVeg": false,
            "rating": 4.6,
            "preparationTime": "25-30 mins",
            "image": "/images/dishes/chicken-sharabi-tikka.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_069",
            "name": "Murgh Seekh Kebab",
            "description": "Chicken seekh kebab",
            "price": 595,
            "category": "Clay Oven",
            "isVeg": false,
            "rating": 4.5,
            "preparationTime": "25-30 mins",
            "image": "/images/dishes/murgh-seekh-kebab.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_070",
            "name": "Tandoori Pomfret",
            "description": "Whole tandoori pomfret",
            "price": 1095,
            "category": "Clay Oven",
            "isVeg": false,
            "rating": 4.9,
            "preparationTime": "35-40 mins",
            "image": "/images/dishes/tandoori-pomfret.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_071",
            "name": "Kasaundi Machchi Tikka",
            "description": "Bengali style fish tikka with kasaundi",
            "price": 745,
            "category": "Clay Oven",
            "isVeg": false,
            "rating": 4.7,
            "preparationTime": "25-30 mins",
            "image": "/images/dishes/kasaundi-fish-tikka.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_072",
            "name": "Thai Red Chicken Tikka, Wasabi Tartare",
            "description": "Fusion Thai red chicken with wasabi tartare",
            "price": 695,
            "category": "Clay Oven",
            "isVeg": false,
            "rating": 4.8,
            "preparationTime": "25-30 mins",
            "image": "/images/dishes/thai-red-chicken-tikka.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_073",
            "name": "Thai Style Spring Rolls",
            "description": "Crispy Thai spring rolls",
            "price": 495,
            "category": "Oriental",
            "isVeg": true,
            "rating": 4.5,
            "preparationTime": "15-20 mins",
            "image": "/images/dishes/thai-spring-rolls.jpg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_074",
            "name": "Cheese Cigar Roll with Spicy Harissa",
            "description": "Cheese rolls with harissa dip",
            "price": 595,
            "category": "Oriental",
            "isVeg": true,
            "rating": 4.4,
            "preparationTime": "15-20 mins",
            "image": "/images/dishes/cheese-cigar-rolls.jpg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_075",
            "name": "Crispy Fried Chilly Paneer",
            "description": "Indo-Chinese chilly paneer",
            "price": 495,
            "category": "Oriental",
            "isVeg": true,
            "rating": 4.6,
            "preparationTime": "20-25 mins",
            "image": "/images/dishes/chilly-paneer.jpg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_076",
            "name": "Korean Vegetable Skewers",
            "description": "Korean style grilled vegetable skewers",
            "price": 495,
            "category": "Oriental",
            "isVeg": true,
            "rating": 4.3,
            "preparationTime": "20-25 mins",
            "image": "/images/dishes/korean-veg-skewers.jpg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_077",
            "name": "Exotic Asian Greens (Chilly Garlic/Black Bean/Schezwan)",
            "description": "Asian style greens in three sauces",
            "price": 495,
            "category": "Oriental",
            "isVeg": true,
            "rating": 4.5,
            "preparationTime": "20-25 mins",
            "image": "/images/dishes/asian-greens.jpg",
            "isAvailable": true,
            "type": "VEG",
            "variants": [
                "Chilly Garlic",
                "Black Bean",
                "Schezwan"
            ],
            "variantPrices": [
                495,
                495,
                495
            ]
        },
        {
            "_id": "cafe_078",
            "name": "Crispy Thai Mushrooms",
            "description": "Thai style crispy mushrooms",
            "price": 495,
            "category": "Oriental",
            "isVeg": true,
            "rating": 4.4,
            "preparationTime": "20-25 mins",
            "image": "/images/dishes/crispy-thai-mushrooms.jpg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_079",
            "name": "Honey Chilly Sesame Potato",
            "description": "Sweet and spicy sesame potatoes",
            "price": 395,
            "category": "Oriental",
            "isVeg": true,
            "rating": 4.3,
            "preparationTime": "20-25 mins",
            "image": "/images/dishes/honey-chilly-potato.jpg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_080",
            "name": "Schezwan Style Salt N Pepper",
            "description": "Schezwan salt and pepper vegetables",
            "price": 495,
            "category": "Oriental",
            "isVeg": true,
            "rating": 4.5,
            "preparationTime": "20-25 mins",
            "image": "/images/dishes/schezwan-salt-pepper.jpg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_081",
            "name": "Crispy Fried Corn Kernels",
            "description": "Crispy corn with oriental spices",
            "price": 495,
            "category": "Oriental",
            "isVeg": true,
            "rating": 4.2,
            "preparationTime": "15-20 mins",
            "image": "/images/dishes/crispy-corn-kernels.jpg",
            "isAvailable": true,
            "type": "VEG"
        },
        {
            "_id": "cafe_082",
            "name": "Golden Fried Magic Prawns",
            "description": "Crispy fried prawns with magic coating",
            "price": 795,
            "category": "Oriental",
            "isVeg": false,
            "rating": 4.8,
            "preparationTime": "20-25 mins",
            "image": "/images/dishes/magic-prawns.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_083",
            "name": "Sichuan Style Burnt Garlic Chicken",
            "description": "Sichuan chicken with burnt garlic",
            "price": 595,
            "category": "Oriental",
            "isVeg": false,
            "rating": 4.7,
            "preparationTime": "20-25 mins",
            "image": "/images/dishes/sichuan-garlic-chicken.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_084",
            "name": "Crispy Fried Fish (Chilly Garlic/Schezwan)",
            "description": "Crispy fish in two oriental sauces",
            "price": 695,
            "category": "Oriental",
            "isVeg": false,
            "rating": 4.6,
            "preparationTime": "20-25 mins",
            "image": "/images/dishes/crispy-fried-fish.jpg",
            "isAvailable": true,
            "type": "NON-VEG",
            "variants": [
                "Chilly Garlic",
                "Schezwan"
            ],
            "variantPrices": [
                695,
                695
            ]
        },
        {
            "_id": "cafe_085",
            "name": "Teriyaki Chicken Skewers",
            "description": "Japanese style teriyaki chicken",
            "price": 595,
            "category": "Oriental",
            "isVeg": false,
            "rating": 4.5,
            "preparationTime": "20-25 mins",
            "image": "/images/dishes/teriyaki-chicken-skewers.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_086",
            "name": "Thai Basil Chicken",
            "description": "Authentic Thai basil chicken",
            "price": 595,
            "category": "Oriental",
            "isVeg": false,
            "rating": 4.6,
            "preparationTime": "20-25 mins",
            "image": "/images/dishes/thai-basil-chicken.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_087",
            "name": "Original Chicken Lollipop",
            "description": "Classic chicken lollipops",
            "price": 595,
            "category": "Oriental",
            "isVeg": false,
            "rating": 4.7,
            "preparationTime": "20-25 mins",
            "image": "/images/dishes/chicken-lollipop.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
        },
        {
            "_id": "cafe_088",
            "name": "Crispy Fried Chilly Chicken",
            "description": "Indo-Chinese chilly chicken",
            "price": 595,
            "category": "Oriental",
            "isVeg": false,
            "rating": 4.8,
            "preparationTime": "20-25 mins",
            "image": "/images/dishes/chilly-chicken.jpg",
            "isAvailable": true,
            "type": "NON-VEG"
                 },
         
         // DUMPLINGS
         {
           "_id": "cafe_089",
           "name": "Fusion Dumplings (Veg/Chicken)",
           "description": "Creative fusion dumplings",
           "price": 495,
           "category": "Dumplings",
           "isVeg": true,
           "rating": 4.5,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/fusion-dumplings.jpg",
           "isAvailable": true,
           "type": "VEG",
           "variants": ["Veg", "Chicken"],
           "variantPrices": [495, 595]
         },
         {
           "_id": "cafe_090",
           "name": "Thai Green Veg Dumpling",
           "description": "Thai green curry flavored vegetable dumplings",
           "price": 495,
           "category": "Dumplings",
           "isVeg": true,
           "rating": 4.4,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/thai-green-dumplings.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_091",
           "name": "Spicy Corn & Asparagus Dumpling",
           "description": "Corn and asparagus filled dumplings",
           "price": 525,
           "category": "Dumplings",
           "isVeg": true,
           "rating": 4.3,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/corn-asparagus-dumplings.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_092",
           "name": "Water Chestnut and Cheese Dumpling",
           "description": "Water chestnut and cheese filled dumplings",
           "price": 495,
           "category": "Dumplings",
           "isVeg": true,
           "rating": 4.2,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/water-chestnut-dumplings.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_093",
           "name": "Chicken Thai Basil Dumpling",
           "description": "Thai basil chicken dumplings",
           "price": 625,
           "category": "Dumplings",
           "isVeg": false,
           "rating": 4.6,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/chicken-thai-basil-dumplings.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },
         {
           "_id": "cafe_094",
           "name": "Sriracha Chicken Dumpling",
           "description": "Spicy sriracha chicken dumplings",
           "price": 625,
           "category": "Dumplings",
           "isVeg": false,
           "rating": 4.5,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/sriracha-chicken-dumplings.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },
         {
           "_id": "cafe_095",
           "name": "Prawn Har Gow Dumpling",
           "description": "Traditional prawn har gow dumplings",
           "price": 795,
           "category": "Dumplings",
           "isVeg": false,
           "rating": 4.8,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/prawn-har-gow.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },

         // SUSHIS
         {
           "_id": "cafe_096",
           "name": "Veg California Roll",
           "description": "Vegetarian California roll",
           "price": 575,
           "category": "Sushis",
           "isVeg": true,
           "rating": 4.4,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/veg-california-roll.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_097",
           "name": "Avocado & Philadelphia Cheese Roll",
           "description": "Avocado and cream cheese sushi roll",
           "price": 595,
           "category": "Sushis",
           "isVeg": true,
           "rating": 4.5,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/avocado-philadelphia-roll.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_098",
           "name": "Zucchini Roll with Herbs & Cheese",
           "description": "Zucchini roll with fresh herbs and cheese",
           "price": 575,
           "category": "Sushis",
           "isVeg": true,
           "rating": 4.3,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/zucchini-herb-roll.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_099",
           "name": "Avocado Carrot Cucumber Maki Roll",
           "description": "Fresh vegetable maki roll",
           "price": 595,
           "category": "Sushis",
           "isVeg": true,
           "rating": 4.4,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/avocado-carrot-maki.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_100",
           "name": "Asparagus Tempura Pickled Carrots",
           "description": "Tempura asparagus with pickled carrots",
           "price": 595,
           "category": "Sushis",
           "isVeg": true,
           "rating": 4.2,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/asparagus-tempura-roll.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_101",
           "name": "Tempura Shrimp Roll",
           "description": "Crispy tempura shrimp roll",
           "price": 895,
           "category": "Sushis",
           "isVeg": false,
           "rating": 4.7,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/tempura-shrimp-roll.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },
         {
           "_id": "cafe_102",
           "name": "Smoked Salmon & Philadelphia Cheese Roll",
           "description": "Premium smoked salmon roll",
           "price": 895,
           "category": "Sushis",
           "isVeg": false,
           "rating": 4.8,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/smoked-salmon-roll.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },
         {
           "_id": "cafe_103",
           "name": "Spicy Chicken Roll",
           "description": "Spicy chicken sushi roll",
           "price": 645,
           "category": "Sushis",
           "isVeg": false,
           "rating": 4.5,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/spicy-chicken-roll.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },
         {
           "_id": "cafe_104",
           "name": "Teriyaki Chicken Roll",
           "description": "Teriyaki chicken sushi roll",
           "price": 645,
           "category": "Sushis",
           "isVeg": false,
           "rating": 4.6,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/teriyaki-chicken-roll.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
                  },
         
         // CONTINENTAL MAINS
         {
           "_id": "cafe_105",
           "name": "Grilled Cottage Cheese Steak (Chipotle/Peri Peri/BBQ)",
           "description": "Grilled paneer steak with choice of sauce",
           "price": 595,
           "category": "Continental Mains",
           "isVeg": true,
           "rating": 4.5,
           "preparationTime": "25-30 mins",
           "image": "/images/dishes/grilled-paneer-steak.jpg",
           "isAvailable": true,
           "type": "VEG",
           "variants": ["Chipotle", "Peri Peri", "BBQ"],
           "variantPrices": [595, 595, 595]
         },
         {
           "_id": "cafe_106",
           "name": "Modern Grilled Chicken (Black Pepper/BBQ/Peri Peri)",
           "description": "Grilled chicken with choice of marinade",
           "price": 695,
           "category": "Continental Mains",
           "isVeg": false,
           "rating": 4.7,
           "preparationTime": "25-30 mins",
           "image": "/images/dishes/modern-grilled-chicken.jpg",
           "isAvailable": true,
           "type": "NON-VEG",
           "variants": ["Black Pepper", "BBQ", "Peri Peri"],
           "variantPrices": [695, 695, 695]
         },
         {
           "_id": "cafe_107",
           "name": "Herb Crusted Lamb Steak",
           "description": "Premium herb crusted lamb steak",
           "price": 895,
           "category": "Continental Mains",
           "isVeg": false,
           "rating": 4.8,
           "preparationTime": "30-35 mins",
           "image": "/images/dishes/herb-lamb-steak.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },
         {
           "_id": "cafe_108",
           "name": "Cajun Angel Shrimps",
           "description": "Cajun spiced prawns",
           "price": 895,
           "category": "Continental Mains",
           "isVeg": false,
           "rating": 4.7,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/cajun-angel-shrimps.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },
         {
           "_id": "cafe_109",
           "name": "Mediterranean Grilled Red Snapper",
           "description": "Mediterranean style grilled red snapper",
           "price": 795,
           "category": "Continental Mains",
           "isVeg": false,
           "rating": 4.6,
           "preparationTime": "25-30 mins",
           "image": "/images/dishes/mediterranean-red-snapper.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },
         {
           "_id": "cafe_110",
           "name": "Peruvian Grilled Fish",
           "description": "Peruvian style grilled fish",
           "price": 745,
           "category": "Continental Mains",
           "isVeg": false,
           "rating": 4.5,
           "preparationTime": "25-30 mins",
           "image": "/images/dishes/peruvian-grilled-fish.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },

         // SIZZLERS
         {
           "_id": "cafe_111",
           "name": "Grilled Cottage Cheese Sizzler (Chipotle/Peri Peri/BBQ)",
           "description": "Sizzling paneer with choice of sauce",
           "price": 645,
           "category": "Sizzlers",
           "isVeg": true,
           "rating": 4.6,
           "preparationTime": "25-30 mins",
           "image": "/images/dishes/paneer-sizzler.jpg",
           "isAvailable": true,
           "type": "VEG",
           "variants": ["Chipotle", "Peri Peri", "BBQ"],
           "variantPrices": [645, 645, 645]
         },
         {
           "_id": "cafe_112",
           "name": "Roasted Mexican Vegetable Sizzler",
           "description": "Mexican style vegetable sizzler",
           "price": 645,
           "category": "Sizzlers",
           "isVeg": true,
           "rating": 4.4,
           "preparationTime": "25-30 mins",
           "image": "/images/dishes/mexican-veg-sizzler.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_113",
           "name": "Grilled Chicken Sizzler (Black Pepper/BBQ/Peri Peri)",
           "description": "Sizzling chicken with choice of marinade",
           "price": 695,
           "category": "Sizzlers",
           "isVeg": false,
           "rating": 4.7,
           "preparationTime": "25-30 mins",
           "image": "/images/dishes/chicken-sizzler.jpg",
           "isAvailable": true,
           "type": "NON-VEG",
           "variants": ["Black Pepper", "BBQ", "Peri Peri"],
           "variantPrices": [695, 695, 695]
         },
         {
           "_id": "cafe_114",
           "name": "Tex-Mex Lamb Sizzler",
           "description": "Tex-Mex style lamb sizzler",
           "price": 795,
           "category": "Sizzlers",
           "isVeg": false,
           "rating": 4.6,
           "preparationTime": "30-35 mins",
           "image": "/images/dishes/tex-mex-lamb-sizzler.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },
         {
           "_id": "cafe_115",
           "name": "Grilled Fish Sizzler",
           "description": "Sizzling grilled fish",
           "price": 795,
           "category": "Sizzlers",
           "isVeg": false,
           "rating": 4.5,
           "preparationTime": "25-30 mins",
           "image": "/images/dishes/fish-sizzler.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },
         {
           "_id": "cafe_116",
           "name": "Butter Garlic Prawn Sizzler",
           "description": "Butter garlic prawn sizzler",
           "price": 895,
           "category": "Sizzlers",
           "isVeg": false,
           "rating": 4.8,
           "preparationTime": "25-30 mins",
           "image": "/images/dishes/prawn-sizzler.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },
         
         // CRAFTED SANDWICHES/BURGERS
         {
           "_id": "cafe_117",
           "name": "Club Sandwich (Veg/Non-Veg)",
           "description": "Classic club sandwich",
           "price": 395,
           "category": "Crafted Sandwiches/Burgers",
           "isVeg": true,
           "rating": 4.4,
           "preparationTime": "15-20 mins",
           "image": "/images/categories/cafe after hours/Club Sandwich.jpg",
           "isAvailable": true,
           "type": "VEG",
           "variants": ["Veg", "Non-Veg"],
           "variantPrices": [395, 495]
         },
         {
           "_id": "cafe_118",
           "name": "Tuscan Vegetable Melt Focaccia",
           "description": "Tuscan style vegetable focaccia",
           "price": 445,
           "category": "Crafted Sandwiches/Burgers",
           "isVeg": true,
           "rating": 4.3,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/tuscan-veg-focaccia.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_119",
           "name": "Garden Veggie Burger",
           "description": "Fresh garden vegetable burger",
           "price": 445,
           "category": "Crafted Sandwiches/Burgers",
           "isVeg": true,
           "rating": 4.2,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/garden-veggie-burger.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_120",
           "name": "Peri Peri Cottage Cheese Burger",
           "description": "Spicy paneer burger",
           "price": 445,
           "category": "Crafted Sandwiches/Burgers",
           "isVeg": true,
           "rating": 4.5,
           "preparationTime": "15-20 mins",
           "image": "/images/categories/cafe after hours/Paneer Burger.jpeg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_121",
           "name": "Texas Peri Peri Chicken Focaccia",
           "description": "Texas style peri peri chicken focaccia",
           "price": 595,
           "category": "Crafted Sandwiches/Burgers",
           "isVeg": false,
           "rating": 4.6,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/texas-chicken-focaccia.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },
         {
           "_id": "cafe_122",
           "name": "New York Style Smoked Chicken Burger",
           "description": "NY style smoked chicken burger",
           "price": 595,
           "category": "Crafted Sandwiches/Burgers",
           "isVeg": false,
           "rating": 4.7,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/ny-smoked-chicken-burger.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },
         {
           "_id": "cafe_123",
           "name": "California Lamb Burger",
           "description": "Premium California style lamb burger",
           "price": 695,
           "category": "Crafted Sandwiches/Burgers",
           "isVeg": false,
           "rating": 4.8,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/california-lamb-burger.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },

         // ARTISAN PIZZAS
         {
           "_id": "cafe_124",
           "name": "Rocket Margherita Caprese",
           "description": "Rocket leaves with margherita and caprese",
           "price": 495,
           "category": "Artisan Pizzas",
           "isVeg": true,
           "rating": 4.5,
           "preparationTime": "20-25 mins",
           "image": "/images/categories/cafe after hours/Margherita Pizza.jpeg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_125",
           "name": "Roasted Veggies",
           "description": "Pizza with assorted roasted vegetables",
           "price": 595,
           "category": "Artisan Pizzas",
           "isVeg": true,
           "rating": 4.4,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/roasted-veggie-pizza.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_126",
           "name": "Vegetable Carnival",
           "description": "Carnival of fresh vegetables on pizza",
           "price": 595,
           "category": "Artisan Pizzas",
           "isVeg": true,
           "rating": 4.3,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/vegetable-carnival-pizza.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_127",
           "name": "Quattro Formaggio",
           "description": "Four cheese pizza",
           "price": 645,
           "category": "Artisan Pizzas",
           "isVeg": true,
           "rating": 4.6,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/quattro-formaggio-pizza.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_128",
           "name": "Classic Pepperoni",
           "description": "Traditional pepperoni pizza",
           "price": 695,
           "category": "Artisan Pizzas",
           "isVeg": false,
           "rating": 4.7,
           "preparationTime": "20-25 mins",
           "image": "/images/categories/cafe after hours/Pepperoni Pizza.jpeg",
           "isAvailable": true,
           "type": "NON-VEG"
         },
         {
           "_id": "cafe_129",
           "name": "All The Meats",
           "description": "Loaded meat pizza",
           "price": 695,
           "category": "Artisan Pizzas",
           "isVeg": false,
           "rating": 4.8,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/all-meats-pizza.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },
         {
           "_id": "cafe_130",
           "name": "Spicy Chicken Tikka",
           "description": "Chicken tikka pizza with Indian spices",
           "price": 695,
           "category": "Artisan Pizzas",
           "isVeg": false,
           "rating": 4.6,
           "preparationTime": "20-25 mins",
           "image": "/images/categories/cafe after hours/Chicken Tikka Pizza .jpeg",
           "isAvailable": true,
           "type": "NON-VEG"
         },
         {
           "_id": "cafe_131",
           "name": "Tex-Mex Peri Peri Chicken",
           "description": "Tex-Mex style peri peri chicken pizza",
           "price": 695,
           "category": "Artisan Pizzas",
           "isVeg": false,
           "rating": 4.5,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/tex-mex-peri-peri-pizza.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },
         
         // FLAVORSOME PASTA
         {
           "_id": "cafe_132",
           "name": "Cheese Sauce (Veg/Chicken)",
           "description": "Pasta in creamy cheese sauce",
           "price": 495,
           "category": "Flavorsome Pasta",
           "isVeg": true,
           "rating": 4.6,
           "preparationTime": "15-25 mins",
           "image": "/images/dishes/cheese-sauce-pasta.jpg",
           "isAvailable": true,
           "type": "VEG",
           "variants": ["Veg", "Chicken"],
           "variantPrices": [495, 595]
         },
         {
           "_id": "cafe_133",
           "name": "Arrabbiata (Veg/Chicken)",
           "description": "Spicy tomato pasta",
           "price": 495,
           "category": "Flavorsome Pasta",
           "isVeg": true,
           "rating": 4.3,
           "preparationTime": "15-25 mins",
           "image": "/images/categories/cafe after hours/Penne Arrabbiata.jpeg",
           "isAvailable": true,
           "type": "VEG",
           "variants": ["Veg", "Chicken"],
           "variantPrices": [495, 595]
         },
         {
           "_id": "cafe_134",
           "name": "Alfredo (Veg/Chicken)",
           "description": "Creamy alfredo pasta",
           "price": 495,
           "category": "Flavorsome Pasta",
           "isVeg": true,
           "rating": 4.5,
           "preparationTime": "15-25 mins",
           "image": "/images/categories/cafe after hours/Fettuccine Alfredojpeg.jpeg",
           "isAvailable": true,
           "type": "VEG",
           "variants": ["Veg", "Chicken"],
           "variantPrices": [495, 595]
         },
         {
           "_id": "cafe_135",
           "name": "Spaghetti Aglio E Olio",
           "description": "Garlic and olive oil spaghetti",
           "price": 495,
           "category": "Flavorsome Pasta",
           "isVeg": true,
           "rating": 4.3,
           "preparationTime": "15-25 mins",
           "image": "/images/dishes/aglio-e-olio.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_136",
           "name": "Veg Lasagna",
           "description": "Layered vegetable lasagna",
           "price": 495,
           "category": "Flavorsome Pasta",
           "isVeg": true,
           "rating": 4.7,
           "preparationTime": "15-25 mins",
           "image": "/images/dishes/veg-lasagna.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_137",
           "name": "Spaghetti with Meatballs",
           "description": "Classic spaghetti and meatballs",
           "price": 695,
           "category": "Flavorsome Pasta",
           "isVeg": false,
           "rating": 4.5,
           "preparationTime": "15-25 mins",
           "image": "/images/dishes/spaghetti-meatballs.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },
         {
           "_id": "cafe_138",
           "name": "Chicken Lasagna",
           "description": "Layered chicken lasagna",
           "price": 625,
           "category": "Flavorsome Pasta",
           "isVeg": false,
           "rating": 4.4,
           "preparationTime": "15-25 mins",
           "image": "/images/dishes/chicken-lasagna.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },

         // MEAL BOWL
         {
           "_id": "cafe_139",
           "name": "Khow Suey (Veg/Chicken)",
           "description": "Burmese style noodle soup",
           "price": 495,
           "category": "Meal Bowl",
           "isVeg": true,
           "rating": 4.6,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/khow-suey.jpg",
           "isAvailable": true,
           "type": "VEG",
           "variants": ["Veg", "Chicken"],
           "variantPrices": [495, 595]
         },
         {
           "_id": "cafe_140",
           "name": "Thai Red/Green Curry Bowl (Veg/Chicken/Prawn)",
           "description": "Thai curry with choice of protein",
           "price": 495,
           "category": "Meal Bowl",
           "isVeg": true,
           "rating": 4.7,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/thai-curry-bowl.jpg",
           "isAvailable": true,
           "type": "VEG",
           "variants": ["Veg", "Chicken", "Prawn"],
           "variantPrices": [495, 595, 695]
         },
         {
           "_id": "cafe_141",
           "name": "Manchurian Bowl (Veg/Chicken)",
           "description": "Indo-Chinese manchurian bowl",
           "price": 495,
           "category": "Meal Bowl",
           "isVeg": true,
           "rating": 4.5,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/manchurian-bowl.jpg",
           "isAvailable": true,
           "type": "VEG",
           "variants": ["Veg", "Chicken"],
           "variantPrices": [495, 595]
         },
         {
           "_id": "cafe_142",
           "name": "Stir Fried Mix Veg Bowl (Chilly Garlic/Black Bean/Schezwan)",
           "description": "Mixed vegetables in three sauces",
           "price": 495,
           "category": "Meal Bowl",
           "isVeg": true,
           "rating": 4.4,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/mix-veg-bowl.jpg",
           "isAvailable": true,
           "type": "VEG",
           "variants": ["Chilly Garlic", "Black Bean", "Schezwan"],
           "variantPrices": [495, 495, 495]
         },
         {
           "_id": "cafe_143",
           "name": "Chilly Paneer Bowl",
           "description": "Spicy chilly paneer bowl",
           "price": 495,
           "category": "Meal Bowl",
           "isVeg": true,
           "rating": 4.6,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/chilly-paneer-bowl.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_144",
           "name": "Chicken Mongolian",
           "description": "Mongolian style chicken bowl",
           "price": 595,
           "category": "Meal Bowl",
           "isVeg": false,
           "rating": 4.7,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/chicken-mongolian.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },
         {
           "_id": "cafe_145",
           "name": "Fish in Black Bean/XO Sauce",
           "description": "Fish in black bean or XO sauce",
           "price": 695,
           "category": "Meal Bowl",
           "isVeg": false,
           "rating": 4.6,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/fish-black-bean.jpg",
           "isAvailable": true,
           "type": "NON-VEG",
           "variants": ["Black Bean", "XO Sauce"],
           "variantPrices": [695, 695]
         },
         {
           "_id": "cafe_146",
           "name": "Prawn in Black Bean/XO Sauce",
           "description": "Prawns in black bean or XO sauce",
           "price": 795,
           "category": "Meal Bowl",
           "isVeg": false,
           "rating": 4.8,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/prawn-black-bean.jpg",
           "isAvailable": true,
           "type": "NON-VEG",
           "variants": ["Black Bean", "XO Sauce"],
           "variantPrices": [795, 795]
         },
         {
           "_id": "cafe_147",
           "name": "Chilly Chicken Bowl",
           "description": "Spicy chilly chicken bowl",
           "price": 595,
           "category": "Meal Bowl",
           "isVeg": false,
           "rating": 4.7,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/chilly-chicken-bowl.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },
         
         // RICE / NOODLES
         {
           "_id": "cafe_148",
           "name": "Steamed Rice",
           "description": "Plain steamed rice",
           "price": 295,
           "category": "Rice / Noodles",
           "isVeg": true,
           "rating": 4.2,
           "preparationTime": "10-15 mins",
           "image": "/images/dishes/steamed-rice.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_149",
           "name": "Pulao (Jeera/Peas)",
           "description": "Flavored rice with jeera or peas",
           "price": 295,
           "category": "Rice / Noodles",
           "isVeg": true,
           "rating": 4.4,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/pulao.jpg",
           "isAvailable": true,
           "type": "VEG",
           "variants": ["Jeera", "Peas"],
           "variantPrices": [295, 395]
         },
         {
           "_id": "cafe_150",
           "name": "Fried Rice (Veg/Chicken)",
           "description": "Chinese style fried rice",
           "price": 295,
           "category": "Rice / Noodles",
           "isVeg": true,
           "rating": 4.5,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/fried-rice.jpg",
           "isAvailable": true,
           "type": "VEG",
           "variants": ["Veg", "Chicken"],
           "variantPrices": [295, 395]
         },
         {
           "_id": "cafe_151",
           "name": "Burnt Garlic Rice (Veg/Chicken)",
           "description": "Aromatic burnt garlic rice",
           "price": 375,
           "category": "Rice / Noodles",
           "isVeg": true,
           "rating": 4.6,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/burnt-garlic-rice.jpg",
           "isAvailable": true,
           "type": "VEG",
           "variants": ["Veg", "Chicken"],
           "variantPrices": [375, 475]
         },
         {
           "_id": "cafe_152",
           "name": "Thai Fried Rice (Veg/Chicken)",
           "description": "Thai style fried rice",
           "price": 375,
           "category": "Rice / Noodles",
           "isVeg": true,
           "rating": 4.5,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/thai-fried-rice.jpg",
           "isAvailable": true,
           "type": "VEG",
           "variants": ["Veg", "Chicken"],
           "variantPrices": [375, 475]
         },
         {
           "_id": "cafe_153",
           "name": "Hakka Noodles (Veg/Chicken)",
           "description": "Hakka style noodles",
           "price": 375,
           "category": "Rice / Noodles",
           "isVeg": true,
           "rating": 4.4,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/hakka-noodles.jpg",
           "isAvailable": true,
           "type": "VEG",
           "variants": ["Veg", "Chicken"],
           "variantPrices": [375, 475]
         },
         {
           "_id": "cafe_154",
           "name": "Asian Noodles (Veg/Chicken)",
           "description": "Asian style noodles",
           "price": 375,
           "category": "Rice / Noodles",
           "isVeg": true,
           "rating": 4.3,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/asian-noodles.jpg",
           "isAvailable": true,
           "type": "VEG",
           "variants": ["Veg", "Chicken"],
           "variantPrices": [375, 475]
         },
         {
           "_id": "cafe_155",
           "name": "Pan Fried Noodles (Veg/Chicken)",
           "description": "Pan fried noodles",
           "price": 375,
           "category": "Rice / Noodles",
           "isVeg": true,
           "rating": 4.4,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/pan-fried-noodles.jpg",
           "isAvailable": true,
           "type": "VEG",
           "variants": ["Veg", "Chicken"],
           "variantPrices": [375, 475]
         },

         // SOULFUL INDIAN DELIGHTS
         {
           "_id": "cafe_156",
           "name": "Subz Handi Biryani",
           "description": "Vegetable biryani cooked in handi",
           "price": 595,
           "category": "Soulful Indian Delights",
           "isVeg": true,
           "rating": 4.6,
           "preparationTime": "25-30 mins",
           "image": "/images/dishes/veg-biryani.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_157",
           "name": "Double Dal Tadka",
           "description": "Mixed lentil curry with tempering",
           "price": 495,
           "category": "Soulful Indian Delights",
           "isVeg": true,
           "rating": 4.4,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/double-dal-tadka.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_158",
           "name": "Dal Makhni",
           "description": "Creamy black lentil curry",
           "price": 545,
           "category": "Soulful Indian Delights",
           "isVeg": true,
           "rating": 4.7,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/dal-makhni.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_159",
           "name": "Khumb Makai Masala",
           "description": "Mushroom and corn curry",
           "price": 495,
           "category": "Soulful Indian Delights",
           "isVeg": true,
           "rating": 4.5,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/khumb-makai-masala.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_160",
           "name": "Amritsari Chole",
           "description": "Spicy Amritsari chickpeas",
           "price": 495,
           "category": "Soulful Indian Delights",
           "isVeg": true,
           "rating": 4.6,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/amritsari-chole.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_161",
           "name": "Dum Aloo Kashmiri",
           "description": "Kashmiri style potato curry",
           "price": 545,
           "category": "Soulful Indian Delights",
           "isVeg": true,
           "rating": 4.5,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/dum-aloo-kashmiri.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_162",
           "name": "Paneer (Butter Masala/Lababdar/Kadhai)",
           "description": "Paneer in three different preparations",
           "price": 545,
           "category": "Soulful Indian Delights",
           "isVeg": true,
           "rating": 4.6,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/paneer-butter-masala.jpg",
           "isAvailable": true,
           "type": "VEG",
           "variants": ["Butter Masala", "Lababdar", "Kadhai"],
           "variantPrices": [545, 545, 545]
         },
         {
           "_id": "cafe_163",
           "name": "Makhmali Paneer Ke Kofte",
           "description": "Soft paneer dumplings in gravy",
           "price": 545,
           "category": "Soulful Indian Delights",
           "isVeg": true,
           "rating": 4.3,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/makhmali-paneer-kofte.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_164",
           "name": "Subz Khada Masala",
           "description": "Mixed vegetables in whole spice curry",
           "price": 545,
           "category": "Soulful Indian Delights",
           "isVeg": true,
           "rating": 4.5,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/subz-khada-masala.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_165",
           "name": "Murgh Handi Biryani",
           "description": "Chicken biryani cooked in handi",
           "price": 695,
           "category": "Soulful Indian Delights",
           "isVeg": false,
           "rating": 4.4,
           "preparationTime": "25-30 mins",
           "image": "/images/dishes/chicken-biryani.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },
         {
           "_id": "cafe_166",
           "name": "Gosht Biryani",
           "description": "Mutton biryani",
           "price": 795,
           "category": "Soulful Indian Delights",
           "isVeg": false,
           "rating": 4.5,
           "preparationTime": "25-30 mins",
           "image": "/images/dishes/gosht-biryani.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },
         {
           "_id": "cafe_167",
           "name": "Chicken Dahiwala",
           "description": "Chicken in yogurt gravy",
           "price": 595,
           "category": "Soulful Indian Delights",
           "isVeg": false,
           "rating": 4.6,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/chicken-dahiwala.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },
         {
           "_id": "cafe_168",
           "name": "After Hours Spl Chicken Changezi",
           "description": "Signature chicken changezi",
           "price": 595,
           "category": "Soulful Indian Delights",
           "isVeg": false,
           "rating": 4.7,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/chicken-changezi.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },
         {
           "_id": "cafe_169",
           "name": "Murgh Makhni (With Bone/Boneless)",
           "description": "Butter chicken",
           "price": 595,
           "category": "Soulful Indian Delights",
           "isVeg": false,
           "rating": 4.5,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/murgh-makhni.jpg",
           "isAvailable": true,
           "type": "NON-VEG",
           "variants": ["With Bone", "Boneless"],
           "variantPrices": [595, 595]
         },
         {
           "_id": "cafe_170",
           "name": "Kadhai Chicken",
           "description": "Chicken cooked in kadhai",
           "price": 595,
           "category": "Soulful Indian Delights",
           "isVeg": false,
           "rating": 4.4,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/kadhai-chicken.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },
         {
           "_id": "cafe_171",
           "name": "Murgh Tikka Masala",
           "description": "Chicken tikka in masala gravy",
           "price": 595,
           "category": "Soulful Indian Delights",
           "isVeg": false,
           "rating": 4.8,
           "preparationTime": "20-25 mins",
           "image": "/images/categories/Main Course/Chicken Tikka Masala.jpeg",
           "isAvailable": true,
           "type": "NON-VEG"
         },
         {
           "_id": "cafe_172",
           "name": "Kadhai Jheenga Masala",
           "description": "Prawns cooked in kadhai",
           "price": 795,
           "category": "Soulful Indian Delights",
           "isVeg": false,
           "rating": 4.3,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/kadhai-jheenga.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },
         {
           "_id": "cafe_173",
           "name": "Josh-E-Rogan",
           "description": "Kashmiri mutton curry",
           "price": 695,
           "category": "Soulful Indian Delights",
           "isVeg": false,
           "rating": 4.5,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/josh-e-rogan.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },
         {
           "_id": "cafe_174",
           "name": "Rahra Gosht",
           "description": "Minced mutton curry",
           "price": 695,
           "category": "Soulful Indian Delights",
           "isVeg": false,
           "rating": 4.5,
           "preparationTime": "20-25 mins",
           "image": "/images/dishes/rahra-gosht.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },
         
         // BREADS
         {
           "_id": "cafe_175",
           "name": "Naan (Plain/Butter/Garlic)",
           "description": "Indian bread varieties",
           "price": 95,
           "category": "Breads",
           "isVeg": true,
           "rating": 4.4,
           "preparationTime": "10-15 mins",
           "image": "/images/dishes/naan.jpg",
           "isAvailable": true,
           "type": "VEG",
           "variants": ["Plain", "Butter", "Garlic"],
           "variantPrices": [95, 115, 125]
         },
         {
           "_id": "cafe_176",
           "name": "Paratha (Pudina/Lachha)",
           "description": "Indian flatbread varieties",
           "price": 95,
           "category": "Breads",
           "isVeg": true,
           "rating": 4.4,
           "preparationTime": "10-15 mins",
           "image": "/images/dishes/paratha.jpg",
           "isAvailable": true,
           "type": "VEG",
           "variants": ["Pudina", "Lachha"],
           "variantPrices": [95, 95]
         },
         {
           "_id": "cafe_177",
           "name": "Missi Roti",
           "description": "Mixed flour Indian bread",
           "price": 95,
           "category": "Breads",
           "isVeg": true,
           "rating": 4.5,
           "preparationTime": "10-15 mins",
           "image": "/images/dishes/missi-roti.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_178",
           "name": "Tandoori Roti (Plain/Butter)",
           "description": "Tandoor baked Indian bread",
           "price": 45,
           "category": "Breads",
           "isVeg": true,
           "rating": 4.3,
           "preparationTime": "10-15 mins",
           "image": "/images/dishes/tandoori-roti.jpg",
           "isAvailable": true,
           "type": "VEG",
           "variants": ["Plain", "Butter"],
           "variantPrices": [45, 75]
         },
         {
           "_id": "cafe_179",
           "name": "Amritsari Kulcha (Aloo/Onion/Paneer)",
           "description": "Stuffed Amritsari kulcha",
           "price": 145,
           "category": "Breads",
           "isVeg": true,
           "rating": 4.3,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/amritsari-kulcha.jpg",
           "isAvailable": true,
           "type": "VEG",
           "variants": ["Aloo", "Onion", "Paneer"],
           "variantPrices": [145, 145, 195]
         },
         {
           "_id": "cafe_180",
           "name": "Cheese Jalapeno Naan",
           "description": "Cheese and jalapeno stuffed naan",
           "price": 125,
           "category": "Breads",
           "isVeg": true,
           "rating": 4.6,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/cheese-jalapeno-naan.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_181",
           "name": "Chur-Chur Naan/Paratha",
           "description": "Layered crispy bread",
           "price": 195,
           "category": "Breads",
           "isVeg": true,
           "rating": 4.6,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/chur-chur-bread.jpg",
           "isAvailable": true,
           "type": "VEG",
           "variants": ["Naan", "Paratha"],
           "variantPrices": [195, 195]
         },
         {
           "_id": "cafe_182",
           "name": "Keema Paratha",
           "description": "Minced meat stuffed paratha",
           "price": 295,
           "category": "Breads",
           "isVeg": false,
           "rating": 4.2,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/keema-paratha.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },

         // ADD ONS
         {
           "_id": "cafe_183",
           "name": "Grilled Vegetables",
           "description": "Assorted grilled vegetables",
           "price": 145,
           "category": "Add Ons",
           "isVeg": true,
           "rating": 4.3,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/grilled-vegetables.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_184",
           "name": "Mash Potato",
           "description": "Creamy mashed potatoes",
           "price": 145,
           "category": "Add Ons",
           "isVeg": true,
           "rating": 4.2,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/mash-potato.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_185",
           "name": "Raita (Boondi/Mix Veg/Pineapple)",
           "description": "Yogurt raita varieties",
           "price": 195,
           "category": "Add Ons",
           "isVeg": true,
           "rating": 4.4,
           "preparationTime": "10-15 mins",
           "image": "/images/dishes/raita.jpg",
           "isAvailable": true,
           "type": "VEG",
           "variants": ["Boondi", "Mix Veg", "Pineapple"],
           "variantPrices": [195, 195, 245]
         },
         {
           "_id": "cafe_186",
           "name": "Bacon Slice",
           "description": "Crispy bacon slice",
           "price": 195,
           "category": "Add Ons",
           "isVeg": false,
           "rating": 4.5,
           "preparationTime": "10-15 mins",
           "image": "/images/dishes/bacon-slice.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },
         {
           "_id": "cafe_187",
           "name": "Grilled Chicken",
           "description": "Grilled chicken piece",
           "price": 195,
           "category": "Add Ons",
           "isVeg": false,
           "rating": 4.6,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/grilled-chicken.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },
         {
           "_id": "cafe_188",
           "name": "Chicken Sausage",
           "description": "Grilled chicken sausage",
           "price": 195,
           "category": "Add Ons",
           "isVeg": false,
           "rating": 4.4,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/chicken-sausage.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },
         {
           "_id": "cafe_189",
           "name": "Chicken Ham",
           "description": "Sliced chicken ham",
           "price": 195,
           "category": "Add Ons",
           "isVeg": false,
           "rating": 4.3,
           "preparationTime": "10-15 mins",
           "image": "/images/dishes/chicken-ham.jpg",
           "isAvailable": true,
           "type": "NON-VEG"
         },
         
         // DESSERT
         {
           "_id": "cafe_190",
           "name": "Andaz E Bayaan",
           "description": "Signature dessert creation",
           "price": 395,
           "category": "Dessert",
           "isVeg": true,
           "rating": 4.3,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/andaz-e-bayaan.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_191",
           "name": "Blueberry Cheesecake",
           "description": "Rich blueberry cheesecake",
           "price": 395,
           "category": "Dessert",
           "isVeg": true,
           "rating": 4.5,
           "preparationTime": "15-20 mins",
           "image": "/images/categories/cafe after hours/Cheesecake.jpeg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_192",
           "name": "Red Velvet Brownie with Ice Cream",
           "description": "Decadent red velvet brownie served with ice cream",
           "price": 345,
           "category": "Dessert",
           "isVeg": true,
           "rating": 4.8,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/red-velvet-brownie.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_193",
           "name": "Mexican Churros",
           "description": "Traditional Mexican churros with chocolate dip",
           "price": 395,
           "category": "Dessert",
           "isVeg": true,
           "rating": 4.2,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/mexican-churros.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_194",
           "name": "Fruity Nutty Sundae",
           "description": "Ice cream sundae with fruits and nuts",
           "price": 345,
           "category": "Dessert",
           "isVeg": true,
           "rating": 4.6,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/fruity-nutty-sundae.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_195",
           "name": "Apple Pie with Ice Cream",
           "description": "Classic apple pie served with vanilla ice cream",
           "price": 345,
           "category": "Dessert",
           "isVeg": true,
           "rating": 4.7,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/apple-pie-ice-cream.jpg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_196",
           "name": "Tiramisu Jar",
           "description": "Classic Italian tiramisu in a jar",
           "price": 495,
           "category": "Dessert",
           "isVeg": true,
           "rating": 4.5,
           "preparationTime": "15-20 mins",
           "image": "/images/categories/cafe after hours/Tiramisu.jpeg",
           "isAvailable": true,
           "type": "VEG"
         },
         {
           "_id": "cafe_197",
           "name": "Mocha Mud Cake",
           "description": "Rich chocolate mocha mud cake",
           "price": 495,
           "category": "Dessert",
           "isVeg": true,
           "rating": 4.6,
           "preparationTime": "15-20 mins",
           "image": "/images/dishes/mocha-mud-cake.jpg",
           "isAvailable": true,
           "type": "VEG"
         }
        ],
        "3": [
    {
      "_id": "symp_north_001",
      "name": "Dal Makhani",
      "description": "Rich and creamy black lentils cooked with butter and spices",
      "price": 180,
      "category": "North Indian",
      "isVeg": true,
      "rating": 4.5,
      "preparationTime": "25 mins",
      "image": "/images/categories/symposium/Dal Makhan.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "symp_north_002",
      "name": "Shahi Paneer",
      "description": "Royal cottage cheese curry in rich tomato gravy",
      "price": 200,
      "category": "North Indian",
      "isVeg": true,
      "rating": 4.3,
      "preparationTime": "20 mins",
      "image": "/images/categories/symposium/Shahi Paneer.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "symp_north_003",
      "name": "Butter Chicken",
      "description": "Tender chicken in creamy tomato-based curry",
      "price": 280,
      "category": "North Indian",
      "isVeg": false,
      "rating": 4.7,
      "preparationTime": "30 mins",
      "image": "/images/categories/symposium/Butter Chicken.jpeg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "symp_south_001",
      "name": "Masala Dosa",
      "description": "Crispy rice crepe filled with spiced potato",
      "price": 120,
      "category": "South Indian",
      "isVeg": true,
      "rating": 4.4,
      "preparationTime": "20 mins",
      "image": "/images/categories/symposium/Masala Dosajpeg.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "symp_south_002",
      "name": "Idli Sambar",
      "description": "Steamed rice cakes with lentil curry",
      "price": 100,
      "category": "South Indian",
      "isVeg": true,
      "rating": 4.2,
      "preparationTime": "15 mins",
      "image": "/images/categories/symposium/Idli Sambar.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "symp_chinese_001",
      "name": "Hakka Noodles",
      "description": "Stir-fried noodles with vegetables",
      "price": 160,
      "category": "Chinese",
      "isVeg": true,
      "rating": 4.1,
      "preparationTime": "25 mins",
      "image": "/images/categories/symposium/Hakka Noodles.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "symp_chinese_002",
      "name": "Veg Manchurian",
      "description": "Deep-fried vegetable balls in tangy sauce",
      "price": 140,
      "category": "Chinese",
      "isVeg": true,
      "rating": 4,
      "preparationTime": "20 mins",
      "image": "/images/categories/symposium/Veg Manchurian.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "symp_oriental_001",
      "name": "Sushi Roll",
      "description": "Fresh sushi roll with vegetables",
      "price": 200,
      "category": "Oriental",
      "isVeg": true,
      "rating": 4.3,
      "preparationTime": "15 mins",
      "image": "/images/categories/symposium/Sushi Roll.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "symp_oriental_002",
      "name": "Teriyaki Chicken",
      "description": "Grilled chicken with teriyaki sauce",
      "price": 220,
      "category": "Oriental",
      "isVeg": false,
      "rating": 4.5,
      "preparationTime": "20 mins",
      "image": "/images/categories/symposium/Teriyaki Chicken.jpeg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "symp_oriental_003",
      "name": "Miso Soup",
      "description": "Traditional Japanese miso soup",
      "price": 80,
      "category": "Oriental",
      "isVeg": true,
      "rating": 4.2,
      "preparationTime": "10 mins",
      "image": "/images/categories/symposium/Miso Soup.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "symp_oriental_004",
      "name": "Tempura",
      "description": "Crispy tempura vegetables",
      "price": 160,
      "category": "Oriental",
      "isVeg": true,
      "rating": 4.4,
      "preparationTime": "18 mins",
      "image": "/images/categories/symposium/Tempura.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "symp_italian_001",
      "name": "Margherita Pizza",
      "description": "Classic pizza with tomato sauce and mozzarella",
      "price": 250,
      "category": "Italian",
      "isVeg": true,
      "rating": 4.6,
      "preparationTime": "20 mins",
      "image": "/images/categories/symposium/Margherita Pizza.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "symp_italian_002",
      "name": "Pasta Carbonara",
      "description": "Creamy pasta with eggs and cheese",
      "price": 180,
      "category": "Italian",
      "isVeg": false,
      "rating": 4.4,
      "preparationTime": "15 mins",
      "image": "/images/categories/symposium/Pasta Carbonara.jpeg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "symp_italian_003",
      "name": "Bruschetta",
      "description": "Toasted bread with fresh tomatoes and herbs",
      "price": 120,
      "category": "Italian",
      "isVeg": true,
      "rating": 4.3,
      "preparationTime": "8 mins",
      "image": "/images/categories/symposium/Bruschetta.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "symp_italian_004",
      "name": "Tiramisu",
      "description": "Classic Italian dessert with coffee",
      "price": 150,
      "category": "Italian",
      "isVeg": true,
      "rating": 4.7,
      "preparationTime": "5 mins",
      "image": "/images/categories/Desserts/Tiramisu.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "symp_european_001",
      "name": "Grilled Salmon",
      "description": "Fresh grilled salmon with herbs",
      "price": 350,
      "category": "European",
      "isVeg": false,
      "rating": 4.8,
      "preparationTime": "25 mins",
      "image": "/images/categories/symposium/Grilled Salmon.jpeg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "symp_european_002",
      "name": "Beef Steak",
      "description": "Juicy beef steak with vegetables",
      "price": 400,
      "category": "European",
      "isVeg": false,
      "rating": 4.7,
      "preparationTime": "30 mins",
      "image": "/images/categories/symposium/Beef Steakjpeg.jpeg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "symp_european_003",
      "name": "Caesar Salad",
      "description": "Fresh romaine lettuce with parmesan",
      "price": 180,
      "category": "European",
      "isVeg": true,
      "rating": 4.4,
      "preparationTime": "12 mins",
      "image": "/images/categories/symposium/Caesar Salad.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "symp_european_004",
      "name": "French Fries",
      "description": "Crispy golden french fries",
      "price": 100,
      "category": "European",
      "isVeg": true,
      "rating": 4.2,
      "preparationTime": "10 mins",
      "image": "/images/categories/symposium/French Fries.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "symp_mughlai_001",
      "name": "Chicken Biryani",
      "description": "Aromatic rice with tender chicken",
      "price": 280,
      "category": "Mughlai",
      "isVeg": false,
      "rating": 4.8,
      "preparationTime": "35 mins",
      "image": "/images/categories/Main Course/Chicken Biryani.jpeg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "symp_mughlai_002",
      "name": "Mutton Rogan Josh",
      "description": "Spicy mutton curry with aromatic spices",
      "price": 320,
      "category": "Mughlai",
      "isVeg": false,
      "rating": 4.6,
      "preparationTime": "40 mins",
      "image": "/images/categories/symposium/Mutton Rogan Josh.jpeg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "symp_mughlai_003",
      "name": "Shahi Paneer",
      "description": "Royal cottage cheese curry",
      "price": 200,
      "category": "Mughlai",
      "isVeg": true,
      "rating": 4.5,
      "preparationTime": "20 mins",
      "image": "/images/categories/symposium/Shahi Paneer.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "symp_mughlai_004",
      "name": "Naan",
      "description": "Soft bread from tandoor",
      "price": 40,
      "category": "Mughlai",
      "isVeg": true,
      "rating": 4.3,
      "preparationTime": "8 mins",
      "image": "/images/categories/symposium/Naan.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "symp_fast_001",
      "name": "Burger",
      "description": "Classic burger with fresh vegetables",
      "price": 150,
      "category": "Fast Food",
      "isVeg": false,
      "rating": 4.4,
      "preparationTime": "12 mins",
      "image": "/images/categories/burger-2.jpg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "symp_fast_002",
      "name": "French Fries",
      "description": "Crispy golden french fries",
      "price": 100,
      "category": "Fast Food",
      "isVeg": true,
      "rating": 4.2,
      "preparationTime": "10 mins",
      "image": "/images/categories/symposium/French Fries.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "symp_fast_003",
      "name": "Chicken Wings",
      "description": "Spicy chicken wings",
      "price": 200,
      "category": "Fast Food",
      "isVeg": false,
      "rating": 4.5,
      "preparationTime": "15 mins",
      "image": "/images/categories/symposium/Chicken Wings.jpeg",
      "isAvailable": true,
      "type": "NON-VEG"
    },
    {
      "_id": "symp_fast_004",
      "name": "Pizza Slice",
      "description": "Fresh pizza slice",
      "price": 120,
      "category": "Fast Food",
      "isVeg": true,
      "rating": 4.3,
      "preparationTime": "8 mins",
      "image": "/images/categories/pizza-2.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "symp_bev_001",
      "name": "Mix Berries Shake",
      "description": "Refreshing mixed berries shake",
      "price": 325,
      "category": "Beverages",
      "isVeg": true,
      "rating": 4.5,
      "preparationTime": "8 mins",
      "image": "/images/categories/symposium/Mix Berries Shake.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "symp_bev_002",
      "name": "Cold Coffee",
      "description": "Creamy cold coffee",
      "price": 295,
      "category": "Beverages",
      "isVeg": true,
      "rating": 4.4,
      "preparationTime": "5 mins",
      "image": "/images/categories/symposium/Cold Coffee.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "symp_bev_003",
      "name": "Various Ice Teas",
      "description": "Assorted flavored ice teas",
      "price": 299,
      "category": "Beverages",
      "isVeg": true,
      "rating": 4.3,
      "preparationTime": "6 mins",
      "image": "/images/categories/symposium/Various Ice Teas .jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "symp_bev_004",
      "name": "Fresh Juice",
      "description": "Fresh seasonal fruit juice",
      "price": 150,
      "category": "Beverages",
      "isVeg": true,
      "rating": 4.2,
      "preparationTime": "5 mins",
      "image": "/images/categories/symposium/Fresh Juice.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "symp_dessert_001",
      "name": "Chocolate Cake",
      "description": "Rich chocolate cake",
      "price": 180,
      "category": "Desserts",
      "isVeg": true,
      "rating": 4.6,
      "preparationTime": "5 mins",
      "image": "/images/categories/symposium/Chocolate Cake .jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "symp_dessert_002",
      "name": "Gulab Jamun",
      "description": "Sweet milk balls in sugar syrup",
      "price": 80,
      "category": "Desserts",
      "isVeg": true,
      "rating": 4.6,
      "preparationTime": "10 mins",
      "image": "/images/categories/Desserts/Gulab Jamun.jpeg",
      "isAvailable": true,
      "type": "VEG"
    },
    {
      "_id": "symp_dessert_003",
      "name": "Vanilla Ice Cream",
      "description": "Creamy vanilla ice cream",
      "price": 60,
      "category": "Desserts",
      "isVeg": true,
      "rating": 4.3,
      "preparationTime": "5 mins",
      "image": "/images/categories/symposium/Vanilla Ice Cream.jpeg",
      "isAvailable": true,
      "type": "VEG"
    }
  ]
};

export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    console.log('🍽️ Restaurant admin menu access, token:', token?.substring(0, 30) + '...');
    
    if (!token || !token.startsWith('restaurant-admin-token-')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Extract restaurant ID from token
    const restaurantId = token.replace('restaurant-admin-token-', '');
    console.log('🏪 Restaurant ID:', restaurantId);

    const menuItems = adminMenuData[restaurantId] || [];
    console.log(`📋 Found ${menuItems.length} menu items for restaurant ${restaurantId}`);

    // Get categories with item counts  
    const categories = {};
    menuItems.forEach(item => {
      if (!categories[item.category]) {
        categories[item.category] = 0;
      }
      categories[item.category]++;
    });

    console.log('📊 Categories:', categories);

    return NextResponse.json({
      menuItems,
      categories,
      totalItems: menuItems.length,
      message: 'Menu retrieved successfully'
    });

  } catch (error: any) {
    console.error('Get menu error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token || !token.startsWith('restaurant-admin-token-')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const restaurantId = token.replace('restaurant-admin-token-', '');
    const { name, description, price, category, isVeg, preparationTime, image, customCategory } = await request.json();

    if (!name || !price || (!category && !customCategory)) {
      return NextResponse.json(
        { error: 'Name, price, and category are required' },
        { status: 400 }
      );
    }

    // Use custom category if provided, otherwise use selected category
    const finalCategory = customCategory || category;

    // Generate new item ID
    const restaurantPrefix = restaurantId === '1' ? 'panache' : restaurantId === '2' ? 'cafe' : 'symposium';
    const newId = `${restaurantPrefix}_${Date.now()}`;

    const newItem = {
      _id: newId,
      name,
      description: description || '',
      price: parseFloat(price),
      category: finalCategory,
      isVeg: isVeg !== undefined ? isVeg : true,
      rating: 4.0,
      preparationTime: preparationTime || '15-20 mins',
      image: image || '/images/placeholder-food.jpg',
      isAvailable: true, // NEW ITEMS ARE AVAILABLE BY DEFAULT
      type: isVeg ? 'VEG' : 'NON-VEG'
    };

    // Add to menu
    if (!adminMenuData[restaurantId]) {
      adminMenuData[restaurantId] = [];
    }
    adminMenuData[restaurantId].push(newItem);

    console.log(`✅ Added new menu item: ${name} to restaurant ${restaurantId}`);

    return NextResponse.json({
      success: true,
      message: 'Menu item added successfully',
      item: newItem
    });

  } catch (error: any) {
    console.error('Add menu item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await connectDB();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token || !token.startsWith('restaurant-admin-token-')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const restaurantId = token.replace('restaurant-admin-token-', '');
    const { _id, name, description, price, category, isVeg, preparationTime, image, isAvailable } = await request.json();

    if (!_id) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const menuItems = adminMenuData[restaurantId] || [];
    const itemIndex = menuItems.findIndex(item => item._id === _id);

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    // Update item
    const updatedItem = {
      ...menuItems[itemIndex],
      ...(name && { name }),
      ...(description !== undefined && { description }),
      ...(price !== undefined && { price: parseFloat(price) }),
      ...(category && { category }),
      ...(isVeg !== undefined && { isVeg, type: isVeg ? 'VEG' : 'NON-VEG' }),
      ...(preparationTime && { preparationTime }),
      ...(image && { image }),
      ...(isAvailable !== undefined && { isAvailable }) // ALLOW STATUS CHANGES
    };

    adminMenuData[restaurantId][itemIndex] = updatedItem;

    console.log(`✅ Updated menu item: ${name || updatedItem.name} in restaurant ${restaurantId}`);

    return NextResponse.json({
      success: true,
      message: 'Menu item updated successfully',
      item: updatedItem
    });

  } catch (error: any) {
    console.error('Update menu item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await connectDB();
    
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token || !token.startsWith('restaurant-admin-token-')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const restaurantId = token.replace('restaurant-admin-token-', '');
    const { searchParams } = new URL(request.url);
    const itemId = searchParams.get('id');

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID is required' },
        { status: 400 }
      );
    }

    const menuItems = adminMenuData[restaurantId] || [];
    const itemIndex = menuItems.findIndex(item => item._id === itemId);

    if (itemIndex === -1) {
      return NextResponse.json(
        { error: 'Menu item not found' },
        { status: 404 }
      );
    }

    const deletedItem = menuItems[itemIndex];
    adminMenuData[restaurantId].splice(itemIndex, 1);

    console.log(`❌ Deleted menu item: ${deletedItem.name} from restaurant ${restaurantId}`);

    return NextResponse.json({
      success: true,
      message: 'Menu item deleted successfully',
      item: deletedItem
    });

  } catch (error: any) {
    console.error('Delete menu item error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// Export function for menu sync API to access the same data
export function getAdminMenuData(restaurantId: string) {
  if (restaurantId === '1') return getPanacheAdminMenu();
  if (restaurantId === '2') return getCafeAdminMenu();
  if (restaurantId === '3') return getSymposiumAdminMenu();
  return adminMenuData[restaurantId] || [];
}