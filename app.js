/**
 * SHOPSPHERE - Core Application Logic
 */

document.addEventListener("DOMContentLoaded", () => {
  // ---------------------------------------------------------
  // 1. STATE MANAGEMENT
  // ---------------------------------------------------------
  let state = {
    cart: JSON.parse(localStorage.getItem("shopsphere_cart")) || [],
    wishlist: JSON.parse(localStorage.getItem("shopsphere_wishlist")) || [],
    appliedCoupon: JSON.parse(localStorage.getItem("shopsphere_coupon")) || null,
    category: "all",
    searchQuery: "",
    sortBy: "featured",
    theme: localStorage.getItem("shopsphere_theme") || "light"
  };

  const COUPONS = {
    SAVE10: { code: "SAVE10", discountPercent: 10, minSpend: 0 },
    WELCOME20: { code: "WELCOME20", discountPercent: 20, minSpend: 50 }
  };

  // ---------------------------------------------------------
  // 2. DOM ELEMENTS
  // ---------------------------------------------------------
  const productGrid = document.getElementById("productGrid");
  const emptyState = document.getElementById("emptyState");
  const resultsCount = document.getElementById("resultsCount");
  const searchInput = document.getElementById("searchInput");
  const clearSearchBtn = document.getElementById("clearSearchBtn");
  const categoryPills = document.querySelectorAll("#categoryPills .pill");
  const sortSelect = document.getElementById("sortSelect");
  const resetFiltersBtn = document.getElementById("resetFiltersBtn");

  // Nav & Badges
  const cartBtn = document.getElementById("cartBtn");
  const cartCount = document.getElementById("cartCount");
  const cartDrawerCount = document.getElementById("cartDrawerCount");
  const wishlistBtn = document.getElementById("wishlistBtn");
  const wishlistCount = document.getElementById("wishlistCount");
  const wishlistDrawerCount = document.getElementById("wishlistDrawerCount");
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const mobileMenuBtn = document.getElementById("mobileMenuBtn");
  const navLinks = document.getElementById("navLinks");

  // Drawers & Overlays
  const drawerOverlay = document.getElementById("drawerOverlay");
  const cartDrawer = document.getElementById("cartDrawer");
  const closeCartBtn = document.getElementById("closeCartBtn");
  const cartItemsContainer = document.getElementById("cartItemsContainer");
  const clearCartBtn = document.getElementById("clearCartBtn");
  const couponInput = document.getElementById("couponInput");
  const applyCouponBtn = document.getElementById("applyCouponBtn");
  const couponAppliedBadge = document.getElementById("couponAppliedBadge");
  const removeCouponBtn = document.getElementById("removeCouponBtn");

  // Cart Price Elements
  const cartSubtotal = document.getElementById("cartSubtotal");
  const discountRow = document.getElementById("discountRow");
  const cartDiscount = document.getElementById("cartDiscount");
  const cartShipping = document.getElementById("cartShipping");
  const cartTax = document.getElementById("cartTax");
  const cartTotal = document.getElementById("cartTotal");
  const shippingProgressText = document.getElementById("shippingProgressText");
  const shippingProgressBar = document.getElementById("shippingProgressBar");

  // Wishlist Drawer
  const wishlistDrawer = document.getElementById("wishlistDrawer");
  const closeWishlistBtn = document.getElementById("closeWishlistBtn");
  const wishlistItemsContainer = document.getElementById("wishlistItemsContainer");

  // Modals
  const quickViewModal = document.getElementById("quickViewModal");
  const quickViewContent = document.getElementById("quickViewContent");
  const closeQuickViewBtn = document.getElementById("closeQuickViewBtn");

  const checkoutModal = document.getElementById("checkoutModal");
  const closeCheckoutBtn = document.getElementById("closeCheckoutBtn");
  const checkoutBtn = document.getElementById("checkoutBtn");
  const checkoutForm = document.getElementById("checkoutForm");
  const checkoutItemsPreview = document.getElementById("checkoutItemsPreview");
  const checkoutSubtotal = document.getElementById("checkoutSubtotal");
  const checkoutDiscountRow = document.getElementById("checkoutDiscountRow");
  const checkoutDiscount = document.getElementById("checkoutDiscount");
  const checkoutShipping = document.getElementById("checkoutShipping");
  const checkoutTax = document.getElementById("checkoutTax");
  const checkoutTotal = document.getElementById("checkoutTotal");

  const orderSuccessModal = document.getElementById("orderSuccessModal");
  const successContinueShoppingBtn = document.getElementById("successContinueShoppingBtn");
  const confirmedOrderId = document.getElementById("confirmedOrderId");
  const confirmedEmail = document.getElementById("confirmedEmail");
  const orderRecapBox = document.getElementById("orderRecapBox");

  const toastContainer = document.getElementById("toastContainer");
  const newsletterForm = document.getElementById("newsletterForm");

  // ---------------------------------------------------------
  // 3. INITIALIZATION
  // ---------------------------------------------------------
  applyTheme(state.theme);
  updateCartBadge();
  updateWishlistBadge();
  renderProducts();

  // ---------------------------------------------------------
  // 4. THEME TOGGLE
  // ---------------------------------------------------------
  function applyTheme(theme) {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("shopsphere_theme", theme);
    state.theme = theme;
  }

  themeToggleBtn.addEventListener("click", () => {
    const nextTheme = state.theme === "dark" ? "light" : "dark";
    applyTheme(nextTheme);
    showToast(`Switched to ${nextTheme} mode`, "info");
  });

  // Mobile menu toggle
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener("click", () => {
      navLinks.classList.toggle("active");
    });
  }

  // ---------------------------------------------------------
  // 5. PRODUCT RENDERING & FILTERING
  // ---------------------------------------------------------
  function getFilteredProducts() {
    return PRODUCTS.filter((product) => {
      const matchesCategory =
        state.category === "all" || product.category === state.category;

      const q = state.searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        product.description.toLowerCase().includes(q);

      return matchesCategory && matchesSearch;
    }).sort((a, b) => {
      if (state.sortBy === "price-low") return a.price - b.price;
      if (state.sortBy === "price-high") return b.price - a.price;
      if (state.sortBy === "rating") return b.rating - a.rating;
      if (state.sortBy === "name") return a.name.localeCompare(b.name);
      return a.id - b.id; // Featured default
    });
  }

  function renderProducts() {
    const filtered = getFilteredProducts();

    if (filtered.length === 0) {
      productGrid.innerHTML = "";
      emptyState.style.display = "block";
      resultsCount.textContent = "0 products found";
      return;
    }

    emptyState.style.display = "none";
    resultsCount.textContent = `Showing ${filtered.length} of ${PRODUCTS.length} products`;

    productGrid.innerHTML = filtered
      .map((product) => {
        const isWishlisted = state.wishlist.includes(product.id);
        const badgeClass =
          product.badge?.toLowerCase() === "sale"
            ? "sale"
            : product.badge?.toLowerCase() === "bestseller"
            ? "bestseller"
            : "";

        return `
          <div class="product-card" data-id="${product.id}">
            <div class="card-media">
              ${
                product.badge
                  ? `<span class="product-badge ${badgeClass}">${product.badge}</span>`
                  : ""
              }
              <img
                src="${product.image}"
                alt="${product.name}"
                class="product-thumb"
                loading="lazy"
                onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80';"
              />
              <div class="card-actions-floating">
                <button
                  class="action-circle-btn wishlist-toggle ${isWishlisted ? "wishlist-active" : ""}"
                  data-id="${product.id}"
                  aria-label="Save to Wishlist"
                  title="Wishlist"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
                  </svg>
                </button>
                <button
                  class="action-circle-btn quick-view-btn"
                  data-id="${product.id}"
                  aria-label="Quick View"
                  title="Quick View"
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>
                  </svg>
                </button>
              </div>
            </div>

            <div class="card-body">
              <span class="card-category">${product.category}</span>
              <h3 class="card-title">${product.name}</h3>

              <div class="card-rating">
                <span>★ ${product.rating.toFixed(1)}</span>
                <span class="rating-count">(${product.reviewsCount})</span>
              </div>

              <div class="card-footer">
                <div class="price-group">
                  <span class="current-price">$${product.price.toFixed(2)}</span>
                  ${
                    product.originalPrice
                      ? `<span class="original-price">$${product.originalPrice.toFixed(2)}</span>`
                      : ""
                  }
                </div>
                <button class="add-cart-btn" data-id="${product.id}">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  Add
                </button>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    attachProductCardEvents();
  }

  function attachProductCardEvents() {
    // Add to cart buttons
    document.querySelectorAll(".add-cart-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = parseInt(e.currentTarget.getAttribute("data-id"));
        addToCart(id, 1);
      });
    });

    // Wishlist buttons
    document.querySelectorAll(".wishlist-toggle").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = parseInt(e.currentTarget.getAttribute("data-id"));
        toggleWishlist(id);
      });
    });

    // Quick View buttons
    document.querySelectorAll(".quick-view-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const id = parseInt(e.currentTarget.getAttribute("data-id"));
        openQuickView(id);
      });
    });
  }

  // ---------------------------------------------------------
  // 6. SEARCH & FILTER HANDLERS
  // ---------------------------------------------------------
  searchInput.addEventListener("input", (e) => {
    state.searchQuery = e.target.value;
    if (state.searchQuery.length > 0) {
      clearSearchBtn.classList.add("active");
    } else {
      clearSearchBtn.classList.remove("active");
    }
    renderProducts();
  });

  clearSearchBtn.addEventListener("click", () => {
    searchInput.value = "";
    state.searchQuery = "";
    clearSearchBtn.classList.remove("active");
    renderProducts();
  });

  categoryPills.forEach((pill) => {
    pill.addEventListener("click", () => {
      categoryPills.forEach((p) => p.classList.remove("active"));
      pill.classList.add("active");
      state.category = pill.getAttribute("data-category");
      renderProducts();
    });
  });

  sortSelect.addEventListener("change", (e) => {
    state.sortBy = e.target.value;
    renderProducts();
  });

  resetFiltersBtn.addEventListener("click", () => {
    state.category = "all";
    state.searchQuery = "";
    state.sortBy = "featured";
    searchInput.value = "";
    clearSearchBtn.classList.remove("active");
    categoryPills.forEach((p) => {
      p.classList.toggle("active", p.getAttribute("data-category") === "all");
    });
    sortSelect.value = "featured";
    renderProducts();
  });

  // Footer category links
  document.querySelectorAll("[data-cat]").forEach((link) => {
    link.addEventListener("click", (e) => {
      const cat = e.currentTarget.getAttribute("data-cat");
      state.category = cat;
      categoryPills.forEach((p) => {
        p.classList.toggle("active", p.getAttribute("data-category") === cat);
      });
      renderProducts();
    });
  });

  // ---------------------------------------------------------
  // 7. CART SYSTEM
  // ---------------------------------------------------------
  function saveCart() {
    localStorage.setItem("shopsphere_cart", JSON.stringify(state.cart));
    updateCartBadge();
    renderCartDrawer();
  }

  function updateCartBadge() {
    const totalQty = state.cart.reduce((sum, item) => sum + item.quantity, 0);
    cartCount.textContent = totalQty;
    cartDrawerCount.textContent = `${totalQty} item${totalQty === 1 ? "" : "s"}`;
  }

  function addToCart(productId, qty = 1) {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return;

    const existing = state.cart.find((item) => item.id === productId);
    if (existing) {
      existing.quantity += qty;
    } else {
      state.cart.push({ id: productId, quantity: qty });
    }

    saveCart();
    showToast(`Added "${product.name}" to your cart!`, "success");
    openCartDrawer();
  }

  function updateCartQuantity(productId, newQty) {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    const item = state.cart.find((i) => i.id === productId);
    if (item) {
      item.quantity = newQty;
      saveCart();
    }
  }

  function removeFromCart(productId) {
    const product = PRODUCTS.find((p) => p.id === productId);
    state.cart = state.cart.filter((item) => item.id !== productId);
    saveCart();
    showToast(`Removed "${product ? product.name : "Item"}" from cart`, "warning");
  }

  function clearCart() {
    state.cart = [];
    state.appliedCoupon = null;
    localStorage.removeItem("shopsphere_coupon");
    saveCart();
    showToast("Cart has been cleared", "info");
  }

  function calculateCartTotals() {
    const subtotal = state.cart.reduce((sum, item) => {
      const p = PRODUCTS.find((prod) => prod.id === item.id);
      return sum + (p ? p.price * item.quantity : 0);
    }, 0);

    let discount = 0;
    if (state.appliedCoupon) {
      discount = (subtotal * state.appliedCoupon.discountPercent) / 100;
    }

    const discountedSubtotal = Math.max(0, subtotal - discount);
    const shipping = subtotal === 0 || subtotal >= 50 ? 0 : 9.99;
    const tax = discountedSubtotal * 0.08;
    const total = discountedSubtotal + shipping + tax;

    return { subtotal, discount, shipping, tax, total };
  }

  function renderCartDrawer() {
    if (state.cart.length === 0) {
      cartItemsContainer.innerHTML = `
        <div class="drawer-empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/>
            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>
          </svg>
          <h4>Your cart is empty</h4>
          <p>Looks like you haven't added anything to your cart yet.</p>
          <a href="#shop" class="btn btn-primary btn-sm" onclick="closeAllDrawers()">Browse Shop</a>
        </div>
      `;
      document.getElementById("cartFooter").style.display = "none";
      updateShippingProgress(0);
      return;
    }

    document.getElementById("cartFooter").style.display = "block";

    cartItemsContainer.innerHTML = state.cart
      .map((item) => {
        const prod = PRODUCTS.find((p) => p.id === item.id);
        if (!prod) return "";

        return `
          <div class="cart-item">
            <img src="${prod.image}" alt="${prod.name}" class="cart-item-img" />
            <div class="cart-item-info">
              <h4 class="cart-item-title">${prod.name}</h4>
              <span class="cart-item-price">$${prod.price.toFixed(2)}</span>
              <div class="cart-item-bottom">
                <div class="qty-stepper">
                  <button class="qty-btn" onclick="window.changeCartQty(${prod.id}, ${item.quantity - 1})">-</button>
                  <span class="qty-val">${item.quantity}</span>
                  <button class="qty-btn" onclick="window.changeCartQty(${prod.id}, ${item.quantity + 1})">+</button>
                </div>
                <button class="remove-item-btn" onclick="window.removeCartItem(${prod.id})">
                  ✕ Remove
                </button>
              </div>
            </div>
          </div>
        `;
      })
      .join("");

    const totals = calculateCartTotals();
    cartSubtotal.textContent = `$${totals.subtotal.toFixed(2)}`;

    if (totals.discount > 0) {
      discountRow.style.display = "flex";
      cartDiscount.textContent = `-$${totals.discount.toFixed(2)} (${state.appliedCoupon.code})`;
    } else {
      discountRow.style.display = "none";
    }

    cartShipping.textContent = totals.shipping === 0 ? "FREE" : `$${totals.shipping.toFixed(2)}`;
    cartTax.textContent = `$${totals.tax.toFixed(2)}`;
    cartTotal.textContent = `$${totals.total.toFixed(2)}`;

    updateShippingProgress(totals.subtotal);
    renderCouponBadge();
  }

  function updateShippingProgress(subtotal) {
    const threshold = 50.0;
    if (subtotal >= threshold) {
      shippingProgressText.innerHTML = "🎉 Congratulations! You unlocked <strong>FREE Shipping!</strong>";
      shippingProgressBar.style.width = "100%";
    } else {
      const remaining = (threshold - subtotal).toFixed(2);
      const percentage = Math.min(100, Math.max(0, (subtotal / threshold) * 100));
      shippingProgressText.innerHTML = `Add <strong>$${remaining}</strong> more to qualify for <strong>FREE shipping</strong>!`;
      shippingProgressBar.style.width = `${percentage}%`;
    }
  }

  // Expose helpers to window for inline onclicks
  window.changeCartQty = (id, newQty) => updateCartQuantity(id, newQty);
  window.removeCartItem = (id) => removeFromCart(id);

  // Coupons
  function renderCouponBadge() {
    if (state.appliedCoupon) {
      couponAppliedBadge.style.display = "flex";
      couponAppliedBadge.querySelector("span").textContent = `Coupon "${state.appliedCoupon.code}" applied (-${state.appliedCoupon.discountPercent}%)`;
    } else {
      couponAppliedBadge.style.display = "none";
    }
  }

  applyCouponBtn.addEventListener("click", () => {
    const code = couponInput.value.trim().toUpperCase();
    if (!code) return;

    if (COUPONS[code]) {
      const coupon = COUPONS[code];
      const totals = calculateCartTotals();
      if (totals.subtotal < coupon.minSpend) {
        showToast(`Minimum order of $${coupon.minSpend} required for this code`, "warning");
        return;
      }
      state.appliedCoupon = coupon;
      localStorage.setItem("shopsphere_coupon", JSON.stringify(coupon));
      couponInput.value = "";
      renderCartDrawer();
      showToast(`Promo "${code}" applied! You save ${coupon.discountPercent}%`, "success");
    } else {
      showToast("Invalid promo code. Try SAVE10 or WELCOME20", "warning");
    }
  });

  removeCouponBtn.addEventListener("click", () => {
    state.appliedCoupon = null;
    localStorage.removeItem("shopsphere_coupon");
    renderCartDrawer();
    showToast("Promo code removed", "info");
  });

  clearCartBtn.addEventListener("click", clearCart);

  // ---------------------------------------------------------
  // 8. WISHLIST SYSTEM
  // ---------------------------------------------------------
  function saveWishlist() {
    localStorage.setItem("shopsphere_wishlist", JSON.stringify(state.wishlist));
    updateWishlistBadge();
    renderProducts();
  }

  function updateWishlistBadge() {
    const count = state.wishlist.length;
    wishlistCount.textContent = count;
    wishlistDrawerCount.textContent = `${count} item${count === 1 ? "" : "s"}`;
  }

  function toggleWishlist(productId) {
    const product = PRODUCTS.find((p) => p.id === productId);
    const index = state.wishlist.indexOf(productId);

    if (index > -1) {
      state.wishlist.splice(index, 1);
      showToast(`Removed "${product ? product.name : "Item"}" from wishlist`, "info");
    } else {
      state.wishlist.push(productId);
      showToast(`Saved "${product ? product.name : "Item"}" to wishlist!`, "success");
    }
    saveWishlist();
  }

  function renderWishlistDrawer() {
    if (state.wishlist.length === 0) {
      wishlistItemsContainer.innerHTML = `
        <div class="drawer-empty-state">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
          </svg>
          <h4>Your wishlist is empty</h4>
          <p>Click the heart icon on any product to save it for later.</p>
          <a href="#shop" class="btn btn-primary btn-sm" onclick="closeAllDrawers()">Browse Shop</a>
        </div>
      `;
      return;
    }

    wishlistItemsContainer.innerHTML = state.wishlist
      .map((id) => {
        const prod = PRODUCTS.find((p) => p.id === id);
        if (!prod) return "";

        return `
          <div class="cart-item">
            <img src="${prod.image}" alt="${prod.name}" class="cart-item-img" />
            <div class="cart-item-info">
              <h4 class="cart-item-title">${prod.name}</h4>
              <span class="cart-item-price">$${prod.price.toFixed(2)}</span>
              <div class="cart-item-bottom">
                <button class="btn btn-primary btn-sm" onclick="window.moveToCartFromWishlist(${prod.id})">
                  Move to Cart
                </button>
                <button class="remove-item-btn" onclick="window.removeFromWishlist(${prod.id})">
                  ✕ Remove
                </button>
              </div>
            </div>
          </div>
        `;
      })
      .join("");
  }

  window.removeFromWishlist = (id) => toggleWishlist(id);
  window.moveToCartFromWishlist = (id) => {
    addToCart(id, 1);
    toggleWishlist(id);
    renderWishlistDrawer();
  };

  // ---------------------------------------------------------
  // 9. QUICK VIEW MODAL
  // ---------------------------------------------------------
  function openQuickView(productId) {
    const product = PRODUCTS.find((p) => p.id === productId);
    if (!product) return;

    quickViewContent.innerHTML = `
      <div class="quick-view-grid">
        <img src="${product.image}" alt="${product.name}" class="quick-view-img" />
        <div class="quick-view-details">
          <span class="card-category">${product.category}</span>
          <h2 class="quick-view-title">${product.name}</h2>
          <div class="card-rating mb-2">
            <span>★ ${product.rating.toFixed(1)}</span>
            <span class="rating-count">(${product.reviewsCount} customer reviews)</span>
          </div>
          <div class="quick-view-price">$${product.price.toFixed(2)}</div>
          <p class="quick-view-desc">${product.description}</p>
          <ul class="quick-view-features">
            ${product.features.map((f) => `<li>${f}</li>`).join("")}
          </ul>
          <div style="display: flex; gap: 0.75rem; margin-top: auto;">
            <button class="btn btn-primary btn-block" onclick="window.quickAddToCart(${product.id})">
              Add to Cart
            </button>
            <button class="action-circle-btn" onclick="window.toggleWishlist(${product.id})" title="Wishlist">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    `;

    quickViewModal.classList.add("active");
  }

  window.quickAddToCart = (id) => {
    addToCart(id, 1);
    quickViewModal.classList.remove("active");
  };

  closeQuickViewBtn.addEventListener("click", () => {
    quickViewModal.classList.remove("active");
  });

  // ---------------------------------------------------------
  // 10. CHECKOUT & ORDER CONFIRMATION
  // ---------------------------------------------------------
  checkoutBtn.addEventListener("click", () => {
    if (state.cart.length === 0) {
      showToast("Your cart is empty!", "warning");
      return;
    }
    closeAllDrawers();
    openCheckoutModal();
  });

  function openCheckoutModal() {
    const totals = calculateCartTotals();

    checkoutItemsPreview.innerHTML = state.cart
      .map((item) => {
        const p = PRODUCTS.find((prod) => prod.id === item.id);
        if (!p) return "";
        return `
          <div class="checkout-mini-item">
            <span class="checkout-mini-item-name">${item.quantity}x ${p.name}</span>
            <span>$${(p.price * item.quantity).toFixed(2)}</span>
          </div>
        `;
      })
      .join("");

    checkoutSubtotal.textContent = `$${totals.subtotal.toFixed(2)}`;
    if (totals.discount > 0) {
      checkoutDiscountRow.style.display = "flex";
      checkoutDiscount.textContent = `-$${totals.discount.toFixed(2)}`;
    } else {
      checkoutDiscountRow.style.display = "none";
    }

    checkoutShipping.textContent = totals.shipping === 0 ? "FREE" : `$${totals.shipping.toFixed(2)}`;
    checkoutTax.textContent = `$${totals.tax.toFixed(2)}`;
    checkoutTotal.textContent = `$${totals.total.toFixed(2)}`;

    checkoutModal.classList.add("active");
  }

  closeCheckoutBtn.addEventListener("click", () => {
    checkoutModal.classList.remove("active");
  });

  checkoutForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const placeOrderBtn = document.getElementById("placeOrderBtn");
    const btnText = placeOrderBtn.querySelector(".btn-text");
    const btnSpinner = placeOrderBtn.querySelector(".btn-spinner");

    // Show simulated loading
    btnText.style.display = "none";
    btnSpinner.style.display = "inline-block";
    placeOrderBtn.disabled = true;

    setTimeout(() => {
      // Complete Order
      btnText.style.display = "inline";
      btnSpinner.style.display = "none";
      placeOrderBtn.disabled = false;
      checkoutModal.classList.remove("active");

      // Generate simulated order confirmation details
      const randomOrderId = "#ORD-" + Math.floor(100000 + Math.random() * 900000);
      const email = document.getElementById("checkoutEmail").value;
      const firstName = document.getElementById("checkoutFirstName").value;
      const totals = calculateCartTotals();

      confirmedOrderId.textContent = randomOrderId;
      confirmedEmail.textContent = email;

      orderRecapBox.innerHTML = `
        <p><strong>Customer:</strong> ${firstName}</p>
        <p><strong>Total Charged:</strong> $${totals.total.toFixed(2)}</p>
        <p><strong>Items:</strong> ${state.cart.reduce((sum, i) => sum + i.quantity, 0)} items</p>
        <p><strong>Estimated Delivery:</strong> 2 - 4 Business Days (Tracked Priority)</p>
      `;

      orderSuccessModal.classList.add("active");

      // Reset cart
      state.cart = [];
      state.appliedCoupon = null;
      localStorage.removeItem("shopsphere_coupon");
      saveCart();
    }, 1200);
  });

  successContinueShoppingBtn.addEventListener("click", () => {
    orderSuccessModal.classList.remove("active");
  });

  // Newsletter handler
  if (newsletterForm) {
    newsletterForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const emailInput = document.getElementById("newsletterEmail");
      showToast(`Subscribed! Use code WELCOME20 for 20% off.`, "success");
      emailInput.value = "";
    });
  }

  // ---------------------------------------------------------
  // 11. DRAWER TOGGLES & HELPERS
  // ---------------------------------------------------------
  function openCartDrawer() {
    closeAllDrawers();
    renderCartDrawer();
    cartDrawer.classList.add("active");
    drawerOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function openWishlistDrawer() {
    closeAllDrawers();
    renderWishlistDrawer();
    wishlistDrawer.classList.add("active");
    drawerOverlay.classList.add("active");
    document.body.style.overflow = "hidden";
  }

  function closeAllDrawers() {
    cartDrawer.classList.remove("active");
    wishlistDrawer.classList.remove("active");
    drawerOverlay.classList.remove("active");
    document.body.style.overflow = "";
  }

  window.closeAllDrawers = closeAllDrawers;
  cartBtn.addEventListener("click", openCartDrawer);
  closeCartBtn.addEventListener("click", closeAllDrawers);
  wishlistBtn.addEventListener("click", openWishlistDrawer);
  closeWishlistBtn.addEventListener("click", closeAllDrawers);
  drawerOverlay.addEventListener("click", closeAllDrawers);

  // Close modals on clicking overlay background
  [quickViewModal, checkoutModal, orderSuccessModal].forEach((modal) => {
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        modal.classList.remove("active");
      }
    });
  });

  // ---------------------------------------------------------
  // 12. TOAST NOTIFICATIONS
  // ---------------------------------------------------------
  function showToast(message, type = "info") {
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;

    const icon =
      type === "success" ? "✓" : type === "warning" ? "⚠️" : "ℹ️";

    toast.innerHTML = `<span>${icon}</span><span>${message}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.remove();
    }, 3500);
  }
});
