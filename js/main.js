/* =====================================================================
   YARN360 — MAIN SCRIPT
   ---------------------------------------------------------------------
   Renders product cards, powers the shop filters, mobile menu, and the
   cart page. You usually won't need to edit this file.
   ===================================================================== */

function money(n) { return CURRENCY + n.toLocaleString("en-IN"); }

/* ---- Build one product card ---- */
function productCard(p) {
  return `
    <article class="card">
      <div class="card__media">
        ${p.tag ? `<span class="card__tag">${p.tag}</span>` : ""}
        <img src="${p.image}" alt="${p.name}" loading="lazy">
        ${p.hoverImage ? `<img src="${p.hoverImage}" alt="${p.name}" loading="lazy" class="card__media-hover">` : ""}
        <button class="card__add" onclick="addToCart(${p.id})">Add to bag</button>
      </div>
      <div class="card__body">
        <div>
          <div class="card__name">${p.name}</div>
          <div class="card__cat">${p.category}</div>
        </div>
        <div class="card__price">${money(p.price)}</div>
      </div>
    </article>`;
}

/* ---- Home page: featured products ---- */
function renderFeatured() {
  const grid = document.getElementById("featured-grid");
  if (!grid) return;
  grid.innerHTML = PRODUCTS.filter(p => p.featured).map(productCard).join("");
}

/* ---- Shop page: full grid + filters ---- */
let activeFilter = "all";
function renderShop() {
  const grid = document.getElementById("shop-grid");
  if (!grid) return;
  const list = activeFilter === "all"
    ? PRODUCTS
    : PRODUCTS.filter(p => p.category === activeFilter);
  grid.innerHTML = list.map(productCard).join("");
}

function buildFilters() {
  const bar = document.getElementById("filter-bar");
  if (!bar) return;
  const cats = ["all", ...new Set(PRODUCTS.map(p => p.category))];
  bar.innerHTML = cats.map(c =>
    `<button class="filter ${c === "all" ? "is-active" : ""}" data-cat="${c}">${c}</button>`
  ).join("");
  bar.querySelectorAll(".filter").forEach(btn => {
    btn.addEventListener("click", () => {
      activeFilter = btn.dataset.cat;
      bar.querySelectorAll(".filter").forEach(b => b.classList.remove("is-active"));
      btn.classList.add("is-active");
      renderShop();
    });
  });
}

/* ---- Cart page ---- */
function renderCartPage() {
  const root = document.getElementById("cart-root");
  if (!root) return;
  const cart = getCart();

  if (cart.length === 0) {
    root.innerHTML = `
      <div class="cart-empty">
        <h2>Your bag is empty</h2>
        <p>Discover pieces made to be worn and loved.</p>
        <a href="shop.html" class="btn btn--solid">Shop the collection</a>
      </div>`;
    return;
  }

  const rows = cart.map(item => {
    const p = PRODUCTS.find(prod => prod.id === item.id);
    if (!p) return "";
    return `
      <div class="cart-item">
        <img src="${p.image}" alt="${p.name}">
        <div>
          <div class="cart-item__name">${p.name}</div>
          <div class="cart-item__cat">${p.category}</div>
          <div class="qty">
            <button onclick="changeQty(${p.id}, -1)" aria-label="Decrease">−</button>
            <span>${item.qty}</span>
            <button onclick="changeQty(${p.id}, 1)" aria-label="Increase">+</button>
          </div>
          <button class="cart-item__remove" onclick="removeFromCart(${p.id})">Remove</button>
        </div>
        <div class="cart-item__price">${money(p.price * item.qty)}</div>
      </div>`;
  }).join("");

  const total = cartTotal();
  const shipping = total > 5000 ? 0 : 99;

  root.innerHTML = `
    <div class="cart-layout">
      <div>${rows}</div>
      <aside class="summary">
        <h3>Order summary</h3>
        <div class="summary__row"><span>Subtotal</span><span>${money(total)}</span></div>
        <div class="summary__row"><span>Shipping</span><span>${shipping === 0 ? "Free" : money(shipping)}</span></div>
        <div class="summary__total"><span>Total</span><span>${money(total + shipping)}</span></div>
        <button class="btn btn--solid" onclick="showToast('Checkout is a demo — connect a payment provider to go live')">Checkout</button>
      </aside>
    </div>`;
}

/* ---- Mobile menu ---- */
function initMenu() {
  const toggle = document.querySelector(".nav__toggle");
  const links = document.querySelector(".nav__links");
  if (toggle && links) {
    toggle.addEventListener("click", () => links.classList.toggle("open"));
  }
}

/* ---- Newsletter (demo) ---- */
function initNewsletter() {
  const form = document.getElementById("newsletter-form");
  if (!form) return;
  const btn = form.querySelector("button");
  btn.addEventListener("click", () => {
    const input = form.querySelector("input");
    if (input.value.includes("@")) {
      showToast("Thanks for subscribing!");
      input.value = "";
    } else {
      showToast("Please enter a valid email");
    }
  });
}

/* ---- Boot everything ---- */
document.addEventListener("DOMContentLoaded", () => {
  renderFeatured();
  buildFilters();
  renderShop();
  renderCartPage();
  updateCartCount();
  initMenu();
  initNewsletter();
  document.getElementById("year") && (document.getElementById("year").textContent = new Date().getFullYear());
});
