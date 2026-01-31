// Farmers Registration JavaScript

document.addEventListener("DOMContentLoaded", function () {
  initializeCertificateUpload();
  initializeFarmerRegistrationForm();
});

// Initialize certificate upload functionality
function initializeCertificateUpload() {
  const uploadArea = document.getElementById("certificateUploadArea");
  const fileInput = document.getElementById("certificateUpload");
  const preview = document.getElementById("certificatePreview");
  const fileName = document.getElementById("fileName");
  const removeBtn = document.getElementById("removeFile");

  if (!uploadArea || !fileInput) return;

  // Click to upload
  uploadArea.addEventListener("click", function () {
    fileInput.click();
  });

  // Drag and drop
  uploadArea.addEventListener("dragover", function (e) {
    e.preventDefault();
    uploadArea.style.background = "#f0fdf4";
  });

  uploadArea.addEventListener("dragleave", function (e) {
    e.preventDefault();
    uploadArea.style.background = "";
  });

  uploadArea.addEventListener("drop", function (e) {
    e.preventDefault();
    uploadArea.style.background = "";

    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  });

  // File input change
  fileInput.addEventListener("change", function (e) {
    if (this.files.length > 0) {
      handleFileUpload(this.files[0]);
    }
  });

  // Remove file
  if (removeBtn) {
    removeBtn.addEventListener("click", function () {
      fileInput.value = "";
      preview.style.display = "none";
      uploadArea.style.display = "block";
    });
  }

  function handleFileUpload(file) {
    // Validate file
    const validTypes = [
      "application/pdf",
      "image/jpeg",
      "image/jpg",
      "image/png",
    ];
    const maxSize = 5 * 1024 * 1024; // 5MB

    if (!validTypes.includes(file.type)) {
      showNotification("Please upload a PDF, JPG, or PNG file", "danger");
      return;
    }

    if (file.size > maxSize) {
      showNotification("File size must be less than 5MB", "danger");
      return;
    }

    // Show preview
    fileName.textContent = file.name;
    preview.style.display = "block";
    uploadArea.style.display = "none";

    showNotification("Certificate uploaded successfully!", "success");
  }
}

// Initialize farmer registration form
function initializeFarmerRegistrationForm() {
  const form = document.getElementById("farmerRegistrationForm");
  if (!form) return;

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Validate form
    if (!validateFarmerForm()) {
      return;
    }

    // Collect form data
    const formData = new FormData();

    // Personal Information
    formData.append("firstName", document.getElementById("firstName").value);
    formData.append("lastName", document.getElementById("lastName").value);
    formData.append("email", document.getElementById("email").value);
    formData.append("phone", document.getElementById("phone").value);

    // Farm Information
    formData.append("farmName", document.getElementById("farmName").value);
    formData.append(
      "farmAddress",
      document.getElementById("farmAddress").value,
    );
    formData.append("city", document.getElementById("city").value);
    formData.append("state", document.getElementById("state").value);
    formData.append("pincode", document.getElementById("pincode").value);
    formData.append("farmSize", document.getElementById("farmSize").value);

    const cropTypes = Array.from(
      document.getElementById("cropTypes").selectedOptions,
    ).map((option) => option.value);
    formData.append("cropTypes", JSON.stringify(cropTypes));

    // Certification Details
    formData.append(
      "certificationNumber",
      document.getElementById("certificationNumber").value,
    );
    formData.append(
      "certificationDate",
      document.getElementById("certificationDate").value,
    );
    formData.append(
      "certificationAuthority",
      document.getElementById("certificationAuthority").value,
    );

    // Certificate File
    const certificateFile =
      document.getElementById("certificateUpload").files[0];
    if (certificateFile) {
      formData.append("certificate", certificateFile);
    }

    // Bank Details
    formData.append("bankName", document.getElementById("bankName").value);
    formData.append(
      "accountNumber",
      document.getElementById("accountNumber").value,
    );
    formData.append("ifscCode", document.getElementById("ifscCode").value);
    formData.append(
      "accountHolderName",
      document.getElementById("accountHolderName").value,
    );

    // Submit form
    try {
      showLoadingOverlay("Submitting registration...");

      // Uncomment when backend is ready
      // const response = await fetch(`${window.OrganicFarm.API_BASE_URL}/farmers/register`, {
      //     method: 'POST',
      //     body: formData
      // });
      // const result = await response.json();

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      hideLoadingOverlay();

      // Show success message
      showSuccessModal();

      // Reset form
      form.reset();
      document.getElementById("certificatePreview").style.display = "none";
      document.getElementById("certificateUploadArea").style.display = "block";
    } catch (error) {
      console.error("Registration error:", error);
      hideLoadingOverlay();
      showNotification("Registration failed. Please try again.", "danger");
    }
  });
}

