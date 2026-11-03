// EDIT THIS LIST to change what appears in the shop.
// price is in Kenya shillings. Set inStock to false to show "Out of stock".
// To use a real photo, put the file in an "images" folder and add: image: "images/blender.jpg"
const CATEGORIES = [
  { name: "Small kitchen appliances", icon: "🍳" },
  { name: "Cooking", icon: "🔥" },
  { name: "Fridges and laundry", icon: "🧊" },
  { name: "Home care", icon: "🏠" }
];
const PRODUCTS = [
  { name: "Blender 1.5L", category: "Small kitchen appliances", price: 3500, icon: "🥤", inStock: true, featured: true, desc: "Multi-speed blender for smoothies, soups and sauces." },
  { name: "Electric Kettle 1.7L", category: "Small kitchen appliances", price: 1800, icon: "☕", inStock: true, featured: false, desc: "Auto shut-off stainless steel kettle." },
  { name: "Air Fryer 5L", category: "Small kitchen appliances", price: 9500, icon: "🍟", inStock: true, featured: true, desc: "Fry, bake and roast with little or no oil." },
  { name: "2-Slice Toaster", category: "Small kitchen appliances", price: 2200, icon: "🍞", inStock: true, featured: false, desc: "Adjustable browning control with crumb tray." },
  { name: "Rice Cooker 1.8L", category: "Small kitchen appliances", price: 4200, icon: "🍚", inStock: true, featured: false, desc: "Non-stick pot with keep-warm function." },
  { name: "Microwave 20L", category: "Cooking", price: 12500, icon: "📦", inStock: true, featured: true, desc: "Solo microwave with 5 power levels and timer." },
  { name: "4-Burner Gas Cooker", category: "Cooking", price: 24000, icon: "🔥", inStock: true, featured: false, desc: "Stainless steel top with built-in oven." },
  { name: "Double Door Fridge 250L", category: "Fridges and laundry", price: 42000, icon: "🧊", inStock: true, featured: true, desc: "Frost-free, energy saving, with adjustable shelves." },
  { name: "Washing Machine 7kg", category: "Fridges and laundry", price: 38000, icon: "🧺", inStock: false, featured: false, desc: "Top-load automatic washer with multiple programs." },
  { name: "Steam Iron", category: "Home care", price: 2600, icon: "👔", inStock: true, featured: false, desc: "Non-stick soleplate with steam burst." },
  { name: "Standing Fan 18 inch", category: "Home care", price: 4800, icon: "🌀", inStock: true, featured: false, desc: "Three speeds with adjustable height and tilt." },
  { name: "Vacuum Cleaner 1600W", category: "Home care", price: 8900, icon: "🧹", inStock: true, featured: false, desc: "Bagless, with washable filter and attachments." }
];

window.CATEGORIES = CATEGORIES;
window.PRODUCTS = PRODUCTS;
