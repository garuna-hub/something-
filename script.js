const products = [
  {
    id: 1,
    name: "Redline Runner",
    category: "Running",
    price: 3499,
    badge: "BESTSELLER",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 2,
    name: "Cloud Nine Classic",
    category: "Classic",
    price: 2799,
    badge: "EVERYDAY",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 3,
    name: "Street Phantom",
    category: "Street",
    price: 4299,
    badge: "NEW DROP",
    rating: "4.9",
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 4,
    name: "Pure Motion",
    category: "Running",
    price: 3199,
    badge: "",
    rating: "4.7",
    image: "https://images.unsplash.com/photo-1460353581641-37baddab0fa2?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 5,
    name: "Urban Legend",
    category: "Street",
    price: 3899,
    badge: "TRENDING",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 6,
    name: "Off-Duty White",
    category: "Classic",
    price: 2499,
    badge: "",
    rating: "4.6",
    image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 7,
    name: "Velocity X",
    category: "Running",
    price: 4999,
    badge: "PREMIUM",
    rating: "5.0",
    image: "https://images.unsplash.com/photo-1556906781-9a412961c28c?auto=format&fit=crop&w=700&q=80"
  },
  {
    id: 8,
    name: "Midnight Rebel",
    category: "Street",
    price: 3699,
    badge: "FAN FAVOURITE",
    rating: "4.8",
    image: "https://images.unsplash.com/photo-1465453869711-7e174808ace9?auto=format&fit=crop&w=700&q=80"
  }
];

const $ = (selector) => document.querySelector(selector);

const productGrid = $("#productGrid");
const searchInput = $("#searchInput");
const sortSelect = $("#sortSelect");
const emptyState = $("#emptyState");

let activeCategory = "All";
let searchTerm = "";
let sortMode = "featured";
let cart = readStorage("sole-cart", []);
let wishlist = readStorage("sole-wishlist", []);
let toastTimer;

function readStorage(key, fallback) {
  try {
    const value = JSON.parse(localStorage.getItem(key));
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

function saveStorage(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Website still works if browser storage is unavailable.
  }
}

function money(amount) {
  return "₹" + amount.toLocaleString("en-IN");
}

function escapeHTML(value) {
  return String(value).replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#39;"
  })[character]);
}

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toast.classList.remove("show");
  }, 2400);
}

function renderProducts() {
  let filtered = products.filter((product) => {
    const matchesCategory =
      activeCategory === "All" ||
      product.category === activeCategory;

    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm) ||
      product.category.toLowerCase().includes(searchTerm);

    return matchesCategory && matchesSearch;
  });

  if (sortMode === "low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (sortMode === "high") {
    filtered.sort((a, b) => b.price - a.price);
  }

  emptyState.hidden = filtered.length > 0;

  productGrid.innerHTML = filtered.map((product, index) => {
    const liked = wishlist.includes(product.id);

    return `
      <article class="product-card" style="animation-delay:${index * 65}ms">
        <div class="product-image">
          <img
            src="${product.image}"
            alt="${escapeHTML(product.name)} sneakers"
            loading="lazy"
          >

          ${product.badge
            ? `<span class="product-badge">${escapeHTML(product.badge)}</span>`
            : ""}

          <button
            class="wish-btn ${liked ? "liked" : ""}"
            data-wish="${product.id}"
            aria-label="${liked ? "Remove from wishlist" : "Add to wishlist"}"
            aria-pressed="${liked}"
          >${liked ? "♥" : "♡"}</button>

          <button class="quick-add" data-add="${product.id}">
            + ADD TO BAG
          </button>
        </div>

        <div class="product-info">
          <span class="product-category">${escapeHTML(product.category)}</span>
          <h3>${escapeHTML(product.name)}</h3>
          <div class="product-bottom">
            <span class="product-price">${money(product.price)}</span>
            <span class="product-rating">★ ${product.rating}</span>
          </div>
        </div>
      </article>
    `;
  }).join("");
}

function addToCart(id) {
  const existing = cart.find((item) => item.id === id);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({ id, quantity: 1 });
  }

  saveStorage("sole-cart", cart);
  renderCart();
  showToast("Added to your bag ✦");
}

function changeQuantity(id, change) {
  const item = cart.find((entry) => entry.id === id);
  if (!item) return;

  item.quantity += change;
  cart = cart.filter((entry) => entry.quantity > 0);

  saveStorage("sole-cart", cart);
  renderCart();
}

function removeFromCart(id) {
  cart = cart.filter((item) => item.id !== id);
  saveStorage("sole-cart", cart);
  renderCart();
  showToast("Item removed from bag");
}

