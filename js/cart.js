/* =====================================================================
   YARN360 — CART LOGIC
   ---------------------------------------------------------------------
   A simple cart that remembers items in the browser (localStorage).
   No backend needed. Works on GitHub Pages.
   You usually won't need to edit this file.
   ===================================================================== */

const CART_KEY = "yarn360_cart";

// ⚠️ TEMPORARY: pointed at a local test server for verification.
// After deploying cf-worker/ (see cf-worker/wrangler.toml), replace this
// with your Worker's actual URL, e.g. "https://yarn360-whatsapp.you.workers.dev"
const WHATSAPP_WORKER_URL = "http://127.0.0.1:8787";

/* Notifies the store owner on WhatsApp that a new order came in.
   Fire-and-forget: checkout still completes even if this fails, since the
   Worker may not be deployed yet or the customer may be offline. */
function notifyOrderOnWhatsApp() {
  const cart = getCart();
  const items = cart.map(item => {
    const p = PRODUCTS.find(prod => prod.id === item.id);
    return p ? { name: p.name, qty: item.qty, price: p.price } : null;
  }).filter(Boolean);

  fetch(`${WHATSAPP_WORKER_URL}/notify-order`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ items, total: cartTotal() }),
  }).catch(err => console.warn("WhatsApp order notification failed:", err));
}

function getCart() {
  try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; }
  catch { return []; }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

function addToCart(productId) {
  const cart = getCart();
  const existing = cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ id: productId, qty: 1 });
  }
  saveCart(cart);
  const product = PRODUCTS.find(p => p.id === productId);
  showToast(`${product ? product.name : "Item"} added to bag`);
}

function changeQty(productId, delta) {
  const cart = getCart();
  const item = cart.find(i => i.id === productId);
  if (!item) return;
  item.qty += delta;
  const updated = cart.filter(i => i.qty > 0);
  saveCart(updated);
  renderCartPage();
}

function removeFromCart(productId) {
  saveCart(getCart().filter(i => i.id !== productId));
  renderCartPage();
}

function cartCount() {
  return getCart().reduce((sum, i) => sum + i.qty, 0);
}

function cartTotal() {
  return getCart().reduce((sum, i) => {
    const p = PRODUCTS.find(prod => prod.id === i.id);
    return sum + (p ? p.price * i.qty : 0);
  }, 0);
}

function updateCartCount() {
  document.querySelectorAll(".js-cart-count").forEach(el => {
    el.textContent = cartCount();
  });
}

function checkout() {
  notifyOrderOnWhatsApp();
  showToast("Checkout is a demo — connect a payment provider to go live");
}

/* ---- Toast notification ---- */
function showToast(message) {
  let toast = document.querySelector(".toast");
  if (!toast) {
    toast = document.createElement("div");
    toast.className = "toast";
    document.body.appendChild(toast);
  }
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => toast.classList.remove("show"), 2200);
}
