import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const threadStates = sqliteTable(
  "thread_states",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ownerEmail: text("owner_email").notNull(),
    threadId: text("thread_id").notNull(),
    state: text("state").notNull(),
    starred: integer("starred", { mode: "boolean" }).notNull().default(false),
    unread: integer("unread", { mode: "boolean" }).notNull().default(false),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("thread_state_owner_thread_idx").on(table.ownerEmail, table.threadId),
    index("thread_state_owner_idx").on(table.ownerEmail),
  ],
);

export const contactNotes = sqliteTable(
  "contact_notes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ownerEmail: text("owner_email").notNull(),
    contactId: text("contact_id").notNull(),
    body: text("body").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("contact_note_owner_contact_idx").on(table.ownerEmail, table.contactId),
  ],
);

export const drafts = sqliteTable(
  "drafts",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ownerEmail: text("owner_email").notNull(),
    recipient: text("recipient").notNull().default(""),
    subject: text("subject").notNull().default(""),
    body: text("body").notNull().default(""),
    status: text("status").notNull().default("draft"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("draft_owner_status_idx").on(table.ownerEmail, table.status)],
);
