CREATE TABLE "contact_notes" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"contact_id" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "drafts" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"recipient" text DEFAULT '' NOT NULL,
	"subject" text DEFAULT '' NOT NULL,
	"body" text DEFAULT '' NOT NULL,
	"status" text DEFAULT 'draft' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "thread_states" (
	"id" serial PRIMARY KEY NOT NULL,
	"owner_id" text NOT NULL,
	"thread_id" text NOT NULL,
	"state" text NOT NULL,
	"starred" boolean DEFAULT false NOT NULL,
	"unread" boolean DEFAULT false NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE INDEX "contact_note_owner_contact_idx" ON "contact_notes" USING btree ("owner_id","contact_id");--> statement-breakpoint
CREATE INDEX "draft_owner_status_idx" ON "drafts" USING btree ("owner_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "thread_state_owner_thread_idx" ON "thread_states" USING btree ("owner_id","thread_id");--> statement-breakpoint
CREATE INDEX "thread_state_owner_idx" ON "thread_states" USING btree ("owner_id");