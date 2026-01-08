import { Global, Module } from '@nestjs/common';
import { DrizzleService } from './drizzle.service';
import { DRIZZLE, drizzleProvider } from './drizzle.provider';

@Global()
@Module({
  providers: [DrizzleService, ...drizzleProvider],
  exports: [DRIZZLE, DrizzleService],
})
export class DrizzleModule {}
