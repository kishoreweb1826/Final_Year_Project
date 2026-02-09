// Authentication JavaScript

document.addEventListener("DOMContentLoaded", function () {
  initializeAuthForms();
  initializeToggleButtons();
});

// Initialize authentication forms
function initializeAuthForms() {
  const loginForm = document.getElementById("loginForm");
  const registerForm = document.getElementById("registerForm");

  if (loginForm) {
    loginForm.addEventListener("submit", handleLogin);
  }

  if (registerForm) {
    registerForm.addEventListener("submit", handleRegistration);
  }
}

// Initialize toggle buttons between login and register
function initializeToggleButtons() {
  const showRegisterBtn = document.getElementById("showRegister");
  const showLoginBtn = document.getElementById("showLogin");

  if (showRegisterBtn) {
    showRegisterBtn.addEventListener("click", function () {
      document.getElementById("loginSection").style.display = "none";
      document.getElementById("registerSection").style.display = "block";
    });
  }

  if (showLoginBtn) {
    showLoginBtn.addEventListener("click", function () {
      document.getElementById("registerSection").style.display = "none";
      document.getElementById("loginSection").style.display = "block";
    });
  }
}

// Handle login submission
async function handleLogin(e) {
  e.preventDefault();

  const email = document.getElementById("loginEmail").value;
  const password = document.getElementById("loginPassword").value;
  const rememberMe = document.getElementById("rememberMe").checked;

  // Validate inputs
  if (!validateEmail(email)) {
    showNotification("Please enter a valid email address", "warning");
    return;
  }

  if (password.length < 6) {
    showNotification("Password must be at least 6 characters", "warning");
    return;
  }

  try {
    showLoadingButton('loginForm button[type="submit"]', "Logging in...");

    // API call to backend
    // Uncomment when backend is ready
    // const response = await fetch(`${window.OrganicFarm.API_BASE_URL}/auth/login`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify({ email, password, rememberMe })
    // });
    // const data = await response.json();

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // Mock successful login
    const mockUser = {
      id: 1,
      name: "John Doe",
      email: email,
      role: email.includes("farmer") ? "farmer" : "customer",
      token: "mock_jwt_token_" + Date.now(),
    };

    // Store user data
    if (rememberMe) {
      localStorage.setItem("user", JSON.stringify(mockUser));
      localStorage.setItem("authToken", mockUser.token);
    } else {
      sessionStorage.setItem("user", JSON.stringify(mockUser));
      sessionStorage.setItem("authToken", mockUser.token);
    }

    showNotification("Login successful!", "success");

    // Redirect based on role
    setTimeout(() => {
      if (mockUser.role === "farmer") {
        window.location.href = "farmer-dashboard.html";
      } else {
        window.location.href = "index.html";
      }
    }, 1000);
  } catch (error) {
    console.error("Login error:", error);
    showNotification("Login failed. Please check your credentials.", "danger");
  } finally {
    resetLoadingButton('loginForm button[type="submit"]', "Login");
  }
}

// Handle registration submission
async function handleRegistration(e) {
  e.preventDefault();

  const name = document.getElementById("registerName").value;
  const email = document.getElementById("registerEmail").value;
  const phone = document.getElementById("registerPhone").value;
  const password = document.getElementById("registerPassword").value;
  const confirmPassword = document.getElementById("confirmPassword").value;
  const userType = document.getElementById("userType").value;
  const agreeTerms = document.getElementById("agreeTerms").checked;

  // Validate inputs
  if (!name.trim()) {
    showNotification("Please enter your full name", "warning");
    return;
  }

  if (!validateEmail(email)) {
    showNotification("Please enter a valid email address", "warning");
    return;
  }

  if (!validatePhone(phone)) {
    showNotification("Please enter a valid 10-digit phone number", "warning");
    return;
  }

  if (password.length < 8) {
    showNotification("Password must be at least 8 characters", "warning");
    return;
  }

  if (password !== confirmPassword) {
    showNotification("Passwords do not match", "warning");
    return;
  }

  if (!userType) {
    showNotification("Please select user type", "warning");
    return;
  }

  if (!agreeTerms) {
    showNotification("Please accept the terms and conditions", "warning");
    return;
  }

  try {
    showLoadingButton(
      'registerForm button[type="submit"]',
      "Creating Account...",
    );

    const userData = {
      name,
      email,
      phone,
      password,
      userType,
    };

    // API call to backend
    // Uncomment when backend is ready
    // const response = await fetch(`${window.OrganicFarm.API_BASE_URL}/auth/register`, {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(userData)
    // });
    // const data = await response.json();

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 2000));

    showNotification("Account created successfully! Please login.", "success");

    // Switch to login form
    setTimeout(() => {
      document.getElementById("registerSection").style.display = "none";
      document.getElementById("loginSection").style.display = "block";
      document.getElementById("loginEmail").value = email;
    }, 1500);
  } catch (error) {
    console.error("Registration error:", error);
    showNotification("Registration failed. Please try again.", "danger");
  } finally {
    resetLoadingButton('registerForm button[type="submit"]', "Create Account");
  }
}

// Validate email format
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validate phone number (Indian format)
function validatePhone(phone) {
  const re = /^[6-9]\d{9}$/;
  return re.test(phone);
}

// Show loading state on button
function showLoadingButton(selector, text) {
  const button = document.querySelector(selector);
  if (button) {
    button.disabled = true;
    button.innerHTML = `
            <span class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
            ${text}
        `;
  }
}

// Reset button to original state
function resetLoadingButton(selector, text) {
  const button = document.querySelector(selector);
  if (button) {
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-${text === "Login" ? "sign-in-alt" : "user-plus"}"></i> ${text}`;
  }
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

// Check if user is already logged in
function checkAuthStatus() {
  const user = localStorage.getItem("user") || sessionStorage.getItem("user");
  if (user) {
    const userData = JSON.parse(user);
    return userData;
  }
  return null;
}

// Logout function
function logout() {
  localStorage.removeItem("user");
  localStorage.removeItem("authToken");
  sessionStorage.removeItem("user");
  sessionStorage.removeItem("authToken");

  showNotification("Logged out successfully", "success");

  setTimeout(() => {
    window.location.href = "index.html";
  }, 1000);
}

// Password strength indicator
document
  .getElementById("registerPassword")
  ?.addEventListener("input", function () {
    const password = this.value;
    const strength = calculatePasswordStrength(password);

    // You can add a visual indicator here
    console.log("Password strength:", strength);
  });

function calculatePasswordStrength(password) {
  let strength = 0;

  if (password.length >= 8) strength++;
  if (password.length >= 12) strength++;
  if (/[a-z]/.test(password)) strength++;
  if (/[A-Z]/.test(password)) strength++;
  if (/[0-9]/.test(password)) strength++;
  if (/[^a-zA-Z0-9]/.test(password)) strength++;

  return strength;
}

// Phone number formatting
document
  .getElementById("registerPhone")
  ?.addEventListener("input", function (e) {
    this.value = this.value.replace(/\D/g, "").slice(0, 10);
  });

// Export functions
window.AuthModule = {
  checkAuthStatus,
  logout,
  validateEmail,
  validatePhone,
};
