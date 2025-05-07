-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Mar 14, 2025 at 04:35 PM
-- Server version: 10.4.24-MariaDB
-- PHP Version: 8.1.6

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `login_system`
--

-- --------------------------------------------------------

--
-- Table structure for table `branches`
--

CREATE TABLE `branches` (
  `id` int(11) NOT NULL,
  `branch_name` varchar(255) NOT NULL,
  `branch_address` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `branches`
--

INSERT INTO `branches` (`id`, `branch_name`, `branch_address`) VALUES
(1, 'QCPL-Main', 'highrise'),
(2, 'Lagro', 'asdasd'),
(4, 'North Fairview', ''),
(5, 'Test2', 'testz');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` int(11) NOT NULL,
  `employee_firstname` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_middlename` varchar(50) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `employee_lastname` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `employee_birthday` date NOT NULL,
  `passcode` varchar(50) COLLATE utf8mb4_unicode_ci NOT NULL,
  `branch` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `schedule_start` time NOT NULL,
  `schedule_end` time NOT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `employee_id`, `employee_firstname`, `employee_middlename`, `employee_lastname`, `employee_birthday`, `passcode`, `branch`, `schedule_start`, `schedule_end`, `created_at`, `updated_at`) VALUES
(1, 1, 'Louies', '', 'Saguinsin', '2025-03-05', 'pass1234', 'QCPL-Main', '07:26:00', '17:26:00', NULL, NULL),
(2, 2, 'Jonjon', 'Anolin', 'Saguinsin', '2000-06-07', 'pass123', 'Lagro', '07:30:00', '16:30:00', '2025-03-12 19:33:55', '2025-03-12 19:33:55'),
(3, 3, 'fred', '', 'asdf', '2025-03-12', 'pass123', 'North Fairview', '03:03:00', '04:04:00', NULL, NULL),
(4, 4, 'Jun', 'Apolinar', 'Toyo', '2000-06-07', 'pass123', 'Lagro', '08:00:00', '17:00:00', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `timerecords`
--

CREATE TABLE `timerecords` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `employee_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `time_in_morning` time DEFAULT NULL,
  `time_out_morning` time DEFAULT NULL,
  `time_in_afternoon` time DEFAULT NULL,
  `time_out_afternoon` time DEFAULT NULL,
  `time_in_img_morning` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `time_out_img_morning` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `time_in_img_afternoon` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `time_out_img_afternoon` text COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `timerecords`
--

INSERT INTO `timerecords` (`id`, `employee_id`, `date`, `time_in_morning`, `time_out_morning`, `time_in_afternoon`, `time_out_afternoon`, `time_in_img_morning`, `time_out_img_morning`, `time_in_img_afternoon`, `time_out_img_afternoon`, `created_at`, `updated_at`) VALUES
(26, 0, '2000-01-21', '15:42:00', '14:34:00', '14:34:00', '14:34:00', '23434', '234', '234', '234', NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `username` varchar(50) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `username`, `password`, `role`) VALUES
(1, 'admin', '21232f297a57a5a743894a0e4a801fc3', 'admin');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `branches`
--
ALTER TABLE `branches`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `timerecords`
--
ALTER TABLE `timerecords`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `branches`
--
ALTER TABLE `branches`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `timerecords`
--
ALTER TABLE `timerecords`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=27;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
