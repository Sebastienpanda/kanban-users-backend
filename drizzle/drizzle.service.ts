import { Inject, Injectable } from '@nestjs/common';
import { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from '@db/schema';
import { DRIZZLE } from './drizzle.provider';

export type DrizzleDb = NeonHttpDatabase<typeof schema>;

@Injectable()
export class DrizzleService {
  constructor(@Inject(DRIZZLE) readonly db: DrizzleDb) {}
}
