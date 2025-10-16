'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Plus, Minus, ShoppingCart, ArrowLeft, Search, X } from 'lucide-react';
import { Cormorant_Garamond } from 'next/font/google';
import { toast } from 'react-hot-toast';
import { unifiedCartService } from '@/lib/api';
import Image from 'next/image';
import getSymposiumAdminMenu from '@/lib/menus/admin/symposium';
import getPanacheAdminMenu from '@/lib/menus/admin/panache';
import getCafeAdminMenu from '@/lib/menus/admin/cafe';

const cormorant = Cormorant_Garamond({ 
  weight: ['400', '600'],
  subsets: ['latin'] 
});

// Category image mapping function
const getCategoryImage = (categoryName: string): string => {
  const categoryImageMap: { [key: string]: string } = {
    "Bar Tidbits": "/images/categories/Bar Munchies.jpg",
    "Soups": "/images/categories/soups.jpg", 
    "Gourmet Healthy Salads": "/images/categories/Salad Station.jpeg",
    "Wholesome Sharing Platters": "/images/categories/Mediterranean and Tandoori Boards.jpeg",
    "Sourdough Toasts/Bruschettas": "/images/categories/SANDWHICH.jpg",
    "Mediterranean": "/images/categories/Mediterranean and Tandoori Boards.jpeg",
    "European": "/images/categories/European.jpg",
    "Clay Oven": "/images/categories/Charcoal.jpeg",
    "Oriental": "/images/categories/Oriental.jpg",
    "Dumplings": "/images/categories/Oriental.jpg", 
    "Sushis": "/images/categories/Oriental.jpg",  
    "Continental Mains": "/images/categories/European.jpg",
    "Sizzlers": "/images/categories/European.jpg",
    "Crafted Sandwiches/Burgers": "/images/categories/SANDWHICH.jpg",
    "Artisan Pizzas": "/images/categories/pizza-2.jpeg",
    "Flavorsome Pasta": "/images/categories/pasta.jpg",
    "Meal Bowl": "/images/categories/Chinese.jpg",
    "Rice / Noodles": "/images/categories/Chinese.jpg",
    "Soulful Indian Delights": "/images/categories/Main Course.jpeg",
    "Breads": "/images/categories/north-indian.jpg",
    "Add Ons": "/images/categories/placeholder-food.jpg",
    "Dessert": "/images/categories/Desserts.jpeg",
    "Desserts": "/images/categories/Desserts.jpeg"
  };

  // Return mapped image or fallback to placeholder
  return categoryImageMap[categoryName] || "/images/placeholder-food.jpg";
};

interface MenuItem {
  _id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  isVeg: boolean;
  rating: number;
  preparationTime: string;
  variants?: string[];
  variantPrices?: number[];
}

interface MenuCategory {
  name: string;
  img: string;
  items: MenuItem[];
  restaurantId: string;
  restaurantName: string;
}

interface RestaurantMenuGridProps {
  restaurantId: string;
  restaurantName: string;
  theme: 'symposium' | 'panache' | 'cafe';
}

