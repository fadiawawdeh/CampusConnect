CREATE DATABASE IF NOT EXISTS campusconnect;
USE campusconnect;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  birth_date DATE NULL,
  birth_country VARCHAR(100) NULL,
  birth_city VARCHAR(100) NULL,
  gender ENUM('male','female','other','prefer_not_to_say') NULL,
  address TEXT NULL,
  phone_number VARCHAR(30) NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('student', 'staff', 'club_organizer', 'admin') NOT NULL DEFAULT 'student',
  is_verified TINYINT(1) NOT NULL DEFAULT 0,
  verification_token VARCHAR(255) NULL,
  reset_password_token VARCHAR(255) NULL,
  reset_password_expires_at DATETIME NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Manual admin seed to match acceptance criteria for Administrator Login
-- Password: Admin123!
INSERT INTO users (
  first_name, last_name, email, password_hash, role, is_verified
)
VALUES (
  'System',
  'Administrator',
  'admin@isik.edu.tr',
  '$2a$10$3euPcmQFCiblsZeEu5s7p.9B6Q/EXYc0ZP6YJ6mRfj7Pj8AqhH4Rm',
  'admin',
  1
)
ON DUPLICATE KEY UPDATE email = email;
