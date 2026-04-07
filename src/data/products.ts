import categoryStaples from "@/assets/category-staples.jpg";
import categoryDairy from "@/assets/category-dairy.jpg";
import categorySpices from "@/assets/category-spices.jpg";
import categoryLentils from "@/assets/category-lentils.jpg";
import categoryVegetables from "@/assets/category-vegetables.jpg";
import categoryFruits from "@/assets/category-fruits.jpg";
import categoryMeat from "@/assets/category-meat.jpg";
import categorySnacks from "@/assets/category-snacks.jpg";
import categoryCondiments from "@/assets/category-condiments.jpg";
import categoryHousehold from "@/assets/category-household.jpg";

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  unit: string;
  seasonal?: boolean;
  seasonLabel?: string;
}

export interface Category {
  id: string;
  name: string;
  image: string;
  emoji: string;
}

export const categories: Category[] = [
  { id: "staples", name: "Staples & Grains", image: categoryStaples, emoji: "🌾" },
  { id: "dairy", name: "Dairy & Eggs", image: categoryDairy, emoji: "🥛" },
  { id: "spices", name: "Spices & Seasonings", image: categorySpices, emoji: "🌶️" },
  { id: "lentils", name: "Lentils & Beans", image: categoryLentils, emoji: "🫘" },
  { id: "vegetables", name: "Fresh Vegetables", image: categoryVegetables, emoji: "🥕" },
  { id: "fruits", name: "Fresh Fruits", image: categoryFruits, emoji: "🍎" },
  { id: "meat", name: "Meat & Seafood", image: categoryMeat, emoji: "🍗" },
  { id: "snacks", name: "Snacks & Packaged", image: categorySnacks, emoji: "🍪" },
  { id: "condiments", name: "Condiments & Sauces", image: categoryCondiments, emoji: "🍯" },
  { id: "household", name: "Household Essentials", image: categoryHousehold, emoji: "🧴" },
];

