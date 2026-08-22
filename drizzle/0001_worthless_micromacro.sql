CREATE TABLE "mailbox_accounts" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"host" text NOT NULL,
	"port" integer DEFAULT 993 NOT NULL,
	"username" text NOT NULL,
	"encrypted_password" text NOT NULL,
	"tls_verified" boolean DEFAULT true NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mailbox_cursors" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"account_id" integer NOT NULL,
	"folder_id" integer NOT NULL,
	"last_uid" integer DEFAULT 0 NOT NULL,
	"uid_validity" text DEFAULT '' NOT NULL,
	"synced_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mailbox_folders" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"account_id" integer NOT NULL,
	"name" text NOT NULL,
	"uid_validity" text DEFAULT '' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "mailbox_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"account_id" integer NOT NULL,
	"folder_id" integer NOT NULL,
	"uid" integer NOT NULL,
	"message_id" text DEFAULT '' NOT NULL,
	"in_reply_to" text DEFAULT '' NOT NULL,
	"references" text DEFAULT '' NOT NULL,
	"thread_key" text DEFAULT '' NOT NULL,
	"from_address" text DEFAULT '' NOT NULL,
	"to_addresses" text DEFAULT '' NOT NULL,
	"subject" text DEFAULT '' NOT NULL,
	"sent_at" timestamp,
	"flags" text DEFAULT '' NOT NULL,
	"body_preview" text DEFAULT '' NOT NULL,
	"raw_size" integer DEFAULT 0 NOT NULL,
	"ingested_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "mailbox_account_owner_idx" ON "mailbox_accounts" USING btree ("owner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mailbox_cursor_account_folder_idx" ON "mailbox_cursors" USING btree ("account_id","folder_id");--> statement-breakpoint
CREATE INDEX "mailbox_folder_owner_idx" ON "mailbox_folders" USING btree ("owner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "mailbox_folder_account_name_idx" ON "mailbox_folders" USING btree ("account_id","name");--> statement-breakpoint
CREATE INDEX "mailbox_message_owner_idx" ON "mailbox_messages" USING btree ("owner_id");--> statement-breakpoint
CREATE INDEX "mailbox_message_thread_key_idx" ON "mailbox_messages" USING btree ("thread_key");--> statement-breakpoint
CREATE UNIQUE INDEX "mailbox_message_account_folder_uid_idx" ON "mailbox_messages" USING btree ("account_id","folder_id","uid");