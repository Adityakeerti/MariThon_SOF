#!/usr/bin/env python3
"""
Simple database setup script for MariThon
Creates tables using mysql.connector
"""

import mysql.connector
from mysql.connector import Error
from config.settings import DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT

def create_database():
    """Create database if it doesn't exist"""
    try:
        # Connect without specifying database
        connection = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            port=DB_PORT
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            
            # Create database
            cursor.execute(f"CREATE DATABASE IF NOT EXISTS {DB_NAME}")
            print(f"Database '{DB_NAME}' created/verified successfully!")
            
            cursor.close()
            connection.close()
            return True
            
    except Error as e:
        print(f"Error creating database: {e}")
        return False

def create_tables():
    """Create all necessary tables"""
    try:
        connection = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            port=DB_PORT
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            
            # Create users table
            cursor.execute("""
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
                )
            """)
            
            # Create voyages table
            cursor.execute("""
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
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            """)
            
            # Create documents table
            cursor.execute("""
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
                    voyage_id INT,
                    user_id INT,
                    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    processed_at TIMESTAMP NULL
                )
            """)
            
            # Create events table
            cursor.execute("""
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
                    voyage_id INT,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
                )
            """)
            
            # Create laytime_calculations table
            cursor.execute("""
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
                    voyage_id INT,
                    calculation_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            connection.commit()
            print("All tables created successfully!")
            
            cursor.close()
            connection.close()
            return True
            
    except Error as e:
        print(f"Error creating tables: {e}")
        return False

def create_sample_users():
    """Create sample users for testing"""
    try:
        connection = mysql.connector.connect(
            host=DB_HOST,
            user=DB_USER,
            password=DB_PASSWORD,
            database=DB_NAME,
            port=DB_PORT
        )
        
        if connection.is_connected():
            cursor = connection.cursor()
            
            # Check if users already exist
            cursor.execute("SELECT COUNT(*) FROM users")
            user_count = cursor.fetchone()[0]
            
            if user_count > 0:
                print("Users already exist, skipping sample user creation...")
                return True
            
            # Create sample admin user (password: admin123)
            cursor.execute("""
                INSERT INTO users (username, email, password_hash, first_name, last_name, role) 
                VALUES (%s, %s, %s, %s, %s, %s)
            """, ('admin', 'admin@marithon.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.CG', 'Admin', 'User', 'admin'))
            
            # Create sample demo user (password: demo123)
            cursor.execute("""
                INSERT INTO users (username, email, password_hash, first_name, last_name, role)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, ('demo', 'demo@marithon.com', '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.s5u.CG', 'Demo', 'User', 'user'))
            
            connection.commit()
            print("Sample users created successfully!")
            print("Admin user: admin@marithon.com / admin123")
            print("Demo user: demo@marithon.com / demo123")
            
            cursor.close()
            connection.close()
            return True
            
    except Error as e:
        print(f"Error creating sample users: {e}")
        return False

def main():
    """Main setup function"""
    print("Starting MariThon database setup...")
    
    # Create database
    if not create_database():
        print("Failed to create database!")
        return
    
    # Create tables
    if not create_tables():
        print("Failed to create tables!")
        return
    
    # Create sample users
    if not create_sample_users():
        print("Failed to create sample users!")
        return
    
    print("Database setup completed successfully!")
    print("You can now start the backend server!")

if __name__ == "__main__":
    main()