export const products: Product[] = [
  // Staples (April 2026 market rates)
  { id: "rice", name: "Rice (Basmati)", price: 280, category: "staples", unit: "kg" },
  { id: "wheat-flour", name: "Wheat Flour (Atta)", price: 120, category: "staples", unit: "kg" },
  { id: "maize-flour", name: "Maize Flour", price: 100, category: "staples", unit: "kg" },
  { id: "bread", name: "Bread", price: 120, category: "staples", unit: "loaf" },
  { id: "cooking-oil", name: "Cooking Oil", price: 480, category: "staples", unit: "liter" },
  { id: "sugar", name: "Sugar", price: 150, category: "staples", unit: "kg" },
  { id: "salt", name: "Salt", price: 50, category: "staples", unit: "kg" },
  { id: "tea", name: "Tea", price: 350, category: "staples", unit: "250g" },
  { id: "coffee", name: "Coffee", price: 600, category: "staples", unit: "250g" },

  // Dairy & Eggs
  { id: "milk", name: "Milk", price: 180, category: "dairy", unit: "liter" },
  { id: "yogurt", name: "Yogurt", price: 120, category: "dairy", unit: "500g" },
  { id: "eggs", name: "Eggs", price: 280, category: "dairy", unit: "dozen" },
  { id: "butter", name: "Butter", price: 200, category: "dairy", unit: "200g" },
  { id: "ghee", name: "Ghee", price: 750, category: "dairy", unit: "500g" },

  // Spices & Seasonings
  { id: "red-chili", name: "Red Chili Powder", price: 160, category: "spices", unit: "200g" },
  { id: "turmeric", name: "Turmeric", price: 120, category: "spices", unit: "200g" },
  { id: "coriander", name: "Coriander Powder", price: 100, category: "spices", unit: "200g" },
  { id: "black-pepper", name: "Black Pepper", price: 250, category: "spices", unit: "100g" },

  // Lentils & Beans
  { id: "masoor-dal", name: "Masoor Dal", price: 220, category: "lentils", unit: "kg" },
  { id: "moong-dal", name: "Moong Dal", price: 260, category: "lentils", unit: "kg" },
  { id: "chana-dal", name: "Chana Dal", price: 200, category: "lentils", unit: "kg" },
  { id: "chickpeas", name: "Chickpeas", price: 240, category: "lentils", unit: "kg" },
  { id: "rajma", name: "Kidney Beans (Rajma)", price: 280, category: "lentils", unit: "kg" },

  // Vegetables (Spring/April Season)
  { id: "potatoes", name: "Potatoes", price: 60, category: "vegetables", unit: "kg" },
  { id: "onions", name: "Onions", price: 80, category: "vegetables", unit: "kg" },
  { id: "tomatoes", name: "Tomatoes", price: 100, category: "vegetables", unit: "kg" },
  { id: "carrots", name: "Carrots", price: 70, category: "vegetables", unit: "kg", seasonal: true, seasonLabel: "Spring" },
  { id: "cucumbers", name: "Cucumbers", price: 50, category: "vegetables", unit: "kg", seasonal: true, seasonLabel: "In Season" },
  { id: "spinach", name: "Spinach", price: 30, category: "vegetables", unit: "bunch", seasonal: true, seasonLabel: "Spring" },
  { id: "cabbage", name: "Cabbage", price: 50, category: "vegetables", unit: "piece", seasonal: true, seasonLabel: "Spring" },
  { id: "green-chilies", name: "Green Chilies", price: 40, category: "vegetables", unit: "100g" },
  { id: "garlic", name: "Garlic", price: 120, category: "vegetables", unit: "250g" },
  { id: "ginger", name: "Ginger", price: 100, category: "vegetables", unit: "250g" },
  { id: "peas", name: "Green Peas", price: 90, category: "vegetables", unit: "kg", seasonal: true, seasonLabel: "Spring" },
  { id: "bitter-gourd", name: "Bitter Gourd", price: 80, category: "vegetables", unit: "kg", seasonal: true, seasonLabel: "Spring" },
  { id: "bottle-gourd", name: "Bottle Gourd (Lauki)", price: 60, category: "vegetables", unit: "piece", seasonal: true, seasonLabel: "In Season" },
  { id: "lady-finger", name: "Lady Finger (Bhindi)", price: 120, category: "vegetables", unit: "kg", seasonal: true, seasonLabel: "Coming Soon" },

  // Fruits (Spring/April Season)
  { id: "mangoes", name: "Mangoes (Sindhri)", price: 250, category: "fruits", unit: "kg", seasonal: true, seasonLabel: "Early Season" },
  { id: "bananas", name: "Bananas", price: 80, category: "fruits", unit: "dozen" },
  { id: "watermelon", name: "Watermelon", price: 40, category: "fruits", unit: "kg", seasonal: true, seasonLabel: "In Season" },
  { id: "apples", name: "Apples", price: 280, category: "fruits", unit: "kg" },
  { id: "oranges", name: "Oranges (Kinnow)", price: 100, category: "fruits", unit: "kg", seasonal: true, seasonLabel: "Last Stock" },
  { id: "grapes", name: "Grapes", price: 200, category: "fruits", unit: "kg", seasonal: true, seasonLabel: "In Season" },
  { id: "guava", name: "Guava (Amrood)", price: 120, category: "fruits", unit: "kg", seasonal: true, seasonLabel: "Spring" },
  { id: "papaya", name: "Papaya", price: 100, category: "fruits", unit: "kg", seasonal: true, seasonLabel: "In Season" },
  { id: "lychee", name: "Lychee", price: 350, category: "fruits", unit: "kg", seasonal: true, seasonLabel: "Coming Soon" },

  // Meat & Seafood (Updated market rates April 2026)
  { id: "chicken", name: "Chicken", price: 480, category: "meat", unit: "kg" },
  { id: "beef", name: "Beef", price: 850, category: "meat", unit: "kg" },
  { id: "mutton", name: "Mutton", price: 1800, category: "meat", unit: "kg" },
  { id: "fish", name: "Fish (Rohu)", price: 550, category: "meat", unit: "kg" },
  { id: "prawns", name: "Prawns (Shrimp)", price: 1200, category: "meat", unit: "kg" },

  // Snacks
  { id: "biscuits", name: "Biscuits", price: 40, category: "snacks", unit: "pack" },
  { id: "chips", name: "Chips", price: 30, category: "snacks", unit: "pack" },
  { id: "noodles", name: "Noodles", price: 25, category: "snacks", unit: "pack" },
  { id: "pasta", name: "Pasta", price: 80, category: "snacks", unit: "500g" },

  // Condiments
  { id: "ketchup", name: "Ketchup", price: 90, category: "condiments", unit: "bottle" },
  { id: "mayonnaise", name: "Mayonnaise", price: 120, category: "condiments", unit: "bottle" },
  { id: "soy-sauce", name: "Soy Sauce", price: 75, category: "condiments", unit: "bottle" },
  { id: "vinegar", name: "Vinegar", price: 45, category: "condiments", unit: "bottle" },

  // Household
  { id: "soap", name: "Soap", price: 35, category: "household", unit: "bar" },
  { id: "shampoo", name: "Shampoo", price: 180, category: "household", unit: "bottle" },
  { id: "toothpaste", name: "Toothpaste", price: 70, category: "household", unit: "tube" },
  { id: "detergent", name: "Detergent", price: 150, category: "household", unit: "kg" },
  { id: "dishwashing", name: "Dishwashing Liquid", price: 95, category: "household", unit: "bottle" },
  { id: "tissues", name: "Tissues", price: 60, category: "household", unit: "box" },
  { id: "toilet-paper", name: "Toilet Paper", price: 80, category: "household", unit: "pack" },
];
