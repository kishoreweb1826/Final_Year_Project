// Shopping Cart JavaScript

let cart = [];
const FREE_DELIVERY_THRESHOLD = 500;
const DELIVERY_CHARGE = 40;

// Initialize cart on page load
document.addEventListener("DOMContentLoaded", function () {
  loadCart();
  renderCart();
  initializeCheckout();
  initializePromoCode();
  loadRecommendedProducts();
});

// Load cart from localStorage
function loadCart() {
  const savedCart = localStorage.getItem("cart");
  if (savedCart) {
    cart = JSON.parse(savedCart);
  }
}

// Save cart to localStorage
function saveCart() {
  localStorage.setItem("cart", JSON.stringify(cart));
  updateCartCount();
}

// Update cart count in navbar
function updateCartCount() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  document.querySelectorAll("#cartCount").forEach((element) => {
    element.textContent = count;
  });
}

// Render cart items
function renderCart() {
  const cartItemsContainer = document.getElementById("cartItems");
  const emptyCartDiv = document.getElementById("emptyCart");
  const continueShoppingBtn = document.getElementById("continueShoppingBtn");
  const orderSummary = document.getElementById("orderSummary");

  if (cart.length === 0) {
    cartItemsContainer.style.display = "none";
    emptyCartDiv.style.display = "block";
    continueShoppingBtn.style.display = "none";
    orderSummary.style.display = "none";
    return;
  }

  cartItemsContainer.style.display = "block";
  emptyCartDiv.style.display = "none";
  continueShoppingBtn.style.display = "block";
  orderSummary.style.display = "block";

  let cartHTML = "";
  cart.forEach((item, index) => {
    cartHTML += createCartItemHTML(item, index);
  });

  cartItemsContainer.innerHTML = cartHTML;
  updateOrderSummary();
  attachCartEventListeners();
}

