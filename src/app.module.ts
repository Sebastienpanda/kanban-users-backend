import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DrizzleModule } from "@drizzle/drizzle.module";
import { TasksModule } from "@api/tasks/tasks.module";
import { WorkspacesModule } from "@api/workspaces/workspaces.module";
import { BoardColumnsModule } from "./api/board-columns/board-columns.module";
import { EventsModule } from "./websockets/events.module";

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        DrizzleModule,
        EventsModule,
        TasksModule,
        WorkspacesModule,
        BoardColumnsModule,
    ],
})
export class AppModule {}