function renderCart() {
  const totalQuantity = cart.reduce(
    (sum, item) => sum + item.quantity, 0
  );

  const totalPrice = cart.reduce((sum, item) => {
    const product = products.find((p) => p.id === item.id);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);

  $("#cartCount").textContent = totalQuantity;
  $("#drawerCount").textContent = `(${totalQuantity})`;
  $("#cartTotal").textContent = money(totalPrice);

  $("#cartEmpty").hidden = cart.length > 0;
  $("#cartFooter").hidden = cart.length === 0;

  $("#cartItems").innerHTML = cart.map((item) => {
    const product = products.find((p) => p.id === item.id);
    if (!product) return "";

    return `
      <div class="cart-row">
        <img src="${product.image}" alt="${escapeHTML(product.name)}">
        <div>
          <h3>${escapeHTML(product.name)}</h3>
          <p>${money(product.price)} each</p>
          <div class="quantity">
            <button data-qty="${product.id}" data-change="-1" aria-label="Decrease quantity">−</button>
            <span>${item.quantity}</span>
            <button data-qty="${product.id}" data-change="1" aria-label="Increase quantity">+</button>
            <button class="remove-item" data-remove="${product.id}">Remove</button>
          </div>
        </div>
        <span class="line-price">${money(product.price * item.quantity)}</span>
      </div>
    `;
  }).join("");
}

function openCart() {
  $("#cartDrawer").classList.add("open");
  $("#overlay").classList.add("show");
  $("#cartDrawer").setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
  $("#closeCart").focus();
}

function closeCart() {
  $("#cartDrawer").classList.remove("open");
  $("#overlay").classList.remove("show");
  $("#cartDrawer").setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";
}

function toggleWishlist(id) {
  if (wishlist.includes(id)) {
    wishlist = wishlist.filter((item) => item !== id);
    showToast("Removed from wishlist");
  } else {
    wishlist.push(id);
    showToast("Saved to your wishlist ♥");
  }

  saveStorage("sole-wishlist", wishlist);
  renderProducts();
}

$("#filters").addEventListener("click", (event) => {
  const button = event.target.closest("[data-category]");
  if (!button) return;

  activeCategory = button.dataset.category;

  document.querySelectorAll(".filter").forEach((filter) => {
    filter.classList.toggle("active", filter === button);
  });

  renderProducts();
});

searchInput.addEventListener("input", () => {
  searchTerm = searchInput.value.trim().toLowerCase();
  renderProducts();
});

sortSelect.addEventListener("change", () => {
  sortMode = sortSelect.value;
  renderProducts();
});

productGrid.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add]");
  const wishButton = event.target.closest("[data-wish]");

  if (addButton) {
    addToCart(Number(addButton.dataset.add));
  }

  if (wishButton) {
    toggleWishlist(Number(wishButton.dataset.wish));
  }
});

$("#openCart").addEventListener("click", openCart);
$("#closeCart").addEventListener("click", closeCart);
$("#overlay").addEventListener("click", closeCart);

$("#continueShopping").addEventListener("click", () => {
  closeCart();
  $("#shop").scrollIntoView({ behavior: "smooth" });
});

$("#cartItems").addEventListener("click", (event) => {
  const quantityButton = event.target.closest("[data-qty]");
  const removeButton = event.target.closest("[data-remove]");

  if (quantityButton) {
    changeQuantity(
      Number(quantityButton.dataset.qty),
      Number(quantityButton.dataset.change)
    );
  }

  if (removeButton) {
    removeFromCart(Number(removeButton.dataset.remove));
  }
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") closeCart();
});

$("#themeToggle").addEventListener("click", () => {
  document.body.classList.toggle("light");

  const isLight = document.body.classList.contains("light");
  $("#themeToggle").textContent = isLight ? "☾" : "☼";

  try {
    localStorage.setItem("sole-theme", isLight ? "light" : "dark");
  } catch {
    // Theme still switches for this session.
  }
});

try {
  if (localStorage.getItem("sole-theme") === "light") {
    document.body.classList.add("light");
    $("#themeToggle").textContent = "☾";
  }
} catch {
  // Use the default dark theme.
}

$("#newsletterForm").addEventListener("submit", (event) => {
  event.preventDefault();

  const email = $("#emailInput").value.trim();
  if (!email) return;

  $("#newsletterMessage").textContent =
    "Thanks for joining! This is a demo subscription.";

  $("#emailInput").value = "";
  showToast("You're on the list ✦");
});

$("#checkoutBtn").addEventListener("click", () => {
  showToast("Demo store: online payments are not connected.");
});

$("#year").textContent = new Date().getFullYear();

renderProducts();
renderCart();