const db = require("../config/db");
const { get } = require("../routes/transactions");

//=============================== GET ALL PRODUCTS ================================//
const getAllProducts = async (req, res) => {
  try {
    const [results] = await db.query("SELECT * FROM Products");
    res.status(200).json(results);
  } catch (err) {
    console.error("Gagal mengambil data produk", err);
    res
      .status(500)
      .json({ message: "Gagal mengambil data produk", error: err });
  }
};

//=============================== CREATE PRODUCT ================================//
const createProduct = async (req, res) => {
  const { sku, product_name, product_price, product_stock } = req.body;
  // Validasi data yang diterima
  if (!sku || !product_name || product_price === undefined) {
    return res.status(400).json({ message: "Data tidak Lengkap" });
  }
  try {
    const [result] = await db.query(
      "INSERT INTO Products(sku, product_name, product_price, product_stock) VALUES (?,?,?,?)",
      [sku, product_name, product_price, product_stock || 0]
    );
    res.status(201).json({
      message: "produk berhasil ditambahkan",
      insertedId: result.insertId,
    });
  } catch (err) {
    res.status(500).json({ message: "gagal insert data", error: err });
  }
};


//=============================== GET PRODUCT BY SKU ================================//
const getProductBySku = async (req, res) => {
  try {
     //1. ambil sku dari parameter
     const { sku } = req.params;

      //2. validasi input sku
      if (!sku) {
        return res.status(400).json({ message: "SKU diperlukan" });
      }
      

    //3. jalankan query untuk ambil data produk
    const [results] = await db.query("SELECT * FROM Products WHERE sku = ? LIMIT 1", [ sku ]);

    //4. cek apakah produk ditemukan
    if (results.length === 0) {
      return res.status(404).json({message: ` Produk dengan SKU ${sku} tidak ditemukan`})
    }
    //5. kirim data produk
    res.status(200).json(results[0]);
  
} catch (err) {
  console.error("Gagal mengambil data produk", err);
  res.status(500).json({ message: "Gagal mengambil data produk", error: err.message });
  }
};


//=============================== GET PRODUCT BY SKU, ACTIVE ================================//
const getproductsActive = async (req,res) => {
  try {
    // 1. queri ambil produk yang aktif
    const [results] = await db.query(`SELECT product_id, sku, product_name, product_price, product_stock FROM Products WHERE is_deleted = 0`);

    // 2. kirim response data
    res.status(200).json(results);
  } catch (err){
    // 3. tangani error ambil data
    console.error(`gagal mengambil data produk aktif`, err);
  }
};



//=============================== UPDATE PRODUCT ================================//
const updateProduct = async (req, res) => {
  const sku = req.params.sku;
  const { product_name, product_price, product_stock } = req.body;

  //1. cek apakah data ada
  if (
    product_name === undefined &&
    product_price === undefined &&
    product_stock === undefined
  ) {
    return res.status(400).json({
      message: "Tidak ada data yang diupdate",
    });
  }
  try {
    //2.buat array untuk kolom yang akan diupdate
    const fields = [];
    const values = [];

    if (product_name) {
      fields.push("product_name = ?");
      values.push(product_name);
    }
    if (product_price) {
      fields.push("product_price = ?");
      values.push(product_price);
    }
    if (product_stock !== undefined) {
      fields.push("product_stock = ?");
      values.push(product_stock);
    }
    //3. push sku ke values
    values.push(sku);

    //4. susun dan jalankan update query
    const query = `UPDATE Products SET ${fields.join(", ")} WHERE sku = ?`;
    const [result] = await db.query(query, values);
    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ message: `Produk dengan SKU ${sku} tidak ditemukan` });
    }
    //5. kirim response sukses
    res.status(200).json({ message: "Produk berhasil diupdate" });
  } catch (err) {
    console.error("Gagal update produk", err);
    res.status(500).json({ message: "Gagal update produk", error: err });
  }
};

//=============================== DELETE PRODUCT, {SOFT DELETE} ================================//
const deleteProduct = async (req, res) => {
  // Menggunakan parameter id untuk menghapus produk
  try {
    const { sku } = req.params;
    // update kolom is_deleted menjadi 1 
    const [result] = await db.query(
      "UPDATE Products SET is_deleted = 1 WHERE sku= ?",
      [sku]
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "produk tidak ditemukan" });
    }
    res.status(200).json({ message: "produk Berhasil dihapus" });
  } catch (err) {
    console.error("gagal hapus data", err);
    res.status(500).json({ message: "gagal hapus produk", error: err });
  }
};


// File: productsController.js
module.exports = {
  getAllProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductBySku,
  getproductsActive
};
