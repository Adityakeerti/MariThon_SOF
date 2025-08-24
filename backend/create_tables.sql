-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS marithon_db;
USE marithon_db;

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    role VARCHAR(20) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Create voyages table
CREATE TABLE IF NOT EXISTS voyages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    vessel_name VARCHAR(100) NOT NULL,
    voyage_from VARCHAR(100),
    voyage_to VARCHAR(100),
    port VARCHAR(100),
    cargo_type VARCHAR(100),
    operation VARCHAR(20),
    allowed_laytime FLOAT,
    demurrage_rate FLOAT,
    dispatch_rate FLOAT,
    loading_rate FLOAT,
    quantity FLOAT,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create documents table
CREATE TABLE IF NOT EXISTS documents (
    id INT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path VARCHAR(500) NOT NULL,
    file_size INT,
    mime_type VARCHAR(100),
    document_type VARCHAR(50),
    extraction_status VARCHAR(20) DEFAULT 'pending',
    extracted_data JSON,
    extraction_errors TEXT,
    voyage_id INT NOT NULL,
    user_id INT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    processed_at TIMESTAMP NULL,
    FOREIGN KEY (voyage_id) REFERENCES voyages(id),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
    id INT AUTO_INCREMENT PRIMARY KEY,
    event_type VARCHAR(50) NOT NULL,
    timestamp TIMESTAMP NOT NULL,
    description TEXT,
    weather_conditions VARCHAR(100),
    stoppage_reason VARCHAR(200),
    is_weather_excluded BOOLEAN DEFAULT FALSE,
    is_weekend_excluded BOOLEAN DEFAULT FALSE,
    is_nor_excluded BOOLEAN DEFAULT FALSE,
    voyage_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (voyage_id) REFERENCES voyages(id)
);

-- Create laytime_calculations table
CREATE TABLE IF NOT EXISTS laytime_calculations (
    id INT AUTO_INCREMENT PRIMARY KEY,
    total_laytime FLOAT NOT NULL,
    used_laytime FLOAT NOT NULL,
    remaining_laytime FLOAT NOT NULL,
    demurrage_amount FLOAT,
    dispatch_amount FLOAT,
    weather_exclusions FLOAT DEFAULT 0,
    weekend_exclusions FLOAT DEFAULT 0,
    nor_exclusions FLOAT DEFAULT 0,
    other_exclusions FLOAT DEFAULT 0,
    voyage_id INT NOT NULL,
    calculation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (voyage_id) REFERENCES voyages(id)
);

-- Insert sample admin user (password: admin123)
INSERT INTO users (username, email, password_hash, first_name, last_name, role) 
VALUES ('admin', 'admin@marithon.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.CG', 'Admin', 'User', 'admin')
ON DUPLICATE KEY UPDATE id=id;

-- Insert sample demo user (password: demo123)
INSERT INTO users (username, email, password_hash, first_name, last_name, role)
VALUES ('demo', 'demo@marithon.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.CG', 'Demo', 'User', 'user')
ON DUPLICATE KEY UPDATE id=id;