const getRestaurantMenuDataOld = (restaurantId: string): MenuCategory[] => {
  // Restaurant-specific menu data
  const restaurantMenus = {
    '1': { // Panache - Complete Menu
      categories: [
        {
          name: 'Bar Munchies',
          img: '/images/categories/Bar Munchies.jpg',
          items: [
            {
              _id: 'panache_munch_001',
              name: 'French Fries Plain/Peri Peri/Cheesy',
              description: 'Crispy golden fries with choice of seasoning',
              price: 145,
              image: '/images/categories/Bar Munchies/french-fries.jpg',
              category: 'Bar Munchies',
              isVeg: true,
              rating: 4.3,
              preparationTime: '10-15 mins',
              variants: ['Plain', 'Peri Peri', 'Cheesy'],
              variantPrices: [145, 195, 195]
            },
            {
              _id: 'panache_munch_002',
              name: 'Garlic Bread Plain/Cheese',
              description: 'Fresh garlic bread with optional cheese',
              price: 145,
              image: '/images/categories/Bar Munchies/Garlic-Bread-4.webp',
              category: 'Bar Munchies',
              isVeg: true,
              rating: 4.4,
              preparationTime: '8-12 mins',
              variants: ['Plain', 'Cheese'],
              variantPrices: [145, 195]
            },
            {
              _id: 'panache_munch_003',
              name: 'Potato Wedges Plain/Peri Peri',
              description: 'Crispy potato wedges with seasoning',
              price: 145,
              image: '/images/categories/Bar Munchies/Potato Wedges Plain.jpeg',
              category: 'Bar Munchies',
              isVeg: true,
              rating: 4.2,
              preparationTime: '12-18 mins'
            },
            {
              _id: 'panache_munch_004',
              name: 'Chilly Cheese Toast',
              description: 'Spicy cheese toast with green chilies',
              price: 145,
              image: '/images/categories/Bar Munchies/Chilly Cheese Toast .webp',
              category: 'Bar Munchies',
              isVeg: true,
              rating: 4.5,
              preparationTime: '8-12 mins'
            },
            {
              _id: 'panache_munch_005',
              name: 'Peanut Masala',
              description: 'Spiced roasted peanuts',
              price: 145,
              image: '/images/categories/Bar Munchies/Peanut Masala.webp',
              category: 'Bar Munchies',
              isVeg: true,
              rating: 4.1,
              preparationTime: '5-8 mins'
            },
            {
              _id: 'panache_munch_006',
              name: 'Masala Papad',
              description: 'Crispy papad with masala',
              price: 145,
              image: '/images/categories/Bar Munchies/Masala Papad.jpg',
              category: 'Bar Munchies',
              isVeg: true,
              rating: 4.0,
              preparationTime: '3-5 mins'
            },
            {
              _id: 'panache_munch_007',
              name: 'American Corn Chat',
              description: 'Sweet corn with tangy chat masala',
              price: 145,
              image: '/images/categories/Bar Munchies/American Corn Chat.jpg',
              category: 'Bar Munchies',
              isVeg: true,
              rating: 4.3,
              preparationTime: '8-12 mins'
            },
            {
              _id: 'panache_munch_008',
              name: 'Hummus with Falafel',
              description: 'Creamy hummus served with falafel',
              price: 195,
              image: '/images/categories/Bar Munchies/Hummus with Falafel.jpeg',
              category: 'Bar Munchies',
              isVeg: true,
              rating: 4.6,
              preparationTime: '12-18 mins'
            },
            {
              _id: 'panache_munch_009',
              name: 'Hummus with Pita',
              description: 'Creamy hummus served with pita bread',
              price: 195,
              image: '/images/categories/Bar Munchies/Hummus with Pita.jpg',
              category: 'Bar Munchies',
              isVeg: true,
              rating: 4.5,
              preparationTime: '10-15 mins'
            },
            {
              _id: 'panache_munch_010',
              name: 'Loaded Nachos (Veg/Chicken)',
              description: 'Crispy tortilla chips topped with cheese and salsa',
              price: 195,
              image: '/images/categories/Bar Munchies/Loaded Nacho.jpeg',
              category: 'Bar Munchies',
              isVeg: false,
              rating: 4.7,
              preparationTime: '15-20 mins',
              variants: ['Veg', 'Chicken'],
              variantPrices: [195, 245]
            },
            {
              _id: 'panache_munch_011',
              name: 'Bruschettas (Tomato/Chicken)',
              description: 'Toasted bread with fresh toppings',
              price: 195,
              image: '/images/categories/Bar Munchies/Bruschettas .jpg',
              category: 'Bar Munchies',
              isVeg: false,
              rating: 4.4,
              preparationTime: '12-18 mins',
              variants: ['Tomato', 'Chicken'],
              variantPrices: [195, 245]
            },
            {
              _id: 'panache_munch_012',
              name: 'Cheesy Cigar Rolls (Veg/Chicken)',
              description: 'Crispy cigar rolls filled with cheese',
              price: 195,
              image: '/images/categories/Bar Munchies/Cheesy Cigar Rolls .jpeg',
              category: 'Bar Munchies',
              isVeg: false,
              rating: 4.5,
              preparationTime: '15-20 mins',
              variants: ['Veg', 'Chicken'],
              variantPrices: [195, 245]
            }
          ]
        },
        {
          name: 'Soups',
          img: '/images/categories/soups.jpg',
          items: [
            {
              _id: 'panache_soup_001',
              name: 'Almond Broccoli Soup',
              description: 'Creamy almond and broccoli soup',
              price: 145,
              image: '/images/categories/soups/Almond Broccoli Soup.jpeg',
              category: 'Soups',
              isVeg: true,
              rating: 4.4,
              preparationTime: '15-20 mins'
            },
            {
              _id: 'panache_soup_002',
              name: 'Cream of Tomato Veg/Chicken',
              description: 'Creamy tomato soup with choice of base',
              price: 145,
              image: '/images/categories/soups/Cream of Tomato.webp',
              category: 'Soups',
              isVeg: false,
              rating: 4.3,
              preparationTime: '12-18 mins',
              variants: ['Veg', 'Chicken'],
              variantPrices: [145, 195]
            },
            {
              _id: 'panache_soup_003',
              name: 'Sweet Corn Soup Veg/Chicken',
              description: 'Sweet corn soup with choice of base',
              price: 145,
              image: '/images/categories/soups/Sweet Corn Soup.jpg',
              category: 'Soups',
              isVeg: false,
              rating: 4.2,
              preparationTime: '12-18 mins',
              variants: ['Veg', 'Chicken'],
              variantPrices: [145, 195]
            },
            {
              _id: 'panache_soup_004',
              name: 'Manchow Soup Veg/Chicken',
              description: 'Spicy manchow soup with choice of base',
              price: 145,
              image: '/images/categories/soups/Manchow Soup.jpg',
              category: 'Soups',
              isVeg: false,
              rating: 4.5,
              preparationTime: '15-20 mins',
              variants: ['Veg', 'Chicken'],
              variantPrices: [145, 195]
            }
          ]
        },
        {
          name: 'Salad Station',
          img: '/images/categories/Salad Station.jpeg',
          items: [
            {
              _id: 'panache_salad_001',
              name: 'Greek Salad (Veg/Chicken)',
              description: 'Fresh Greek salad with feta and olives',
              price: 245,
              image: '/images/categories/Salad station/GreekSalad_9.jpg',
              category: 'Salad Station',
              isVeg: false,
              rating: 4.6,
              preparationTime: '10-15 mins',
              variants: ['Veg', 'Chicken'],
              variantPrices: [245, 275]
            },
            {
              _id: 'panache_salad_002',
              name: 'Quinoa Apple Vinaigrette Salad',
              description: 'Healthy quinoa salad with apple vinaigrette',
              price: 345,
              image: '/images/categories/Salad station/Quinoa Apple Vinaigrette Salad.webp',
              category: 'Salad Station',
              isVeg: true,
              rating: 4.7,
              preparationTime: '12-18 mins'
            },
            {
              _id: 'panache_salad_003',
              name: 'Classic Caesar Veg/Chicken',
              description: 'Classic Caesar salad with choice of base',
              price: 245,
              image: '/images/categories/Salad station/Classic Caesar.jpg',
              category: 'Salad Station',
              isVeg: false,
              rating: 4.5,
              preparationTime: '10-15 mins',
              variants: ['Veg', 'Chicken'],
              variantPrices: [245, 275]
            },
            {
              _id: 'panache_salad_004',
              name: 'Fresh Garden Green Salad',
              description: 'Fresh garden vegetables with light dressing',
              price: 195,
              image: '/images/categories/Salad station/Fresh Garden Green Salad.jpeg',
              category: 'Salad Station',
              isVeg: true,
              rating: 4.3,
              preparationTime: '8-12 mins'
            }
          ]
        },
        {
          name: 'Mediterranean and Tandoori Boards',
          img: '/images/categories/Mediterranean and Tandoori Boards.jpeg',
          items: [
            {
              _id: 'panache_board_001',
              name: 'Mediterranean Platter Veg',
              description: 'Assorted Mediterranean vegetarian items',
              price: 595,
              image: '/images/categories/Mediterranean and Tandoori Boards/Mediterranean Platter Veg.jpg',
              category: 'Mediterranean and Tandoori Boards',
              isVeg: true,
              rating: 4.8,
              preparationTime: '20-25 mins'
            },
            {
              _id: 'panache_board_002',
              name: 'Mediterranean Platter Non-Veg',
              description: 'Assorted Mediterranean non-vegetarian items',
              price: 695,
              image: '/images/categories/Mediterranean and Tandoori Boards/Mediterranean Platter Non-Veg.jpg',
              category: 'Mediterranean and Tandoori Boards',
              isVeg: false,
              rating: 4.9,
              preparationTime: '25-30 mins'
            },
            {
              _id: 'panache_board_003',
              name: 'Tandoori Veg Platter',
              description: 'Assorted tandoori vegetarian items',
              price: 595,
              image: '/images/categories/Mediterranean and Tandoori Boards/Tandoori Veg Platter.jpeg',
              category: 'Mediterranean and Tandoori Boards',
              isVeg: true,
              rating: 4.7,
              preparationTime: '20-25 mins'
            },
            {
              _id: 'panache_board_004',
              name: 'Tandoori Non-Veg Platter',
              description: 'Assorted tandoori non-vegetarian items',
              price: 695,
              image: '/images/categories/Mediterranean and Tandoori Boards/Tandoori Non-Veg Platter.jpeg',
              category: 'Mediterranean and Tandoori Boards',
              isVeg: false,
              rating: 4.8,
              preparationTime: '25-30 mins'
            }
          ]
        },
        {
          name: 'Appetizers Continental',
          img: '/images/categories/Appetizers Continentaljpg.jpg',
          items: [
            {
              _id: 'panache_app_cont_001',
              name: 'Mushroom Duplex',
              description: 'Stuffed mushrooms with cheese and herbs',
              price: 275,
              image: '/images/categories/Appetizers Continental/Mushroom Duplext.jpg',
              category: 'Appetizers Continental',
              isVeg: true,
              rating: 4.5,
              preparationTime: '15-20 mins'
            },
            {
              _id: 'panache_app_cont_002',
              name: 'Fried Mozzarella Sticks',
              description: 'Crispy fried mozzarella cheese sticks',
              price: 275,
              image: '/images/categories/Appetizers Continental/Fried Mozzarella Sticks.jpg',
              category: 'Appetizers Continental',
              isVeg: true,
              rating: 4.6,
              preparationTime: '12-18 mins'
            },
            {
              _id: 'panache_app_cont_003',
              name: 'Crispy Onion Rings',
              description: 'Crispy battered onion rings',
              price: 245,
              image: '/images/categories/Appetizers Continental/Crispy Onion Rings .jpg',
              category: 'Appetizers Continental',
              isVeg: true,
              rating: 4.3,
              preparationTime: '10-15 mins'
            },
            {
              _id: 'panache_app_cont_004',
              name: 'Veg Pita Pockets',
              description: 'Fresh vegetables in pita bread',
              price: 245,
              image: '/images/categories/Appetizers Continental/Veg Pita Pockets.jpg',
              category: 'Appetizers Continental',
              isVeg: true,
              rating: 4.4,
              preparationTime: '12-18 mins'
            },
            {
              _id: 'panache_app_cont_005',
              name: 'Peri Peri Chicken Wings',
              description: 'Spicy peri peri chicken wings',
              price: 375,
              image: '/images/categories/Appetizers Continental/Peri Peri Chicken Wings.jpg',
              category: 'Appetizers Continental',
              isVeg: false,
              rating: 4.7,
              preparationTime: '18-25 mins'
            },
            {
              _id: 'panache_app_cont_006',
              name: 'Fish N Chips',
              description: 'Classic fish and chips with tartar sauce',
              price: 445,
              image: '/images/categories/Appetizers Continental/Fish N Chips.webp',
              category: 'Appetizers Continental',
              isVeg: false,
              rating: 4.6,
              preparationTime: '15-20 mins'
            },
            {
              _id: 'panache_app_cont_007',
              name: 'Crispy Chicken Tenders',
              description: 'Crispy breaded chicken tenders',
              price: 375,
              image: '/images/categories/Appetizers Continental/Crispy Chicken Tenders.jpg',
              category: 'Appetizers Continental',
              isVeg: false,
              rating: 4.5,
              preparationTime: '15-20 mins'
            },
            {
              _id: 'panache_app_cont_008',
              name: 'Grilled Tiger Prawns',
              description: 'Grilled tiger prawns with herbs',
              price: 625,
              image: '/images/categories/Appetizers Continental/Grilled Tiger Prawnsr.jpg',
              category: 'Appetizers Continental',
              isVeg: false,
              rating: 4.8,
              preparationTime: '20-25 mins'
            }
          ]
        },
        {
          name: 'Charcoal',
          img: '/images/categories/Charcoal.jpeg',
          items: [
            {
              _id: 'panache_char_001',
              name: 'Bharwan Mushroom',
              description: 'Stuffed mushrooms cooked in tandoor',
              price: 275,
              image: '/images/categories/Charcoal/Bharwan Mushroom.jpg',
              category: 'Charcoal',
              isVeg: true,
              rating: 4.4,
              preparationTime: '18-25 mins'
            },
            {
              _id: 'panache_char_002',
              name: 'Surkh Paneer Tikka',
              description: 'Red spiced paneer tikka from tandoor',
              price: 275,
              image: '/images/categories/Charcoal/Surkh Paneer Tikka.jpeg',
              category: 'Charcoal',
              isVeg: true,
              rating: 4.5,
              preparationTime: '15-20 mins'
            },
            {
              _id: 'panache_char_003',
              name: 'Badami Veg Seekh',
              description: 'Almond-flavored vegetarian seekh kebab',
              price: 275,
              image: '/images/categories/Charcoal/Badami Veg Seekh.jpg',
              category: 'Charcoal',
              isVeg: true,
              rating: 4.3,
              preparationTime: '20-25 mins'
            },
            {
              _id: 'panache_char_004',
              name: 'Dahi Ke Sholay',
              description: 'Yogurt-based kebabs from tandoor',
              price: 275,
              image: '/images/categories/Charcoal/Dahi-ke-Sholay.jpg',
              category: 'Charcoal',
              isVeg: true,
              rating: 4.4,
              preparationTime: '15-20 mins'
            },
            {
              _id: 'panache_char_005',
              name: 'Soya Chap Tandoori/Malai/Achari',
              description: 'Soya chap with choice of marinade',
              price: 275,
              image: '/images/categories/Charcoal/Soya Chap Tandoori.avif',
              category: 'Charcoal',
              isVeg: true,
              rating: 4.2,
              preparationTime: '18-25 mins',
              variants: ['Tandoori', 'Malai', 'Achari'],
              variantPrices: [275, 275, 275]
            },
            {
              _id: 'panache_char_006',
              name: 'Malai Broccoli',
              description: 'Creamy broccoli cooked in tandoor',
              price: 295,
              image: '/images/categories/Charcoal/Malai Broccoli.jpg',
              category: 'Charcoal',
              isVeg: true,
              rating: 4.5,
              preparationTime: '15-20 mins'
            },
            {
              _id: 'panache_char_007',
              name: 'Charcoal Dumplings (Veg/Chicken)',
              description: 'Dumplings cooked in charcoal tandoor',
              price: 275,
              image: '/images/categories/Charcoal/Charcoal Dumplings.jpeg',
              category: 'Charcoal',
              isVeg: false,
              rating: 4.6,
              preparationTime: '20-25 mins',
              variants: ['Veg', 'Chicken'],
              variantPrices: [275, 345]
            },
            {
              _id: 'panache_char_008',
              name: 'Mutton Galouti Kebab',
              description: 'Tender mutton galouti kebab',
              price: 545,
              image: '/images/categories/Charcoal/Mutton Galouti Kebab.jpg',
              category: 'Charcoal',
              isVeg: false,
              rating: 4.8,
              preparationTime: '25-30 mins'
            },
            {
              _id: 'panache_char_009',
              name: 'Gilafi Mutton Seekh Kebab',
              description: 'Mutton seekh kebab with herbs',
              price: 545,
              image: '/images/categories/Charcoal/Gilafi Mutton Seekh Kebab.jpeg',
              category: 'Charcoal',
              isVeg: false,
              rating: 4.7,
              preparationTime: '25-30 mins'
            },
            {
              _id: 'panache_char_010',
              name: 'Tandoori Chicken Half/Full',
              description: 'Classic tandoori chicken',
              price: 345,
              image: '/images/categories/Charcoal/andoori Chicken.jpg',
              category: 'Charcoal',
              isVeg: false,
              rating: 4.9,
              preparationTime: '30-35 mins',
              variants: ['Half', 'Full'],
              variantPrices: [345, 595]
            },
            {
              _id: 'panache_char_011',
              name: 'Bhatti Ka Murgh Half/Full',
              description: 'Traditional bhatti style chicken',
              price: 345,
              image: '/images/categories/Charcoal/Bhatti Ka Murgh .jpg',
              category: 'Charcoal',
              isVeg: false,
              rating: 4.8,
              preparationTime: '30-35 mins',
              variants: ['Half', 'Full'],
              variantPrices: [345, 595]
            },
            {
              _id: 'panache_char_012',
              name: 'Murgh Malai Tikka',
              description: 'Creamy chicken tikka from tandoor',
              price: 375,
              image: '/images/categories/Charcoal/Murgh Malai Tikkajpg.jpg',
              category: 'Charcoal',
              isVeg: false,
              rating: 4.7,
              preparationTime: '20-25 mins'
            },
            {
              _id: 'panache_char_013',
              name: 'Murgh Angara',
              description: 'Spicy angara chicken tikka',
              price: 375,
              image: '/images/categories/Charcoal/Murgh Angara.jpg',
              category: 'Charcoal',
              isVeg: false,
              rating: 4.6,
              preparationTime: '20-25 mins'
            },
            {
              _id: 'panache_char_014',
              name: 'Kandhari Jhinga',
              description: 'Kandhari style prawns from tandoor',
              price: 625,
              image: '/images/categories/Charcoal/Kandhari Jhingat.jpg',
              category: 'Charcoal',
              isVeg: false,
              rating: 4.9,
              preparationTime: '25-30 mins'
            },
            {
              _id: 'panache_char_015',
              name: 'Amritsari Fish Tikka',
              description: 'Amritsari style fish tikka',
              price: 525,
              image: '/images/categories/Charcoal/Amritsari Fish Tikka.jpg',
              category: 'Charcoal',
              isVeg: false,
              rating: 4.7,
              preparationTime: '20-25 mins'
            }
          ]
        },
        {
          name: 'Oriental',
          img: '/images/categories/Chinese.jpg',
          items: [
            {
              _id: 'panache_oriental_001',
              name: 'Classic Thai Spring Rolls',
              description: 'Fresh Thai spring rolls with dipping sauce',
              price: 245,
              image: '/images/categories/Oriental/Traditional-Thai-Spring-Rolls-2.jpg',
              category: 'Oriental',
              isVeg: true,
              rating: 4.4,
              preparationTime: '12-18 mins'
            },
            {
              _id: 'panache_oriental_002',
              name: 'Schezwan Chilly Paneer',
              description: 'Spicy schezwan style paneer',
              price: 275,
              image: '/images/categories/Oriental/Schezwan Chilly Paneer.jpeg',
              category: 'Oriental',
              isVeg: true,
              rating: 4.5,
              preparationTime: '15-20 mins'
            },
            {
              _id: 'panache_oriental_003',
              name: 'Chilly Garlic Mushrooms',
              description: 'Spicy garlic mushrooms',
              price: 275,
              image: '/images/categories/Oriental/Chilly Garlic Mushrooms.jpeg',
              category: 'Oriental',
              isVeg: true,
              rating: 4.3,
              preparationTime: '12-18 mins'
            },
            {
              _id: 'panache_oriental_004',
              name: 'Sesame Honey Chilly Potato',
              description: 'Crispy potatoes with honey chilly sauce',
              price: 245,
              image: '/images/categories/Oriental/Sesame Honey Chilly Potatojpeg.jpeg',
              category: 'Oriental',
              isVeg: true,
              rating: 4.4,
              preparationTime: '15-20 mins'
            },
            {
              _id: 'panache_oriental_005',
              name: 'Crispy Veg Salt N Pepper',
              description: 'Crispy vegetables with salt and pepper',
              price: 245,
              image: '/images/categories/Oriental/Crispy Veg Salt N Pepperjpeg.jpeg',
              category: 'Oriental',
              isVeg: true,
              rating: 4.2,
              preparationTime: '12-18 mins'
            },
            {
              _id: 'panache_oriental_006',
              name: 'Crispy Fried Peppery Corn',
              description: 'Crispy fried corn with pepper',
              price: 245,
              image: '/images/categories/Oriental/Crispy Fried Peppery Corn.jpeg',
              category: 'Oriental',
              isVeg: true,
              rating: 4.3,
              preparationTime: '10-15 mins'
            },
            {
              _id: 'panache_oriental_007',
              name: 'Classic Veg Dumplings (Steamed/Pan Tossed)',
              description: 'Fresh vegetable dumplings',
              price: 275,
              image: '/images/categories/Oriental/Classic Veg Dumplings.jpeg',
              category: 'Oriental',
              isVeg: true,
              rating: 4.6,
              preparationTime: '15-20 mins',
              variants: ['Steamed', 'Pan Tossed'],
              variantPrices: [275, 275]
            },
            {
              _id: 'panache_oriental_008',
              name: 'Crispy Golden Prawns',
              description: 'Crispy golden fried prawns',
              price: 595,
              image: '/images/categories/Oriental/Crispy Golden Prawns.jpeg',
              category: 'Oriental',
              isVeg: false,
              rating: 4.8,
              preparationTime: '18-25 mins'
            },
            {
              _id: 'panache_oriental_009',
              name: 'Wok Tossed Chilly Prawns',
              description: 'Wok tossed prawns with chilly sauce',
              price: 595,
              image: '/images/categories/Oriental/Wok Tossed Chilly Prawns.jpeg',
              category: 'Oriental',
              isVeg: false,
              rating: 4.7,
              preparationTime: '20-25 mins'
            },
            {
              _id: 'panache_oriental_010',
              name: 'Chilly Garlic Fish',
              description: 'Fish in chilly garlic sauce',
              price: 475,
              image: '/images/categories/Oriental/Chilly Garlic Fishjpeg.jpeg',
              category: 'Oriental',
              isVeg: false,
              rating: 4.6,
              preparationTime: '18-25 mins'
            },
            {
              _id: 'panache_oriental_011',
              name: 'Five Spiced Drums of Heaven',
              description: 'Five spiced chicken drumsticks',
              price: 345,
              image: '/images/categories/Oriental/Five Spiced Drums of Heaven.jpeg',
              category: 'Oriental',
              isVeg: false,
              rating: 4.5,
              preparationTime: '20-25 mins'
            },
            {
              _id: 'panache_oriental_012',
              name: 'Classic Chilly Chicken',
              description: 'Classic chilly chicken',
              price: 345,
              image: '/images/categories/Oriental/Classic Chilly Chicken.jpeg',
              category: 'Oriental',
              isVeg: false,
              rating: 4.7,
              preparationTime: '18-25 mins'
            },
            {
              _id: 'panache_oriental_013',
              name: 'Classic Chicken Dumplings (Steamed/Pan Tossed)',
              description: 'Chicken dumplings with choice of cooking',
              price: 345,
              image: '/images/categories/Oriental/Classic Chicken Dumplings.jpeg',
              category: 'Oriental',
              isVeg: false,
              rating: 4.6,
              preparationTime: '15-20 mins',
              variants: ['Steamed', 'Pan Tossed'],
              variantPrices: [345, 345]
            }
          ]
        },
        {
          name: 'Main Course',
          img: '/images/categories/Main Course.jpeg',
          items: [
            {
              _id: 'panache_main_001',
              name: 'Butter Chicken',
              description: 'Creamy tomato-based curry with tender chicken',
              price: 445,
              image: '/images/categories/Main Course/Butter Chicken.jpeg',
              category: 'Main Course',
              isVeg: false,
              rating: 4.8,
              preparationTime: '25-30 mins'
            },
            {
              _id: 'panache_main_002',
              name: 'Paneer Butter Masala',
              description: 'Creamy cottage cheese curry in rich tomato gravy',
              price: 345,
              image: '/images/categories/Main Course/Paneer Butter Masala.jpeg',
              category: 'Main Course',
              isVeg: true,
              rating: 4.7,
              preparationTime: '20-25 mins'
            },
            {
              _id: 'panache_main_003',
              name: 'Dal Makhani',
              description: 'Creamy black lentils slow-cooked to perfection',
              price: 245,
              image: '/images/categories/Main Course/Dal Makhanijpeg.jpeg',
              category: 'Main Course',
              isVeg: true,
              rating: 4.6,
              preparationTime: '30-35 mins'
            },
            {
              _id: 'panache_main_004',
              name: 'Chicken Tikka Masala',
              description: 'Tender chicken tikka in rich masala gravy',
              price: 445,
              image: '/images/categories/Main Course/Chicken Tikka Masala.jpeg',
              category: 'Main Course',
              isVeg: false,
              rating: 4.7,
              preparationTime: '25-30 mins'
            },
            {
              _id: 'panache_main_005',
              name: 'Veg Biryani',
              description: 'Aromatic rice with mixed vegetables and spices',
              price: 295,
              image: '/images/categories/Main Course/Veg Biryani .jpeg',
              category: 'Main Course',
              isVeg: true,
              rating: 4.5,
              preparationTime: '30-35 mins'
            },
            {
              _id: 'panache_main_006',
              name: 'Chicken Biryani',
              description: 'Aromatic rice with tender chicken and spices',
              price: 395,
              image: '/images/categories/Main Course/chicken-hyderabadi-biryani-01.jpg',
              category: 'Main Course',
              isVeg: false,
              rating: 4.8,
              preparationTime: '30-35 mins'
            }
          ]
        },
        {
          name: 'Desserts',
          img: '/images/categories/Desserts.jpeg',
          items: [
            {
              _id: 'panache_dessert_001',
              name: 'Tiramisu',
              description: 'Classic Italian dessert with coffee and mascarpone',
              price: 325,
              image: '/images/categories/Desserts/Tiramisu.webp',
              category: 'Desserts',
              isVeg: true,
              rating: 4.7,
              preparationTime: '5-10 mins'
            },
            {
              _id: 'panache_dessert_002',
              name: 'Chocolate Brownie',
              description: 'Warm chocolate brownie with vanilla ice cream',
              price: 195,
              image: '/images/categories/Desserts/Chocolate Brownie.jpeg',
              category: 'Desserts',
              isVeg: true,
              rating: 4.6,
              preparationTime: '5-8 mins'
            },
            {
              _id: 'panache_dessert_003',
              name: 'Gulab Jamun',
              description: 'Sweet milk dumplings in sugar syrup',
              price: 145,
              image: '/images/categories/Desserts/Gulab Jamun.jpg',
              category: 'Desserts',
              isVeg: true,
              rating: 4.5,
              preparationTime: '3-5 mins'
            },
            {
              _id: 'panache_dessert_004',
              name: 'Rasmalai',
              description: 'Soft cottage cheese patties in sweetened milk',
              price: 165,
              image: '/images/categories/Desserts/Rasmalai.jpeg',
              category: 'Desserts',
              isVeg: true,
              rating: 4.6,
              preparationTime: '5-8 mins'
            }
          ]
        },
        {
          name: 'Beverages',
          img: '/images/categories/Beverages.jpeg',
          items: [
            {
              _id: 'panache_bev_001',
              name: 'Masala Chai',
              description: 'Traditional Indian spiced tea',
              price: 95,
              image: '/images/categories/Beverages/Masala Chai-.jpg',
              category: 'Beverages',
              isVeg: true,
              rating: 4.4,
              preparationTime: '3-5 mins'
            },
            {
              _id: 'panache_bev_002',
              name: 'Coffee',
              description: 'Filter coffee with milk',
              price: 95,
              image: '/images/categories/Beverages/Coffee.webp',
              category: 'Beverages',
              isVeg: true,
              rating: 4.3,
              preparationTime: '3-5 mins'
            },
            {
              _id: 'panache_bev_003',
              name: 'Lassi (Sweet/Salty)',
              description: 'Refreshing yogurt-based drink',
              price: 125,
              image: '/images/categories/Beverages/Lassi .jpg',
              category: 'Beverages',
              isVeg: true,
              rating: 4.5,
              preparationTime: '5-8 mins',
              variants: ['Sweet', 'Salty'],
              variantPrices: [125, 125]
            },
            {
              _id: 'panache_bev_004',
              name: 'Fresh Lime Soda',
              description: 'Refreshing lime soda with mint',
              price: 95,
              image: '/images/categories/Beverages/Fresh Lime Soda.jpeg',
              category: 'Beverages',
              isVeg: true,
              rating: 4.2,
              preparationTime: '3-5 mins'
            }
          ]
        }
      ]
    },
    '2': { // Cafe After Hours - Complete Menu
      categories: [
        {
          name: 'Coffee & Tea',
          img: '/images/categories/Beverages.jpeg',
          items: [
            {
              _id: 'cafe_coffee_001',
              name: 'Espresso',
              description: 'Strong Italian coffee shot',
              price: 120,
              image: '/images/categories/cafe after hours/Espresso.webp',
              category: 'Coffee & Tea',
              isVeg: true,
              rating: 4.5,
              preparationTime: '2-3 mins'
            },
            {
              _id: 'cafe_coffee_002',
              name: 'Cappuccino',
              description: 'Espresso with steamed milk and foam',
              price: 180,
              image: '/images/categories/cafe after hours/Cappuccino.webp',
              category: 'Coffee & Tea',
              isVeg: true,
              rating: 4.6,
              preparationTime: '3-5 mins'
            },
            {
              _id: 'cafe_coffee_003',
              name: 'Latte',
              description: 'Espresso with steamed milk',
              price: 160,
              image: '/images/categories/cafe after hours/Latte.jpeg',
              category: 'Coffee & Tea',
              isVeg: true,
              rating: 4.4,
              preparationTime: '3-5 mins'
            },
            {
              _id: 'cafe_coffee_004',
              name: 'Americano',
              description: 'Espresso with hot water',
              price: 140,
              image: '/images/categories/cafe after hours/Americano.jpeg',
              category: 'Coffee & Tea',
              isVeg: true,
              rating: 4.3,
              preparationTime: '2-3 mins'
            },
            {
              _id: 'cafe_coffee_005',
              name: 'Mocha',
              description: 'Espresso with chocolate and steamed milk',
              price: 200,
              image: '/images/categories/cafe after hours/Mocha.png',
              category: 'Coffee & Tea',
              isVeg: true,
              rating: 4.7,
              preparationTime: '4-6 mins'
            },
            {
              _id: 'cafe_coffee_006',
              name: 'Green Tea',
              description: 'Refreshing green tea',
              price: 100,
              image: '/images/categories/cafe after hours/Green Tea.jpg',
              category: 'Coffee & Tea',
              isVeg: true,
              rating: 4.2,
              preparationTime: '3-4 mins'
            },
            {
              _id: 'cafe_coffee_007',
              name: 'Masala Chai',
              description: 'Traditional Indian spiced tea',
              price: 95,
              image: '/images/categories/cafe after hours/Masala Chai.jpg',
              category: 'Coffee & Tea',
              isVeg: true,
              rating: 4.4,
              preparationTime: '3-5 mins'
            }
          ]
        },
        {
          name: 'Sandwiches',
          img: '/images/categories/sandwhich.jpg',
          items: [
            {
              _id: 'cafe_sand_001',
              name: 'Club Sandwich',
              description: 'Triple-decker sandwich with fresh vegetables',
              price: 245,
              image: '/images/categories/cafe after hours/Club Sandwich.jpg',
              category: 'Sandwiches',
              isVeg: false,
              rating: 4.3,
              preparationTime: '12-18 mins'
            },
            {
              _id: 'cafe_sand_002',
              name: 'Veg Club Sandwich',
              description: 'Triple-decker sandwich with fresh vegetables',
              price: 225,
              image: '/images/categories/cafe after hours/Veggie-Club-Sandwich.jpg',
              category: 'Sandwiches',
              isVeg: true,
              rating: 4.2,
              preparationTime: '10-15 mins'
            },
            {
              _id: 'cafe_sand_003',
              name: 'Grilled Cheese Sandwich',
              description: 'Classic grilled cheese with tomato soup',
              price: 185,
              image: '/images/categories/cafe after hours/Grilled Cheese Sandwich .jpg',
              category: 'Sandwiches',
              isVeg: true,
              rating: 4.4,
              preparationTime: '8-12 mins'
            },
            {
              _id: 'cafe_sand_004',
              name: 'Chicken Mayo Sandwich',
              description: 'Chicken with mayonnaise and fresh vegetables',
              price: 205,
              image: '/images/categories/cafe after hours/Chicken Mayo Sandwich.jpg',
              category: 'Sandwiches',
              isVeg: false,
              rating: 4.3,
              preparationTime: '10-15 mins'
            },
            {
              _id: 'cafe_sand_005',
              name: 'Paneer Tikka Sandwich',
              description: 'Spicy paneer tikka with mint chutney',
              price: 215,
              image: '/images/categories/cafe after hours/Paneer Tikka Sandwich.jpeg',
              category: 'Sandwiches',
              isVeg: true,
              rating: 4.5,
              preparationTime: '12-18 mins'
            }
          ]
        },
        {
          name: 'Burgers',
          img: '/images/categories/burger-2.jpg',
          items: [
            {
              _id: 'cafe_burger_001',
              name: 'Classic Chicken Burger',
              description: 'Grilled chicken patty with fresh vegetables',
              price: 285,
              image: '/images/categories/cafe after hours/Classic Chicken Burge.jpeg',
              category: 'Burgers',
              isVeg: false,
              rating: 4.4,
              preparationTime: '15-20 mins'
            },
            {
              _id: 'cafe_burger_002',
              name: 'Veg Burger',
              description: 'Vegetable patty with fresh vegetables',
              price: 245,
              image: '/images/categories/cafe after hours/Veg Burge.jpeg',
              category: 'Burgers',
              isVeg: true,
              rating: 4.2,
              preparationTime: '12-18 mins'
            },
            {
              _id: 'cafe_burger_003',
              name: 'Cheese Burger',
              description: 'Beef patty with cheese and vegetables',
              price: 325,
              image: '/images/categories/cafe after hours/Cheese Burger.jpeg',
              category: 'Burgers',
              isVeg: false,
              rating: 4.6,
              preparationTime: '15-20 mins'
            },
            {
              _id: 'cafe_burger_004',
              name: 'Paneer Burger',
              description: 'Paneer patty with mint chutney',
              price: 265,
              image: '/images/categories/cafe after hours/Paneer Burger.jpeg',
              category: 'Burgers',
              isVeg: true,
              rating: 4.3,
              preparationTime: '12-18 mins'
            }
          ]
        },
        {
          name: 'Pizza',
          img: '/images/categories/pizza-2.jpeg',
          items: [
            {
              _id: 'cafe_pizza_001',
              name: 'Margherita Pizza',
              description: 'Classic pizza with tomato sauce and mozzarella',
              price: 345,
              image: '/images/categories/cafe after hours/Margherita Pizza.jpeg',
              category: 'Pizza',
              isVeg: true,
              rating: 4.5,
              preparationTime: '15-20 mins'
            },
            {
              _id: 'cafe_pizza_002',
              name: 'Pepperoni Pizza',
              description: 'Pizza topped with pepperoni and cheese',
              price: 425,
              image: '/images/categories/cafe after hours/Pepperoni Pizza.jpeg',
              category: 'Pizza',
              isVeg: false,
              rating: 4.7,
              preparationTime: '18-25 mins'
            },
            {
              _id: 'cafe_pizza_003',
              name: 'Veg Supreme Pizza',
              description: 'Pizza with assorted vegetables',
              price: 385,
              image: '/images/categories/cafe after hours/Veg Supreme Pizza.jpeg',
              category: 'Pizza',
              isVeg: true,
              rating: 4.4,
              preparationTime: '15-20 mins'
            },
            {
              _id: 'cafe_pizza_004',
              name: 'Chicken Tikka Pizza',
              description: 'Pizza with spicy chicken tikka',
              price: 445,
              image: '/images/categories/cafe after hours/Chicken Tikka Pizza .jpeg',
              category: 'Pizza',
              isVeg: false,
              rating: 4.6,
              preparationTime: '18-25 mins'
            }
          ]
        },
        {
          name: 'Pasta',
          img: '/images/categories/pasta.jpg',
          items: [
            {
              _id: 'cafe_pasta_001',
              name: 'Spaghetti Carbonara',
              description: 'Classic Italian pasta with eggs and cheese',
              price: 285,
              image: '/images/categories/cafe after hours/Spaghetti Carbonara.jpeg',
              category: 'Pasta',
              isVeg: false,
              rating: 4.5,
              preparationTime: '15-20 mins'
            },
            {
              _id: 'cafe_pasta_002',
              name: 'Penne Arrabbiata',
              description: 'Spicy tomato sauce with penne pasta',
              price: 265,
              image: '/images/categories/cafe after hours/Penne Arrabbiata.jpeg',
              category: 'Pasta',
              isVeg: true,
              rating: 4.3,
              preparationTime: '12-18 mins'
            },
            {
              _id: 'cafe_pasta_003',
              name: 'Fettuccine Alfredo',
              description: 'Creamy Alfredo sauce with fettuccine',
              price: 295,
              image: '/images/categories/cafe after hours/Fettuccine Alfredojpeg.jpeg',
              category: 'Pasta',
              isVeg: true,
              rating: 4.4,
              preparationTime: '15-20 mins'
            },
            {
              _id: 'cafe_pasta_004',
              name: 'Chicken Pasta',
              description: 'Pasta with grilled chicken and vegetables',
              price: 325,
              image: '/images/categories/cafe after hours/Chicken Pasta.jpeg',
              category: 'Pasta',
              isVeg: false,
              rating: 4.6,
              preparationTime: '18-25 mins'
            }
          ]
        },
        {
          name: 'Desserts',
          img: '/images/categories/Desserts.jpeg',
          items: [
            {
              _id: 'cafe_dessert_001',
              name: 'Chocolate Brownie',
              description: 'Warm chocolate brownie with vanilla ice cream',
              price: 195,
              image: '/images/categories/cafe after hours/Chocolate Brownie.jpeg',
              category: 'Desserts',
              isVeg: true,
              rating: 4.7,
              preparationTime: '5-8 mins'
            },
            {
              _id: 'cafe_dessert_002',
              name: 'Tiramisu',
              description: 'Classic Italian dessert with coffee',
              price: 325,
              image: '/images/categories/cafe after hours/Tiramisu.jpeg',
              category: 'Desserts',
              isVeg: true,
              rating: 4.8,
              preparationTime: '5-10 mins'
            },
            {
              _id: 'cafe_dessert_003',
              name: 'Cheesecake',
              description: 'New York style cheesecake',
              price: 285,
              image: '/images/categories/cafe after hours/Cheesecake.jpeg',
              category: 'Desserts',
              isVeg: true,
              rating: 4.6,
              preparationTime: '5-8 mins'
            },
            {
              _id: 'cafe_dessert_004',
              name: 'Ice Cream Sundae',
              description: 'Vanilla ice cream with chocolate sauce',
              price: 165,
              image: '/images/categories/cafe after hours/Ice Cream Sundae.jpeg',
              category: 'Desserts',
              isVeg: true,
              rating: 4.4,
              preparationTime: '3-5 mins'
            }
          ]
        },
        {
          name: 'Shakes & Smoothies',
          img: '/images/categories/shakes.jpg',
          items: [
            {
              _id: 'cafe_shake_001',
              name: 'Chocolate Shake',
              description: 'Rich chocolate milkshake',
              price: 185,
              image: '/images/categories/cafe after hours/Chocolate Shake.jpeg',
              category: 'Shakes & Smoothies',
              isVeg: true,
              rating: 4.5,
              preparationTime: '5-8 mins'
            },
            {
              _id: 'cafe_shake_002',
              name: 'Strawberry Shake',
              description: 'Fresh strawberry milkshake',
              price: 175,
              image: '/images/categories/cafe after hours/Strawberry Shake.jpeg',
              category: 'Shakes & Smoothies',
              isVeg: true,
              rating: 4.4,
              preparationTime: '5-8 mins'
            },
            {
              _id: 'cafe_shake_003',
              name: 'Oreo Shake',
              description: 'Creamy Oreo cookie milkshake',
              price: 195,
              image: '/images/categories/cafe after hours/Oreo Shake.jpeg',
              category: 'Shakes & Smoothies',
              isVeg: true,
              rating: 4.6,
              preparationTime: '5-8 mins'
            },
            {
              _id: 'cafe_shake_004',
              name: 'Mango Smoothie',
              description: 'Fresh mango smoothie',
              price: 165,
              image: '/images/categories/cafe after hours/Mango Smoothie.jpeg',
              category: 'Shakes & Smoothies',
              isVeg: true,
              rating: 4.3,
              preparationTime: '5-8 mins'
            }
          ]
        }
      ]
    },
    '3': {
      categories: []
    }
  };

  const menu = restaurantMenus[restaurantId as keyof typeof restaurantMenus];
  if (menu) {
    let categories = menu.categories;
    if ((restaurantId === '3' || restaurantId === '2' || restaurantId === '1') && (!categories || categories.length === 0)) {
      // Build categories from symposium admin menu, grouped by category
      const raw = restaurantId === '3' ? getSymposiumAdminMenu() : restaurantId === '2' ? getCafeAdminMenu() : getPanacheAdminMenu();
      const grouped: { [cat: string]: any[] } = {};
      raw.forEach((item) => {
        if (!grouped[item.category]) grouped[item.category] = [];
        grouped[item.category].push({
          _id: item._id,
          name: item.name,
          description: item.description || '',
          price: item.price,
          image: item.image,
          category: item.category,
          isVeg: item.isVeg,
          rating: item.rating,
          preparationTime: item.preparationTime,
          variants: item.variants,
          variantPrices: item.variantPrices
        });
      });
      categories = Object.keys(grouped).map((catName) => ({
        name: catName,
        img: getCategoryImage(catName),
        items: grouped[catName]
      }));
    }
    return categories.map(cat => ({
      ...cat,
      restaurantId,
      restaurantName: restaurantId === '1' ? 'Panache' : restaurantId === '2' ? 'Cafe After Hours' : 'Symposium Restaurant'
    }));
  }

  return [];
};

