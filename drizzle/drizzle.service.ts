import { Inject, Injectable } from "@nestjs/common";
import { drizzle, NeonDatabase } from "drizzle-orm/neon-serverless";
import * as schema from "@db/schema";
import { DATABASE_CONNECTION_STRING, DRIZZLE } from "@drizzle/drizzle.provider";
import { Pool } from "@neondatabase/serverless";

export type DrizzleDb = NeonDatabase<typeof schema>;

@Injectable()
export class DrizzleService {
    constructor(
        @Inject(DRIZZLE) readonly db: DrizzleDb,
        @Inject(DATABASE_CONNECTION_STRING) private readonly connectionString: string,
    ) {}

    getAuthDb(accessToken: string): DrizzleDb {
        const pool = new Pool({
            connectionString: this.connectionString,
        });

        return drizzle(pool, {
            schema,
            logger: true,
        });
    }
}
