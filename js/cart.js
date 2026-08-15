/* =====================================================================
   YARN360 — CART LOGIC
   ---------------------------------------------------------------------
   A simple cart that remembers items in the browser (localStorage).
   No backend needed. Works on GitHub Pages.
   You usually won't need to edit this file.
   ===================================================================== */

const CART_KEY = "yarn360_cart";

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
