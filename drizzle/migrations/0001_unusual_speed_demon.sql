ALTER TABLE "statuses" DROP CONSTRAINT "statuses_name_unique";--> statement-breakpoint
ALTER TABLE "statuses" ADD CONSTRAINT "statuses_name_workspace_id_unique" UNIQUE("name","workspace_id");