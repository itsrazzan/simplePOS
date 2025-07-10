# simplePOS

**simplePOS** adalah aplikasi web Point of Sale (kasir) sederhana yang dikembangkan sebagai proyek akhir semester 2. Aplikasi ini bertujuan untuk membantu pengelolaan produk, transaksi penjualan, dan pencatatan stok secara efisien di toko atau usaha kecil. Dengan tampilan modern dan fitur CRUD lengkap, simplePOS cocok untuk pembelajaran maupun implementasi kasir dasar.

---

## ✨ Fitur Utama

### Backend (Node.js + Express + MySQL)

- **Manajemen Produk**
  - Tambah produk baru
  - Lihat semua produk (termasuk soft delete)
  - Update data produk berdasarkan SKU
  - Soft delete produk (tidak benar-benar dihapus dari database)
  - Lihat produk aktif saja
- **Manajemen Transaksi** 
  - Buat transaksi baru (dengan validasi stok & pengurangan stok otomatis)
  - Lihat seluruh riwayat transaksi beserta detail produk yang dibeli

### Frontend (HTML, Java scipt, TailwindCSS)

- **Dashboard**: Ringkasan penjualan dan navigasi utama
- **Halaman Produk**: CRUD produk, pencarian & update berdasarkan SKU
- **Halaman Transaksi**: Pilih produk, tambah ke keranjang, pilih metode pembayaran, proses transaksi
- **Tampilan Responsive & Modern**: Menggunakan TailwindCSS untuk UI yang bersih dan mudah dikembangkan

---

##  Cara Kerja Backend

- **Produk**:  
  Endpoint `/products` menyediakan fitur GET, POST, PUT, DELETE (soft delete) serta pencarian produk berdasarkan SKU.  
  Produk yang dihapus hanya di-set `is_deleted = 1` (soft delete), sehingga data tetap aman dan tidak memicu error.
- **Transaksi**:  
  Endpoint `/transactions` menerima data transaksi baru (produk, jumlah, metode pembayaran), melakukan validasi stok, mengurangi stok produk, dan mencatat detail transaksi di tabel `Transactions_Details`.  
  Riwayat transaksi dapat diakses via GET `/transactions`.

---

## ⚡ Cara Kerja Frontend

- **Produk**:  
  Halaman produk menampilkan daftar produk, form tambah produk, serta fitur update/delete produk berdasarkan SKU.
- **Transaksi**:  
  Halaman transaksi menampilkan daftar produk aktif, keranjang belanja, pilihan metode pembayaran, dan tombol proses pembayaran.
- **Interaksi**:  
  Semua interaksi frontend menggunakan fetch API ke backend .

---

## 🚀 Cara Menjalankan Aplikasi

### 1. **Clone Repository**

```bash
git clone https://github.com/itsrazzan/simplePOS.git

```

### 2. **membuat database dengan schema.sql (khusus untuk environment baru)**
- jalankan xampp
- buka phpmyadmin dari aplikasi xampp dengan kli admin
- pilih tab import
- pilih file schema.sql
- klik button import, maka phpmyadmin akan membuatkan database secara otomatis

### 3. **menjalankan API Backend **

**masuk ke folder**
jalankan terminal di direktori simplePOS
cd backend

**menambahakn node modules dan library node.js (khusus untuk environment baru)**
- pertama masukkan command `npm init -y`
- kemudian tambahkan library dengan command ` npm install express dayjs nodemon mysql2 cors body-parser`

**menjalankan Node.js**
- ketik `nodemon app.js` untuk menjalankan node.js
- Aplikasi siap digunakan!!
