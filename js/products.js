/* =====================================================================
   YARN360 — PRODUCT CATALOGUE
   ---------------------------------------------------------------------
   THIS IS THE FILE YOU EDIT TO ADD / CHANGE PRODUCTS.
   To add a product: copy one { ... } block, paste it, change the values.

   Fields:
     id       - unique number (no two products share the same id)
     name     - product name shown on the card
     category - used by the shop filter buttons: "tops", "dresses",
                "knitwear", "accessories", "bottoms" (add your own too)
     price    - number only, no symbol
     tag      - small badge on the image, e.g. "New", "Bestseller", "" (empty = no badge)
     image    - path to the photo. Put real photos in assets/products/
                and point to them like "assets/products/my-photo.jpg"
     featured - true shows it on the home page "Featured" section
   ===================================================================== */

const CURRENCY = "₹";   // change to "$", "€", "AED" etc.

const PRODUCTS = [
  {
    id: 1,
    name: "Wildflower Linen Shirt",
    category: "tops",
    price: 2399,
    tag: "New",
    image: "assets/products/linen-shirt.svg",
    featured: true,
  },
  {
    id: 2,
    name: "Meadow Cotton Dress",
    category: "Chudi Materials(Unstitched)",
    price: 2399,
    tag: "Bestseller",
    image: "../assets/products/Firstone.jpg",
    featured: true,
  },
  {
    id: 3,
    name: "Moss Knit Sweater",
    category: "Chudi Materials(Unstitched)",
    price: 2499,
    tag: "Sold Out",
    image: "assets/products/knit-sweater.svg",
    featured: true,
  },
{
    id: 4,
    name: "Moss Knit Sweater",
    category: "Chudi Materials(Unstitched)",
    price: 299,
    tag: "New Collections",
    image: "assets/products/knit-sweater.svg",
    featured: true,
  },
];
