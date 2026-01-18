import { pgEnum, pgTable, text, timestamp, uuid, unique } from "drizzle-orm/pg-core";
import { InferInsertModel, InferSelectModel, relations, sql } from "drizzle-orm";
import { neonAuthUsers } from "@db/users.schema";
import { createInsertSchema, createUpdateSchema } from "drizzle-zod";
import { z } from "zod";
import { workspaces } from "@db/workspace.schema";
import { tasks } from "@db/task.schema";

export const statusColorKey = pgEnum("statusColorKey", [
    "blue",
    "orange",
    "green",
    "red",
    "purple",
    "pink",
    "yellow",
    "gray",
]);

export const statuses = pgTable(
    "statuses",
    {
        id: uuid("id").primaryKey().defaultRandom(),
        name: text("name").notNull(),
        color: statusColorKey("color").default("blue"),
        workspaceId: uuid("workspace_id")
            .references(() => workspaces.id)
            .notNull(),
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
    },
    (table) => ({
        uniqueNamePerWorkspace: unique().on(table.name, table.workspaceId),
    }),
);

export const statusesRelations = relations(statuses, ({ one, many }) => ({
    workspace: one(workspaces, {
        fields: [statuses.workspaceId],
        references: [workspaces.id],
    }),
    tasks: many(tasks),
}));

export type Statuses = InferSelectModel<typeof statuses>;
export type StatusesInsert = InferInsertModel<typeof statuses>;
export type StatusesUpdate = Partial<StatusesInsert>;

export const statusesInsertSchema = createInsertSchema(statuses)
    .omit({
        id: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
    })
    .extend({
        name: z.string().trim().min(3, "Le nom du statut doit contenir au moins 3 caractères"),
        color: z
            .enum(["blue", "orange", "green", "red", "purple", "pink", "yellow", "gray"])
            .default("blue")
            .optional(),
        workspaceId: z.uuid("L'ID du workspace doit être valide"),
    });

export const statusesUpdateSchema = createUpdateSchema(statuses)
    .omit({
        id: true,
        userId: true,
        createdAt: true,
        updatedAt: true,
    })
    .partial()
    .extend({
        name: z.string().trim().min(3, "Le nom du statut doit contenir au moins 3 caractères").optional(),
        color: z
            .enum(["blue", "orange", "green", "red", "purple", "pink", "yellow", "gray"])
            .default("blue")
            .optional(),
        workspaceId: z.uuid("L'ID du workspace doit être valide").optional(),
    })
    .refine((data) => Object.keys(data).length > 0, {
        message: "Au moins un champ doit être fourni pour la mise à jour",
    });
