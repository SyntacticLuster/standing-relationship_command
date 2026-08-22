import { boolean, index, pgTable, serial, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

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
