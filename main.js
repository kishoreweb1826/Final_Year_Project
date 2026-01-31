// Main JavaScript for OrganicFarm Platform

// Configuration
const API_BASE_URL = "http://localhost:8080/api"; // Update with your backend URL
const AI_API_URL = "http://localhost:5000/api"; // Update with your Flask AI API URL

// Cart Management
let cart = JSON.parse(localStorage.getItem("cart")) || [];

// Update cart count on page load
document.addEventListener("DOMContentLoaded", function () {
  updateCartCount();
  loadFeaturedProducts();
  initializeNewsletterForm();
});

// Update cart count badge
function updateCartCount() {
  const cartCountElements = document.querySelectorAll("#cartCount");
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  cartCountElements.forEach((element) => {
    element.textContent = count;
  });
}

// Add to cart function
function addToCart(product) {
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.image,
      quantity: 1,
      farmer: product.farmer,
    });
  }

  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  showNotification("Product added to cart!", "success");
}

// Remove from cart
function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== productId);
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
  showNotification("Product removed from cart", "info");
}

// Update cart item quantity
function updateCartQuantity(productId, quantity) {
  const item = cart.find((item) => item.id === productId);
  if (item) {
    item.quantity = quantity;
    if (quantity <= 0) {
      removeFromCart(productId);
    } else {
      localStorage.setItem("cart", JSON.stringify(cart));
      updateCartCount();
    }
  }
}

// Show notification
function showNotification(message, type = "info") {
  const notification = document.createElement("div");
  notification.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
  notification.style.zIndex = "9999";
  notification.innerHTML = `
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
  document.body.appendChild(notification);

  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Load featured products for homepage
async function loadFeaturedProducts() {
  const container = document.getElementById("featuredProducts");
  if (!container) return;

  // Sample products - Replace with actual API call
  const sampleProducts = [
    {
      id: 1,
      name: "Organic Tomatoes",
      price: 60,
      image: "https://images.unsplash.com/photo-1546470427-e26264715c8c?w=400",
      category: "Vegetables",
      rating: 4.5,
      farmer: "Green Valley Farm",
      certified: true,
    },
    {
      id: 2,
      name: "Fresh Strawberries",
      price: 120,
      image:
        "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400",
      category: "Fruits",
      rating: 4.8,
      farmer: "Berry Farms",
      certified: true,
    },
    {
      id: 3,
      name: "Organic Spinach",
      price: 40,
      image:
        "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400",
      category: "Vegetables",
      rating: 4.6,
      farmer: "Sunrise Organic",
      certified: true,
    },
    {
      id: 4,
      name: "Brown Rice",
      price: 80,
      image:
        "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?w=400",
      category: "Grains",
      rating: 4.7,
      farmer: "Golden Harvest",
      certified: true,
    },
  ];

  try {
    // Uncomment when backend is ready
    // const response = await fetch(`${API_BASE_URL}/products/featured`);
    // const products = await response.json();

    const products = sampleProducts; // Remove this line when using real API

    container.innerHTML = products
      .map((product) => createProductCard(product))
      .join("");
  } catch (error) {
    console.error("Error loading products:", error);
    container.innerHTML =
      '<div class="col-12"><p class="text-center text-muted">Unable to load products</p></div>';
  }
}

// Create product card HTML
function createProductCard(product) {
  const stars = generateStarRating(product.rating);

  return `
        <div class="col-md-6 col-lg-3">
            <div class="product-card">
                <div class="position-relative">
                    <img src="${product.image}" alt="${product.name}" class="product-image">
                    ${product.certified ? '<span class="product-badge"><i class="fas fa-certificate"></i> Certified</span>' : ""}
                </div>
                <div class="product-info">
                    <h5 class="mb-2">${product.name}</h5>
                    <p class="text-muted mb-2"><i class="fas fa-store"></i> ${product.farmer}</p>
                    <div class="rating mb-2">${stars}</div>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="product-price">₹${product.price}/kg</span>
                        <button class="btn btn-success btn-sm" onclick="addToCart(${JSON.stringify(product).replace(/"/g, "&quot;")})">
                            <i class="fas fa-cart-plus"></i> Add
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// Generate star rating HTML
function generateStarRating(rating) {
  let stars = "";
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars += '<i class="fas fa-star"></i>';
    } else if (i - 0.5 <= rating) {
      stars += '<i class="fas fa-star-half-alt"></i>';
    } else {
      stars += '<i class="far fa-star"></i>';
    }
  }
  return stars;
}

// Initialize newsletter form
function initializeNewsletterForm() {
  const form = document.getElementById("newsletterForm");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;

    try {
      // Uncomment when backend is ready
      // const response = await fetch(`${API_BASE_URL}/newsletter/subscribe`, {
      //     method: 'POST',
      //     headers: { 'Content-Type': 'application/json' },
      //     body: JSON.stringify({ email })
      // });

      showNotification("Thank you for subscribing!", "success");
      this.reset();
    } catch (error) {
      console.error("Subscription error:", error);
      showNotification("Subscription failed. Please try again.", "danger");
    }
  });
}

// Format currency
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}

// Validate email
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validate phone number (Indian format)
function validatePhone(phone) {
  const re = /^[6-9]\d{9}$/;
  return re.test(phone);
}

// Smooth scroll to section
function scrollToSection(sectionId) {
  const element = document.getElementById(sectionId);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

// Image lazy loading
if ("IntersectionObserver" in window) {
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src;
        img.classList.remove("lazy");
        imageObserver.unobserve(img);
      }
    });
  });

  document.querySelectorAll("img.lazy").forEach((img) => {
    imageObserver.observe(img);
  });
}

// Export functions for use in other scripts
window.OrganicFarm = {
  addToCart,
  removeFromCart,
  updateCartQuantity,
  showNotification,
  formatCurrency,
  validateEmail,
  validatePhone,
  API_BASE_URL,
  AI_API_URL,
};
