ALTER TABLE "users" ALTER COLUMN "background_color" SET DEFAULT '#0AC0C0';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "is_public" boolean DEFAULT false NOT NULL;