const PHONE = "254793961544";
const fmt = n => "KES " + n.toLocaleString("en-KE");
document.getElementById("year").textContent = new Date().getFullYear();

function card(p) {
  const el = document.createElement("article");
  el.className = "card";
  const pic = p.image
    ? `<img src="${esc(p.image)}" alt="${esc(p.name)}">`
    : `<div class="pic" aria-hidden="true">${p.icon}</div>`;
  const msg = encodeURIComponent(`Hello Monique Collections, I am interested in the ${p.name} (${fmt(p.price)}).`);
  el.innerHTML = `${pic}
    <h3>${esc(p.name)}</h3>
    <p class="desc">${esc(p.desc)}</p>
    <p class="price">${fmt(p.price)}</p>
    <p class="stock ${p.inStock ? "in" : "out"}">${p.inStock ? "In stock" : "Sold"}</p>
    ${p.inStock ? `<a class="btn small" href="https://wa.me/${PHONE}?text=${msg}">Order on WhatsApp</a>` : ""}`;
  return el;
}

let catalog = PRODUCTS.slice();
const esc = t => String(t).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

// Home page
function renderHome() {
  const featured = document.getElementById("featured");
  if (!featured) return;
  featured.innerHTML = "";
  catalog.filter(p => p.featured).forEach(p => featured.appendChild(card(p)));
  const cats = document.getElementById("cats");
  if (cats && !cats.children.length) CATEGORIES.forEach(c => {
    const a = document.createElement("a");
    a.className = "cat";
    a.href = "shop.html#" + encodeURIComponent(c.name);
    a.innerHTML = `<span>${c.icon}</span>${c.name}`;
    cats.appendChild(a);
  });
}

// Shop page
let renderShop = () => {};
const list = document.getElementById("products");
if (list) {
  const search = document.getElementById("search");
  const btns = document.getElementById("filterBtns");
  let active = decodeURIComponent(location.hash.slice(1)) || "All";
  if (active !== "All" && !CATEGORIES.some(c => c.name === active)) active = "All";

  ["All", ...CATEGORIES.map(c => c.name)].forEach(name => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = name;
    b.addEventListener("click", () => { active = name; renderShop(); });
    btns.appendChild(b);
  });

  renderShop = function () {
    const q = search.value.trim().toLowerCase();
    const shown = catalog.filter(p =>
      (active === "All" || p.category === active) &&
      (p.name + " " + p.desc).toLowerCase().includes(q));
    list.innerHTML = "";
    shown.forEach(p => list.appendChild(card(p)));
    document.getElementById("count").textContent = shown.length
      ? `Showing ${shown.length} product${shown.length === 1 ? "" : "s"}`
      : "No products match your search. Try a different word or call us on 0793 961 544.";
    btns.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.textContent === active));
  };
  search.addEventListener("input", renderShop);
}

// Called by live.js when products load from Firestore
window.MC = { setProducts(l) { catalog = l; renderHome(); renderShop(); } };
renderHome();
renderShop();

// Contact form: validates, then opens WhatsApp with the message
const form = document.getElementById("enquiry");
if (form) {
  form.addEventListener("submit", e => {
    e.preventDefault();
    const v = id => document.getElementById(id).value.trim();
    const checks = {
      name: v("name").length >= 2 ? "" : "Enter your name.",
      item: v("item").length >= 2 ? "" : "Enter the product you are asking about.",
      msg: v("msg").length >= 5 ? "" : "Write a short message."
    };
    let ok = true;
    for (const k in checks) { document.getElementById(k + "Err").textContent = checks[k]; if (checks[k]) ok = false; }
    if (!ok) return;
    const text = `Hello Monique Collections, my name is ${v("name")}.\nProduct: ${v("item")}\n${v("msg")}`;
    window.open(`https://wa.me/${PHONE}?text=${encodeURIComponent(text)}`, "_blank");
  });
}
