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

export const cafeAfterHoursMenu: MenuCategory[] = [
  {
    name: "Bar Tidbits",
    items: [
      { name: "Nuts n Bolts", price: 295, isVeg: true },
      { name: "French Fries (Plain/Peri Peri/Cheesey)", price: "299/345", isVeg: true },
      { name: "Garlic Bread (Plain/Cheese)", price: "299/345", isVeg: true },
      { name: "Potato Wedges (Plain/Peri Peri)", price: "299/345", isVeg: true },
      { name: "Crispy Masala Fox Nuts", price: 295, isVeg: true },
      { name: "Mumbaiya Corn Bhel", price: 295, isVeg: true },
      { name: "Peanut Masala", price: 245, isVeg: true },
      { name: "Peri Peri Chana Chat", price: 245, isVeg: true },
      { name: "Chicken Popeyes", price: 345, isVeg: false },
      { name: "Chicken 65", price: 345, isVeg: false },
      { name: "Grilled Fish Skewers", price: 495, isVeg: false },
      { name: "Beer Batter Fish Fingers", price: 495, isVeg: false },
      { name: "Cheesy Gordita Crunch", price: 345, isVeg: true },
      { name: "Butter Chicken Pav", price: 345, isVeg: false },
      { name: "Chilly Basil Tofu Bao", price: 345, isVeg: true },
      { name: "Keema Bao", price: 495, isVeg: false }
    ]
  },
  {
    name: "Soups",
    items: [
      { name: "Thyme Infused Wild Mushroom Soup", price: "245/275", isVeg: true },
      { name: "Tomato Basil Soup (Veg/Chicken)", price: "245/275", isVeg: true },
      { name: "Tibetian Thupka (Veg/Chicken)", price: "245/275", isVeg: true },
      { name: "Sweet Corn Soup (Veg/Chicken)", price: "245/275", isVeg: true },
      { name: "Manchow Soup (Veg/Chicken)", price: "245/275", isVeg: true }
    ]
  },
  {
    name: "Gourmet Healthy Salads",
    items: [
      { name: "Figs and Apricot", price: 395, isVeg: true },
      { name: "Fattoush", price: 395, isVeg: true },
      { name: "Garden Salad", price: 395, isVeg: true },
      { name: "Watermelon Feta Cheese Salad", price: 395, isVeg: true },
      { name: "Zesty Avocado Quinoa Salad", price: 395, isVeg: true },
      { name: "Fresh Garden Green Salad", price: 245, isVeg: true },
      { name: "Classic Caesar (Veg/Chicken)", price: "395/445", isVeg: true }
    ]
  },
  {
    name: "Wholesome Sharing Platters",
    items: [
      { name: "Veg Mezze Platter", price: 795, isVeg: true },
      { name: "Non-Veg Mezze Platter", price: 895, isVeg: false },
      { name: "Tandoori Veg Platter", price: 795, isVeg: true },
      { name: "Tandoori Non-Veg Platter", price: 895, isVeg: false }
    ]
  },
  {
    name: "Sourdough Toasts & Bruschettas",
    items: [
      { name: "Schezwan Mushroom Sourdough Toast", price: 495, isVeg: true },
      { name: "Avocado Sourdough Toast", price: 495, isVeg: true },
      { name: "Tomato Mozzarella & Basil Bruschettas", price: 345, isVeg: true },
      { name: "Smoke Salmon Nicoise Toast", price: 695, isVeg: false },
      { name: "Grilled Rosemary Chicken Bruschettas", price: 395, isVeg: false }
    ]
  },
  {
    name: "Mediterranean (Veg & Non-Veg)",
    items: [
      { name: "Classic Falafel", price: 645, isVeg: true },
      { name: "Vegetable Shish Touk", price: 645, isVeg: true },
      { name: "Falafel Shawarma", price: 645, isVeg: true },
      { name: "Paneer Chelo Kebab", price: 645, isVeg: true },
      { name: "Veg Sambousek", price: 645, isVeg: true },
      { name: "Chicken Shish Touk", price: 745, isVeg: false },
      { name: "Turkish Adana Kebab", price: 795, isVeg: false },
      { name: "Chicken Shawarma", price: 745, isVeg: false },
      { name: "Chicken Chelo Kebab", price: 745, isVeg: false },
      { name: "Chicken Sambousek", price: 745, isVeg: false }
    ]
  },
  {
    name: "European (Veg & Non-Veg)",
    items: [
      { name: "Tex-Mex Loaded Nachos (Veg)", price: 495, isVeg: true },
      { name: "Mexican Vegetable Quesadillas", price: 495, isVeg: true },
      { name: "Creamy Exotic Veg Vol-au-vent", price: 445, isVeg: true },
      { name: "Peri Peri Onion Rings", price: 395, isVeg: true },
      { name: "Paneer Tikka Tacos", price: 495, isVeg: true },
      { name: "Chicken Wings (BBQ / Buffalo)", price: 495, isVeg: false },
      { name: "Chicken Sausage & Ham Vol-au-vent", price: 495, isVeg: false },
      { name: "Tex-Mex Loaded Nachos (Chicken)", price: 595, isVeg: false },
      { name: "Spicy Chicken Tacos", price: 595, isVeg: false },
      { name: "Harissa Chicken Strips", price: 595, isVeg: false },
      { name: "Classic Fish n Chips", price: 575, isVeg: false },
      { name: "Butter Garlic Tiger Prawns", price: 795, isVeg: false },
      { name: "Smoked Chicken Quesadillas", price: 595, isVeg: false }
    ]
  },
  {
    name: "Clay Oven (Veg & Non-Veg)",
    items: [
      { name: "Khumb ki Galouti", price: 595, isVeg: true },
      { name: "Tandoori Khumb Red Cheddar Fondue", price: 495, isVeg: true },
      { name: "Soya Chap (Achari/Malai/Tandoori)", price: 395, isVeg: true },
      { name: "Harissa Paneer Tikka", price: 495, isVeg: true },
      { name: "Paneer Tikka (Surkh/Afghani)", price: 495, isVeg: true },
      { name: "Sadabahar Malai Seekh", price: 495, isVeg: true },
      { name: "Papad Crusted Dahi ke Kebab", price: 495, isVeg: true },
      { name: "Tandoori Chicken Wings", price: 595, isVeg: false },
      { name: "Burrah Kebab", price: 795, isVeg: false },
      { name: "Lucknowee Mutton Galouti", price: 795, isVeg: false },
      { name: "Gilafi Mutton Seekh Kebab", price: 695, isVeg: false },
      { name: "Tandoori Chicken (Half/Full)", price: "495/795", isVeg: false },
      { name: "Peshawari Chicken Tangri", price: 595, isVeg: false },
      { name: "Bhatti ka Murgh (Half/Full)", price: "495/795", isVeg: false },
      { name: "Murgh Malai Tikka", price: 595, isVeg: false },
      { name: "Chicken Sharabi Tikka", price: 595, isVeg: false },
      { name: "Murgh Seekh Kebab", price: 595, isVeg: false },
      { name: "Tandoori Pomfret", price: 995, isVeg: false },
      { name: "Kasaundi Machchi Tikka", price: 695, isVeg: false },
      { name: "Thai Red Chicken Tikka", price: 595, isVeg: false }
    ]
  },
  {
    name: "Oriental (Veg & Non-Veg)",
    items: [
      { name: "Thai Style Spring Rolls", price: 495, isVeg: true },
      { name: "Cheese Cigar Roll with Spicy Harissa", price: 595, isVeg: true },
      { name: "Crispy Fried Chilly Paneer", price: 495, isVeg: true },
      { name: "Korean Vegetable Skewers", price: 495, isVeg: true },
      { name: "Asian Green Mix Veggies", price: 495, isVeg: true },
      { name: "Crispy Thai Mushrooms", price: 495, isVeg: true },
      { name: "Honey Chilly Sesame Potato", price: 395, isVeg: true },
      { name: "Schezwan Style Salt n Pepper Veg", price: 495, isVeg: true },
      { name: "Crispy Fried Corn Kernels", price: 495, isVeg: true },
      { name: "Golden Fried Magic Prawns", price: 795, isVeg: false },
      { name: "Sichuan Style Burnt Garlic Chicken", price: 595, isVeg: false },
      { name: "Crispy Fried Fish (Chilly Garlic/Schezwan)", price: 695, isVeg: false },
      { name: "Teriyaki Chicken Skewers", price: 595, isVeg: false },
      { name: "Thai Basil Chicken", price: 595, isVeg: false },
      { name: "Original Chicken Lollipop", price: 595, isVeg: false },
      { name: "Crispy Fried Chilly Chicken", price: 595, isVeg: false }
    ]
  },
  {
    name: "Dumplings & Sushi",
    items: [
      { name: "Thai Green Veg Dumpling", price: 495, isVeg: true },
      { name: "Spicy Corn & Asparagus Dumpling", price: 495, isVeg: true },
      { name: "Waterchestnut and Cheese Dumpling", price: 495, isVeg: true },
      { name: "Chicken Thai Basil Dumpling", price: 595, isVeg: false },
      { name: "Sriracha Chicken Dumpling", price: 595, isVeg: false },
      { name: "Prawn Har Gow Dumpling", price: 695, isVeg: false },
      { name: "Veg California Roll", price: 495, isVeg: true },
      { name: "Avocado & Philadelphia Cheese Roll", price: 495, isVeg: true },
      { name: "Tempura Shrimp Roll", price: 695, isVeg: false },
      { name: "Smoke Salmon & Philadelphia Cheese Roll", price: 795, isVeg: false }
    ]
  },
  {
    name: "Continental & Sizzlers",
    items: [
      { name: "Grilled Cottage Cheese Steak", price: 595, isVeg: true },
      { name: "Modern Grilled Chicken", price: 695, isVeg: false },
      { name: "Herb Crusted Lamb Steak", price: 795, isVeg: false },
      { name: "Cajun Angel Shrimps", price: 795, isVeg: false },
      { name: "Mediterranean Grilled Red Snapper", price: 695, isVeg: false },
      { name: "Grilled Cottage Cheese Sizzler", price: 595, isVeg: true },
      { name: "Grilled Chicken Sizzler", price: 695, isVeg: false },
      { name: "Tex-Mex Lamb Sizzler", price: 795, isVeg: false },
      { name: "Grilled Fish Sizzler", price: 795, isVeg: false },
      { name: "Butter Garlic Prawn Sizzler", price: 795, isVeg: false }
    ]
  },
  {
    name: "Artisans Pizza & Pasta",
    items: [
      { name: "Rocket Margherita Caprese", price: 495, isVeg: true },
      { name: "Quattro Formaggio", price: 645, isVeg: true },
      { name: "Classic Pepperoni (Pork)", price: 695, isVeg: false },
      { name: "Spicy Chicken Tikka Pizza", price: 695, isVeg: false },
      { name: "Penne (Veg/Chicken)", price: "495/595", isVeg: true },
      { name: "Spaghetti with Meatballs", price: 695, isVeg: false },
      { name: "Chicken Lasagna", price: 595, isVeg: false }
    ]
  },
  {
    name: "Soulful Indian Delights",
    items: [
      { name: "Subz Handi Biryani", price: 595, isVeg: true },
      { name: "Dal Makhni", price: 495, isVeg: true },
      { name: "Paneer Butter Masala/Lababdar", price: 545, isVeg: true },
      { name: "Murgh Handi Biryani", price: 695, isVeg: false },
      { name: "Gosht Biryani", price: 795, isVeg: false },
      { name: "After Hours Spl Chicken Changezi", price: 595, isVeg: false },
      { name: "Josh-E-Rogan", price: 695, isVeg: false },
      { name: "Rahra Gosht", price: 695, isVeg: false }
    ]
  },
  {
    name: "Desserts",
    items: [
      { name: "Andaz e Bayaan", price: 395, isVeg: true },
      { name: "Blueberry Cheesecake", price: 395, isVeg: true },
      { name: "Red Velvet Brownie with Ice Cream", price: 345, isVeg: true },
      { name: "Mexican Churros with Ice Cream", price: 395, isVeg: true },
      { name: "Tiramisu Jar", price: 495, isVeg: true },
      { name: "Mocha Mud Cake", price: 495, isVeg: true }
    ]
  }
];

