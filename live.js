// Loads the live product list from Firestore. If Firebase is not set up, or no products
// have been imported yet, the page keeps showing the starter list from products.js.
import { configured, db } from "./firebase-init.js";
import { collection, onSnapshot, query, orderBy } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

if (configured) {
  onSnapshot(query(collection(db, "products"), orderBy("createdAt", "asc")), snap => {
    if (snap.empty) return;
    window.MC.setProducts(snap.docs.map(d => {
      const p = d.data();
      return { id: d.id, name: p.name, category: p.category, price: p.price, desc: p.desc || "",
               icon: p.icon || "🛒", image: p.imageUrl || "", featured: !!p.featured, inStock: !p.sold };
    }));
  }, err => console.warn("Could not load live products:", err.message));
}
