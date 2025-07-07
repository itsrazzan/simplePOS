let allProducts = []; // To store all products, including soft-deleted ones
let currentProductToUpdate = null; // To store product data when updating

// Initialize
document.addEventListener("DOMContentLoaded", function () {
  updateDateTime();
  setInterval(updateDateTime, 1000);
  setupTabEventListeners();
  fetchAllProducts(); // Fetch all products initially for the "All Products" tab
});

// Update date and time real time
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
  document.getElementById("datetime").textContent = now.toLocaleDateString(
    "en-US",
    options
  );
}

// Setup tab event listeners
function setupTabEventListeners() {
  document.querySelectorAll(".tab-button").forEach((button) => {
    button.addEventListener("click", function () {
      // Deactivate all buttons and hide all content
      document.querySelectorAll(".tab-button").forEach((btn) => {
        btn.classList.remove("active");
      });
      document.querySelectorAll(".tab-content").forEach((content) => {
        content.classList.add("hidden");
      });

      // Activate clicked button and show relevant content
      this.classList.add("active");
      const targetTab = this.dataset.tab;
      document
        .getElementById(`content-${targetTab}`)
        .classList.remove("hidden");

      // Specific actions for each tab
      if (targetTab === "all-products") {
        fetchAllProducts(); // Re-fetch to ensure data is fresh
      } else if (targetTab === "new-product") {
        document.getElementById("newProductForm").reset(); // Clear form
      } else if (targetTab === "update-product") {
        document.getElementById("updateProductForm").classList.add("hidden"); // Hide form initially
        document.getElementById("productNotFound").classList.add("hidden"); // Hide not found message
        document.getElementById("update-sku-search").value = ""; // Clear search input
      }
    });
  });

  // Default active tab
  document.getElementById("tab-all-products").click();

  // New Product Form Submission
  document
    .getElementById("newProductForm")
    .addEventListener("submit", createNewProduct);

  // Search Product for Update
  document
    .getElementById("searchProductButton")
    .addEventListener("click", searchProductBySku);
  document
    .getElementById("update-sku-search")
    .addEventListener("keypress", function (event) {
      if (event.key === "Enter") {
        event.preventDefault(); // Prevent form submission
        searchProductBySku();
      }
    });

  // Update Product Form Submission
  document
    .getElementById("updateProductForm")
    .addEventListener("submit", updateExistingProduct);

  // Delete Product Button
  document
    .getElementById("deleteProductButton")
    .addEventListener("click", deleteExistingProduct);
}

// Fetch all products (including soft-deleted)
async function fetchAllProducts() {
  try {
    const response = await fetch("http://localhost:3000/products"); // Endpoint for all products
    allProducts = await response.json();
    renderAllProducts();
  } catch (error) {
    console.error("Error fetching all products:", error);
    renderAllProducts(); // Still try to render even if fetch fails
  }
}

// Render all products for 'All Products' tab
function renderAllProducts() {
  const allProductsList = document.getElementById("allProductsList");
  allProductsList.innerHTML = "";

  if (allProducts.length === 0) {
    allProductsList.innerHTML =
      "<p class='text-primary/70 col-span-full text-center'>No products found.</p>";
    return;
  }

  allProducts.forEach((product) => {
    const isActive = product.is_deleted === 0;
    const item = document.createElement("div");
    item.className = `bg-secondary rounded-lg p-2 shadow-md ${
      isActive ? "" : "opacity-60 grayscale"
    }`; // Add visual cue for inactive
    item.innerHTML = `
            <div class="flex rounded-lg  mb-2">
    <div class="w-1/3 flex items-center justify-center mr-4">
        <div class="h-full w-full bg-gray-custom rounded-lg flex items-center justify-center">
            <span class="text-gray-400 text-sm">Image Placeholder</span>
        </div>
    </div>
    <div class="w-2/3">
        <div class="text-lg font-bold text-primary mb-1">Rp. ${product.product_price.toLocaleString()}</div>
        <div class="text-base text-primary/70">${product.product_name}</div>
        <div class="text-sm text-gray-600 mt-1">SKU: ${product.sku}</div>
        <div class="text-sm text-gray-600">Stock: ${product.product_stock}</div>
        <div class="text-sm font-semibold mt-2 ${isActive ? 'text-green-600' : 'text-red-600'}">
            Status: ${isActive ? 'Active' : 'Inactive (Soft Deleted)'}
        </div>
    </div>
</div>
        `;
    allProductsList.appendChild(item);
  });
}