// Create HTML for cart item
function createCartItemHTML(item, index) {
  const itemTotal = (item.price * item.quantity).toFixed(2);

  return `
        <div class="cart-item">
            <div class="row align-items-center">
                <div class="col-md-2 col-3">
                    <img src="${item.image}" alt="${item.name}" class="img-fluid rounded">
                </div>
                <div class="col-md-4 col-9">
                    <h5 class="mb-1">${item.name}</h5>
                    <p class="text-muted mb-2"><small><i class="fas fa-store"></i> ${item.farmer || "OrganicFarm"}</small></p>
                    ${item.certified ? '<span class="badge bg-success"><i class="fas fa-certificate"></i> Certified Organic</span>' : ""}
                </div>
                <div class="col-md-2 col-4">
                    <p class="mb-0 fw-bold">₹${item.price}/kg</p>
                </div>
                <div class="col-md-2 col-4">
                    <div class="input-group input-group-sm">
                        <button class="btn btn-outline-secondary" type="button" onclick="decreaseQuantity(${index})">
                            <i class="fas fa-minus"></i>
                        </button>
                        <input type="text" class="form-control text-center" value="${item.quantity}" readonly style="max-width: 50px;">
                        <button class="btn btn-outline-secondary" type="button" onclick="increaseQuantity(${index})">
                            <i class="fas fa-plus"></i>
                        </button>
                    </div>
                </div>
                <div class="col-md-1 col-3">
                    <p class="mb-0 fw-bold text-success">₹${itemTotal}</p>
                </div>
                <div class="col-md-1 col-1">
                    <button class="btn btn-sm btn-outline-danger" onclick="removeItem(${index})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Attach event listeners to cart items
function attachCartEventListeners() {
  // Event listeners are now inline in the HTML
}

// Increase item quantity
function increaseQuantity(index) {
  if (cart[index].quantity < 50) {
    // Max quantity limit
    cart[index].quantity++;
    saveCart();
    renderCart();
    showNotification("Quantity updated", "success");
  } else {
    showNotification("Maximum quantity reached", "warning");
  }
}

// Decrease item quantity
function decreaseQuantity(index) {
  if (cart[index].quantity > 1) {
    cart[index].quantity--;
    saveCart();
    renderCart();
    showNotification("Quantity updated", "success");
  } else {
    showNotification(
      "Minimum quantity is 1. Use delete to remove item.",
      "warning",
    );
  }
}

// Remove item from cart
function removeItem(index) {
  const itemName = cart[index].name;

  if (confirm(`Remove ${itemName} from cart?`)) {
    cart.splice(index, 1);
    saveCart();
    renderCart();
    showNotification("Item removed from cart", "info");
  }
}

// Update order summary
function updateOrderSummary() {
  const subtotal = cart.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const deliveryCharges =
    subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DELIVERY_CHARGE;
  const discount = calculateDiscount(subtotal);
  const total = subtotal + deliveryCharges - discount;

  document.getElementById("itemCount").textContent = itemCount;
  document.getElementById("subtotal").textContent = subtotal.toFixed(2);
  document.getElementById("deliveryCharges").textContent =
    deliveryCharges === 0 ? "FREE" : `₹${deliveryCharges}`;
  document.getElementById("discount").textContent = discount.toFixed(2);
  document.getElementById("totalAmount").textContent = total.toFixed(2);
  document.getElementById("checkoutTotal").textContent = total.toFixed(2);

  // Update free delivery progress
  if (subtotal < FREE_DELIVERY_THRESHOLD) {
    const remaining = FREE_DELIVERY_THRESHOLD - subtotal;
    showFreeDeliveryMessage(remaining);
  }
}

// Calculate discount based on promo code
function calculateDiscount(subtotal) {
  const promoCode = localStorage.getItem("appliedPromo");
  if (!promoCode) return 0;

  // Sample promo codes
  const promoCodes = {
    ORGANIC10: 0.1, // 10% off
    FIRST20: 0.2, // 20% off for first order
    SAVE50: 50, // Flat ₹50 off
  };

  if (promoCodes[promoCode]) {
    const discount = promoCodes[promoCode];
    if (discount < 1) {
      return subtotal * discount;
    } else {
      return discount;
    }
  }

  return 0;
}

// Show free delivery message
function showFreeDeliveryMessage(remaining) {
  // You can add a banner or message here
  console.log(`Add ₹${remaining.toFixed(2)} more for FREE delivery!`);
}

// Initialize promo code functionality
function initializePromoCode() {
  const applyPromoBtn = document.getElementById("applyPromo");

  if (applyPromoBtn) {
    applyPromoBtn.addEventListener("click", function () {
      const promoCode = document
        .getElementById("promoCode")
        .value.trim()
        .toUpperCase();

      if (!promoCode) {
        showNotification("Please enter a promo code", "warning");
        return;
      }

      // Validate promo code
      const validCodes = ["ORGANIC10", "FIRST20", "SAVE50"];

      if (validCodes.includes(promoCode)) {
        localStorage.setItem("appliedPromo", promoCode);
        document.getElementById("promoSuccess").classList.remove("d-none");
        showNotification("Promo code applied successfully!", "success");
        updateOrderSummary();
      } else {
        showNotification("Invalid promo code", "danger");
      }
    });
  }
}

// Initialize checkout process
function initializeCheckout() {
  const checkoutBtn = document.getElementById("checkoutBtn");
  const placeOrderBtn = document.getElementById("placeOrderBtn");

  if (checkoutBtn) {
    checkoutBtn.addEventListener("click", function () {
      if (cart.length === 0) {
        showNotification("Your cart is empty", "warning");
        return;
      }

      // Show checkout modal
      const modal = new bootstrap.Modal(
        document.getElementById("checkoutModal"),
      );
      modal.show();
    });
  }

  if (placeOrderBtn) {
    placeOrderBtn.addEventListener("click", async function () {
      const form = document.getElementById("checkoutForm");

      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      // Process order
      await processOrder();
    });
  }
}

// Process order
async function processOrder() {
  const orderData = {
    items: cart,
    total: parseFloat(document.getElementById("totalAmount").textContent),
    promoCode: localStorage.getItem("appliedPromo"),
    deliveryAddress: {
      // Collect from form
    },
    paymentMethod: document.querySelector('input[name="payment"]:checked')
      .value,
  };

  try {
    // Show loading
    document.getElementById("placeOrderBtn").innerHTML =
      '<span class="spinner-border spinner-border-sm me-2"></span>Processing...';
    document.getElementById("placeOrderBtn").disabled = true;

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Uncomment when backend is ready
    // const response = await fetch(`${window.OrganicFarm.API_BASE_URL}/orders`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(orderData)
    // });
    // const result = await response.json();

    // Clear cart
    cart = [];
    saveCart();
    localStorage.removeItem("appliedPromo");

    // Close modal
    bootstrap.Modal.getInstance(
      document.getElementById("checkoutModal"),
    ).hide();

    // Show success message
    showOrderSuccessModal();

    // Redirect to order confirmation page
    setTimeout(() => {
      window.location.href = "index.html";
    }, 3000);
  } catch (error) {
    console.error("Order error:", error);
    showNotification("Order failed. Please try again.", "danger");
  } finally {
    document.getElementById("placeOrderBtn").innerHTML =
      '<i class="fas fa-check"></i> Place Order';
    document.getElementById("placeOrderBtn").disabled = false;
  }
}

// Show order success modal
function showOrderSuccessModal() {
  const modal = document.createElement("div");
  modal.className = "modal fade show";
  modal.style.cssText = "display: block; background: rgba(0,0,0,0.5);";
  modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-body text-center py-5">
                    <i class="fas fa-check-circle fa-5x text-success mb-4"></i>
                    <h3>Order Placed Successfully!</h3>
                    <p class="mb-4">Thank you for your order. You will receive a confirmation email shortly.</p>
                    <p class="text-muted">Order ID: #ORG${Date.now()}</p>
                    <button type="button" class="btn btn-success" onclick="this.closest('.modal').remove()">
                        Continue Shopping
                    </button>
                </div>
            </div>
        </div>
    `;
  document.body.appendChild(modal);

  setTimeout(() => modal.remove(), 5000);
}

