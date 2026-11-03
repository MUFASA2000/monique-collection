import { configured, db, auth, storage, ownerEmail } from "./firebase-init.js";
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot, query, orderBy, writeBatch, serverTimestamp }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";
import { signInWithEmailAndPassword, signOu, onAuthStateChanged, sendEmailVerification }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { ref, uploadBytes, getDownloadURL, deleteObject }
  from "https://www.gstatic.com/firebasejs/10.12.2/firebase-storage.js";

const $ = id => document.getElementById(id);
if (configured) {
  $("owner").hidden = false;
  CATEGORIES.forEach(c => $("pcat").add(new Option(c.name, c.name)));
  const say = (t, bad) => { $("mgrStatus").textContent = t; $("mgrStatus").style.color = bad ? "#b3261e" : ""; };
  let items = [];

  $("loginForm").addEventListener("submit", async e => {
    e.preventDefault();
    $("loginErr").textContent = "";
    try { await signInWithEmailAndPassword(auth, $("oemail").value.trim(), $("opass").value); }
    catch { $("loginErr").textContent = "Sign-in failed. Check your email and password."; }
  });
  $("signOut").addEventListener("click", () => signOut(auth));

  let unsub = null;
  onAuthStateChanged(auth, user => {
    if (unsub) { unsub(); unsub = null; }
    const isOwner = user && user.email === ownerEmail && user.emailVerified;
    if (user && !isOwner) {
            if (user.email === ownerEmail) {
        sendEmailVerification(user).catch(() => {});
        $("loginErr").textContent = "Your email is not verified yet. We sent a verification link to " + user.email + ". Open it, then sign in again.";
      } else $("loginErr").textContent = "This account is not allowed to manage products.";
      signOut(auth); return;
    }
    $("loginBox").hidden = !!isOwner;
    $("manager").hidden = !isOwner;
    if (isOwner) {
      $("who").textContent = "Signed in as " + user.email + ".";
      unsub = onSnapshot(query(collection(db, "products"), orderBy("createdAt", "asc")), snap => {
        items = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        renderList();
      });
    }
  });

  function renderList() {
    const box = $("mgrList");
    box.innerHTML = "";
    if (!items.length) { box.textContent = "No products yet. Add one above or import the starter products."; return; }
    items.forEach(p => {
      const row = document.createElement("div");
      row.className = "mgr-row";
      const label = document.createElement("span");
      label.textContent = `${p.name} - KES ${Number(p.price).toLocaleString("en-KE")}${p.sold ? " (sold)" : ""}`;
      const sell = document.createElement("button");
      sell.type = "button"; sell.className = "btn alt small";
      sell.textContent = p.sold ? "Mark available" : "Mark sold";
      sell.onclick = async () => { try { await updateDoc(doc(db, "products", p.id), { sold: !p.sold }); } catch (e) { say(e.message, true); } };
      const del = document.createElement("button");
      del.type = "button"; del.className = "btn danger small";
      del.textContent = "Remove";
      del.onclick = async () => {
        if (!confirm(`Remove "${p.name}" from the shop?`)) return;
        try {
          await deleteDoc(doc(db, "products", p.id));
          if (p.imagePath) await deleteObject(ref(storage, p.imagePath)).catch(() => {});
        } catch (e) { say(e.message, true); }
      };
      row.append(label, sell, del);
      box.appendChild(row);
    });
  }

  // Shrink phone photos before upload (max 1000px wide, JPEG)
  async function prepare(file) {
    try {
      const bmp = await createImageBitmap(file);
      const scale = Math.min(1, 1000 / bmp.width);
      const c = document.createElement("canvas");
      c.width = Math.round(bmp.width * scale); c.height = Math.round(bmp.height * scale);
      c.getContext("2d").drawImage(bmp, 0, 0, c.width, c.height);
      const blob = await new Promise(r => c.toBlob(r, "image/jpeg", 0.85));
      return blob || file;
    } catch { return file; }
  }

  $("addForm").addEventListener("submit", async e => {
    e.preventDefault();
    const name = $("pname").value.trim(), price = Number($("pprice").value), file = $("pphoto").files[0];
    if (name.length < 2) { $("addErr").textContent = "Enter the product name."; return; }
    if (!(price >= 0) || $("pprice").value === "") { $("addErr").textContent = "Enter the price in shillings."; return; }
    $("addErr").textContent = "";
    $("addBtn").disabled = true; say("Saving...");
    try {
      let imageUrl = "", imagePath = "";
      if (file) {
        const blob = await prepare(file);
        imagePath = `products/${Date.now()}.jpg`;
        const r = ref(storage, imagePath);
        await uploadBytes(r, blob, { contentType: "image/jpeg" });
        imageUrl = await getDownloadURL(r);
      }
      await addDoc(collection(db, "products"), {
        name, category: $("pcat").value, price, desc: $("pdesc").value.trim(),
        imageUrl, imagePath, featured: $("pfeat").checked, sold: false, createdAt: serverTimestamp()
      });
      $("addForm").reset(); say("Product added.");
    } catch (err) { say("Could not add the product: " + err.message, true); }
    $("addBtn").disabled = false;
  });

  $("importBtn").addEventListener("click", async () => {
    if (items.length && !confirm("You already have products online. Importing adds the starter products again. Continue?")) return;
    try {
      const batch = writeBatch(db);
      PRODUCTS.forEach((p, i) => batch.set(doc(collection(db, "products")), {
        name: p.name, category: p.category, price: p.price, desc: p.desc, icon: p.icon,
        imageUrl: p.image || "", imagePath: "", featured: !!p.featured, sold: !p.inStock,
        createdAt: new Date(Date.now() + i)
      }));
      await batch.commit(); say("Starter products imported.");
    } catch (err) { say("Import failed: " + err.message, true); }
  });
}
