import { initializeApp } from "https://www.gstatic.com/firebasejs/11.10.0/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-auth.js";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getFirestore,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  writeBatch
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-firestore.js";
import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytes
} from "https://www.gstatic.com/firebasejs/11.10.0/firebase-storage.js";
import { firebaseConfig, ownerEmail } from "./firebase-config.js";

const status = document.getElementById("ownerStatus");
const loginForm = document.getElementById("ownerLogin");
const ownerTools = document.getElementById("ownerTools");
const productForm = document.getElementById("productForm");
const categorySelect = document.getElementById("productCategory");
const loginEmail = document.getElementById("ownerEmail");
const ownerProductList = document.getElementById("ownerProductList");
const starterImport = document.getElementById("starterImport");
let publishedProducts = [];
let signedInUser = null;
let catalogInitialized = false;
let database;
let storage;

window.CATEGORIES.forEach(category => {
  const option = document.createElement("option");
  option.value = category.name;
  option.textContent = category.name;
  categorySelect.appendChild(option);
});

function setStatus(message) {
  status.textContent = message;
}

function renderOwnerProducts() {
  ownerProductList.replaceChildren();
  if (!publishedProducts.length) {
    const empty = document.createElement("p");
    empty.textContent = "No products have been published online yet.";
    ownerProductList.appendChild(empty);
    return;
  }

  publishedProducts.forEach(product => {
    const row = document.createElement("div");
    row.className = "owner-product-row";
    const details = document.createElement("div");
    const name = document.createElement("p");
    name.className = "owner-product-name";
    name.textContent = product.name;
    const availability = document.createElement("p");
    availability.className = `stock ${product.inStock ? "in" : "out"}`;
    availability.textContent = product.inStock ? "Available" : "Sold";
    details.append(name, availability);

    const actions = document.createElement("div");
    actions.className = "owner-product-actions";
    const toggleButton = document.createElement("button");
    toggleButton.type = "button";
    toggleButton.textContent = product.inStock ? "Mark sold" : "Mark available";
    toggleButton.addEventListener("click", async () => {
      toggleButton.disabled = true;
      try {
        await updateDoc(doc(database, "products", product.id), { inStock: !product.inStock });
        setStatus(`${product.name} updated.`);
      } catch (error) {
        console.error("Could not update product availability.", error);
        setStatus("Could not update availability. Check your connection and try again.");
      } finally {
        toggleButton.disabled = false;
      }
    });

    const removeButton = document.createElement("button");
    removeButton.type = "button";
    removeButton.textContent = "Remove";
    removeButton.addEventListener("click", async () => {
      if (!window.confirm(`Remove ${product.name} from the shop?`)) return;
      removeButton.disabled = true;
      try {
        await deleteDoc(doc(database, "products", product.id));
        if (product.imagePath) {
          try {
            await deleteObject(ref(storage, product.imagePath));
          } catch (error) {
            console.error("Product removed but its photo could not be deleted.", error);
            setStatus("Product removed. Its photo could not be deleted from storage.");
            return;
          }
        }
        setStatus(`${product.name} removed from the shop.`);
      } catch (error) {
        console.error("Could not remove product.", error);
        setStatus("Could not remove product. Check your connection and try again.");
        removeButton.disabled = false;
      }
    });
    actions.append(toggleButton, removeButton);
    row.append(details, actions);
    ownerProductList.appendChild(row);
  });
}

const configIsReady = Object.values(firebaseConfig).every(value =>
  typeof value === "string" && value.length > 0 && !value.startsWith("YOUR_")
);