// Load recommended products
function loadRecommendedProducts() {
  const recommendedProducts = [
    {
      id: 101,
      name: "Organic Honey",
      price: 200,
      image:
        "https://images.unsplash.com/photo-1587049352846-4a222e784acc?w=300",
      rating: 4.9,
      farmer: "Bee Happy Farms",
      certified: true,
    },
    {
      id: 102,
      name: "Fresh Basil",
      price: 30,
      image:
        "https://images.unsplash.com/photo-1618375569909-3c8616cf7733?w=300",
      rating: 4.7,
      farmer: "Herb Garden",
      certified: true,
    },
    {
      id: 103,
      name: "Organic Apples",
      price: 120,
      image: "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300",
      rating: 4.8,
      farmer: "Apple Valley",
      certified: true,
    },
  ];

  if (cart.length > 0) {
    const container = document.getElementById("recommendedProducts");
    const section = document.getElementById("recommendedSection");

    const html = recommendedProducts
      .map(
        (product) => `
            <div class="col-md-4">
                <div class="product-card">
                    <div class="position-relative">
                        <img src="${product.image}" alt="${product.name}" class="product-image">
                        <span class="product-badge"><i class="fas fa-certificate"></i> Certified</span>
                    </div>
                    <div class="product-info">
                        <h5 class="mb-2">${product.name}</h5>
                        <p class="text-muted mb-2"><i class="fas fa-store"></i> ${product.farmer}</p>
                        <div class="d-flex justify-content-between align-items-center">
                            <span class="product-price">₹${product.price}/kg</span>
                            <button class="btn btn-success btn-sm" onclick="addToCartQuick(${JSON.stringify(product).replace(/"/g, "&quot;")})">
                                <i class="fas fa-cart-plus"></i> Add
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `,
      )
      .join("");

    container.innerHTML = html;
    section.style.display = "block";
  }
}

// Quick add to cart from recommendations
function addToCartQuick(product) {
  const existingItem = cart.find((item) => item.id === product.id);

  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      quantity: 1,
    });
  }

  saveCart();
  renderCart();
  showNotification(`${product.name} added to cart!`, "success");
}

// Show notification
function showNotification(message, type = "info") {
  if (window.OrganicFarm && window.OrganicFarm.showNotification) {
    window.OrganicFarm.showNotification(message, type);
  } else {
    const notification = document.createElement("div");
    notification.className = `alert alert-${type} alert-dismissible fade show position-fixed top-0 start-50 translate-middle-x mt-3`;
    notification.style.zIndex = "9999";
    notification.innerHTML = `
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
  }
}
