const express = require("express");
const router = express.Router();
const {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductBySku,
  getproductsActive
} = require("../controllers/productsController");

//Route Get /products
router.get("/", getAllProducts);

//Route Get /products by sku
router.get("/sku/:sku", getProductBySku);

 // Route untuk ambil produk aktif
 router.get("/active", getproductsActive)
//POST produk baru
router.post("/", createProduct);

//update produk by sku
router.put("/:sku", updateProduct);

// Delete Produk by ID
router.delete("/:sku", deleteProduct);

module.exports = router;
