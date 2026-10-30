# 🛍️ ShopSphere — Modern E-Commerce Web Storefront

A responsive shopping website built with vanilla **HTML5**, **CSS3**, and **JavaScript**. Designed with clean UI/UX, smooth micro-interactions, dark/light mode, real-time product filtering, interactive slide-out cart, wishlist, and simulated checkout flow.

---

## ✨ Features

- 🌟 **Dynamic Product Catalog**: 12 curated products across Electronics, Accessories, Footwear, Clothing, and Home & Living with high-resolution imagery and badge indicators (*Sale*, *Bestseller*, *New*).
- 🔍 **Live Search & Category Filtering**: Instant real-time search across product titles, descriptions, and categories, combined with interactive pill filters and sorting (Price, Rating, Name).
- 🛒 **Slide-Out Cart Drawer**:
  - Quantity steppers (`+` / `-`) and item removal
  - Dynamic free shipping calculation & visual progress bar ($50 threshold)
  - Promo coupon engine (`SAVE10` for 10% off, `WELCOME20` for 20% off)
  - Automatic calculation of subtotal, discounts, shipping, and taxes
- 💖 **Wishlist System**: Save favorite items with persistent local storage.
- 👁️ **Quick View Modal**: Inspect detailed product features, specs, and photos before adding to cart.
- 💳 **Checkout & Order Confirmation**: Form validation for shipping info, payment selection (Card, PayPal, COD), and an order confirmation invoice popup with simulated Order ID.
- 🌓 **Dark / Light Theme Toggle**: Seamless persistent theme switching via CSS variables.
- 🔔 **Toast Notification System**: Floating feedback alerts for cart and wishlist interactions.
- 📱 **Fully Responsive**: Optimized for desktops, tablets, and smartphones.

---

## 🚀 Getting Started

### Run Locally
Since this project is built using vanilla web technologies, no build step or package manager is required!

1. Open the folder `portfolio` on your computer.
2. Double-click **`index.html`** to launch it in any web browser (Chrome, Edge, Firefox, Safari).

*Or run with a local lightweight server (optional):*
```bash
# If you have Python installed:
python -m http.server 8000
# Then visit http://localhost:8000
```

---

## 📦 How to Push to GitHub

Follow these steps to upload your shopping website to your GitHub profile:

### Step 1: Create a New Repository on GitHub
1. Go to [github.com](https://github.com) and log in.
2. Click the **`+`** icon in the top-right corner and select **New repository**.
3. Name your repository (e.g., `shopsphere` or `shopping-website`).
4. Keep it **Public** (or Private if you prefer).
5. **Do NOT** check "Initialize this repository with a README" (we already have one).
6. Click **Create repository**.

### Step 2: Push Your Local Repository
Open PowerShell or your terminal in this directory (`c:\Users\user\Desktop\portfolio`) and run:

```bash
# 1. Initialize git (if not already done)
git init -b main

# 2. Add all project files
git add .

# 3. Commit the changes
git commit -m "Initial commit: ShopSphere modern shopping website"

# 4. Link your local project to your GitHub repository
# Replace YOUR_USERNAME and YOUR_REPO_NAME with your GitHub info:
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# 5. Push your code to GitHub
git push -u origin main
```

---

## 🌐 Deploy Free on GitHub Pages

You can host this website online for free using GitHub Pages:

1. Open your repository on **GitHub**.
2. Go to **Settings** > **Pages** (in the left sidebar).
3. Under **Branch**, select `main` branch and `/ (root)` folder.
4. Click **Save**.
5. Within 1-2 minutes, GitHub will generate a live URL:
   `https://<your-username>.github.io/<your-repo-name>/`

---

## 📁 Project Structure

```
├── index.html        # Main HTML layout, modals, drawers & footer
├── style.css         # Modern styling, responsive grid, theme variables
├── products.js       # Product database & details
├── app.js            # Cart logic, filters, modals, checkout, local storage
├── .gitignore        # Files ignored by Git
└── README.md         # Documentation and guide
```

---

## 📄 License
This project is open-source and free to use for personal and portfolio projects.
