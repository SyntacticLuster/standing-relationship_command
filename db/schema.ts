import { boolean, index, integer, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const threadStates = pgTable(
  "thread_states",
  {
    id: serial("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    threadId: text("thread_id").notNull(),
    state: text("state").notNull(),
    starred: boolean("starred").notNull().default(false),
    unread: boolean("unread").notNull().default(false),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("thread_state_owner_thread_idx").on(table.ownerId, table.threadId),
    index("thread_state_owner_idx").on(table.ownerId),
  ],
);

export const contactNotes = pgTable(
  "contact_notes",
  {
    id: serial("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    contactId: text("contact_id").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("contact_note_owner_contact_idx").on(table.ownerId, table.contactId),
  ],
);

export const drafts = pgTable(
  "drafts",
  {
    id: serial("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    recipient: text("recipient").notNull().default(""),
    subject: text("subject").notNull().default(""),
    body: text("body").notNull().default(""),
    status: text("status").notNull().default("draft"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (table) => [index("draft_owner_status_idx").on(table.ownerId, table.status)],
);

// ── IMAP provider tables ──────────────────────────────────────────────────────

export const mailboxAccounts = pgTable(
  "mailbox_accounts",
  {
    id: serial("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    host: text("host").notNull(),
    port: integer("port").notNull().default(993),
    username: text("username").notNull(),
    // AES-256-GCM ciphertext:iv — never returned to client
    encryptedPassword: text("encrypted_password").notNull(),
    tlsVerified: boolean("tls_verified").notNull().default(true),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [index("mailbox_account_owner_idx").on(table.ownerId)],
);

export const mailboxFolders = pgTable(
  "mailbox_folders",
  {
    id: serial("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    accountId: integer("account_id").notNull(),
    name: text("name").notNull(),
    uidValidity: text("uid_validity").notNull().default(""),
    createdAt: timestamp("created_at").notNull().defaultNow(),
  },
  (table) => [
    index("mailbox_folder_owner_idx").on(table.ownerId),
    uniqueIndex("mailbox_folder_account_name_idx").on(table.accountId, table.name),
  ],
);

export const mailboxCursors = pgTable(
  "mailbox_cursors",
  {
    id: serial("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    accountId: integer("account_id").notNull(),
    folderId: integer("folder_id").notNull(),
    lastUid: integer("last_uid").notNull().default(0),
    uidValidity: text("uid_validity").notNull().default(""),
    syncedAt: timestamp("synced_at").notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("mailbox_cursor_account_folder_idx").on(table.accountId, table.folderId),
  ],
);

export const mailboxMessages = pgTable(
  "mailbox_messages",
  {
    id: serial("id").primaryKey(),
    ownerId: text("owner_id").notNull(),
    accountId: integer("account_id").notNull(),
    folderId: integer("folder_id").notNull(),
    uid: integer("uid").notNull(),
    uidValidity: text("uid_validity").notNull().default(""),
    messageId: text("message_id").notNull().default(""),
    inReplyTo: text("in_reply_to").notNull().default(""),
    references: text("references").notNull().default(""),
    threadKey: text("thread_key").notNull().default(""),
    fromAddress: text("from_address").notNull().default(""),
    toAddresses: text("to_addresses").notNull().default(""),
    subject: text("subject").notNull().default(""),
    sentAt: timestamp("sent_at"),
    flags: text("flags").notNull().default(""),
    bodyPreview: text("body_preview").notNull().default(""),
    rawSize: integer("raw_size").notNull().default(0),
    ingestedAt: timestamp("ingested_at").notNull().defaultNow(),
  },
  (table) => [
    index("mailbox_message_owner_idx").on(table.ownerId),
    index("mailbox_message_thread_key_idx").on(table.threadKey),
    uniqueIndex("mailbox_message_account_folder_uid_validity_uid_idx").on(
      table.accountId,
      table.folderId,
      table.uidValidity,
      table.uid,
    ),
  ],
);
