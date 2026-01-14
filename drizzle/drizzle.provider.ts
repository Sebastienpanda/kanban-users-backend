import { ConfigService } from "@nestjs/config";
import { neonConfig, Pool } from "@neondatabase/serverless";
import { drizzle, type NeonDatabase } from "drizzle-orm/neon-serverless";
import * as schema from "@db/schema";
import ws from "ws";

neonConfig.webSocketConstructor = ws;

export const DRIZZLE = Symbol("DRIZZLE");

export const drizzleProvider = [
    {
        provide: DRIZZLE,
        inject: [ConfigService],
        useFactory: (configService: ConfigService): NeonDatabase<typeof schema> => {
            const connectionString = configService.getOrThrow<string>("DATABASE_URL");

            const pool = new Pool({ connectionString });

            return drizzle(pool, {
                schema,
                logger: true,
            });
        },
    },
];
