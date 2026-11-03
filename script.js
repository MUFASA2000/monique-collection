const PHONE = "254714489239";
const fmt = n => "KES " + n.toLocaleString("en-KE");
document.getElementById("year").textContent = new Date().getFullYear();

function card(p) {
  const el = document.createElement("article");
  el.className = "card";
  if (p.image) {
    const image = document.createElement("img");
    image.src = p.image;
    image.alt = p.name;
    el.appendChild(image);
  } else {
    const pic = document.createElement("div");
    pic.className = "pic";
    pic.setAttribute("aria-hidden", "true");
    pic.textContent = p.icon || "📦";
    el.appendChild(pic);
  }
  const msg = encodeURIComponent(`Hello Monique Collections, I am interested in the ${p.name} (${fmt(p.price)}).`);
  const title = document.createElement("h3");
  title.textContent = p.name;
  const description = document.createElement("p");
  description.className = "desc";
  description.textContent = p.desc;
  const price = document.createElement("p");
  price.className = "price";
  price.textContent = fmt(p.price);
  const stock = document.createElement("p");
  stock.className = `stock ${p.inStock ? "in" : "out"}`;
  stock.textContent = p.inStock ? "Available" : "Sold";
  const order = document.createElement("a");
  order.className = "btn small";
  order.href = `https://wa.me/${PHONE}?text=${msg}`;
  order.textContent = "Order on WhatsApp";
  el.append(title, description, price, stock, order);
  return el;
}

// Home page
const featured = document.getElementById("featured");
if (featured) {
  PRODUCTS.filter(p => p.featured).forEach(p => featured.appendChild(card(p)));
  const cats = document.getElementById("cats");
  CATEGORIES.forEach(c => {
    const a = document.createElement("a");
    a.className = "cat";
    a.href = "shop.html#" + encodeURIComponent(c.name);
    a.innerHTML = `<span>${c.icon}</span>${c.name}`;
    cats.appendChild(a);
  });
}

// Shop page
const list = document.getElementById("products");
if (list) {
  const search = document.getElementById("search");
  const btns = document.getElementById("filterBtns");
  let shopProducts = [...PRODUCTS];
  let active = decodeURIComponent(location.hash.slice(1)) || "All";
  if (active !== "All" && !CATEGORIES.some(c => c.name === active)) active = "All";

  ["All", ...CATEGORIES.map(c => c.name)].forEach(name => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = name;
    b.addEventListener("click", () => { active = name; render(); });
    btns.appendChild(b);
  });

  function render() {
    const q = search.value.trim().toLowerCase();
    const shown = shopProducts.filter(p =>
      (active === "All" || p.category === active) &&
      (p.name + " " + p.desc).toLowerCase().includes(q));
    list.innerHTML = "";
    shown.forEach(p => list.appendChild(card(p)));
    document.getElementById("count").textContent = shown.length
      ? `Showing ${shown.length} product${shown.length === 1 ? "" : "s"}`
      : "No products match your search. Try a different word or call us on 0714 489 239.";
    btns.querySelectorAll("button").forEach(b => b.classList.toggle("on", b.textContent === active));
  }
  search.addEventListener("input", render);
  window.setRemoteProducts = (remoteProducts, useRemoteCatalog = false) => {
    shopProducts = useRemoteCatalog ? remoteProducts : [...PRODUCTS, ...remoteProducts];
    render();
  };
  render();
}

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
