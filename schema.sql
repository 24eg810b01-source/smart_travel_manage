-- ==============================================================
-- SMART TRAVEL MANAGEMENT SYSTEM - MySQL 8.0 DDL & SEED SCRIPT
-- Host: localhost:3306
-- Database: smart_travel_db
-- User: root
-- ==============================================================

CREATE DATABASE IF NOT EXISTS smart_travel_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smart_travel_db;

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(180) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL DEFAULT '$2a$10$eO1v0QjG9F9cW7r/xQ0B4uY9v2w1Z5.',
    role ENUM('USER', 'ADMIN', 'CO_PLANNER') NOT NULL DEFAULT 'USER',
    avatar VARCHAR(255),
    phone VARCHAR(30),
    department VARCHAR(100),
    member_since DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 2. Destinations Table
CREATE TABLE IF NOT EXISTS destinations (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    country VARCHAR(100) NOT NULL,
    continent ENUM('Asia', 'Europe', 'North America', 'South America', 'Oceania', 'Africa') NOT NULL,
    image VARCHAR(255) NOT NULL,
    description TEXT,
    category ENUM('Cultural', 'Adventure', 'Relaxation', 'Urban', 'Nature') NOT NULL,
    budget_level ENUM('$', '$$', '$$$', '$$$$') NOT NULL DEFAULT '$$',
    best_season VARCHAR(100),
    currency VARCHAR(20),
    avg_daily_cost DECIMAL(10,2) NOT NULL DEFAULT 150.00,
    rating DECIMAL(3,2) NOT NULL DEFAULT 4.50,
    status ENUM('ACTIVE', 'FEATURED', 'ARCHIVED') NOT NULL DEFAULT 'ACTIVE',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- 3. Trips Table
CREATE TABLE IF NOT EXISTS trips (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    destination_id VARCHAR(36) NOT NULL,
    destination_name VARCHAR(150) NOT NULL,
    title VARCHAR(200) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('PLANNING', 'CONFIRMED', 'ONGOING', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PLANNING',
    total_budget DECIMAL(10,2) NOT NULL DEFAULT 2000.00,
    cover_image VARCHAR(255),
    notes TEXT,
    share_code VARCHAR(30) UNIQUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_trips_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_trips_destination FOREIGN KEY (destination_id) REFERENCES destinations(id) ON DELETE RESTRICT
) ENGINE=InnoDB;

-- 4. Trip Days Table
CREATE TABLE IF NOT EXISTS trip_days (
    id VARCHAR(36) PRIMARY KEY,
    trip_id VARCHAR(36) NOT NULL,
    day_number INT NOT NULL,
    date DATE NOT NULL,
    title VARCHAR(150) NOT NULL,
    CONSTRAINT fk_days_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Activities Table
CREATE TABLE IF NOT EXISTS activities (
    id VARCHAR(36) PRIMARY KEY,
    day_id VARCHAR(36) NOT NULL,
    time VARCHAR(10) NOT NULL,
    title VARCHAR(200) NOT NULL,
    location VARCHAR(200),
    cost DECIMAL(10,2) DEFAULT 0.00,
    category ENUM('Sightseeing', 'Dining', 'Transport', 'Leisure', 'Tour') NOT NULL,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_activities_day FOREIGN KEY (day_id) REFERENCES trip_days(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 6. Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id VARCHAR(36) PRIMARY KEY,
    trip_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    type ENUM('FLIGHT', 'HOTEL', 'TRAIN', 'ACTIVITY', 'CAR_RENTAL') NOT NULL,
    provider VARCHAR(150) NOT NULL,
    confirmation_code VARCHAR(50) NOT NULL,
    reference_no VARCHAR(50) NOT NULL,
    title VARCHAR(200) NOT NULL,
    details TEXT,
    start_date_time DATETIME NOT NULL,
    end_date_time DATETIME NOT NULL,
    cost DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    status ENUM('PENDING', 'CONFIRMED', 'IN_TRANSIT', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    seat_or_room VARCHAR(50),
    terminal_gate VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bookings_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    CONSTRAINT fk_bookings_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 7. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(36) PRIMARY KEY,
    trip_id VARCHAR(36) NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    title VARCHAR(200) NOT NULL,
    category ENUM('Flights', 'Lodging', 'Dining', 'Transit', 'Activities', 'Shopping', 'Misc') NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    date DATE NOT NULL,
    paid_by VARCHAR(120) NOT NULL,
    receipt_ref VARCHAR(50),
    status ENUM('PAID', 'PENDING', 'REIMBURSED', 'SPLIT') NOT NULL DEFAULT 'PAID',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_expenses_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    CONSTRAINT fk_expenses_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 8. Audit Logs Table
CREATE TABLE IF NOT EXISTS audit_logs (
    id VARCHAR(36) PRIMARY KEY,
    timestamp DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actor VARCHAR(120) NOT NULL,
    action VARCHAR(100) NOT NULL,
    entity VARCHAR(150) NOT NULL,
    details TEXT,
    status ENUM('SUCCESS', 'WARNING', 'ERROR') NOT NULL DEFAULT 'SUCCESS'
) ENGINE=InnoDB;

-- ==============================================================
-- INITIAL SEED RECORDS
-- ==============================================================
INSERT IGNORE INTO users (id, name, email, role, member_since) VALUES
('usr-1', 'Alex Morgan', 'alex.morgan@voyage.io', 'USER', '2024-03-15'),
('usr-admin', 'Administrator (root)', 'admin@smarttravel.internal', 'ADMIN', '2023-01-10');

INSERT IGNORE INTO destinations (id, name, country, continent, image, description, category, avg_daily_cost, rating, status) VALUES
('dest-1', 'Kyoto & Kansai', 'Japan', 'Asia', '/src/assets/images/destination_kyoto_japan_1793293339020.jpg', 'Ancient shrines, serene bamboo groves, traditional machiya townhouses, and Kaiseki gastronomy.', 'Cultural', 195.00, 4.90, 'FEATURED'),
('dest-2', 'Swiss Alps & Zermatt', 'Switzerland', 'Europe', '/src/assets/images/destination_swiss_alps_1793293339440.jpg', 'Car-free mountain hamlet crowned by the iconic Matterhorn, offering alpine hiking and cogwheel railways.', 'Nature', 310.00, 4.85, 'FEATURED');
