ALTER TABLE "users" ADD COLUMN "handle" varchar(30);--> statement-breakpoint
CREATE INDEX "users_handle_idx" ON "users" USING btree ("handle");--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_handle_unique" UNIQUE("handle");