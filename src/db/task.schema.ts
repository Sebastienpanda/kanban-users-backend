import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { InferInsertModel, InferSelectModel, relations, sql } from "drizzle-orm";
import { boardColumns } from "./bord-columns.schema";
import { neonAuthUsers } from "@db/users.schema";
import { statuses } from "@db/statuses.schema";

export const tasks = pgTable("tasks", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").unique().notNull(),
    description: text("description").notNull(),
    statusId: uuid("status_id").references(() => statuses.id),
    columnId: uuid("column_id")
        .references(() => boardColumns.id)
        .notNull(),
    order: integer("order").notNull().default(0),
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

export const tasksRelations = relations(tasks, ({ one }) => ({
    column: one(boardColumns, {
        fields: [tasks.columnId],
        references: [boardColumns.id],
    }),
    status: one(statuses, {
        fields: [tasks.statusId],
        references: [statuses.id],
    }),
}));

export type Task = InferSelectModel<typeof tasks>;
export type TaskInsert = InferInsertModel<typeof tasks>;
export type TaskUpdate = Partial<TaskInsert>;
export type TaskReorder = z.infer<typeof taskReorderSchema>;

export const taskInsertSchema = createInsertSchema(tasks)
    .omit({ id: true, order: true, userId: true, createdAt: true, updatedAt: true })
    .extend({
        title: z.string().trim().min(5, "Le titre doit contenir au moins 5 caractères"),
        description: z.string().trim().min(1, "La description est obligatoire"),
        statusId: z.uuid("L'ID du statut doit être un UUID valide").optional(),
        columnId: z.uuid("L'ID de la colonne doit être un UUID valide"),
    });

export const taskReorderSchema = z.object({
    newOrder: z.number().int().min(0, "L'ordre doit être un nombre positif"),
    newColumnId: z.uuid("L'ID de la colonne doit être un UUID valide").optional(),
});

export const taskUpdateSchema = createUpdateSchema(tasks)
    .omit({ id: true, userId: true, createdAt: true, updatedAt: true, order: true })
    .partial()
    .extend({
        title: z.string().trim().min(5, "Le titre doit contenir au moins 5 caractères").optional(),
        description: z.string().trim().min(1, "La description est obligatoire").optional(),
        statusId: z.uuid("L'ID du statut doit être un UUID valide").optional(),
        columnId: z.uuid("L'ID de la colonne doit être un UUID valide").optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "Au moins un champ doit être fourni pour la mise à jour",
    });
