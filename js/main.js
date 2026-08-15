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
        <img src="${p.image}" alt="${p.name}" loading="lazy" onclick="openQuickView(${p.id})">
        ${p.hoverImage ? `<img src="${p.hoverImage}" alt="${p.name}" loading="lazy" class="card__media-hover" onclick="openQuickView(${p.id})">` : ""}
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

/* ---- Quick view popup (click a product photo) ---- */
function openQuickView(id) {
  const p = PRODUCTS.find(prod => prod.id === id);
  if (!p) return;

  let modal = document.querySelector(".quick-view");
  if (!modal) {
    modal = document.createElement("div");
    modal.className = "quick-view";
    document.body.appendChild(modal);
  }

  const description = p.description ? `<p class="quick-view__desc">${p.description}</p>` : "";

  const accordionSections = [
    p.highlights && p.highlights.length
      ? { title: "Product Highlights", open: true, body: `<ul class="quick-view__highlights">${p.highlights.map(h => `<li>${h}</li>`).join("")}</ul>` }
      : null,
    { title: "Wash Care Instructions", open: false, body: `<p>${STORE_POLICIES.washCare}</p>` },
    { title: "Shipping Timelines", open: false, body: `<p>${STORE_POLICIES.shipping}</p>` },
    { title: "Exchange / Return Policy", open: false, body: `<p>${STORE_POLICIES.exchangeReturn}</p>` },
    { title: "Disclaimer", open: false, body: `<p>${STORE_POLICIES.disclaimer}</p>` },
  ].filter(Boolean);

  const accordion = `
    <div class="accordion">
      ${accordionSections.map(s => `
        <div class="accordion-item ${s.open ? "is-open" : ""}">
          <button class="accordion-item__header" onclick="toggleAccordion(this)">
            <span>${s.title}</span>
            <span class="accordion-item__icon">▾</span>
          </button>
          <div class="accordion-item__body">${s.body}</div>
        </div>`).join("")}
    </div>`;

  const images = (p.images && p.images.length ? p.images : [p.image, p.hoverImage]).filter(Boolean);
  const thumbs = images.length > 1
    ? `<div class="quick-view__thumbs">
        ${images.map((src, i) => `<img src="${src}" alt="${p.name} view ${i + 1}" class="quick-view__thumb ${i === 0 ? "is-active" : ""}" onclick="setQuickViewImage(this, '${src}')">`).join("")}
      </div>`
    : "";

  modal.innerHTML = `
    <div class="quick-view__backdrop" onclick="closeQuickView()"></div>
    <div class="quick-view__panel" role="dialog" aria-modal="true" aria-label="${p.name}">
      <button class="quick-view__close" onclick="closeQuickView()" aria-label="Close">&times;</button>
      <div class="quick-view__media">
        ${thumbs}
        <div class="quick-view__main">
          <img src="${p.image}" alt="${p.name}" class="quick-view__main-img" onclick="openImageZoom(this)">
          <span class="quick-view__zoom-hint">Click to zoom</span>
        </div>
      </div>
      <div class="quick-view__info">
        <div class="card__cat">${p.category || ""}</div>
        <h2 class="quick-view__name">${p.name}</h2>
        <div class="quick-view__price">${money(p.price)}</div>
        ${description}
        ${accordion}
        <button class="btn btn--solid quick-view__add" onclick="addToCart(${p.id})">Add to bag</button>
      </div>
    </div>`;

  modal.classList.add("is-open");
  document.body.classList.add("no-scroll");
}

function toggleAccordion(header) {
  header.parentElement.classList.toggle("is-open");
}

function setQuickViewImage(thumb, src) {
  const media = thumb.closest(".quick-view__media");
  media.querySelector(".quick-view__main-img").src = src;
  media.querySelectorAll(".quick-view__thumb").forEach(t => t.classList.remove("is-active"));
  thumb.classList.add("is-active");
}

function closeQuickView() {
  const modal = document.querySelector(".quick-view");
  if (modal) modal.classList.remove("is-open");
  document.body.classList.remove("no-scroll");
}

