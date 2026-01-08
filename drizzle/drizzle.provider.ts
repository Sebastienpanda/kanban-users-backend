import { ConfigService } from '@nestjs/config';
import { drizzle, type NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '@db/schema';

export const DRIZZLE = Symbol('DRIZZLE');

export const drizzleProvider = [
  {
    provide: DRIZZLE,
    inject: [ConfigService],
    useFactory: (
      configService: ConfigService,
    ): NeonHttpDatabase<typeof schema> => {
      const connectionString = configService.getOrThrow<string>('DATABASE_URL');

      return drizzle(connectionString, {
        schema,
        logger: true,
      });
    },
  },
];
