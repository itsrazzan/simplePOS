let products = [];
let orderItems = [];
let selectedPaymentMethod = "QRIS";
let totalAmount = 0;

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  updateDateTime();
  setInterval(updateDateTime, 1000);
  fetchProducts();
  setupEventListeners();
});

// Update date and time
function updateDateTime() {
  const now = new Date();
  const options = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  };
  document.getElementById("datetime").textContent =
    now.toLocaleDateString("en-US", options);
}

// Fetch products from API
async function fetchProducts() {
  try {
    const response = await fetch("http://localhost:3000/products/active");
    products = await response.json();
    renderProducts();
  } catch (error) {
    console.error("Error fetching products:", error);
    renderProducts();
  }
}

