import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { InferInsertModel, InferSelectModel, relations, sql } from "drizzle-orm";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { boardColumns, BoardColumnWithTasks } from "./bord-columns.schema";
import { neonAuthUsers } from "@db/users.schema";
import { statuses } from "@db/statuses.schema";

export const workspaces = pgTable("workspaces", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 50 }).unique().notNull(),
    userId: uuid("user_id")
        .references(() => neonAuthUsers.id)
        .notNull(),
    createdAt: timestamp("created_at", {
        precision: 3,
        withTimezone: true,
        mode: "string",
    })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),

    updatedAt: timestamp("updated_at", {
        precision: 3,
        withTimezone: true,
        mode: "string",
    }),
});

export const workspacesRelations = relations(workspaces, ({ many }) => ({
    columns: many(boardColumns),
    statuses: many(statuses),
}));

export type Workspace = InferSelectModel<typeof workspaces>;
export type WorkspaceInsert = InferInsertModel<typeof workspaces>;
export type WorkspaceUpdate = Partial<WorkspaceInsert>;

export type WorkspaceWithColumnsAndTasks = Workspace & {
    columns: BoardColumnWithTasks[];
};

export const workspaceInsertSchema = createInsertSchema(workspaces)
    .omit({ id: true, userId: true, createdAt: true, updatedAt: true })
    .extend({
        name: z.string().trim().min(5, "Le nom du workspace doit contenir au moins 5 caractères"),
    });

export const workspaceUpdateSchema = createUpdateSchema(workspaces)
    .omit({ id: true, userId: true, createdAt: true, updatedAt: true })
    .partial()
    .extend({
        name: z.string().trim().min(5, "Le nom du workspace doit contenir au moins 5 caractères").optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "Au moins un champ doit être fourni pour la mise à jour",
    });
