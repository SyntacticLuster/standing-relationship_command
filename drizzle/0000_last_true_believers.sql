CREATE TABLE `contact_notes` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_email` text NOT NULL,
	`contact_id` text NOT NULL,
	`body` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `contact_note_owner_contact_idx` ON `contact_notes` (`owner_email`,`contact_id`);--> statement-breakpoint
CREATE TABLE `drafts` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_email` text NOT NULL,
	`recipient` text DEFAULT '' NOT NULL,
	`subject` text DEFAULT '' NOT NULL,
	`body` text DEFAULT '' NOT NULL,
	`status` text DEFAULT 'draft' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE INDEX `draft_owner_status_idx` ON `drafts` (`owner_email`,`status`);--> statement-breakpoint
CREATE TABLE `thread_states` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`owner_email` text NOT NULL,
	`thread_id` text NOT NULL,
	`state` text NOT NULL,
	`starred` integer DEFAULT false NOT NULL,
	`unread` integer DEFAULT false NOT NULL,
	`updated_at` text DEFAULT CURRENT_TIMESTAMP NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `thread_state_owner_thread_idx` ON `thread_states` (`owner_email`,`thread_id`);--> statement-breakpoint
CREATE INDEX `thread_state_owner_idx` ON `thread_states` (`owner_email`);