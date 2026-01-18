import { integer, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { InferInsertModel, InferSelectModel, relations, sql } from "drizzle-orm";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { Task, tasks } from "./task.schema";
import { workspaces } from "./workspace.schema";
import { neonAuthUsers } from "@db/users.schema";

export const boardColumns = pgTable("board_columns", {
    id: uuid("id").primaryKey().defaultRandom(),
    name: varchar("name", { length: 50 }).notNull(),
    workspaceId: uuid("workspace_id")
        .references(() => workspaces.id)
        .notNull(),
    userId: uuid("user_id")
        .references(() => neonAuthUsers.id)
        .notNull(),
    position: integer("position").notNull().default(0),
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

export type BoardColumnWithTasks = BoardColumns & {
    tasks: Task[];
};

export type BoardColumns = InferSelectModel<typeof boardColumns>;
export type BoardColumnsInsert = InferInsertModel<typeof boardColumns>;
export type BoardColumnsUpdate = Partial<BoardColumnsInsert>;
export type BoardColumnsReorder = z.infer<typeof boardColumnsReorderSchema>;

export const boardColumnsInsertSchema = createInsertSchema(boardColumns)
    .omit({
        id: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        position: true,
    })
    .extend({
        name: z.string().trim().min(5, "Le nom de la colonne doit contenir au moins 5 caractères"),
        workspaceId: z.uuid("L'ID du workspace doit être un UUID valide"),
    });

export const boardColumnsReorderSchema = z.object({
    newPosition: z.number().int().min(0, "La position doit être un nombre positif"),
});

export const boardColumnsUpdateSchema = createUpdateSchema(boardColumns)
    .omit({
        id: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
        position: true,
    })
    .partial()
    .extend({
        name: z.string().trim().min(5, "Le nom de la colonne doit contenir au moins 5 caractères").optional(),
        workspaceId: z.uuid("L'ID du workspace doit être un UUID valide").optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "Au moins un champ doit être fourni pour la mise à jour",
    });
