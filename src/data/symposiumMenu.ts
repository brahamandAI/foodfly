export interface MenuItem {
  name: string;
  price: number | string; // Can be single price or "295 / 325" format
  description?: string;
  isVeg: boolean;
  image?: string;
  isAvailable?: boolean; // Availability status
}

export interface MenuCategory {
  name: string;
  items: MenuItem[];
}

export const symposiumMenu: MenuCategory[] = [
  {
    name: "Soups",
    items: [
      { name: "Cream of Tomato Soup", price: 325, isVeg: true },
      { name: "Cappuccino of Wild Mushroom", price: 375, isVeg: true },
      { name: "Minestrone Soup", price: 325, isVeg: true },
      { name: "Manchow Soup", price: "295 / 325", isVeg: true },
      { name: "Hot n Sour Soup", price: "295 / 325", isVeg: true },
      { name: "Sweet Corn Soup", price: "295 / 325", isVeg: true },
      { name: "Thai Lemon Coriander", price: "295 / 325", isVeg: true },
      { name: "Roasted Chicken Soup", price: 325, isVeg: false }
    ]
  },
  {
    name: "Salads",
    items: [
      { name: "Green Salad", price: 195, isVeg: true },
      { name: "Greek Salad", price: 225, isVeg: true },
      { name: "Cucumber Salad", price: 225, isVeg: true },
      { name: "Symposium Casa Salad", price: 435, isVeg: true },
      { name: "Tex Mex Salad", price: 435, isVeg: true },
      { name: "Classic Caesar Salad", price: 435, isVeg: true }
    ]
  },
  {
    name: "European Appetizers",
    items: [
      { name: "Hummus with Pita Bread", price: 375, isVeg: true },
      { name: "Baked Fries", price: 455, isVeg: true },
      { name: "Baked Nachos", price: 495, isVeg: true },
      { name: "Veggie Baked Potato", price: 325, isVeg: true },
      { name: "Bruschette di Pomodoro", price: 395, isVeg: true },
      { name: "Phyllo Pie Cup", price: 645, isVeg: true },
      { name: "Chilli Cheese Toast", price: 425, isVeg: true },
      { name: "Cheese Ball", price: 395, isVeg: true },
      { name: "Fiery Grill Chicken", price: 695, isVeg: false },
      { name: "Speidini di Pollo con Pesto", price: 695, isVeg: false },
      { name: "Tapenade Glazed Chicken", price: 695, isVeg: false },
      { name: "Cilantro Pepper Fish", price: 695, isVeg: false },
      { name: "Fish Finger", price: 695, isVeg: false },
      { name: "Gamberi al Vino Bianco", price: 999, isVeg: false }
    ]
  },
  {
    name: "Indian Appetizers (Veg)",
    items: [
      { name: "Tandoori Momos Veg", price: 245, isVeg: true },
      { name: "Tandoori Khumb", price: 455, isVeg: true },
      { name: "Tandoori Badami Broccoli", price: 495, isVeg: true },
      { name: "Dahi Aam Papad Tikki", price: 525, isVeg: true },
      { name: "Hara Bhara Kebab", price: 449, isVeg: true },
      { name: "Vegetable Seekh Kebab", price: 449, isVeg: true },
      { name: "Beetroot Spinach Cheese Tikki", price: 575, isVeg: true },
      { name: "Tandoori Soya Chaap/Malai", price: "495 / 525", isVeg: true },
      { name: "Lebanese Paneer Tikka", price: 575, isVeg: true },
      { name: "Symposium Style Vegetarian Platter", price: 799, isVeg: true }
    ]
  },
  {
    name: "Indian Appetizers (Non-Veg)",
    items: [
      { name: "Tandoori Chicken Momos", price: 345, isVeg: false },
      { name: "Tandoori Chicken Half/Afgani Chicken", price: "625 / 695", isVeg: false },
      { name: "Tandoori Chicken Wings", price: 595, isVeg: false },
      { name: "Punjabi Tangri Kebab (04 Pieces)", price: 595, isVeg: false },
      { name: "Cilantro Garlic Chicken Tikka", price: 625, isVeg: false },
      { name: "Chicken Malai Tikka", price: 625, isVeg: false },
      { name: "Paprika Murg Tikka", price: 625, isVeg: false },
      { name: "Chicken Seekh Kebab", price: 625, isVeg: false },
      { name: "Mutton Seekh Kebab", price: 679, isVeg: false },
      { name: "Mutton Burrah Chaap (03 Pieces)", price: 799, isVeg: false },
      { name: "Ajwaini Lemon Fish Tikka", price: 699, isVeg: false },
      { name: "Tandoori Garlic Prawns", price: 999, isVeg: false },
      { name: "Symposium Style Non-Veg Platter", price: 999, isVeg: false }
    ]
  },
  {
    name: "Oriental Appetizers (Veg)",
    items: [
      { name: "Chilli Mushroom", price: 495, isVeg: true },
      { name: "Wok Tossed Chilli Paneer", price: 525, isVeg: true },
      { name: "Crispy Salt n Pepper", price: 499, isVeg: true },
      { name: "Scallions Spring Roll", price: 499, isVeg: true },
      { name: "Manchurian Ball", price: 499, isVeg: true },
      { name: "Crispy Pepper Corn", price: 499, isVeg: true },
      { name: "Veg Momo", price: 225, isVeg: true },
      { name: "Honey Chilli Potato", price: 499, isVeg: true }
    ]
  },
  {
    name: "Oriental Appetizers (Non-Veg)",
    items: [
      { name: "Chicken Momos", price: 355, isVeg: false },
      { name: "Chilli Garlic Chicken Wings", price: 575, isVeg: false },
      { name: "Drums of Heaven", price: 595, isVeg: false },
      { name: "Wok Chilli Chicken", price: 595, isVeg: false },
      { name: "Kung Pao Chicken", price: 595, isVeg: false },
      { name: "Oriental Chicken Spring Roll", price: 595, isVeg: false },
      { name: "Spicy Chilli Garlic Fish", price: 699, isVeg: false },
      { name: "Stir Fried Fish", price: 699, isVeg: false },
      { name: "Hot Garlic Prawns", price: 999, isVeg: false }
    ]
  },
  {
    name: "Sandwiches",
    items: [
      { name: "Vegetables Grilled Sandwich", price: 295, isVeg: true },
      { name: "Grilled Paneer Sandwich", price: 325, isVeg: true },
      { name: "Chicken Tikka/Malai Sandwich", price: 395, isVeg: false }
    ]
  },
  {
    name: "Burgers",
    items: [
      { name: "Aloo Tikki Burger", price: 295, isVeg: true },
      { name: "Paneer Tikka Burger", price: 325, isVeg: true },
      { name: "Chicken Tikka Burger", price: 395, isVeg: false },
      { name: "Butter Chicken Burger", price: 395, isVeg: false }
    ]
  },
  {
    name: "Rolls",
    items: [
      { name: "Paneer Tikka Roll/Malai", price: "245 / 295", isVeg: true },
      { name: "Soya Chaap Roll/Malai Roll", price: "245 / 295", isVeg: true },
      { name: "Chicken Seekh Kebab Roll", price: 325, isVeg: false },
      { name: "Chicken Tikka Roll/Malai", price: "325 / 355", isVeg: false },
      { name: "Double Egg Roll", price: 295, isVeg: false },
      { name: "Egg Chicken Tikka Roll", price: 325, isVeg: false }
    ]
  },
  {
    name: "Home Made Pasta",
    items: [
      { name: "Spinach and Ricotta Ravioli", price: 595, isVeg: true },
      { name: "Fettuccini Funghi Misti", price: 595, isVeg: true },
      { name: "Garganelli alla Verdure", price: 595, isVeg: true },
      { name: "Penne Arrabiata (Veg/Non-Veg)", price: "525 / 625", isVeg: true },
      { name: "Penne Alfredo (Veg/Non-Veg)", price: "525 / 625", isVeg: true },
      { name: "Spaghetti Aglio Olio e Pepperoncino", price: 595, isVeg: true },
      { name: "Lasagna (Veg/Non-Veg)", price: "595 / 695", isVeg: true },
      { name: "Garganelli Polo Al Pesto", price: 625, isVeg: false }
    ]
  },
  {
    name: "Pizza",
    items: [
      { name: "Pizza Margherita", price: 555, isVeg: true },
      { name: "Exotic Vegetable Pizza", price: 595, isVeg: true },
      { name: "Basilico-e-Bocconcini Pizza", price: 595, isVeg: true },
      { name: "Paneer Tikka Pizza", price: 595, isVeg: true },
      { name: "Olive Corn Pizza", price: 595, isVeg: true },
      { name: "Paneer Makhani Pizza", price: 595, isVeg: true },
      { name: "Chicken Tikka Pizza", price: 675, isVeg: false },
      { name: "Pizza Pollo con Funghi e Pomodori Secchi", price: 675, isVeg: false },
      { name: "Butter Chicken Pizza", price: 675, isVeg: false }
    ]
  },
  {
    name: "European Main Course",
    items: [
      { name: "Butter Bean Rosti", price: 595, isVeg: true },
      { name: "Grilled Mediterranean Vegetables", price: 545, isVeg: true },
      { name: "Baked Veg", price: 545, isVeg: true },
      { name: "Spedini Verdure with Saffron Rice", price: 595, isVeg: true },
      { name: "Chicken Stroganoff with Saffron Rice", price: 725, isVeg: false },
      { name: "Pan Seared Chicken Breast", price: 725, isVeg: false },
      { name: "Grilled Chicken with Lime Thyme Sauce", price: 725, isVeg: false },
      { name: "Grilled River Sole", price: 999, isVeg: false },
      { name: "Grilled Basa", price: 799, isVeg: false },
      { name: "Grilled Lamb Chops", price: 945, isVeg: false },
      { name: "Grilled Prawns", price: 1099, isVeg: false }
    ]
  },
  {
    name: "Indian Main Course (Veg)",
    items: [
      { name: "Kadai Paneer", price: 595, isVeg: true },
      { name: "Paneer Tikka Butter Masala", price: 595, isVeg: true },
      { name: "Paneer Lababdar", price: 595, isVeg: true },
      { name: "Paneer Makhani", price: 595, isVeg: true },
      { name: "Dal Tadka / Dal Palak Dubale Tadka", price: 525, isVeg: true },
      { name: "Dal Makhani", price: 595, isVeg: true },
      { name: "Matar Methi Malai", price: 595, isVeg: true },
      { name: "Tawa Firangi Sabzi", price: 595, isVeg: true }
    ]
  },
  {
    name: "Indian Main Course (Non-Veg)",
    items: [
      { name: "Murg Makhan Wala", price: 725, isVeg: false },
      { name: "Murg Kali Mirch", price: 725, isVeg: false },
      { name: "Chicken Saagwala", price: 725, isVeg: false },
      { name: "Mutton Roganjosh / Mutton Rara", price: 899, isVeg: false },
      { name: "Goan Prawn Curry", price: 1099, isVeg: false }
    ]
  },
  {
    name: "Desserts",
    items: [
      { name: "Tiramisu in a Jar", price: 449, isVeg: true },
      { name: "Chocolate Warm Cake", price: 325, isVeg: true },
      { name: "Warm Carrot Cake", price: 425, isVeg: true },
      { name: "Choice of Ice Creams (02 Scoop)", price: 275, isVeg: true },
      { name: "Walnut Brownie with Vanilla Ice Cream", price: 395, isVeg: true },
      { name: "Gulab Jamun (2 Pieces)", price: 245, isVeg: true }
    ]
  },
  {
    name: "Mocktails",
    items: [
      { name: "Mojito Mania / Hawaiian Pinacolada", price: 215, isVeg: true },
      { name: "Blue Beach Lemonade", price: 215, isVeg: true }
    ]
  },
  {
    name: "Shakes & Smoothies",
    items: [
      { name: "Cold Coffee / Nutella Shake", price: 225, isVeg: true },
      { name: "Berry Berry Boom (Smoothie)", price: 225, isVeg: true }
    ]
  },
  {
    name: "Quenchers",
    items: [
      { name: "Fresh Lime Soda", price: 105, isVeg: true },
      { name: "Red Bull", price: 225, isVeg: true },
      { name: "Cappuccino (Regular / King Size)", price: "125 / 150", isVeg: true }
    ]
  }
];

