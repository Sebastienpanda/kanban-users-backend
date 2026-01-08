import { pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { InferInsertModel, InferSelectModel, relations, sql } from "drizzle-orm";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { tasks } from "./task.schema";
import { workspaces } from "./workspace.schema";

export const boardColumns = pgTable("board_columns", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 50 }).unique().notNull(),
    workspaceId: uuid("workspace_id")
        .references(() => workspaces.id, { onDelete: "cascade" })
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

export const boardColumnsRelations = relations(boardColumns, ({ one, many }) => ({
    workspace: one(workspaces, {
        fields: [boardColumns.workspaceId],
        references: [workspaces.id],
    }),
    tasks: many(tasks),
}));

export type BoardColumns = InferSelectModel<typeof boardColumns>;
export type BoardColumnsInsert = InferInsertModel<typeof boardColumns>;
export type BoardColumnsUpdate = Partial<BoardColumnsInsert>;

export const boardColumnsInsertSchema = createInsertSchema(boardColumns)
    .omit({
        id: true,
        createdAt: true,
        updatedAt: true,
    })
    .extend({
        name: z.string().trim().min(5, "Le nom de la colonne doit contenir au moins 5 caractères"),
        workspaceId: z.string().uuid("L'ID du workspace doit être un UUID valide"),
    });

export const boardColumnsUpdateSchema = createUpdateSchema(boardColumns)
    .omit({
        id: true,
        createdAt: true,
        updatedAt: true,
    })
    .partial()
    .extend({
        name: z.string().trim().min(5, "Le nom de la colonne doit contenir au moins 5 caractères").optional(),
        workspaceId: z.string().uuid("L'ID du workspace doit être un UUID valide").optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "Le champ ne peux pas être vide",
    });
