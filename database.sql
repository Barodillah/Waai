-- ==========================================================
-- Database Schema for Waai Chat Application
-- Features: Google Auth, Groups with Invites, Custom AI Personas, Read Receipts
-- Primary Keys: CHAR(36) for UUIDs
-- ==========================================================

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+07:00";

-- --------------------------------------------------------
-- 1. Table structure for table `users`
-- --------------------------------------------------------
CREATE TABLE `users` (
  `id` CHAR(36) NOT NULL,
  `google_id` VARCHAR(255) NOT NULL,
  `email` VARCHAR(255) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `avatar_url` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_google_id_unique` (`google_id`),
  UNIQUE KEY `users_email_unique` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 2. Table structure for table `personas`
-- --------------------------------------------------------
CREATE TABLE `personas` (
  `id` CHAR(36) NOT NULL,
  `created_by` CHAR(36) NOT NULL,
  `name` VARCHAR(255) NOT NULL,
  `avatar_url` VARCHAR(255) DEFAULT NULL,
  `description` VARCHAR(255) DEFAULT NULL,
  `system_prompt` TEXT NOT NULL,
  `base_model` VARCHAR(255) DEFAULT NULL,
  `interest` VARCHAR(255) DEFAULT NULL,
  `tone` VARCHAR(255) DEFAULT NULL,
  `character_types` VARCHAR(255) DEFAULT NULL,
  `welcome_message` TEXT DEFAULT NULL,
  `advanced_settings` JSON DEFAULT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_personas_created_by` (`created_by`),
  CONSTRAINT `fk_personas_users` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 3. Table structure for table `sessions`
-- --------------------------------------------------------
CREATE TABLE `sessions` (
  `id` CHAR(36) NOT NULL,
  `type` ENUM('direct', 'group') NOT NULL DEFAULT 'direct',
  `name` VARCHAR(255) DEFAULT NULL, -- Nullable for direct chats
  `avatar_url` VARCHAR(255) DEFAULT NULL,
  `invite_code` VARCHAR(255) DEFAULT NULL,
  `created_by` CHAR(36) DEFAULT NULL, -- The user who created the group
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `sessions_invite_code_unique` (`invite_code`),
  KEY `fk_sessions_created_by` (`created_by`),
  CONSTRAINT `fk_sessions_users` FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 4. Table structure for table `session_members`
-- --------------------------------------------------------
CREATE TABLE `session_members` (
  `id` CHAR(36) NOT NULL,
  `session_id` CHAR(36) NOT NULL,
  `member_type` ENUM('user', 'persona', 'model') NOT NULL,
  `user_id` CHAR(36) DEFAULT NULL,
  `persona_id` CHAR(36) DEFAULT NULL,
  `model_id` VARCHAR(255) DEFAULT NULL,
  `role` ENUM('admin', 'member') NOT NULL DEFAULT 'member',
  `joined_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_session_members_session` (`session_id`),
  KEY `fk_session_members_user` (`user_id`),
  KEY `fk_session_members_persona` (`persona_id`),
  CONSTRAINT `fk_members_sessions` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_members_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_members_personas` FOREIGN KEY (`persona_id`) REFERENCES `personas` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 5. Table structure for table `messages`
-- --------------------------------------------------------
CREATE TABLE `messages` (
  `id` CHAR(36) NOT NULL,
  `session_id` CHAR(36) NOT NULL,
  `sender_type` ENUM('user', 'persona', 'model', 'system') NOT NULL,
  `sender_user_id` CHAR(36) DEFAULT NULL,
  `sender_persona_id` CHAR(36) DEFAULT NULL,
  `sender_model_id` VARCHAR(255) DEFAULT NULL,
  `text` TEXT NOT NULL,
  `reply_to_id` CHAR(36) DEFAULT NULL,
  `is_forwarded` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_messages_session` (`session_id`),
  KEY `fk_messages_reply_to` (`reply_to_id`),
  CONSTRAINT `fk_messages_sessions` FOREIGN KEY (`session_id`) REFERENCES `sessions` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_messages_users` FOREIGN KEY (`sender_user_id`) REFERENCES `users` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_messages_personas` FOREIGN KEY (`sender_persona_id`) REFERENCES `personas` (`id`) ON DELETE SET NULL,
  CONSTRAINT `fk_messages_reply` FOREIGN KEY (`reply_to_id`) REFERENCES `messages` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 6. Table structure for table `message_reads`
-- --------------------------------------------------------
-- Tracks which users have read which messages in group chats
CREATE TABLE `message_reads` (
  `id` CHAR(36) NOT NULL,
  `message_id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `read_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `msg_user_read_unique` (`message_id`, `user_id`),
  KEY `fk_reads_user` (`user_id`),
  CONSTRAINT `fk_reads_messages` FOREIGN KEY (`message_id`) REFERENCES `messages` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_reads_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------
-- 7. Table structure for table `user_memories`
-- --------------------------------------------------------
CREATE TABLE `user_memories` (
  `id` CHAR(36) NOT NULL,
  `user_id` CHAR(36) NOT NULL,
  `parameter` VARCHAR(255) NOT NULL,
  `value` TEXT NOT NULL,
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `fk_memories_user` (`user_id`),
  CONSTRAINT `fk_memories_users` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