if (!configIsReady) {
  loginForm.hidden = true;
  setStatus("Online publishing is not configured yet. Follow FIREBASE_SETUP.md to connect the shop.");
} else {
  const app = initializeApp(firebaseConfig);
  const auth = getAuth(app);
  database = getFirestore(app);
  storage = getStorage(app);
  const productCollection = collection(database, "products");
  const catalogSettingsRef = doc(database, "settings", "catalog");

  onSnapshot(catalogSettingsRef, snapshot => {
    catalogInitialized = snapshot.exists() && snapshot.data().initialized === true;
    starterImport.hidden = !signedInUser || catalogInitialized;
    window.setRemoteProducts(publishedProducts, catalogInitialized);
  }, error => {
    console.error("Could not load catalog settings.", error);
    setStatus("Catalog setup could not be loaded. Check the Firebase security rules.");
  });

  onSnapshot(productCollection, snapshot => {
    publishedProducts = snapshot.docs.map(product => ({ id: product.id, ...product.data() }));
    window.setRemoteProducts(publishedProducts, catalogInitialized);
    renderOwnerProducts();
    if (!signedInUser) setStatus("Online products are up to date.");
  }, error => {
    console.error("Could not load online products.", error);
    setStatus("Online products could not be loaded. Check the Firebase setup and security rules.");
  });

  onAuthStateChanged(auth, user => {
    const isOwner = user && user.email?.toLowerCase() === ownerEmail.toLowerCase() && user.emailVerified;
    signedInUser = isOwner ? user : null;
    loginForm.hidden = Boolean(isOwner);
    ownerTools.hidden = !isOwner;
    starterImport.hidden = !isOwner || catalogInitialized;
    renderOwnerProducts();

    if (user && !isOwner) {
      signOut(auth);
      setStatus("This account is not authorized to publish products.");
    } else if (isOwner) {
      setStatus(`Signed in as ${ownerEmail}.`);
    } else if (!status.textContent.startsWith("Online products could not be loaded")) {
      setStatus("Sign in with the owner account to manage products.");
    }
  });

  loginForm.addEventListener("submit", async event => {
    event.preventDefault();
    const email = loginEmail.value.trim().toLowerCase();
    const password = document.getElementById("ownerPassword").value;
    if (email !== ownerEmail.toLowerCase()) {
      setStatus("Only the website owner's account can sign in here.");
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      loginForm.reset();
    } catch (error) {
      console.error("Owner sign-in failed.", error);
      setStatus("Sign-in failed. Check the owner email and password, and verify the email address.");
    }
  });

  document.getElementById("ownerLogout").addEventListener("click", () => signOut(auth));

  document.getElementById("importStarterProducts").addEventListener("click", async event => {
    const button = event.currentTarget;
    if (!signedInUser || catalogInitialized) return;
    button.disabled = true;
    setStatus("Importing the starter catalog...");

    try {
      const batch = writeBatch(database);
      for (const [index, product] of window.PRODUCTS.entries()) {
        const starterRef = doc(database, "products", `starter-${index + 1}`);
        const existing = await getDoc(starterRef);
        if (existing.exists()) continue;
        batch.set(starterRef, {
          name: product.name,
          category: product.category,
          price: product.price,
          desc: product.desc,
          image: "",
          imagePath: "",
          icon: product.icon,
          inStock: product.inStock,
          featured: product.featured,
          createdAt: serverTimestamp()
        });
      }
      batch.set(catalogSettingsRef, { initialized: true, createdAt: serverTimestamp() });
      await batch.commit();
      setStatus("Starter catalog imported. All products can now be managed here.");
    } catch (error) {
      console.error("Could not import starter products.", error);
      setStatus("Could not import the starter catalog. Check the Firebase rules and try again.");
      button.disabled = false;
    }
  });

  productForm.addEventListener("submit", async event => {
    event.preventDefault();
    const user = auth.currentUser;
    if (!user || user.email?.toLowerCase() !== ownerEmail.toLowerCase() || !user.emailVerified) {
      setStatus("Sign in with the verified owner account before publishing.");
      return;
    }

    const photo = document.getElementById("productPhoto").files[0];
    if (!photo || !photo.type.startsWith("image/") || photo.size > 5 * 1024 * 1024) {
      setStatus("Choose an image smaller than 5 MB.");
      return;
    }

    const submitButton = productForm.querySelector("button[type=submit]");
    submitButton.disabled = true;
    setStatus("Uploading product photo and publishing product...");

    const imagePath = `products/${user.uid}/${crypto.randomUUID()}-${photo.name.replace(/[^a-zA-Z0-9._-]/g, "_")}`;
    const photoRef = ref(storage, imagePath);
    let photoUploaded = false;

    try {
      await uploadBytes(photoRef, photo, { contentType: photo.type });
      photoUploaded = true;
      const image = await getDownloadURL(photoRef);
      await addDoc(productCollection, {
        name: document.getElementById("productName").value.trim(),
        category: categorySelect.value,
        price: Number(document.getElementById("productPrice").value),
        desc: document.getElementById("productDescription").value.trim(),
        image,
        imagePath,
        icon: "📦",
        inStock: document.getElementById("productInStock").checked,
        featured: false,
        createdAt: serverTimestamp()
      });
      productForm.reset();
      document.getElementById("productInStock").checked = true;
      setStatus("Product published. It is now visible in the shop.");
    } catch (error) {
      console.error("Product publishing failed.", error);
      if (photoUploaded) {
        try {
          await deleteObject(photoRef);
        } catch (cleanupError) {
          console.error("Could not remove the unused product photo.", cleanupError);
        }
      }
      setStatus("Could not publish the product. Check your connection and Firebase setup, then try again.");
    } finally {
      submitButton.disabled = false;
    }
  });
}