const getThemeColors = (theme: string) => {
  switch (theme) {
    case 'symposium':
      return {
        primary: 'from-red-600 to-orange-500',
        secondary: 'from-orange-500 to-yellow-500',
        accent: 'text-yellow-400',
        border: 'border-yellow-500/30',
        hover: 'hover:bg-yellow-900/20',
        button: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
      };
    case 'panache':
      return {
        primary: 'from-purple-600 to-pink-500',
        secondary: 'from-pink-500 to-red-500',
        accent: 'text-yellow-400',
        border: 'border-yellow-500/30',
        hover: 'hover:bg-yellow-900/20',
        button: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
      };
    case 'cafe':
      return {
        primary: 'from-blue-600 to-cyan-500',
        secondary: 'from-cyan-500 to-teal-500',
        accent: 'text-yellow-400',
        border: 'border-yellow-500/30',
        hover: 'hover:bg-yellow-900/20',
        button: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
      };
    default:
      return {
        primary: 'from-gray-600 to-gray-500',
        secondary: 'from-gray-500 to-gray-400',
        accent: 'text-yellow-400',
        border: 'border-yellow-500/30',
        hover: 'hover:bg-yellow-900/20',
        button: 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black'
      };
  }
};

export default function RestaurantMenuGrid({ restaurantId, restaurantName, theme }: RestaurantMenuGridProps) {
  const colors = getThemeColors(theme);
  const [cartItems, setCartItems] = useState<{[key: string]: number}>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Search and Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'veg' | 'non-veg'>('all');
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [sortBy, setSortBy] = useState<'name' | 'price-low' | 'price-high' | 'rating'>('name');

  // Load menu data (synced with admin changes)
  useEffect(() => {
    const loadMenuData = async () => {
      try {
        setIsLoading(true);
        // Try to fetch synced menu data first
        const response = await fetch(`/api/restaurants/${restaurantId}/menu-sync`);
        
        if (response.ok) {
          const syncedData = await response.json();
          console.log('✅ Loaded synced menu data:', syncedData);
          setCategories(syncedData.categories);
        } else {
          // Fallback to original static data if sync fails
          console.log('⚠️ Sync failed, using original static data');
          const staticCategories = getRestaurantMenuDataOld(restaurantId);
          setCategories(staticCategories);
        }
      } catch (error) {
        console.error('❌ Menu loading error:', error);
        // Fallback to original static data on error
        const staticCategories = getRestaurantMenuDataOld(restaurantId);
        setCategories(staticCategories);
      } finally {
        setIsLoading(false);
      }
    };

    loadMenuData();
  }, [restaurantId]);

  // Filter and search logic
  const filteredCategories = useMemo(() => {
    if (!categories.length) return [];

    return categories.map(category => {
      let filteredItems = category.items.filter(item => {
        // Search filter
        const matchesSearch = searchTerm === '' || 
          item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          item.description.toLowerCase().includes(searchTerm.toLowerCase());

        // Type filter (veg/non-veg)
        const matchesType = filterType === 'all' || 
          (filterType === 'veg' && item.isVeg) ||
          (filterType === 'non-veg' && !item.isVeg);

        // Price range filter
        const matchesPrice = item.price >= priceRange[0] && item.price <= priceRange[1];

        return matchesSearch && matchesType && matchesPrice;
      });

      // Sort items
      filteredItems.sort((a, b) => {
        switch (sortBy) {
          case 'name':
            return a.name.localeCompare(b.name);
          case 'price-low':
            return a.price - b.price;
          case 'price-high':
            return b.price - a.price;
          case 'rating':
            return (b.rating || 0) - (a.rating || 0);
          default:
            return 0;
        }
      });

      return {
        ...category,
        items: filteredItems
      };
    }).filter(category => category.items.length > 0); // Only show categories with items
  }, [categories, searchTerm, filterType, priceRange, sortBy]);

  // Get all items for global search
  const allItems = useMemo(() => {
    return categories.flatMap(category => 
      category.items.map(item => ({ ...item, category: category.name }))
    );
  }, [categories]);

  // Get price range from all items
  const maxPrice = useMemo(() => {
    if (!allItems.length) return 1000;
    return Math.max(...allItems.map(item => item.price));
  }, [allItems]);

  // Reset price range when restaurant changes
  useEffect(() => {
    if (maxPrice > 0) {
      setPriceRange([0, maxPrice]);
    }
  }, [maxPrice, restaurantId]);

  const addToCart = async (item: MenuItem) => {
    try {
      const currentQuantity = cartItems[item._id] || 0;
      
      setCartItems(prev => ({
        ...prev,
        [item._id]: currentQuantity + 1
      }));

      // Add to cart service
      await unifiedCartService.addToCart(
        item._id,
        item.name,
        item.description,
        item.price,
        1,
        item.image,
        restaurantId,
        restaurantName,
        [],
        item.isVeg,
        item.category
      );

      toast.success(`${item.name} added to cart!`);
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast.error('Failed to add item to cart');
    }
  };

  const removeFromCart = (itemId: string) => {
    setCartItems(prev => {
      const newCart = { ...prev };
      if (newCart[itemId] > 1) {
        newCart[itemId] -= 1;
      } else {
        delete newCart[itemId];
      }
      return newCart;
    });
  };

  const getCartTotal = () => {
    let total = 0;
    Object.entries(cartItems).forEach(([itemId, quantity]) => {
      categories.forEach(category => {
        category.items.forEach(item => {
          if (item._id === itemId) {
            total += item.price * quantity;
          }
        });
      });
    });
    return total;
  };

  const getCartItemCount = () => {
    return Object.values(cartItems).reduce((total, quantity) => total + quantity, 0);
  };

  const selectedCategoryData = selectedCategory 
    ? filteredCategories.find(cat => cat.name === selectedCategory)
    : null;

  // Show loading state while menu is being fetched
  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading menu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Restaurant Header */}
      <div className="bg-gradient-to-r from-gray-900 to-black py-8">
        <div className="max-w-7xl mx-auto px-4">
          {/* Home Button */}
          <div className="text-center mb-6">
            <button
              onClick={() => window.location.href = '/'}
              className="inline-flex items-center gap-2 px-6 py-3 bg-yellow-500 text-black rounded-lg hover:bg-yellow-400 transition-colors font-semibold shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to Home
            </button>
          </div>
          
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-full bg-gradient-to-r ${colors.primary} flex items-center justify-center`}>
                <span className="text-white text-lg font-bold">
                  {restaurantName.charAt(0)}
                </span>
              </div>
              <h1 className={`${cormorant.className} text-3xl sm:text-4xl font-semibold tracking-wide text-white`}>
                {restaurantName}
              </h1>
            </div>
            <div className={`w-32 h-1 bg-gradient-to-r ${colors.primary} mx-auto rounded-full mb-4`}></div>
            <p className="text-gray-300 text-lg">
              {selectedCategory ? `Explore ${selectedCategory}` : 'Explore our delicious menu categories'}
            </p>
          </div>

          {/* Back to Categories Button */}
          {selectedCategory && (
            <div className="text-center mb-8">
              <button
                onClick={() => setSelectedCategory(null)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Categories
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modern Search and Filter Section */}
      <div className="bg-gradient-to-r from-gray-900/80 to-black/80 backdrop-blur-xl border-y border-gray-700/50 shadow-2xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          {/* Search Bar */}
          <div className="mb-8">
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-yellow-400 w-6 h-6" />
              <input
                type="text"
                placeholder="Search for your favorite dishes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-14 pr-6 py-4 bg-gray-800/80 border-2 border-gray-500/50 rounded-2xl text-white placeholder-gray-300 focus:outline-none focus:ring-4 focus:ring-yellow-500/30 focus:border-yellow-500/70 text-lg backdrop-blur-sm transition-all duration-300 font-semibold shadow-lg"
                style={{ 
                  textShadow: '0 0 8px rgba(0,0,0,0.8)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.3)'
                }}
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm('')}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-300 hover:text-yellow-400 transition-colors bg-gray-700/50 p-1 rounded-full hover:bg-gray-600/50"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap items-center justify-center gap-6 mb-6">
            {/* Type Filter */}
            <div className="flex items-center gap-3">
              <span className="text-white font-medium text-sm">Type:</span>
              <div className="flex bg-gray-800/50 rounded-xl p-1 backdrop-blur-sm">
                {[
                  { value: 'all', label: 'All', icon: '🍽️' },
                  { value: 'veg', label: 'Vegetarian', icon: '🌱' },
                  { value: 'non-veg', label: 'Non-Veg', icon: '🍖' }
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setFilterType(option.value as 'all' | 'veg' | 'non-veg')}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                      filterType === option.value
                        ? 'bg-yellow-500 text-black shadow-lg'
                        : 'text-gray-300 hover:text-white hover:bg-gray-700/50'
                    }`}
                  >
                    <span className="mr-2">{option.icon}</span>
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort Filter */}
            <div className="flex items-center gap-3">
              <span className="text-white font-medium text-sm">Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'name' | 'price-low' | 'price-high' | 'rating')}
                className="px-4 py-2 bg-gray-800/50 border border-gray-600/30 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 focus:border-yellow-500/50 backdrop-blur-sm transition-all duration-200"
              >
                <option value="name">Name (A-Z)</option>
                <option value="price-low">Price (Low to High)</option>
                <option value="price-high">Price (High to Low)</option>
                <option value="rating">Rating (High to Low)</option>
              </select>
            </div>

            {/* Price Range */}
            <div className="flex items-center gap-3">
              <span className="text-white font-medium text-sm">Price:</span>
              <div className="flex items-center gap-2 bg-gray-800/50 px-4 py-2 rounded-xl backdrop-blur-sm">
                <span className="text-yellow-400 font-semibold">₹{priceRange[0]}</span>
                <span className="text-gray-400">-</span>
                <span className="text-yellow-400 font-semibold">₹{priceRange[1]}</span>
              </div>
            </div>
          </div>

          {/* Price Range Sliders */}
          <div className="max-w-md mx-auto mb-6">
            <div className="relative">
              <div className="h-2 bg-gray-700/50 rounded-full">
                <div 
                  className="h-2 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-full transition-all duration-200"
                  style={{ 
                    left: `${(priceRange[0] / maxPrice) * 100}%`,
                    right: `${100 - (priceRange[1] / maxPrice) * 100}%`
                  }}
                ></div>
              </div>
              <input
                type="range"
                min="0"
                max={maxPrice}
                value={priceRange[0]}
                onChange={(e) => setPriceRange([parseInt(e.target.value), priceRange[1]])}
                className="absolute top-0 w-full h-2 opacity-0 cursor-pointer"
              />
              <input
                type="range"
                min="0"
                max={maxPrice}
                value={priceRange[1]}
                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value)])}
                className="absolute top-0 w-full h-2 opacity-0 cursor-pointer"
              />
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-2">
              <span>₹0</span>
              <span>₹{maxPrice}</span>
            </div>
          </div>

          {/* Clear Filters Button */}
          <div className="text-center">
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterType('all');
                setPriceRange([0, maxPrice]);
                setSortBy('name');
              }}
              className="px-6 py-2 bg-gray-700/50 hover:bg-gray-600/50 text-white rounded-xl hover:scale-105 transition-all duration-200 backdrop-blur-sm border border-gray-600/30"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {selectedCategory ? (
          // Show dishes for selected category
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className={`${cormorant.className} text-3xl font-semibold text-white mb-2`}>
                {selectedCategory}
              </h2>
              <p className="text-gray-400">
                {selectedCategoryData?.items.length} items available
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {selectedCategoryData?.items.map((item) => (
                <div key={item._id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-yellow-500/30 transition-colors">
                  <div className="relative h-48">
                    <Image src={item.image || '/images/placeholder-food.jpg'} alt={item.name} fill className="object-cover" unoptimized />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                    <div className="absolute top-2 right-2">
                      {item.isVeg && (
                        <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">🌱 Veg</span>
                      )}
                    </div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <h3 className="text-white font-semibold text-lg mb-1">{item.name}</h3>
                      <p className="text-gray-300 text-sm">{item.description}</p>
                    </div>
                  </div>

                  <div className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          ⭐ {item.rating}
                        </span>
                        <span className="flex items-center gap-1">
                          ⏱️ {item.preparationTime}
                        </span>
                      </div>
                      <div className="text-yellow-400 font-bold text-xl">
                        ₹{item.price}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {cartItems[item._id] ? (
                        <>
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center hover:bg-gray-600 transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="text-white font-semibold min-w-[20px] text-center">
                            {cartItems[item._id]}
                          </span>
                          <button
                            onClick={() => addToCart(item)}
                            className="w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center hover:bg-yellow-400 transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => addToCart(item)}
                          className={`w-full py-2 rounded-lg ${colors.button} font-semibold hover:scale-105 transition-all duration-200`}
                        >
                          Add to Cart
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : searchTerm ? (
          // Show search results as individual dishes
          <div className="space-y-6">
            <div className="text-center mb-8">
              <h2 className={`${cormorant.className} text-3xl font-semibold text-white mb-2`}>
                Search Results
              </h2>
              <p className="text-gray-400">
                Found {allItems.filter(item => 
                  item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.category.toLowerCase().includes(searchTerm.toLowerCase())
                ).length} dishes matching "{searchTerm}"
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {allItems
                .filter(item => 
                  item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  item.category.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .filter(item => {
                  // Apply type filter
                  if (filterType === 'veg' && !item.isVeg) return false;
                  if (filterType === 'non-veg' && item.isVeg) return false;
                  
                  // Apply price filter
                  if (item.price < priceRange[0] || item.price > priceRange[1]) return false;
                  
                  return true;
                })
                .sort((a, b) => {
                  // Apply sorting
                  switch (sortBy) {
                    case 'name':
                      return a.name.localeCompare(b.name);
                    case 'price-low':
                      return a.price - b.price;
                    case 'price-high':
                      return b.price - a.price;
                    case 'rating':
                      return (b.rating || 0) - (a.rating || 0);
                    default:
                      return 0;
                  }
                })
                .map((item) => (
                  <div key={item._id} className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-yellow-500/30 transition-all duration-300 hover:scale-105">
                    <div className="relative h-48">
                      <Image src={item.image || '/images/placeholder-food.jpg'} alt={item.name} fill className="object-cover" unoptimized />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
                      <div className="absolute top-2 right-2">
                        {item.isVeg && (
                          <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">🌱 Veg</span>
                        )}
                      </div>
                      <div className="absolute top-2 left-2">
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          {item.category}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-white font-semibold text-lg mb-1">{item.name}</h3>
                        <p className="text-gray-300 text-sm">{item.description}</p>
                      </div>
                    </div>

                    <div className="p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-4 text-sm text-gray-400">
                          <span className="flex items-center gap-1">
                            ⭐ {item.rating || 4.0}
                          </span>
                          <span className="flex items-center gap-1">
                            ⏱️ {item.preparationTime || '15-20 mins'}
                          </span>
                        </div>
                        <div className="text-yellow-400 font-bold text-xl">
                          ₹{item.price}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {cartItems[item._id] ? (
                          <>
                            <button
                              onClick={() => removeFromCart(item._id)}
                              className="w-8 h-8 rounded-full bg-gray-700 text-white flex items-center justify-center hover:bg-gray-600 transition-colors"
                            >
                              <Minus className="w-4 h-4" />
                            </button>
                            <span className="text-white font-semibold min-w-[20px] text-center">
                              {cartItems[item._id]}
                            </span>
                            <button
                              onClick={() => addToCart(item)}
                              className="w-8 h-8 rounded-full bg-yellow-500 text-black flex items-center justify-center hover:bg-yellow-400 transition-colors"
                            >
                              <Plus className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => addToCart(item)}
                            className={`w-full py-2 rounded-lg ${colors.button} font-semibold hover:scale-105 transition-all duration-200`}
                          >
                            Add to Cart
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        ) : (
          // Show categories grid when no search
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {filteredCategories.map((category, index) => (
              <button
                key={category.name}
                onClick={() => setSelectedCategory(category.name)}
                className={`group relative overflow-hidden rounded-xl transition-all duration-300 ${colors.hover} border ${colors.border} bg-black hover:scale-105 hover:shadow-2xl`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {/* Category Image */}
                <div className="relative w-full h-32 sm:h-36 overflow-hidden">
                  <Image src={category.img || getCategoryImage(category.name)} alt={category.name} fill className="object-cover group-hover:scale-110 transition-transform duration-300" priority unoptimized />
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
                  
                  {/* Item Count Badge */}
                  <div className="absolute top-2 right-2">
                    <span className="bg-black/70 text-white text-xs px-2 py-1 rounded-full backdrop-blur-sm border border-white/20">
                      {category.items.length} items
                    </span>
                  </div>
                </div>

                {/* Category Name */}
                <div className="p-3 sm:p-4 text-center">
                  <span className={`${cormorant.className} text-sm sm:text-base font-semibold text-white group-hover:${colors.accent} transition-colors duration-300`}>
                    {category.name}
                  </span>
                </div>

                {/* Hover Effect */}
                <div className={`absolute inset-0 bg-gradient-to-r ${colors.primary} opacity-0 group-hover:opacity-10 transition-opacity duration-300`}></div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Cart Summary */}
      {getCartItemCount() > 0 && (
        <div className="fixed bottom-4 right-4 bg-gray-900 rounded-xl p-4 border border-gray-800 shadow-2xl">
          <div className="flex items-center gap-3 mb-3">
            <ShoppingCart className="w-6 h-6 text-yellow-400" />
            <span className="text-white font-semibold">Cart ({getCartItemCount()} items)</span>
          </div>
          <div className="text-yellow-400 font-bold text-lg mb-3">
            Total: ₹{getCartTotal()}
          </div>
          <button
            onClick={() => window.location.href = '/cart'}
            className={`w-full py-2 rounded-lg ${colors.button} font-semibold hover:scale-105 transition-all duration-200`}
          >
            View Cart
          </button>
        </div>
      )}
    </div>
  );
}
