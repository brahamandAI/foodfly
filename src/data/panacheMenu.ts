export interface MenuItem {
  name: string;
  price: number | string;
  description?: string;
  isVeg: boolean;
  image?: string;
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export const panacheMenu: MenuCategory[] = [
  {
    name: "Bar Munchies",
    items: [
      { name: "French Fries (Plain/Peri Peri/Cheesey)", price: "145/195", isVeg: true },
      { name: "Garlic Bread (Plain/Cheese)", price: "145/195", isVeg: true },
      { name: "Potato Wedges (Plain/Peri Peri)", price: 145, isVeg: true },
      { name: "Chilly Cheese Toast", price: 145, isVeg: true },
      { name: "Peanut Masala", price: 145, isVeg: true },
      { name: "Masala Papad", price: 145, isVeg: true },
      { name: "American Corn Chat", price: 145, isVeg: true },
      { name: "Hummus with Falafel", price: 195, isVeg: true },
      { name: "Hummus with Pita", price: 195, isVeg: true },
      { name: "Loaded Nachos (Veg/Chicken)", price: "195/245", isVeg: true },
      { name: "Bruschettas (Tomato/Chicken)", price: "195/245", isVeg: true },
      { name: "Cheesy Cigar Rolls (Veg/Chicken)", price: "195/245", isVeg: true }
    ]
  },
  {
    name: "Soups",
    items: [
      { name: "Almond Broccoli Soup", price: "145/195", isVeg: true },
      { name: "Cream of Tomato (Veg/Chicken)", price: "145/195", isVeg: true },
      { name: "Sweet Corn Soup (Veg/Chicken)", price: "145/195", isVeg: true },
      { name: "Manchow Soup (Veg/Chicken)", price: "145/195", isVeg: true }
    ]
  },
  {
    name: "Salad Station",
    items: [
      { name: "Greek Salad (Veg/Chicken)", price: "245/275", isVeg: true },
      { name: "Quinoa Apple Vinaigrette Salad", price: 345, isVeg: true },
      { name: "Classic Caesar (Veg/Chicken)", price: "245/275", isVeg: true },
      { name: "Fresh Garden Green Salad", price: 195, isVeg: true }
    ]
  },
  {
    name: "Platters & Boards",
    items: [
      { name: "Mediterranean Platter Veg", price: 595, isVeg: true },
      { name: "Mediterranean Platter Non-Veg", price: 695, isVeg: false },
      { name: "Tandoori Veg Platter", price: 595, isVeg: true },
      { name: "Tandoori Non-Veg Platter", price: 695, isVeg: false }
    ]
  },
  {
    name: "Continental Appetizers",
    items: [
      { name: "Mushroom Duplex", price: 275, isVeg: true },
      { name: "Fried Mozzarella Sticks", price: 275, isVeg: true },
      { name: "Crispy Onion Rings", price: 245, isVeg: true },
      { name: "Veg Pita Pockets", price: 245, isVeg: true },
      { name: "Peri Peri Chicken Wings", price: 375, isVeg: false },
      { name: "Fish n Chips", price: 445, isVeg: false },
      { name: "Crispy Chicken Tenders", price: 375, isVeg: false },
      { name: "Grilled Tiger Prawns", price: 625, isVeg: false }
    ]
  },
  {
    name: "Charcoal (Clay Oven)",
    items: [
      { name: "Bharwan Mushroom", price: 275, isVeg: true },
      { name: "Surkh Paneer Tikka", price: 275, isVeg: true },
      { name: "Badami Veg Seekh", price: 275, isVeg: true },
      { name: "Dahi Ke Sholay", price: 275, isVeg: true },
      { name: "Soya Chap (Tandoori/Malai/Achari)", price: 275, isVeg: true },
      { name: "Malai Broccoli", price: 295, isVeg: true },
      { name: "Charcoal Dumplings (Veg/Chicken)", price: "275/345", isVeg: true },
      { name: "Mutton Galouti Kebab", price: 545, isVeg: false },
      { name: "Gilafi Mutton Seekh Kebab", price: 545, isVeg: false },
      { name: "Tandoori Chicken (Half/Full)", price: "345/595", isVeg: false },
      { name: "Bhatti Ka Murgh (Half/Full)", price: "345/595", isVeg: false },
      { name: "Murgh Malai Tikka", price: 375, isVeg: false },
      { name: "Murgh Angara", price: 375, isVeg: false },
      { name: "Kandhari Jhinga", price: 625, isVeg: false },
      { name: "Amritsari Fish Tikka", price: 525, isVeg: false }
    ]
  },
  {
    name: "Oriental Appetizers",
    items: [
      { name: "Classic Thai Spring Rolls", price: 245, isVeg: true },
      { name: "Schezwan Chilly Paneer", price: 275, isVeg: true },
      { name: "Chilly Garlic Mushrooms", price: 275, isVeg: true },
      { name: "Sesame Honey Chilly Potato", price: 245, isVeg: true },
      { name: "Crispy Veg Salt n Pepper", price: 245, isVeg: true },
      { name: "Crispy Fried Peppery Corn", price: 245, isVeg: true },
      { name: "Classic Veg Dumplings (Steamed/Pan Tossed)", price: 275, isVeg: true },
      { name: "Classic Chicken Dumplings (Steamed/Pan Tossed)", price: 345, isVeg: false },
      { name: "Crispy Golden Prawns", price: 595, isVeg: false },
      { name: "Wok Tossed Chilly Prawns", price: 595, isVeg: false },
      { name: "Chilly Garlic Fish", price: 475, isVeg: false },
      { name: "Five Spiced Drums of Heaven", price: 345, isVeg: false },
      { name: "Classic Chilly Chicken", price: 345, isVeg: false }
    ]
  },
  {
    name: "Continental Main Course",
    items: [
      { name: "Exotic Veg Stroganoff", price: 345, isVeg: true },
      { name: "Cottage Cheese Steak (Peri Peri/BBQ)", price: 395, isVeg: true },
      { name: "Grilled Chicken Steak", price: 425, isVeg: false },
      { name: "Grilled Fish in Lemon Butter Sauce", price: 495, isVeg: false }
    ]
  },
  {
    name: "Sizzlers",
    items: [
      { name: "Cottage Cheese Sizzler (Chipotle/Peri Peri/BBQ)", price: 425, isVeg: true },
      { name: "European Vegetable Sizzler", price: 395, isVeg: true },
      { name: "Grilled Chicken Sizzler", price: 475, isVeg: false },
      { name: "Grilled Prawn Sizzler", price: 525, isVeg: false },
      { name: "Tandoori Kebab Sizzler Veg", price: 525, isVeg: true },
      { name: "Tandoori Kebab Sizzler Non-Veg", price: 625, isVeg: false }
    ]
  },
  {
    name: "Indian Main Course",
    items: [
      { name: "Hing Jeera Dal Tadka", price: 295, isVeg: true },
      { name: "Dal Bukhara", price: 345, isVeg: true },
      { name: "Subz Tawa Masala", price: 345, isVeg: true },
      { name: "Pind De Chole", price: 345, isVeg: true },
      { name: "Paneer Mirch Miloni", price: 345, isVeg: true },
      { name: "Paneer Butter Masala", price: 345, isVeg: true },
      { name: "Shahi Kofta Curry", price: 345, isVeg: true },
      { name: "Murgh-e-Awadh", price: 445, isVeg: false },
      { name: "Butter Chicken (Bone/Boneless)", price: 445, isVeg: false },
      { name: "Kadhai Chicken", price: 445, isVeg: false },
      { name: "Murgh Tikka Masala", price: 445, isVeg: false },
      { name: "Mutton Beliram", price: 545, isVeg: false },
      { name: "Kashmiri Josh-e-Rogan", price: 545, isVeg: false },
      { name: "Keema Te Boti Masala", price: 545, isVeg: false }
    ]
  },
  {
    name: "Oriental Main Course",
    items: [
      { name: "Thai Red/Green Curry Bowl (Veg/Chicken/Prawn)", price: "345/445/545", isVeg: true },
      { name: "Exotic Chinese Greens (Chilly Garlic/Black Bean/Schezwan)", price: 295, isVeg: true },
      { name: "Kung Pao Chicken", price: 395, isVeg: false },
      { name: "Crispy Fried Fish in Chilly Garlic Sauce", price: 395, isVeg: false },
      { name: "Prawns in Black Bean/Hot Garlic", price: 525, isVeg: false },
      { name: "Chilly Paneer Gravy", price: 295, isVeg: true },
      { name: "Chilly Chicken Gravy", price: 345, isVeg: false },
      { name: "Manchurian Gravy (Veg/Chicken)", price: "245/295", isVeg: true }
    ]
  },
  {
    name: "Wood Fired Pizzas",
    items: [
      { name: "Classic Margherita", price: 345, isVeg: true },
      { name: "Pizza Indiana", price: 395, isVeg: true },
      { name: "Mexicano Veg Pizza", price: 395, isVeg: true },
      { name: "Portugal Pepperoni Pizza", price: 495, isVeg: false },
      { name: "Meat Lovers Pizza", price: 495, isVeg: false },
      { name: "Spicy Chicken Tikka", price: 495, isVeg: false },
      { name: "New York Style Chicken", price: 495, isVeg: false }
    ]
  },
  {
    name: "Sandwiches & Burgers",
    items: [
      { name: "Club Sandwich (Veg/Non-Veg)", price: "245/295", isVeg: true },
      { name: "Garden Veggie Burger", price: 245, isVeg: true },
      { name: "Grilled Cottage Cheese Burger", price: 245, isVeg: true },
      { name: "Peri Peri Chicken Burger", price: 295, isVeg: false }
    ]
  },
  {
    name: "Rice & Biryani",
    items: [
      { name: "Hyderabadi Dum Veg Biryani", price: 445, isVeg: true },
      { name: "Hyderabadi Chicken Dum Biryani", price: 545, isVeg: false },
      { name: "Hyderabadi Gosht Dum Biryani", price: 645, isVeg: false },
      { name: "Steamed Rice", price: 225, isVeg: true },
      { name: "Peas Pulao", price: 245, isVeg: true },
      { name: "Veg Fried Rice", price: 245, isVeg: true },
      { name: "Chicken Fried Rice", price: 295, isVeg: false }
    ]
  },
  {
    name: "Breads & Sides",
    items: [
      { name: "Kulcha (Aloo/Pyaaz/Paneer)", price: 95, isVeg: true },
      { name: "Naan (Plain/Butter/Garlic)", price: "55/65/75", isVeg: true },
      { name: "Roti (Plain/Butter/Missi)", price: "25/45/55", isVeg: true },
      { name: "Paratha (Plain/Pudina/Green Chilly)", price: "75/95/95", isVeg: true },
      { name: "Keema Paratha", price: 225, isVeg: false },
      { name: "Cheese Chilly Naan", price: 95, isVeg: true },
      { name: "Hakka Noodles (Veg/Chicken)", price: "245/295", isVeg: true },
      { name: "Chilly Garlic Noodles (Veg/Chicken)", price: "245/295", isVeg: true },
      { name: "Raita (Boondi/Mix Veg/Pineapple)", price: "145/175/175", isVeg: true }
    ]
  },
  {
    name: "Desserts",
    items: [
      { name: "Cheesecake", price: 245, isVeg: true },
      { name: "Choco Fudge Brownie with Ice Cream", price: 245, isVeg: true },
      { name: "Gulab Jamun", price: 195, isVeg: true },
      { name: "Tiramisu", price: 325, isVeg: true }
    ]
  },
  {
    name: "Mocktails & Juices",
    items: [
      { name: "Standard Mocktails (e.g., Sip of Sunshine, Baby Blue Colada)", price: 195, isVeg: true },
      { name: "Virgin Mojito/Watermelon Mojito", price: 145, isVeg: true },
      { name: "Fresh Cold Press Juices (Pomegranate)", price: 225, isVeg: true },
      { name: "Fresh Cold Press Juices (Others like Watermelon, Orange)", price: 195, isVeg: true }
    ]
  },
  {
    name: "Quenchers & Cafe",
    items: [
      { name: "Red Bull", price: 195, isVeg: true },
      { name: "Soft Drink Cans (Coke, Sprite, Diet Coke)", price: 135, isVeg: true },
      { name: "Iced Tea / Slushes / Shakes", price: 195, isVeg: true },
      { name: "Tea/Coffee (e.g., Green Tea)", price: 175, isVeg: true },
      { name: "Tea/Coffee (e.g., Cappuccino, Masala Tea)", price: 145, isVeg: true },
      { name: "Tea/Coffee (e.g., Espresso, Americano)", price: 125, isVeg: true }
    ]
  }
];

