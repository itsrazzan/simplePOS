// import koneksi database
const db = require("../config/db");

/**================================= GET TRANSACTIONS ==============================*/
/**=============================================================================== */
//1.import koneksi oleh const db dari config/db.js
// 2. ambil semua transaksi
const getAllTransactions = async (req, res) => {
  try {
    //ambil data transaksi + detail + produk dengan Join
    const [rows] = await db.query(`
            SELECT
            t.transaction_id,
            t.transaction_date,
            t.total_amount,
            t.payment_method,
            p.product_name,
            p.sku,
            td.quantity,
            td.price_at_order_time
            FROM Transactions t
            JOIN Transactions_Details td ON t.transaction_id = td.transaction_id
            JOIN Products p ON td.product_id = p.product_id
            ORDER BY t.transaction_id DESC
            `);
    //buat objek menampung transaksi per ID
    const transactions = {};
    //looping hasil
    for (const row of rows) {
      const id = row.transaction_id;
      //jika transaksi belum ada, buat objek baru
      if (!transactions[id]) {
        transactions[id] = {
          transaction_id: id,
          transaction_date: row.transaction_date,
          total_amount: row.total_amount,
          payment_method: row.payment_method,
          items: [],
        };
      }
      //tambahkan produk ke array items
      transactions[id].items.push({
        product_name: row.product_name,
        sku: row.sku,
        quantity: row.quantity,
        price_at_order_time: row.price_at_order_time,
      });
    }
    //ubah objek menjadi array
    const result = Object.values(transactions);

    //kirim response sukses
    res.status(200).json(result);
  } catch (err) {
    console.error("Gagal mengambil data transaksi", err);
    res
      .status(500)
      .json({ message: "Gagal mengambil data transaksi", error: err });
  }
};

/**================================= POST TRANSACTIONS ==============================*/
/**================================================================================ */
// handle transaksi baru
const createTransaction = async (req, res) => {
  // Ambil koneksi dari pool (untuk beginTransaction dan commit)
  const conn = await db.getConnection();

  try {
    //mulai transaksi, semua queri bisa di rollback jika error
    await conn.beginTransaction();
    //ambil data dari body request
    const { payment_method, items } = req.body;
    // 1. Validasi request dasar: payment_method wajib, items harus array dan tidak kosong
    if (!payment_method || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Data Transaksi tidak lengkap" });
    }

    //2. ambil semua SKU dari items
    const skus = items.map((item) => item.sku);

    //buat placeholder queri SQL, ambil detail product berdasarkan SKU
    const placeholders = skus.map(() => "?").join(",");
    const queryProduct = `SELECT product_id,sku, product_price, product_stock FROM Products WHERE sku IN (${placeholders})`;

    //3. panggil query produk dengan skus
    const [products] = await conn.query(queryProduct, skus);

    //4. hitung total & siapkan variabel
    const details = [];
    let total = 0;
    const updatedStockTasks = [];
    const skuSet = new Set(); // untuk menghindari duplikasi SKU

    //5. looping items untuk menghitung total dan menyiapkan detail transaksi
    for (const item of items) {
      // =====[1] Cek sku ganda ====//
      if (skuSet.has(item.sku)) {
        throw new Error(`SKU ${item.sku} sudah ada dalam daftar`);
      }
      skuSet.add(item.sku);
      // =====[2] Cari produk yang sesuai dengan Sku ====//
      const product = products.find((p) => p.sku === item.sku);
      if (!product) {
        throw new Error(`Produk dengan SKU ${item.sku} tidak ditemukan`);
      }
      // =====[3] Cek stok produk ===//
      if (product.product_stock < item.quantity) {
        throw new Error(`Stok tidak cukup untuk SKU ${item.sku}`);
      }
      //=====[4] Siapkan data detail transaksi ===//
      // hitung subtotal dan akumulasi total
      const price = product.product_price;
      const subtotal = price * item.quantity;
      total += subtotal;

      // simpan detail ke tabel detail
      details.push({
        product_id: product.product_id,
        quantity: item.quantity,
        price_at_order_time: price,
      });

      //=====[5] Simpan task update stok produk ===//
      updatedStockTasks.push({
        product_id: product.product_id,
        quantity: item.quantity,
      });
    }

    //6. simpan data ke tabel Transactions
    const [result] = await conn.query(
      `INSERT INTO Transactions (total_amount, payment_method) VALUES (?,?)`,
      [total, payment_method]
    );
    // ambil ID transaksi baru
    const transactionId = result.insertId;

    //7. Simpan detail transaksi
    const detailValues = details.map((d) => [
      transactionId,
      d.product_id,
      d.quantity,
      d.price_at_order_time,
    ]);
    await conn.query(
      `INSERT INTO Transactions_Details (transaction_id, product_id, quantity, price_at_order_time) VALUES ?`,
      [detailValues]
    );

    //8. Update stok produk satu per satu
    for (const update of updatedStockTasks) {
      await conn.query(
        `UPDATE Products SET product_stock = product_stock - ? WHERE product_id = ?`,
        [update.quantity, update.product_id]
      );
    }

    //9.commit semua query
    await conn.commit(); // commit transaksi

    //10.kirim status sukses
    res.status(201).json({
      message: "Transaksi berhasil disimpan",
      transaction_id: transactionId,
      total_amount: total,
      items: details,
    });
  } catch (err) {
    // 11. jika terjadi error, Rollback
    await conn.rollback();
    console.error("Gagal membuat transaksi", err);
    res.status(500).json({ message: "Transaksi gagal", error: err.message });
  } finally {
    //IMPORTANT, kembalikan koneksi ke pool
    conn.release();
  }
};

/**===== Export Fungsi ======*/
module.exports = {
  getAllTransactions,
  createTransaction,
};
