ALTER TABLE "workspaces" ALTER COLUMN "created_at" SET DATA TYPE timestamp(3) with time zone;--> statement-breakpoint
ALTER TABLE "workspaces" ALTER COLUMN "created_at" SET DEFAULT CURRENT_TIMESTAMP;--> statement-breakpoint
ALTER TABLE "workspaces" ALTER COLUMN "updated_at" SET DATA TYPE timestamp(3) with time zone;