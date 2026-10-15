-- phpMyAdmin SQL Dump
-- version 5.2.1deb3
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Oct 15, 2026 at 04:53 AM
-- Server version: 8.0.46-0ubuntu0.24.04.4
-- PHP Version: 8.3.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ip_std6730202190`
--

-- --------------------------------------------------------

--
-- Table structure for table `TanaHom_202190`
--

CREATE TABLE `TanaHom_202190` (
  `id` int UNSIGNED NOT NULL,
  `name` varchar(100) NOT NULL,
  `position` varchar(100) NOT NULL,
  `status` enum('Active','On Leave') NOT NULL DEFAULT 'Active',
  `salary` decimal(12,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

--
-- Dumping data for table `TanaHom_202190`
--

INSERT INTO `TanaHom_202190` (`id`, `name`, `position`, `status`, `salary`, `created_at`, `updated_at`) VALUES
(1, 'John Doe', 'Software Engineer', 'Active', 45000.00, '2026-10-15 03:14:42', '2026-10-15 03:14:42'),
(2, 'Jane Smith', 'HR Manager', 'Active', 85000.00, '2026-10-15 03:14:42', '2026-10-15 03:14:42'),
(3, 'Somchai Jaidee', 'Junior Developer', 'On Leave', 18000.00, '2026-10-15 03:14:42', '2026-10-15 03:14:42'),
(4, 'Suda Rakdee', 'Office Assistant', 'Active', 16500.00, '2026-10-15 03:14:42', '2026-10-15 03:14:42'),
(5, 'Michael Brown', 'Senior Engineer', 'Active', 48000.00, '2026-10-15 03:14:42', '2026-10-15 03:14:42'),
(6, 'Nida Srisuk', 'Accountant', 'Active', 21000.00, '2026-10-15 03:14:42', '2026-10-15 03:14:42'),
(7, 'David Lee', 'Engineering Director', 'On Leave', 92000.00, '2026-10-15 03:14:42', '2026-10-15 03:14:42'),
(8, 'Kanya Wong', 'UX Designer', 'Active', 42000.00, '2026-10-15 03:14:42', '2026-10-15 03:14:42'),
(18, 'Jay Spcae Y', 'OSPL', 'On Leave', 250.00, '2026-10-15 04:44:30', '2026-10-15 04:45:36'),
(19, 'San', 'CEO', 'Active', 500000.00, '2026-10-15 04:45:52', '2026-10-15 04:45:52');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `TanaHom_202190`
--
ALTER TABLE `TanaHom_202190`
  ADD PRIMARY KEY (`id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `TanaHom_202190`
--
ALTER TABLE `TanaHom_202190`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
