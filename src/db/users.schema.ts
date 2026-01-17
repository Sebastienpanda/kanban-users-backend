import { boolean, pgSchema, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

const neonAuthSchema = pgSchema("neon_auth");

export const neonAuthUsers = neonAuthSchema.table("user", {
    id: uuid().primaryKey().defaultRandom(),
    name: varchar().notNull(),
    email: varchar().unique().notNull(),
    emailVerified: boolean().notNull(),
    image: text(),
    role: text(),
    banned: boolean(),
    banReason: text(),
    banExpires: timestamp({
        precision: 3,
        withTimezone: true,
        mode: "string",
    }),
    createdAt: timestamp({
        precision: 3,
        withTimezone: true,
        mode: "string",
    })
        .default(sql`CURRENT_TIMESTAMP`)
        .notNull(),

    updatedAt: timestamp({
        precision: 3,
        withTimezone: true,
        mode: "string",
    }),
});
