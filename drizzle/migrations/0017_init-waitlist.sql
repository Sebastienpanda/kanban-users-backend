ALTER TABLE "board_columns" DROP CONSTRAINT "board_columns_name_unique";--> statement-breakpoint
ALTER TABLE "board_columns" ADD CONSTRAINT "unique_name_per_workspace" UNIQUE("workspace_id","name");