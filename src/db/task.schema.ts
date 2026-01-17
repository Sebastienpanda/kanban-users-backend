import { integer, pgEnum, pgTable, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { InferInsertModel, InferSelectModel, relations, sql } from "drizzle-orm";
import { boardColumns } from "./bord-columns.schema";
import { neonAuthUsers } from "@db/users.schema";

export const taskStatusEnum = pgEnum("task_status", ["todo", "in_progress", "done"]);

export const tasks = pgTable("tasks", {
    id: uuid("id").primaryKey().defaultRandom(),
    title: varchar("title", { length: 255 }).unique().notNull(),
    description: text("description").notNull(),
    status: taskStatusEnum("status").default("todo").notNull(),
    columnId: uuid("column_id")
        .references(() => boardColumns.id, { onDelete: "cascade" })
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
}));

export type Task = InferSelectModel<typeof tasks>;
export type TaskInsert = InferInsertModel<typeof tasks>;
export type TaskUpdate = Partial<TaskInsert>;
export type TaskReorder = z.infer<typeof taskReorderSchema>;

export const taskInsertSchema = createInsertSchema(tasks)
    .omit({ id: true, order: true, createdAt: true, updatedAt: true, userId: true })
    .extend({
        title: z.string().trim().min(5, "Le titre doit contenir au moins 5 caractères"),
        description: z.string().trim().min(1, "La description est obligatoire"),
        status: z.enum(["todo", "in_progress", "done"]).default("todo").optional(),
        columnId: z.string().uuid("L'ID de la colonne doit être un UUID valide"),
    });

export const taskReorderSchema = z.object({
    newOrder: z.number().int().min(0, "L'ordre doit être un nombre positif"),
    newColumnId: z.string().uuid("L'ID de la colonne doit être un UUID valide").optional(),
});

export const taskUpdateSchema = createUpdateSchema(tasks)
    .omit({ id: true, createdAt: true, updatedAt: true, order: true })
    .partial()
    .extend({
        title: z.string().trim().min(5, "Le titre doit contenir au moins 5 caractères").optional(),
        description: z.string().trim().min(1, "La description est obligatoire").optional(),
        status: z.enum(["todo", "in_progress", "done"]).optional(),
        columnId: z.string().uuid("L'ID de la colonne doit être un UUID valide").optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "Au moins un champ doit être fourni pour la mise à jour",
    });