// Validate farmer registration form
function validateFarmerForm() {
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const pincode = document.getElementById("pincode").value;
  const certificateFile = document.getElementById("certificateUpload").files[0];
  const termsAccepted = document.getElementById("terms").checked;
  const certifyInfo = document.getElementById("certifyInfo").checked;

  // Validate email
  if (!validateEmail(email)) {
    showNotification("Please enter a valid email address", "warning");
    return false;
  }

  // Validate phone
  if (!validatePhone(phone)) {
    showNotification("Please enter a valid 10-digit phone number", "warning");
    return false;
  }

  // Validate pincode
  if (!/^\d{6}$/.test(pincode)) {
    showNotification("Please enter a valid 6-digit pincode", "warning");
    return false;
  }

  // Check certificate upload
  if (!certificateFile) {
    showNotification("Please upload your organic certification", "warning");
    return false;
  }

  // Check terms
  if (!termsAccepted || !certifyInfo) {
    showNotification(
      "Please accept the terms and certify the information",
      "warning",
    );
    return false;
  }

  return true;
}

// Validate email format
function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validate phone number
function validatePhone(phone) {
  const re = /^[6-9]\d{9}$/;
  return re.test(phone);
}

// Show loading overlay
function showLoadingOverlay(message = "Processing...") {
  const overlay = document.createElement("div");
  overlay.id = "loadingOverlay";
  overlay.className =
    "position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center";
  overlay.style.cssText = "background: rgba(0,0,0,0.7); z-index: 9999;";
  overlay.innerHTML = `
        <div class="text-center text-white">
            <div class="spinner-border mb-3" style="width: 3rem; height: 3rem;" role="status">
                <span class="visually-hidden">Loading...</span>
            </div>
            <h5>${message}</h5>
        </div>
    `;
  document.body.appendChild(overlay);
}

// Hide loading overlay
function hideLoadingOverlay() {
  const overlay = document.getElementById("loadingOverlay");
  if (overlay) {
    overlay.remove();
  }
}

// Show success modal
function showSuccessModal() {
  const modal = document.createElement("div");
  modal.className = "modal fade show";
  modal.style.cssText = "display: block; background: rgba(0,0,0,0.5);";
  modal.innerHTML = `
        <div class="modal-dialog modal-dialog-centered">
            <div class="modal-content">
                <div class="modal-header bg-success text-white">
                    <h5 class="modal-title">
                        <i class="fas fa-check-circle"></i> Registration Successful!
                    </h5>
                </div>
                <div class="modal-body text-center py-4">
                    <i class="fas fa-check-circle fa-4x text-success mb-3"></i>
                    <h4>Welcome to OrganicFarm!</h4>
                    <p class="mb-0">Your registration has been submitted successfully. Our team will verify your organic certification and activate your account within 24-48 hours.</p>
                    <p class="mt-3">You will receive a confirmation email at your registered email address.</p>
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-success" onclick="closeSuccessModal()">
                        Go to Dashboard
                    </button>
                    <button type="button" class="btn btn-outline-secondary" onclick="closeSuccessModal()">
                        Close
                    </button>
                </div>
            </div>
        </div>
    `;
  document.body.appendChild(modal);
}

// Close success modal
function closeSuccessModal() {
  const modal = document.querySelector(".modal.show");
  if (modal) {
    modal.remove();
  }
  // Optionally redirect to dashboard or login
  // window.location.href = 'login.html';
}

// Show notification
function showNotification(message, type = "info") {
  if (window.OrganicFarm && window.OrganicFarm.showNotification) {
    window.OrganicFarm.showNotification(message, type);
  } else {
    alert(message);
  }
}

// Preview crop types selection
document.getElementById("cropTypes")?.addEventListener("change", function () {
  const selected = Array.from(this.selectedOptions).map((opt) => opt.text);
  if (selected.length > 0) {
    console.log("Selected crops:", selected.join(", "));
  }
});

// IFSC code validation and bank lookup
document
  .getElementById("ifscCode")
  ?.addEventListener("blur", async function () {
    const ifscCode = this.value.trim().toUpperCase();
    this.value = ifscCode;

    if (ifscCode.length === 11) {
      // Validate IFSC format
      const ifscPattern = /^[A-Z]{4}0[A-Z0-9]{6}$/;
      if (!ifscPattern.test(ifscCode)) {
        showNotification("Invalid IFSC code format", "warning");
      } else {
        // In production, you could fetch bank details from IFSC API
        showNotification("IFSC code validated", "success");
      }
    }
  });

// Phone number formatting
document.getElementById("phone")?.addEventListener("input", function (e) {
  this.value = this.value.replace(/\D/g, "").slice(0, 10);
});

// Pincode validation
document.getElementById("pincode")?.addEventListener("input", function (e) {
  this.value = this.value.replace(/\D/g, "").slice(0, 6);
});
