-- HR Manager & Salary Analytics System - MySQL schema
-- Run in phpMyAdmin: select database ip_std6730202190 -> SQL tab -> paste -> Go.
-- (The backend also creates this table automatically on startup if it can connect.)

CREATE TABLE IF NOT EXISTS `TanaHom_202190` (
  `id`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name`       VARCHAR(100) NOT NULL,
  `position`   VARCHAR(100) NOT NULL,
  `status`     ENUM('Active', 'On Leave') NOT NULL DEFAULT 'Active',
  `salary`     DECIMAL(12, 2) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed data: inserted only when the table is empty (safe to run this file again).
INSERT INTO `TanaHom_202190` (`name`, `position`, `status`, `salary`)
SELECT * FROM (
  SELECT 'John Doe' AS name, 'Software Engineer' AS position, 'Active' AS status, 45000 AS salary
  UNION ALL SELECT 'Jane Smith', 'HR Manager', 'Active', 85000
  UNION ALL SELECT 'Somchai Jaidee', 'Junior Developer', 'On Leave', 18000
  UNION ALL SELECT 'Suda Rakdee', 'Office Assistant', 'Active', 16500
  UNION ALL SELECT 'Michael Brown', 'Senior Engineer', 'Active', 48000
  UNION ALL SELECT 'Nida Srisuk', 'Accountant', 'Active', 21000
  UNION ALL SELECT 'David Lee', 'Engineering Director', 'On Leave', 92000
  UNION ALL SELECT 'Kanya Wong', 'UX Designer', 'Active', 42000
) AS seed
WHERE NOT EXISTS (SELECT 1 FROM `TanaHom_202190`);
