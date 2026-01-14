import { Inject, Injectable } from "@nestjs/common";
import { NeonDatabase } from "drizzle-orm/neon-serverless";
import * as schema from "@db/schema";
import { DRIZZLE } from "./drizzle.provider";

export type DrizzleDb = NeonDatabase<typeof schema>;

@Injectable()
export class DrizzleService {
  constructor(@Inject(DRIZZLE) readonly db: DrizzleDb) {}
}
