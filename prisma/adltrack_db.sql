-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Hôte : 127.0.0.1
-- Généré le : mar. 17 fév. 2026 à 17:41
-- Version du serveur : 10.4.32-MariaDB
-- Version de PHP : 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de données : `adltrack_db`
--

-- --------------------------------------------------------

--
-- Structure de la table `alternative_penalties_registry`
--

CREATE TABLE `alternative_penalties_registry` (
  `id` int(11) NOT NULL,
  `serial_number` int(11) NOT NULL,
  `year` int(11) NOT NULL DEFAULT 2026,
  `ordinal_full` varchar(191) NOT NULL DEFAULT '',
  `full_name` varchar(191) NOT NULL,
  `national_id` varchar(191) NOT NULL,
  `address_contact` text DEFAULT NULL,
  `source_court` varchar(191) DEFAULT NULL,
  `case_number` varchar(191) DEFAULT NULL,
  `judgment_number` varchar(191) DEFAULT NULL,
  `judgment_date` datetime(3) DEFAULT NULL,
  `crime_type` varchar(191) DEFAULT NULL,
  `original_penalty_type` varchar(191) DEFAULT NULL,
  `original_penalty_duration` varchar(191) DEFAULT NULL,
  `alternative_penalty_type` varchar(191) DEFAULT NULL,
  `alternative_penalty_details` text DEFAULT NULL,
  `supervising_institution` varchar(191) DEFAULT NULL,
  `prosecution_referral_date` datetime(3) DEFAULT NULL,
  `execution_decision_number` varchar(191) DEFAULT NULL,
  `execution_decision_date` datetime(3) DEFAULT NULL,
  `execution_decision_content` text DEFAULT NULL,
  `followup_orders` text DEFAULT NULL,
  `report_received_date` datetime(3) DEFAULT NULL,
  `responsible_authority` varchar(191) DEFAULT NULL,
  `compliance_notes` text DEFAULT NULL,
  `appellant_identity` varchar(191) DEFAULT NULL,
  `dispute_date` datetime(3) DEFAULT NULL,
  `dispute_subject` text DEFAULT NULL,
  `dispute_outcome` text DEFAULT NULL,
  `final_decision_date` datetime(3) DEFAULT NULL,
  `appeal_deadline` datetime(3) DEFAULT NULL,
  `notification_date` datetime(3) DEFAULT NULL,
  `judge_notes` text DEFAULT NULL,
  `createdById` int(11) NOT NULL,
  `updatedById` int(11) DEFAULT NULL,
  `created_at` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updated_at` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `alternative_penalties_registry`
--

INSERT INTO `alternative_penalties_registry` (`id`, `serial_number`, `year`, `ordinal_full`, `full_name`, `national_id`, `address_contact`, `source_court`, `case_number`, `judgment_number`, `judgment_date`, `crime_type`, `original_penalty_type`, `original_penalty_duration`, `alternative_penalty_type`, `alternative_penalty_details`, `supervising_institution`, `prosecution_referral_date`, `execution_decision_number`, `execution_decision_date`, `execution_decision_content`, `followup_orders`, `report_received_date`, `responsible_authority`, `compliance_notes`, `appellant_identity`, `dispute_date`, `dispute_subject`, `dispute_outcome`, `final_decision_date`, `appeal_deadline`, `notification_date`, `judge_notes`, `createdById`, `updatedById`, `created_at`, `updated_at`) VALUES
(1, 1, 2025, '1/2025', 'عبد الله الناصري', 'Z101111', 'حي السلام، الدار البيضاء', 'المحكمة الابتدائية بالدار البيضاء', '1001/2025', '2001/2025', '2024-12-11 23:00:00.000', 'إصدار شيك بدون رصيد', 'الحبس الموقوف التنفيذ', '2 أشهر', 'تقييد بعض الحقوق', 'تنفيذ 80 ساعة من العمل', 'المركز الاجتماعي للقرب', '2025-01-10 23:00:00.000', 'ت.ب/3001/2025', '2025-01-17 23:00:00.000', 'تنفيذ العقوبة البديلة وفق المقتضيات القانونية', NULL, NULL, 'المركز الاجتماعي للقرب', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, NULL, '2026-02-06 19:09:43.700', '2026-02-06 19:09:43.700'),
(2, 2, 2025, '2/2025', 'سمير المغربي', 'Z102222', 'حي المسيرة، فاس', 'المحكمة الابتدائية بفاس', '1002/2025', '2002/2025', '2025-01-12 23:00:00.000', 'خيانة الأمانة', 'الغرامة', '3 أشهر', 'فرض تدابير رقابية أو علاجية أو تأهيلية', 'تنفيذ 120 ساعة من العمل', 'مؤسسة الأعمال الاجتماعية', '2025-02-11 23:00:00.000', 'ت.ب/3002/2025', '2025-02-18 23:00:00.000', 'تنفيذ العقوبة البديلة وفق المقتضيات القانونية', NULL, '2025-03-13 23:00:00.000', 'مؤسسة الأعمال الاجتماعية', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-02-14 23:00:00.000', NULL, 4, NULL, '2026-02-06 19:09:43.706', '2026-02-06 19:09:43.706'),
(3, 3, 2025, '3/2025', 'نور الدين البكري', 'Z103333', 'حي الفتح، مراكش', 'المحكمة الابتدائية بمراكش', '1003/2025', '2003/2025', '2025-02-11 00:00:00.000', 'النصب والاحتيال', 'الحبس النافذ', '4 أشهر', 'الغرامة اليومية', 'تنفيذ 160 ساعة من العمل', 'المستشفى الجهوي', '2025-03-13 00:00:00.000', 'ت.ب/3003/2025', '2025-03-20 00:00:00.000', 'تنفيذ العقوبة البديلة وفق المقتضيات القانونية', 'تقديم تقرير شهري عن سير التنفيذ', NULL, 'المستشفى الجهوي', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ملاحظات القاضي حول سير التنفيذ', 1, NULL, '2026-02-06 19:09:43.716', '2026-02-06 19:09:43.716'),
(4, 4, 2025, '4/2025', 'طارق الأندلسي', 'Z104444', 'حي الأمل، طنجة', 'المحكمة الابتدائية بطنجة', '1004/2025', '2004/2025', '2025-03-14 23:00:00.000', 'التزوير في محرر عرفي', 'الحبس الموقوف التنفيذ', '5 أشهر', 'العمل لأجل المنفعة العامة', 'تنفيذ 40 ساعة من العمل', 'البلدية', '2025-04-13 23:00:00.000', 'ت.ب/3004/2025', '2025-04-20 23:00:00.000', 'تنفيذ العقوبة البديلة وفق المقتضيات القانونية', NULL, '2025-05-13 23:00:00.000', 'البلدية', 'التزام تام بالعقوبة البديلة', NULL, NULL, NULL, NULL, NULL, NULL, '2025-04-16 23:00:00.000', NULL, 2, NULL, '2026-02-06 19:09:43.721', '2026-02-06 19:09:43.721'),
(5, 5, 2025, '5/2025', 'زكرياء الحمداني', 'Z105555', 'حي النهضة، الرباط', 'المحكمة الابتدائية بالرباط', '1005/2025', '2005/2025', '2025-04-14 23:00:00.000', 'سرقة بسيطة', 'الغرامة', '6 أشهر', 'تقييد بعض الحقوق', 'تنفيذ 80 ساعة من العمل', 'جمعية التنمية المحلية', '2025-05-14 23:00:00.000', 'ت.ب/3005/2025', '2025-05-21 23:00:00.000', 'تنفيذ العقوبة البديلة وفق المقتضيات القانونية', NULL, NULL, 'جمعية التنمية المحلية', NULL, 'النيابة العامة', '2025-06-28 23:00:00.000', 'طعن في قرار التنفيذ', 'رفض الطعن', '2025-07-13 23:00:00.000', '2025-07-28 23:00:00.000', NULL, NULL, 4, NULL, '2026-02-06 19:09:43.728', '2026-02-06 19:09:43.728'),
(6, 6, 2025, '6/2025', 'بلال الرحماني', 'Z106666', 'حي السلام، الدار البيضاء', 'المحكمة الابتدائية بالدار البيضاء', '1006/2025', '2006/2025', '2025-05-16 23:00:00.000', 'إصدار شيك بدون رصيد', 'الحبس النافذ', '1 أشهر', 'فرض تدابير رقابية أو علاجية أو تأهيلية', 'تنفيذ 120 ساعة من العمل', 'المركز الاجتماعي للقرب', '2025-06-15 23:00:00.000', 'ت.ب/3006/2025', '2025-06-22 23:00:00.000', 'تنفيذ العقوبة البديلة وفق المقتضيات القانونية', 'تقديم تقرير شهري عن سير التنفيذ', '2025-07-15 23:00:00.000', 'المركز الاجتماعي للقرب', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2025-06-18 23:00:00.000', 'ملاحظات القاضي حول سير التنفيذ', 1, NULL, '2026-02-06 19:09:43.733', '2026-02-06 19:09:43.733'),
(7, 7, 2025, '7/2025', 'أنس الوزاني', 'Z107777', 'حي المسيرة، فاس', 'المحكمة الابتدائية بفاس', '1007/2025', '2007/2025', '2025-06-16 23:00:00.000', 'خيانة الأمانة', 'الحبس الموقوف التنفيذ', '2 أشهر', 'الغرامة اليومية', 'تنفيذ 160 ساعة من العمل', 'مؤسسة الأعمال الاجتماعية', '2025-07-16 23:00:00.000', 'ت.ب/3007/2025', '2025-07-23 23:00:00.000', 'تنفيذ العقوبة البديلة وفق المقتضيات القانونية', NULL, NULL, 'مؤسسة الأعمال الاجتماعية', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, NULL, '2026-02-06 19:09:43.738', '2026-02-06 19:09:43.738'),
(8, 8, 2025, '8/2025', 'هشام الشاوي', 'Z108888', 'حي الفتح، مراكش', 'المحكمة الابتدائية بمراكش', '1008/2025', '2008/2025', '2025-07-18 23:00:00.000', 'النصب والاحتيال', 'الغرامة', '3 أشهر', 'العمل لأجل المنفعة العامة', 'تنفيذ 40 ساعة من العمل', 'المستشفى الجهوي', '2025-08-17 23:00:00.000', 'ت.ب/3008/2025', '2025-08-24 23:00:00.000', 'تنفيذ العقوبة البديلة وفق المقتضيات القانونية', NULL, '2025-09-16 23:00:00.000', 'المستشفى الجهوي', 'التزام تام بالعقوبة البديلة', NULL, NULL, NULL, NULL, NULL, NULL, '2025-08-20 23:00:00.000', NULL, 4, NULL, '2026-02-06 19:09:43.742', '2026-02-06 19:09:43.742'),
(9, 9, 2025, '9/2025', 'عادل بن يحيى', 'Z109999', 'حي الأمل، طنجة', 'المحكمة الابتدائية بطنجة', '1009/2025', '2009/2025', '2025-08-19 23:00:00.000', 'التزوير في محرر عرفي', 'الحبس النافذ', '4 أشهر', 'تقييد بعض الحقوق', 'تنفيذ 80 ساعة من العمل', 'البلدية', '2025-09-18 23:00:00.000', 'ت.ب/3009/2025', '2025-09-25 23:00:00.000', 'تنفيذ العقوبة البديلة وفق المقتضيات القانونية', 'تقديم تقرير شهري عن سير التنفيذ', NULL, 'البلدية', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 'ملاحظات القاضي حول سير التنفيذ', 1, NULL, '2026-02-06 19:09:43.747', '2026-02-06 19:09:43.747'),
(10, 10, 2025, '10/2025', 'منير الجزولي', 'Z111110', 'حي النهضة، الرباط', 'المحكمة الابتدائية بالرباط', '1010/2025', '2010/2025', '2025-09-19 23:00:00.000', 'سرقة بسيطة', 'الحبس الموقوف التنفيذ', '5 أشهر', 'فرض تدابير رقابية أو علاجية أو تأهيلية', 'تنفيذ 120 ساعة من العمل', 'جمعية التنمية المحلية', '2025-10-19 23:00:00.000', 'ت.ب/3010/2025', '2025-10-26 23:00:00.000', 'تنفيذ العقوبة البديلة وفق المقتضيات القانونية', NULL, '2025-11-18 23:00:00.000', 'جمعية التنمية المحلية', NULL, 'النيابة العامة', '2025-12-03 23:00:00.000', 'طعن في قرار التنفيذ', 'رفض الطعن', '2025-12-18 23:00:00.000', '2026-01-02 23:00:00.000', '2025-10-22 23:00:00.000', NULL, 2, NULL, '2026-02-06 19:09:43.752', '2026-02-06 19:09:43.752'),
(11, 11, 2026, '11/2026', 'فؤاد العراقي', 'Z112221', 'حي السلام، الدار البيضاء', 'المحكمة الابتدائية بالدار البيضاء', '1011/2026', '2011/2026', '2025-12-16 23:00:00.000', 'إصدار شيك بدون رصيد', 'الغرامة', '6 أشهر', 'الغرامة اليومية', 'تنفيذ 160 ساعة من العمل', 'المركز الاجتماعي للقرب', '2026-01-15 23:00:00.000', 'ت.ب/3011/2026', '2026-01-22 23:00:00.000', 'تنفيذ العقوبة البديلة وفق المقتضيات القانونية', NULL, NULL, 'المركز الاجتماعي للقرب', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 4, NULL, '2026-02-06 19:09:43.757', '2026-02-06 19:09:43.757'),
(12, 12, 2026, '12/2026', 'وليد بنموسى', 'Z113332', 'حي المسيرة، فاس', 'المحكمة الابتدائية بفاس', '1012/2026', '2012/2026', '2026-01-18 00:00:00.000', 'خيانة الأمانة', 'الحبس النافذ', '1 أشهر', 'العمل لأجل المنفعة العامة', 'تنفيذ 40 ساعة من العمل', 'مؤسسة الأعمال الاجتماعية', '2026-02-17 00:00:00.000', 'ت.ب/3012/2026', '2026-02-24 00:00:00.000', 'تنفيذ العقوبة البديلة وفق المقتضيات القانونية', 'تقديم تقرير شهري عن سير التنفيذ', '2026-03-19 00:00:00.000', 'مؤسسة الأعمال الاجتماعية', 'التزام تام بالعقوبة البديلة', NULL, NULL, NULL, NULL, NULL, NULL, '2026-02-20 00:00:00.000', 'ملاحظات القاضي حول سير التنفيذ', 1, NULL, '2026-02-06 19:09:43.761', '2026-02-06 19:09:43.761'),
(13, 13, 2026, '13/2026', 'سفيان الخطيب', 'Z114443', 'حي الفتح، مراكش', 'المحكمة الابتدائية بمراكش', '1013/2026', '2013/2026', '2026-02-16 00:00:00.000', 'النصب والاحتيال', 'الحبس الموقوف التنفيذ', '2 أشهر', 'تقييد بعض الحقوق', 'تنفيذ 80 ساعة من العمل', 'المستشفى الجهوي', '2026-03-18 00:00:00.000', 'ت.ب/3013/2026', '2026-03-25 00:00:00.000', 'تنفيذ العقوبة البديلة وفق المقتضيات القانونية', NULL, NULL, 'المستشفى الجهوي', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, 2, NULL, '2026-02-06 19:09:43.766', '2026-02-06 19:09:43.766'),
(14, 14, 2026, '14/2026', 'رضا المهدي', 'Z115554', 'حي الأمل، طنجة', 'المحكمة الابتدائية بطنجة', '1014/2026', '2014/2026', '2026-03-19 23:00:00.000', 'التزوير في محرر عرفي', 'الغرامة', '3 أشهر', 'فرض تدابير رقابية أو علاجية أو تأهيلية', 'تنفيذ 120 ساعة من العمل', 'البلدية', '2026-04-18 23:00:00.000', 'ت.ب/3014/2026', '2026-04-25 23:00:00.000', 'تنفيذ العقوبة البديلة وفق المقتضيات القانونية', NULL, '2026-05-18 23:00:00.000', 'البلدية', NULL, NULL, NULL, NULL, NULL, NULL, NULL, '2026-04-21 23:00:00.000', NULL, 4, NULL, '2026-02-06 19:09:43.773', '2026-02-06 19:09:43.773'),
(15, 15, 2026, '15/2026', 'جمال بنداود', 'Z116665', 'حي النهضة، الرباط', 'المحكمة الابتدائية بالرباط', '1015/2026', '2015/2026', '2026-04-19 23:00:00.000', 'سرقة بسيطة', 'الحبس النافذ', '4 أشهر', 'الغرامة اليومية', 'تنفيذ 160 ساعة من العمل', 'جمعية التنمية المحلية', '2026-05-19 23:00:00.000', 'ت.ب/3015/2026', '2026-05-26 23:00:00.000', 'تنفيذ العقوبة البديلة وفق المقتضيات القانونية', 'تقديم تقرير شهري عن سير التنفيذ', NULL, 'جمعية التنمية المحلية', NULL, 'النيابة العامة', '2026-07-03 23:00:00.000', 'طعن في قرار التنفيذ', 'رفض الطعن', '2026-07-18 23:00:00.000', '2026-08-02 23:00:00.000', NULL, 'ملاحظات القاضي حول سير التنفيذ', 1, NULL, '2026-02-06 19:09:43.778', '2026-02-06 19:09:43.778');

-- --------------------------------------------------------

--
-- Structure de la table `auditlog`
--

CREATE TABLE `auditlog` (
  `id` int(11) NOT NULL,
  `tableName` varchar(191) NOT NULL,
  `recordId` int(11) NOT NULL,
  `action` varchar(191) NOT NULL,
  `oldData` text DEFAULT NULL,
  `newData` text DEFAULT NULL,
  `performedById` int(11) NOT NULL,
  `performedAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `auditlog`
--

INSERT INTO `auditlog` (`id`, `tableName`, `recordId`, `action`, `oldData`, `newData`, `performedById`, `performedAt`) VALUES
(1, 'rehabilitation_requests', 1, 'CREATE', 'null', '{\"FullName\":\"محمد الإدريسي\"}', 1, '2026-02-06 19:09:43.783'),
(2, 'rehabilitation_requests', 1, 'UPDATE', '{\"request_status\":\"PENDING\"}', '{\"request_status\":\"APPROVED\"}', 1, '2026-02-06 19:09:43.788'),
(3, 'rehabilitation_requests', 4, 'UPDATE', '{\"request_status\":\"PENDING\"}', '{\"request_status\":\"REJECTED\"}', 2, '2026-02-06 19:09:43.792'),
(4, 'alternative_penalties_registry', 1, 'CREATE', 'null', '{\"full_name\":\"عبد الله الناصري\"}', 1, '2026-02-06 19:09:43.796'),
(5, 'alternative_penalties_registry', 5, 'CREATE', 'null', '{\"full_name\":\"زكرياء الحمداني\"}', 4, '2026-02-06 19:09:43.800');

-- --------------------------------------------------------

--
-- Structure de la table `notification`
--

CREATE TABLE `notification` (
  `id` int(11) NOT NULL,
  `userId` int(11) NOT NULL,
  `title` varchar(191) NOT NULL,
  `message` text NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT 0,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `notification`
--

INSERT INTO `notification` (`id`, `userId`, `title`, `message`, `isRead`, `createdAt`) VALUES
(1, 1, 'طلب جديد', 'تم تقديم طلب رد اعتبار جديد رقم 10/2026', 1, '2026-02-06 19:09:43.804'),
(2, 1, 'تحديث حالة', 'تم تحديث حالة الطلب رقم 1/2025 إلى موافقة', 1, '2026-02-06 19:09:43.808'),
(3, 2, 'طلب جديد', 'تم تقديم طلب رد اعتبار جديد رقم 9/2026', 1, '2026-02-06 19:09:43.815'),
(4, 2, 'عقوبة بديلة جديدة', 'تم تسجيل عقوبة بديلة جديدة رقم 15/2026', 1, '2026-02-06 19:09:43.821'),
(5, 3, 'مرحبا', 'مرحبا بك في نظام تتبع العدل', 1, '2026-02-06 19:09:43.825'),
(6, 4, 'تقرير شهري', 'يرجى تقديم التقرير الشهري لشهر يناير 2026', 0, '2026-02-06 19:09:43.829');

-- --------------------------------------------------------

--
-- Structure de la table `rehabilitation_requests`
--

CREATE TABLE `rehabilitation_requests` (
  `id` int(11) NOT NULL,
  `ordinalNumber` int(11) NOT NULL,
  `year` int(11) NOT NULL,
  `ordinalFull` varchar(191) NOT NULL,
  `FullName` varchar(191) NOT NULL,
  `cin` varchar(191) NOT NULL,
  `request_date` datetime(3) NOT NULL,
  `prosecution_inquiry_date` datetime(3) DEFAULT NULL,
  `prosecution_opinion` text DEFAULT NULL,
  `request_status` varchar(191) NOT NULL DEFAULT 'PENDING',
  `createdById` int(11) NOT NULL,
  `updatedById` int(11) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `rehabilitation_requests`
--

INSERT INTO `rehabilitation_requests` (`id`, `ordinalNumber`, `year`, `ordinalFull`, `FullName`, `cin`, `request_date`, `prosecution_inquiry_date`, `prosecution_opinion`, `request_status`, `createdById`, `updatedById`, `createdAt`, `updatedAt`) VALUES
(1, 1, 2025, '1/2025', 'محمد الإدريسي', 'AB123456', '2025-01-15 00:00:00.000', '2025-02-01 00:00:00.000', 'موافقة على الطلب بعد المراجعة', 'APPROVED', 1, NULL, '2026-02-06 19:09:43.656', '2026-02-06 19:09:43.656'),
(2, 2, 2025, '2/2025', 'سعيد بن عمر', 'CD789012', '2025-02-20 00:00:00.000', '2025-03-10 00:00:00.000', 'قيد الدراسة', 'PENDING', 2, NULL, '2026-02-06 19:09:43.661', '2026-02-06 19:09:43.661'),
(3, 3, 2025, '3/2025', 'عبد الرحمان الحسني', 'EF345678', '2025-03-05 00:00:00.000', NULL, NULL, 'PENDING', 1, NULL, '2026-02-06 19:09:43.665', '2026-02-06 19:09:43.665'),
(4, 4, 2025, '4/2025', 'كريم الطاهري', 'GH901234', '2025-03-18 00:00:00.000', '2025-04-02 00:00:00.000', 'رفض الطلب لعدم استيفاء الشروط', 'REJECTED', 2, NULL, '2026-02-06 19:09:43.669', '2026-02-06 19:09:43.669'),
(5, 5, 2025, '5/2025', 'حسن المنصوري', 'IJ567890', '2025-04-10 00:00:00.000', '2025-04-25 00:00:00.000', 'موافقة', 'APPROVED', 1, NULL, '2026-02-06 19:09:43.674', '2026-02-06 19:09:43.674'),
(6, 6, 2025, '6/2025', 'عمر بنشريف', 'KL234567', '2025-05-01 00:00:00.000', NULL, NULL, 'PENDING', 2, NULL, '2026-02-06 19:09:43.678', '2026-02-06 19:09:43.678'),
(7, 7, 2025, '7/2025', 'ياسين العمري', 'MN890123', '2025-05-15 00:00:00.000', '2025-06-01 00:00:00.000', 'موافقة مشروطة', 'APPROVED', 1, NULL, '2026-02-06 19:09:43.682', '2026-02-06 19:09:43.682'),
(8, 8, 2025, '8/2025', 'رشيد بلحاج', 'OP456789', '2025-06-20 00:00:00.000', NULL, NULL, 'PENDING', 2, NULL, '2026-02-06 19:09:43.686', '2026-02-06 19:09:43.686'),
(9, 9, 2026, '9/2026', 'إبراهيم الفاسي', 'QR012345', '2026-01-05 00:00:00.000', '2026-01-20 00:00:00.000', 'رفض', 'REJECTED', 1, NULL, '2026-02-06 19:09:43.690', '2026-02-06 19:09:43.690'),
(10, 10, 2026, '10/2026', 'مصطفى الشرقاوي', 'ST678901', '2026-01-15 00:00:00.000', NULL, NULL, 'PENDING', 2, NULL, '2026-02-06 19:09:43.695', '2026-02-06 19:09:43.695');

-- --------------------------------------------------------

--
-- Structure de la table `user`
--

CREATE TABLE `user` (
  `id` int(11) NOT NULL,
  `fullName` varchar(191) NOT NULL,
  `email` varchar(191) NOT NULL,
  `password` varchar(191) NOT NULL,
  `role` varchar(191) NOT NULL DEFAULT 'CLERK',
  `isActive` tinyint(1) NOT NULL DEFAULT 1,
  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Déchargement des données de la table `user`
--

INSERT INTO `user` (`id`, `fullName`, `email`, `password`, `role`, `isActive`, `createdAt`, `updatedAt`) VALUES
(1, 'أحمد بنعلي', 'admin@adltrack.ma', '$2b$10$WUd8crpML.mhqlX1o7zS7.pbwbgi926tclRrSI6N59gfy3j7Odusq', 'ADMIN', 1, '2026-02-06 19:09:43.619', '2026-02-06 19:09:43.619'),
(2, 'فاطمة الزهراء العلوي', 'clerk@adltrack.ma', '$2b$10$jnpaFcx/2a2UdTMzStPS6.dr1v9l.YNJc/PD7ros.nPUQyXoznB02', 'CLERK', 1, '2026-02-06 19:09:43.631', '2026-02-06 19:09:43.631'),
(3, 'يوسف المرابط', 'viewer@adltrack.ma', '$2b$10$jnpaFcx/2a2UdTMzStPS6.dr1v9l.YNJc/PD7ros.nPUQyXoznB02', 'VIEWER', 1, '2026-02-06 19:09:43.637', '2026-02-06 19:09:43.637'),
(4, 'خديجة بوزيد', 'clerk2@adltrack.ma', '$2b$10$jnpaFcx/2a2UdTMzStPS6.dr1v9l.YNJc/PD7ros.nPUQyXoznB02', 'CLERK', 1, '2026-02-06 19:09:43.650', '2026-02-06 19:09:43.650');

--
-- Index pour les tables déchargées
--

--
-- Index pour la table `alternative_penalties_registry`
--
ALTER TABLE `alternative_penalties_registry`
  ADD PRIMARY KEY (`id`),
  ADD KEY `alternative_penalties_registry_createdById_fkey` (`createdById`),
  ADD KEY `alternative_penalties_registry_updatedById_fkey` (`updatedById`);

--
-- Index pour la table `auditlog`
--
ALTER TABLE `auditlog`
  ADD PRIMARY KEY (`id`),
  ADD KEY `auditlog_performedById_fkey` (`performedById`);

--
-- Index pour la table `notification`
--
ALTER TABLE `notification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notification_userId_fkey` (`userId`);

--
-- Index pour la table `rehabilitation_requests`
--
ALTER TABLE `rehabilitation_requests`
  ADD PRIMARY KEY (`id`),
  ADD KEY `rehabilitation_requests_createdById_fkey` (`createdById`),
  ADD KEY `rehabilitation_requests_updatedById_fkey` (`updatedById`);

--
-- Index pour la table `user`
--
ALTER TABLE `user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `user_email_key` (`email`);

--
-- AUTO_INCREMENT pour les tables déchargées
--

--
-- AUTO_INCREMENT pour la table `alternative_penalties_registry`
--
ALTER TABLE `alternative_penalties_registry`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT pour la table `auditlog`
--
ALTER TABLE `auditlog`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT pour la table `notification`
--
ALTER TABLE `notification`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT pour la table `rehabilitation_requests`
--
ALTER TABLE `rehabilitation_requests`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT pour la table `user`
--
ALTER TABLE `user`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- Contraintes pour les tables déchargées
--

--
-- Contraintes pour la table `alternative_penalties_registry`
--
ALTER TABLE `alternative_penalties_registry`
  ADD CONSTRAINT `alternative_penalties_registry_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `alternative_penalties_registry_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Contraintes pour la table `auditlog`
--
ALTER TABLE `auditlog`
  ADD CONSTRAINT `auditlog_performedById_fkey` FOREIGN KEY (`performedById`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Contraintes pour la table `notification`
--
ALTER TABLE `notification`
  ADD CONSTRAINT `notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON UPDATE CASCADE;

--
-- Contraintes pour la table `rehabilitation_requests`
--
ALTER TABLE `rehabilitation_requests`
  ADD CONSTRAINT `rehabilitation_requests_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `user` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `rehabilitation_requests_updatedById_fkey` FOREIGN KEY (`updatedById`) REFERENCES `user` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;


CREATE TABLE `rehabilitation_requests_rapport` (
  `id` int(11) NOT NULL AUTO_INCREMENT,

  -- Relation with rehabilitation request
  `rehabilitationRequestId` int(11) NOT NULL,

  `num_dossier` varchar(191) NOT NULL,
  `fils_de_pere` varchar(191) DEFAULT NULL,
  `fils_de_mere` varchar(191) DEFAULT NULL,
  `date_naissance` date DEFAULT NULL,
  `ville` varchar(191) DEFAULT NULL,
  `adresse` text DEFAULT NULL,
  `date_de_faire` datetime(3) DEFAULT NULL,
  `tribunal` varchar(191) DEFAULT NULL,
  `cause` text DEFAULT NULL,
  `date_niyaba` datetime(3) DEFAULT NULL,
  `status` varchar(191) DEFAULT NULL,
  `autre_condition` text DEFAULT NULL,
  `rapport_date` datetime(3) NOT NULL DEFAULT current_timestamp(3),

  `createdById` int(11) NOT NULL,
  `updatedById` int(11) DEFAULT NULL,

  `createdAt` datetime(3) NOT NULL DEFAULT current_timestamp(3),
  `updatedAt` datetime(3) NOT NULL,

  PRIMARY KEY (`id`),

  KEY `rehab_rapport_request_fkey` (`rehabilitationRequestId`),
  KEY `rehab_rapport_createdBy_fkey` (`createdById`),
  KEY `rehab_rapport_updatedBy_fkey` (`updatedById`),

  CONSTRAINT `rehab_rapport_request_fkey`
    FOREIGN KEY (`rehabilitationRequestId`)
    REFERENCES `rehabilitation_requests` (`id`)
    ON DELETE CASCADE
    ON UPDATE CASCADE,

  CONSTRAINT `rehab_rapport_createdBy_fkey`
    FOREIGN KEY (`createdById`)
    REFERENCES `user` (`id`)
    ON UPDATE CASCADE,

  CONSTRAINT `rehab_rapport_updatedBy_fkey`
    FOREIGN KEY (`updatedById`)
    REFERENCES `user` (`id`)
    ON DELETE SET NULL
    ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;





/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
