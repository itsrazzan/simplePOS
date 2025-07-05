const express = require("express");
const router = express.Router();
const { createTransaction } = require("../controllers/transactionsController");
const { getAllTransactions } = require("../controllers/transactionsController");

// Route untuk mendapatkan semua transaksi
router.get("/", getAllTransactions);
// Route untuk membuat transaksi baru
router.post("/", createTransaction);

module.exports = router;
