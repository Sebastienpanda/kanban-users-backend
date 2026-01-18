import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { DrizzleService } from "@drizzle/drizzle.service";
import { Statuses, StatusesInsert, statuses, StatusesUpdate } from "@db/statuses.schema";
import { eq } from "drizzle-orm";
import { EventsGateway } from "../../websockets/events.gateway";
import { byIdAndUser, byUserId } from "@common/query-helpers";

@Injectable()
export class StatusesService {
    constructor(
        private readonly drizzleService: DrizzleService,
        private readonly eventsGateway: EventsGateway,
    ) {}

    async create(payload: StatusesInsert, userId: string): Promise<Statuses> {
        const [newStatus] = await this.drizzleService.db
            .insert(statuses)
            .values({
                ...payload,
                userId,
            })
            .returning();

        this.eventsGateway.emitStatusCreated(newStatus);
        return newStatus;
    }

    async findAll(userId: string): Promise<Statuses[]> {
        return this.drizzleService.db.select().from(statuses).where(byUserId(statuses, userId));
    }

    async findOne(id: string, userId: string): Promise<Statuses> {
        const [status] = await this.drizzleService.db.select().from(statuses).where(byIdAndUser(statuses, id, userId));

        if (!status) {
            throw new NotFoundException("Le statut n'existe pas ou ne vous appartient pas");
        }

        return status;
    }

    async update(id: string, payload: StatusesUpdate, userId: string): Promise<Statuses> {
        await this.findOne(id, userId);

        const [updated] = await this.drizzleService.db
            .update(statuses)
            .set(payload)
            .where(byIdAndUser(statuses, id, userId))
            .returning();

        this.eventsGateway.emitStatusUpdated(updated);
        return updated;
    }
}
