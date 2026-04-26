ALTER TABLE "activities" ALTER COLUMN "metadata" SET DATA TYPE jsonb USING metadata::jsonb;--> statement-breakpoint
CREATE INDEX "activities_user_id_idx" ON "activities" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "activities_user_created_at_idx" ON "activities" USING btree ("user_id","created_at" DESC NULLS LAST);