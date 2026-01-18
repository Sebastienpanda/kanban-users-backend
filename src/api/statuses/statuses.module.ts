import { Module } from "@nestjs/common";
import { StatusesController } from "./statuses.controller";
import { StatusesService } from "./statuses.service";
import { EventsModule } from "../../websockets/events.module";

@Module({
    imports: [EventsModule],
    controllers: [StatusesController],
    providers: [StatusesService],
})
export class StatusesModule {}
