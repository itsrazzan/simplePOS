const express = require("express");
const cors = require("cors");
const app = express();
const productRoutes = require("./routes/products");
const transactionRoutes = require("./routes/transactions");

// Middleware
app.use(cors());
app.use(express.json());

//Route Dasar
app.get("/", (req, res) => {
  res.send("simplePOS backend ready meluncur 🚀");
});
app.use("/products", productRoutes);

//tambah Transaksi
app.use("/transactions", transactionRoutes);

//Jalankan Server
const PORT = 3000;
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server sudah meluncur di Port ${PORT}`);
});
