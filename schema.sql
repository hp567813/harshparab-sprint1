-- EstateEdge Database Schema
DROP DATABASE IF EXISTS estateedge;
CREATE DATABASE estateedge;
USE estateedge;

-- Users table
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    role ENUM('buyer', 'seller', 'admin') DEFAULT 'buyer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Properties table
CREATE TABLE properties (
    id INT AUTO_INCREMENT PRIMARY KEY,
    seller_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(12, 2) NOT NULL,
    address VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    state VARCHAR(50) NOT NULL,
    zip_code VARCHAR(10) NOT NULL,
    bedrooms INT DEFAULT 0,
    bathrooms INT DEFAULT 0,
    square_feet INT DEFAULT 0,
    property_type ENUM('house', 'apartment', 'condo', 'townhouse', 'land') DEFAULT 'house',
    status ENUM('available', 'pending', 'sold') DEFAULT 'available',
    image_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Sales table
CREATE TABLE sales (
    id INT AUTO_INCREMENT PRIMARY KEY,
    property_id INT NOT NULL,
    buyer_id INT NOT NULL,
    seller_id INT NOT NULL,
    sale_price DECIMAL(12, 2) NOT NULL,
    commission DECIMAL(8, 2) DEFAULT 0,
    sale_date DATE NOT NULL,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Payments table
CREATE TABLE payments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    sale_id INT NOT NULL,
    amount DECIMAL(12, 2) NOT NULL,
    payment_type ENUM('down_payment', 'installment', 'full_payment', 'commission') DEFAULT 'down_payment',
    payment_method ENUM('cash', 'check', 'bank_transfer', 'credit_card') DEFAULT 'bank_transfer',
    payment_date DATE NOT NULL,
    status ENUM('pending', 'completed', 'failed') DEFAULT 'pending',
    transaction_id VARCHAR(100),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (sale_id) REFERENCES sales(id) ON DELETE CASCADE
);

-- Insert default admin user
INSERT INTO users (email, password, first_name, last_name, role) VALUES 
('admin@estateedge.local', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', 'User', 'admin');

-- Insert sample seller users
INSERT INTO users (email, password, first_name, last_name, phone, role) VALUES 
('seller1@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'John', 'Seller', '555-0101', 'seller'),
('seller2@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Jane', 'Agent', '555-0102', 'seller');

-- Insert sample buyer users
INSERT INTO users (email, password, first_name, last_name, phone, role) VALUES 
('buyer1@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Mike', 'Buyer', '555-0201', 'buyer'),
('buyer2@example.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sarah', 'Johnson', '555-0202', 'buyer');

-- Insert sample properties
INSERT INTO properties (seller_id, title, description, price, address, city, state, zip_code, bedrooms, bathrooms, square_feet, property_type, status, image_url) VALUES 
(2, 'Beautiful Family Home', 'Spacious 4-bedroom home with modern amenities in quiet neighborhood', 450000.00, '123 Maple Street', 'Springfield', 'IL', '62701', 4, 3, 2500, 'house', 'available', 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800'),
(2, 'Downtown Luxury Condo', 'Modern condo in the heart of downtown with city views', 320000.00, '456 Main Avenue', 'Springfield', 'IL', '62702', 2, 2, 1200, 'condo', 'available', 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800'),
(3, 'Charming Starter Home', 'Perfect first home with updated kitchen and hardwood floors', 180000.00, '789 Oak Drive', 'Springfield', 'IL', '62703', 3, 2, 1400, 'house', 'available', 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?w=800'),
(3, 'Executive Estate', 'Luxury estate with pool and 3-car garage on 2 acres', 850000.00, '321 Elite Boulevard', 'Springfield', 'IL', '62704', 5, 4, 4200, 'house', 'pending', 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800');

-- Insert sample sales
INSERT INTO sales (property_id, buyer_id, seller_id, sale_price, commission, sale_date, status) VALUES 
(4, 4, 3, 850000.00, 25500.00, '2024-08-15', 'pending');

-- Insert sample payments
INSERT INTO payments (sale_id, amount, payment_type, payment_method, payment_date, status, transaction_id) VALUES 
(1, 85000.00, 'down_payment', 'bank_transfer', '2024-08-15', 'completed', 'TXN001234567');

-- Create indexes for better performance
CREATE INDEX idx_properties_seller ON properties(seller_id);
CREATE INDEX idx_properties_status ON properties(status);
CREATE INDEX idx_properties_city ON properties(city);
CREATE INDEX idx_sales_property ON sales(property_id);
CREATE INDEX idx_sales_buyer ON sales(buyer_id);
CREATE INDEX idx_payments_sale ON payments(sale_id);