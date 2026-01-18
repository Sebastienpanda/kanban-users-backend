import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ThrottlerModule, ThrottlerGuard } from "@nestjs/throttler";
import { DrizzleModule } from "@drizzle/drizzle.module";
import { TasksModule } from "@api/tasks/tasks.module";
import { WorkspacesModule } from "@api/workspaces/workspaces.module";
import { BoardColumnsModule } from "./api/board-columns/board-columns.module";
import { EventsModule } from "./websockets/events.module";
import { UserModule } from "@api/user/user.module";
import { StatusesModule } from "@api/statuses/statuses.module";
import { HealthModule } from "@api/health/health.module";

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        ThrottlerModule.forRoot([
            {
                ttl: 60000, // 60 secondes
                limit: 100, // 100 requêtes par minute
            },
        ]),
        DrizzleModule,
        EventsModule,
        HealthModule,
        UserModule,
        TasksModule,
        WorkspacesModule,
        BoardColumnsModule,
        StatusesModule,
    ],
    providers: [
        {
            provide: APP_GUARD,
            useClass: ThrottlerGuard,
        },
    ],
})
export class AppModule {}