// Create New Product
async function createNewProduct(event) {
  event.preventDefault();
  const form = event.target;
  const newProduct = {
    sku: form["new-sku"].value,
    product_name: form["new-product_name"].value,
    product_price: parseFloat(form["new-product_price"].value),
    product_stock: parseInt(form["new-product_stock"].value),
  };

  try {
    const response = await fetch("http://localhost:3000/products", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(newProduct),
    });

    if (response.ok) {
      alert("Product added successfully!");
      form.reset();
      fetchAllProducts(); // Refresh the 'All Products' list
      // Optionally switch to 'All Products' tab
      document.getElementById("tab-all-products").click();
    } else {
      const errorData = await response.json();
      alert(
        `Failed to add product: ${errorData.message || response.statusText}`
      );
    }
  } catch (error) {
    console.error("Error adding product:", error);
    alert("Error adding product. Please check server connection.");
  }
}

// Search Product by SKU for Update/Delete
async function searchProductBySku() {
  const sku = document.getElementById("update-sku-search").value.trim();
  const updateProductForm = document.getElementById("updateProductForm");
  const productNotFoundMessage = document.getElementById("productNotFound");

  if (!sku) {
    alert("Please enter an SKU to search.");
    updateProductForm.classList.add("hidden");
    productNotFoundMessage.classList.add("hidden");
    return;
  }

  try {
    const response = await fetch(`http://localhost:3000/products/sku/${sku}`);
    if (response.ok) {
      currentProductToUpdate = await response.json();
      document.getElementById("currentProductSku").textContent =
        currentProductToUpdate.sku;
      document.getElementById("update-product_name").value =
        currentProductToUpdate.product_name;
      document.getElementById("update-product_price").value =
        currentProductToUpdate.product_price;
      document.getElementById("update-product_stock").value =
        currentProductToUpdate.product_stock;
      updateProductForm.classList.remove("hidden");
      productNotFoundMessage.classList.add("hidden");
    } else if (response.status === 404) {
      updateProductForm.classList.add("hidden");
      productNotFoundMessage.classList.remove("hidden");
      currentProductToUpdate = null;
    } else {
      throw new Error(`Failed to fetch product: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error searching product:", error);
    alert("Error searching product. Please check server connection.");
    updateProductForm.classList.add("hidden");
    productNotFoundMessage.classList.add("hidden");
    currentProductToUpdate = null;
  }
}

// Update Existing Product
async function updateExistingProduct(event) {
  event.preventDefault();
  if (!currentProductToUpdate) {
    alert("No product selected for update. Please search for a product first.");
    return;
  }

  const form = event.target;
  const updatedData = {
    product_name: form["update-product_name"].value,
    product_price: parseFloat(form["update-product_price"].value),
    product_stock: parseInt(form["update-product_stock"].value),
  };

  try {
    const response = await fetch(
      `http://localhost:3000/products/${currentProductToUpdate.sku}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedData),
      }
    );

    if (response.ok) {
      alert("Product updated successfully!");
      form.classList.add("hidden"); // Hide the form
      document.getElementById("update-sku-search").value = ""; // Clear search
      currentProductToUpdate = null; // Clear current product
      fetchAllProducts(); // Refresh 'All Products' list
      document.getElementById("tab-all-products").click(); // Switch to All Products tab
    } else {
      const errorData = await response.json();
      alert(
        `Failed to update product: ${errorData.message || response.statusText}`
      );
    }
  } catch (error) {
    console.error("Error updating product:", error);
    alert("Error updating product. Please check server connection.");
  }
}

// Delete Existing Product (Soft Delete)
async function deleteExistingProduct() {
  if (
    !currentProductToUpdate ||
    !confirm(
      `Are you sure you want to delete (soft delete) ${currentProductToUpdate.product_name}?`
    )
  ) {
    return;
  }

  try {
    const response = await fetch(
      `http://localhost:3000/products/${currentProductToUpdate.sku}`,
      {
        method: "DELETE",
      }
    );

    if (response.ok) {
      alert("Product soft-deleted successfully!");
      document.getElementById("updateProductForm").classList.add("hidden"); // Hide the form
      document.getElementById("update-sku-search").value = ""; // Clear search
      currentProductToUpdate = null; // Clear current product
      fetchAllProducts(); // Refresh 'All Products' list
      document.getElementById("tab-all-products").click(); // Switch to All Products tab
    } else {
      const errorData = await response.json();
      alert(
        `Failed to delete product: ${errorData.message || response.statusText}`
      );
    }
  } catch (error) {
    console.error("Error deleting product:", error);
    alert("Error deleting product. Please check server connection.");
  }
}
