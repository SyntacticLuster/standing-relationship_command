DROP INDEX "mailbox_message_account_folder_uid_idx";--> statement-breakpoint
ALTER TABLE "mailbox_messages" ADD COLUMN "uid_validity" text DEFAULT '' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "mailbox_message_account_folder_uid_validity_uid_idx" ON "mailbox_messages" USING btree ("account_id","folder_id","uid_validity","uid");