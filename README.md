# YARN360 — Online Clothing Store

A premium, fully responsive storefront built with plain HTML, CSS and JavaScript.
No build tools, no frameworks — it runs anywhere, including free GitHub Pages hosting.
Colors and styling are taken directly from your logo (forest green `#334D2A` on peach `#FFDEC3`).

---

## Folder structure (open this whole folder in VS Code)

```
yarn360/
├── index.html          ← Home page
├── shop.html           ← Full product grid + category filters
├── cart.html           ← Shopping bag
├── about.html          ← Our Story page
│
├── css/
│   └── style.css       ← ALL styling. Colors/fonts are at the very top (:root)
│
├── js/
│   ├── products.js     ← ★ EDIT THIS to add / change products
│   ├── cart.js         ← Cart logic (saves to the browser). Rarely needs editing
│   └── main.js         ← Renders the pages. Rarely needs editing
│
├── assets/
│   ├── logo.jpg        ← Your logo
│   └── products/       ← Product images (swap the .svg placeholders for real photos)
│
└── README.md           ← This file
```

---

## How to open and edit in VS Code

1. Install **VS Code** (free) from https://code.visualstudio.com
2. `File → Open Folder…` and choose the `yarn360` folder.
3. (Recommended) Install the **Live Server** extension. Then right-click `index.html`
   → **Open with Live Server**. Your site opens in the browser and refreshes
   automatically every time you save. This is the easiest way to preview changes.

### The 3 things you'll actually change

**1. Add or edit products** → open `js/products.js`
Copy one `{ ... }` block, paste it below, and change the values (name, price, category, image).
Give each product a unique `id`.

**2. Use real product photos** → drop your `.jpg`/`.png` files into `assets/products/`,
then in `products.js` point to them, e.g. `image: "assets/products/blue-shirt.jpg"`.

**3. Change colors or fonts** → open `css/style.css`. Everything is in the `:root` block
at the top. Change a value once and it updates the whole site.

Change the currency in `js/products.js` (`const CURRENCY = "₹";`).

---

## What is GitHub Pages?

**GitHub Pages is a free web hosting service built into GitHub.** If your site is made of
plain files like this one (HTML/CSS/JS — a "static" site), GitHub can serve it to the world
at a free web address, with no server to manage and no monthly cost.

- You put your project files in a GitHub **repository** (a project folder in the cloud).
- You flip on the **Pages** setting.
- GitHub gives you a public URL like `https://yourusername.github.io/yarn360/`.
- Every time you push an update, the live site updates automatically.

It's perfect for a store front-end like this one. (Note: GitHub Pages only serves files —
for real card payments later you'd add a checkout provider such as Razorpay, Stripe, or
Shopify Buy Buttons. The current Checkout button is a demo.)

---

## Put it on GitHub + go live (step by step)

### Option A — the easy way (upload in the browser, no commands)

1. Create a free account at https://github.com
2. Click **New repository**. Name it `yarn360`, set it **Public**, click **Create**.
3. On the repo page click **uploading an existing file**.
4. Drag **everything inside** the `yarn360` folder (index.html, the css/js/assets folders, etc.)
   into the upload box. Click **Commit changes**.
5. Go to **Settings → Pages**.
6. Under **Branch**, choose `main` and folder `/ (root)`, then **Save**.
7. Wait about a minute, refresh. GitHub shows your live link:
   `https://YOURNAME.github.io/yarn360/` 🎉

### Option B — using Git (recommended once you're comfortable)

Run these in the `yarn360` folder (VS Code has a built-in Terminal: `Terminal → New Terminal`):

```bash
git init
git add .
git commit -m "Initial YARN360 store"
git branch -M main
git remote add origin https://github.com/YOURNAME/yarn360.git
git push -u origin main
```

Then turn on **Settings → Pages → Branch: main → Save**, same as above.

To publish future changes, just:

```bash
git add .
git commit -m "Updated products"
git push
```

---

## Notes

- The cart uses your browser's local storage, so items stay in the bag between visits.
- Fonts (Fraunces + Jost) load from Google Fonts — they need an internet connection to appear.
- The site is responsive and works on phones, tablets and desktops.
```
