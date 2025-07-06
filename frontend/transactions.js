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

// Render products
function renderProducts() {
  const itemsList = document.getElementById("itemsList");
  itemsList.innerHTML = "";

  products.forEach((product) => {
    const item = document.createElement("div");
    item.className =
      "bg-secondary rounded-lg p-4 cursor-pointer hover:scale-105 transition-transform shadow-md";
    item.innerHTML = `
            <div class="h-32 bg-gray-custom rounded-lg mb-2"></div>
            <div class="text-lg font-bold text-primary mb-1">Rp. ${product.product_price.toLocaleString()}</div>
            <div class="text-sm text-primary/70 h-20 overflow-hidden mb-2"
        >${
              product.product_name
            }</div>
        `;
    item.addEventListener("click", () => addToOrder(product));
    itemsList.appendChild(item);
  });
}

// Add item to order
function addToOrder(product) {
  const existingItem = orderItems.find(
    (item) => item.sku === product.sku
  );

  if (existingItem) {
    if (existingItem.quantity < product.product_stock) {
      existingItem.quantity++;
    }
  } else {
    orderItems.push({
      ...product,
      quantity: 1,
    });
  }

  renderOrderItems();
  updateTotal();
}

// Render order items
function renderOrderItems() {
  const orderItemsContainer = document.getElementById("orderItems");
  orderItemsContainer.innerHTML = "";

  orderItems.forEach((item, index) => {
    const orderItem = document.createElement("div");
    orderItem.className =
      "flex items-center justify-between p-3 bg-gray-custom rounded-lg";
    orderItem.innerHTML = `
            <div class="flex-1">
                <div class="font-semibold text-primary">${
                  item.product_name
                }</div>
                <div class="text-sm text-primary/70">Rp. ${item.product_price.toLocaleString()}</div>
            </div>
            <div class="flex items-center gap-2">
                <button class="w-8 h-8 bg-primary text-secondary rounded-full hover:bg-primary/80 transition-colors" onclick="updateQuantity(${index}, -1)">-</button>
                <span class="w-8 text-center font-bold text-primary">${
                  item.quantity
                }</span>
                <button class="w-8 h-8 bg-primary text-secondary rounded-full hover:bg-primary/80 transition-colors" onclick="updateQuantity(${index}, 1)">+</button>
            </div>
        `;
    orderItemsContainer.appendChild(orderItem);
  });
}

// Update item quantity
function updateQuantity(index, change) {
  const item = orderItems[index];
  const newQuantity = item.quantity + change;

  if (newQuantity <= 0) {
    orderItems.splice(index, 1);
  } else if (newQuantity <= item.product_stock) {
    item.quantity = newQuantity;
  }

  renderOrderItems();
  updateTotal();
}

// Update total amount
function updateTotal() {
  totalAmount = orderItems.reduce(
    (total, item) => total + item.product_price * item.quantity,
    0
  );
  document.getElementById(
    "totalAmount"
  ).textContent = `Rp. ${totalAmount.toLocaleString()}`;

  const payButton = document.getElementById("payButton");
  payButton.disabled = orderItems.length === 0 || !selectedPaymentMethod;
}

// Setup event listeners
function setupEventListeners() {
  // Payment method selection
  document.querySelectorAll(".payment-method").forEach((button) => {
    button.addEventListener("click", function () {
      document.querySelectorAll(".payment-method").forEach((btn) => {
        btn.classList.remove("active");
        btn.classList.remove("bg-primary", "text-secondary");
        btn.classList.add("bg-gray-custom", "text-primary");
      });

      this.classList.add("active");
      this.classList.remove("bg-gray-custom", "text-primary");
      this.classList.add("bg-primary", "text-secondary");

      selectedPaymentMethod = this.dataset.method;
      updateTotal();
    });
  });

  // Pay button
  document
    .getElementById("payButton")
    .addEventListener("click", processPayment);
}

// Process payment
async function processPayment() {
  if (orderItems.length === 0) return;

  const transactionData = {
    payment_method: selectedPaymentMethod,
    items: orderItems.map((item) => ({
      sku: item.sku,
      quantity: item.quantity,
    })),
  };

  try {
    const response = await fetch("http://localhost:3000/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(transactionData),
    });

    if (response.ok) {
      // Reset order
      orderItems = [];
      renderOrderItems();
      updateTotal();

      // Show success message
      alert("Payment successful!");

      // Refresh products to update stock
      fetchProducts();
    } else {
      throw new Error("Payment failed");
    }
  } catch (error) {
    console.error("Error processing payment:", error);
    alert("Payment failed. Please try again.");
  }
}