/* ---- Full-screen zoom (magnify a quick-view photo) ---- */
function openImageZoom(img) {
  let lightbox = document.querySelector(".zoom-lightbox");
  if (!lightbox) {
    lightbox = document.createElement("div");
    lightbox.className = "zoom-lightbox";
    document.body.appendChild(lightbox);
  }

  lightbox.innerHTML = `
    <div class="zoom-lightbox__backdrop" onclick="closeImageZoom()"></div>
    <button class="zoom-lightbox__close" onclick="closeImageZoom()" aria-label="Close">&times;</button>
    <span class="zoom-lightbox__hint">Tap to zoom · scroll or drag to move around</span>
    <img src="${img.src}" alt="${img.alt}" class="zoom-lightbox__img" draggable="false" ondragstart="return false">`;

  lightbox.classList.add("is-open");
  document.body.classList.add("no-scroll");

  const zimg = lightbox.querySelector(".zoom-lightbox__img");
  const MIN_SCALE = 1;   // never zoom out past the photo's normal size
  const MAX_SCALE = 6;   // allow a closer zoom for fine embroidery detail
  let scale = 1, posX = 0, posY = 0;
  let dragging = false, moved = false, startX = 0, startY = 0;

  const clampPos = () => {
    const maxX = (zimg.offsetWidth * (scale - 1)) / 2;
    const maxY = (zimg.offsetHeight * (scale - 1)) / 2;
    posX = Math.min(maxX, Math.max(-maxX, posX));
    posY = Math.min(maxY, Math.max(-maxY, posY));
  };

  const applyTransform = () => {
    clampPos();
    zimg.style.transform = `translate(${posX}px, ${posY}px) scale(${scale})`;
    zimg.style.cursor = scale > 1 ? (dragging ? "grabbing" : "grab") : "zoom-in";
  };

  zimg.addEventListener("wheel", e => {
    e.preventDefault();
    if (e.ctrlKey) {
      // trackpad pinch gesture — always zoom
      scale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, scale - e.deltaY * 0.01));
      if (scale === MIN_SCALE) { posX = 0; posY = 0; }
    } else if (scale > MIN_SCALE) {
      // already zoomed in — scroll pans around the photo
      posX -= e.deltaX;
      posY -= e.deltaY;
    } else if (e.deltaY < 0) {
      // scrolling up from 1x — zoom in
      scale = 2.5;
    }
    applyTransform();
  }, { passive: false });

  zimg.addEventListener("click", () => {
    if (moved) { moved = false; return; }
    // tap cycles through zoom levels: normal → zoomed in → max detail → normal
    if (scale < 2.5) scale = 2.5;
    else if (scale < MAX_SCALE) scale = MAX_SCALE;
    else scale = MIN_SCALE;
    if (scale === MIN_SCALE) { posX = 0; posY = 0; }
    applyTransform();
  });

  zimg.addEventListener("pointerdown", e => {
    if (scale <= MIN_SCALE) return;
    dragging = true;
    moved = false;
    startX = e.clientX - posX;
    startY = e.clientY - posY;
    zimg.classList.add("is-dragging");
    zimg.setPointerCapture(e.pointerId);
    applyTransform();
  });
  zimg.addEventListener("pointermove", e => {
    if (!dragging) return;
    moved = true;
    posX = e.clientX - startX;
    posY = e.clientY - startY;
    applyTransform();
  });
  const endDrag = () => { dragging = false; zimg.classList.remove("is-dragging"); applyTransform(); };
  zimg.addEventListener("pointerup", endDrag);
  zimg.addEventListener("pointercancel", endDrag);

  applyTransform();
}

function closeImageZoom() {
  const lightbox = document.querySelector(".zoom-lightbox");
  if (lightbox) lightbox.classList.remove("is-open");
  document.body.classList.remove("no-scroll");
}

document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  closeImageZoom();
  closeQuickView();
});

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
        <a href="checkout.html" class="btn btn--solid">Checkout</a>
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
