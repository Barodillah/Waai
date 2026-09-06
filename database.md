# Database Documentation for Waai Chat App

This document serves as the data dictionary for the Waai Chat App MySQL database schema. The design natively supports 1-on-1 and Group chats containing a mixture of human users, custom AI personas, and standard AI models.

## Database Wide Decisions
- **UUIDs for Primary Keys**: All tables use `CHAR(36)` (UUIDs) for primary keys. This ensures IDs cannot be guessed by users (important for chat application security and group invite links).
- **Encoding**: Uses `utf8mb4_unicode_ci` to properly support emojis in chat messages and names.
- **Timestamps**: Most tables include `created_at` and `updated_at` timestamps for chronological sorting.

---

## Tables

### 1. `users`
Stores all human users who log into the application using Google Auth.
- **id**: `CHAR(36)` Primary Key.
- **google_id**: `VARCHAR(255)` Unique. The ID provided by Google OAuth.
- **email**: `VARCHAR(255)` Unique. The user's Google email.
- **name**: `VARCHAR(255)`. The display name from Google.
- **avatar_url**: `VARCHAR(255)`. URL to the Google profile picture.
- **created_at**, **updated_at**: Timestamps.

### 2. `personas`
Stores custom AI personas created by users.
- **id**: `CHAR(36)` Primary Key.
- **created_by**: `CHAR(36)` Foreign Key to `users.id`. The human user who created this persona. (Deletes cascade).
- **name**: `VARCHAR(255)`. Name of the persona (e.g., "Budi Sang Debater").
- **avatar_url**: `VARCHAR(255)`. The generated Dicebear avatar URL.
- **description**: `VARCHAR(255)`. The tagline/brief description.
- **system_prompt**: `TEXT`. The full background prompt instructions.
- **base_model**: `VARCHAR(255)`. The underlying AI model ID (e.g., `google/gemini-2.5-flash`).
- **interest**, **tone**, **character_types**: `VARCHAR(255)`. Meta attributes of the persona.
- **advanced_settings**: `JSON`. Custom key-value pairs defining specific rules or traits for the persona.
- **created_at**, **updated_at**: Timestamps.

### 3. `sessions`
Represents a chat room. It can be a direct chat (1-on-1) or a group chat.
- **id**: `CHAR(36)` Primary Key.
- **type**: `ENUM('direct', 'group')`. Indicates chat type.
- **name**: `VARCHAR(255)`. Name of the group (Null for direct chats).
- **avatar_url**: `VARCHAR(255)`. Icon for the group.
- **invite_code**: `VARCHAR(255)` Unique. A shareable string/slug to join groups.
- **created_by**: `CHAR(36)`. Foreign Key to `users.id`. The admin who created the group.
- **created_at**, **updated_at**: Timestamps.

### 4. `session_members`
A junction table mapping which entities (Users, Personas, or Models) belong to which Session.
- **id**: `CHAR(36)` Primary Key.
- **session_id**: `CHAR(36)` FK to `sessions.id`.
- **member_type**: `ENUM('user', 'persona', 'model')`. Helps determine which ID column to look at.
- **user_id**: `CHAR(36)` FK to `users.id`. Populated if member is a human.
- **persona_id**: `CHAR(36)` FK to `personas.id`. Populated if member is a custom persona.
- **model_id**: `VARCHAR(255)`. Populated if member is a raw OpenRouter model (e.g., `minimax/minimax-m3`).
- **role**: `ENUM('admin', 'member')`. Defines group management privileges.
- **joined_at**: Timestamp.

### 5. `messages`
Stores the actual chat messages sent within sessions.
- **id**: `CHAR(36)` Primary Key.
- **session_id**: `CHAR(36)` FK to `sessions.id`.
- **sender_type**: `ENUM('user', 'persona', 'model', 'system')`. Identifies who sent the message.
- **sender_user_id**: `CHAR(36)` FK to `users.id`.
- **sender_persona_id**: `CHAR(36)` FK to `personas.id`.
- **sender_model_id**: `VARCHAR(255)`.
- **text**: `TEXT`. The message body.
- **reply_to_id**: `CHAR(36)` FK to `messages.id`. Self-referencing column for the "Reply" feature.
- **is_forwarded**: `BOOLEAN`. True if the message was forwarded.
- **created_at**: Timestamp.

### 6. `message_reads`
Provides the ability to track read receipts (like WhatsApp's blue ticks) specifically in groups where multiple people must read a message before it's considered fully "read".
- **id**: `CHAR(36)` Primary Key.
- **message_id**: `CHAR(36)` FK to `messages.id`.
- **user_id**: `CHAR(36)` FK to `users.id`. The user who read it.
- **read_at**: Timestamp.
- *Note:* Unique constraint on `(message_id, user_id)` ensures a user can only "read" a message once.

### 7. `user_memories`
Menyimpan informasi personal/profil user yang diekstrak secara otomatis dari percakapan untuk konteks (memori) tambahan bagi AI.
- **id**: `CHAR(36)` Primary Key.
- **user_id**: `CHAR(36)` FK to `users.id`. User pemilik memori tersebut. (Deletes cascade).
- **parameter**: `VARCHAR(255)`. Kunci data (contoh: "nama anak", "pekerjaan").
- **value**: `TEXT`. Nilai/isi datanya (contoh: "rama", "software engineer").
- **created_at**, **updated_at**: Timestamps.

---
## Notes on Implementation
- **API Keys**: OpenRouter API Keys are explicitly excluded from this database and will remain in local storage (`localStorage`) on the client side per security requirements.
- **UUID Generation**: UUIDs should be generated by the backend language (e.g., Node.js `uuidv4()`, PHP `Str::uuid()`) rather than the database for better portability.
