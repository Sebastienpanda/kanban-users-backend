import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { InferInsertModel, InferSelectModel, relations, sql } from "drizzle-orm";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { boardColumns, BoardColumnWithTasks } from "./bord-columns.schema";

export const workspaces = pgTable("workspaces", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 50 }).unique().notNull(),
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
}));

export type Workspace = InferSelectModel<typeof workspaces>;
export type WorkspaceInsert = InferInsertModel<typeof workspaces>;
export type WorkspaceUpdate = Partial<WorkspaceInsert>;

export type WorkspaceWithColumnsAndTasks = Workspace & {
    columns: BoardColumnWithTasks[];
};

export const workspaceInsertSchema = createInsertSchema(workspaces)
    .omit({ id: true })
    .extend({
        name: z.string().trim().min(5, "Le nom du workspace doit contenir au moins 5 caractères"),
    });

export const workspaceUpdateSchema = createUpdateSchema(workspaces)
    .omit({ id: true })
    .partial()
    .extend({
        name: z.string().trim().min(5, "Le nom du workspace doit contenir au moins 5 caractères"),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "Vous ne pouvez pas update avec un champ vide",
    });
