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
     hoverImage - optional second photo shown when the shopper hovers the card
     featured - true shows it on the home page "Featured" section
     description - optional paragraph shown in the quick-view popup
     highlights - optional array of bullet points shown in the quick-view popup
   ===================================================================== */

const CURRENCY = "₹";   // change to "$", "€", "AED" etc.

const PRODUCTS = [
  {
    id: 3,
    name: "Sage Gold Aari Suit",
    category: "Salwar Materials",
    price: 2399,
    tag: "New Collections",
    image: "assets/GS-1.PNG",
    hoverImage: "assets/GS-2.PNG",
    description: "Elevate your festive wardrobe with this Luxury Sea Green Organza Tissue Silk Unstitched Salwar Kameez Suit — a graceful blend of elegance, intricate craftsmanship and royal detailing.",
    highlights: [
      "Premium Organza Tissue Silk",
      "Heavy Zari & Thread Embroidery",
      "Floral Vine & Booti Detailing",
      "Heavy Sequin & Embroidered Border",
      "Matching Designer Organza Dupatta",
      "Luxury Unstitched Salwar Suit",
      "Perfect for Weddings, Eid & Festive Occasions",
    ],
    featured: true,
  },
  {
    id: 4,
    name: "Dove Grey Meadow Suit",
    category: "Salwar Materials",
    price: 2499,
    tag: "New Collections",
    image: "assets/knit-sweater.jpg",
    featured: true,
  },
  {
    id: 1,
    name: "Lilac Chiffon Aari Suit",
    category: "Salwar Materials",
    price: 2500,
    tag: "Sold Out",
    image: "assets/linen-shirt.jpg",
    featured: true,
  },
  {
    id: 2,
    name: "Dusty Mauve Aari Suit",
    category: "Salwar Materials",
    price: 2399,
    tag: "Sold Out",
    image: "assets/Firstone.jpg",
    featured: true,
  },

];
