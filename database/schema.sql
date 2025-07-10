-- Buat database, jika belum ada
CREATE DATABASE IF NOT EXISTS simplePOS;
USE simplePOS;

-- Tabel: Products
CREATE TABLE IF NOT EXISTS Products (
    product_id INT(11) NOT NULL AUTO_INCREMENT,
    sku VARCHAR(100) NOT NULL UNIQUE,
    product_name VARCHAR(100) NOT NULL,
    product_price DECIMAL(10,2) NOT NULL,
    product_stock INT(11) NOT NULL DEFAULT 0,
    is_deleted TINYINT(1) NOT NULL DEFAULT 0, -- untuk soft delete
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (product_id)
);

--  Tabel: Transactions
CREATE TABLE IF NOT EXISTS Transactions (
    transaction_id INT(11) NOT NULL AUTO_INCREMENT,
    transaction_date TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    total_amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(30) NOT NULL,
    PRIMARY KEY (transaction_id)
);

-- Tabel: Transactions_Details
CREATE TABLE IF NOT EXISTS Transactions_Details (
    transaction_detail_id INT(11) NOT NULL AUTO_INCREMENT,
    transaction_id INT(11) NOT NULL,
    product_id INT(11) NOT NULL,
    quantity INT(11) NOT NULL,
    price_at_order_time DECIMAL(10,2) NOT NULL,
    PRIMARY KEY (transaction_detail_id),
    FOREIGN KEY (transaction_id) REFERENCES Transactions(transaction_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(product_id)
);



-- Tambah data dummy ke tabel Products
INSERT INTO Products (sku, product_name, product_price, product_stock)
VALUES 
('SKU002', 'Kemeja Oxford Pria', 320000.00, 15),
('TSHIRT001', 'Kaos Polos Katun Combed 30s', 45000.00, 50),
('JNS001', 'Celana Jeans Slim Fit Pria', 120000.00, 30),
('HD001', 'Hoodie Zipper Fleece', 150000.00, 20),
('KRUD001', 'Kemeja Flanel Lengan Panjang', 95000.00, 25),
('BLZR001', 'Blazer Casual Wanita', 175000.00, 15),
('JKT001', 'Jaket Parka Waterproof', 200000.00, 10),
('KNIT001', 'Sweater Rajut Lengan Panjang', 85000.00, 30),
('KEM003', 'Kemeja Polos Slimfit', 105000.00, 35),
('HD002', 'Hoodie Crop Zipper Wanita', 160000.00, 18);
