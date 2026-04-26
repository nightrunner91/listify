ALTER TABLE "users" ADD COLUMN "username" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_style" varchar(50) DEFAULT 'adventurer' NOT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "avatar_seed" varchar(255);--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "background_color" varchar(50) DEFAULT '#18a058' NOT NULL;