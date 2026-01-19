import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Workspace, WorkspaceInsert, workspaces, WorkspaceUpdate } from "@db/workspace.schema";
import { DrizzleService } from "@drizzle/drizzle.service";
import { eq } from "drizzle-orm";
import { EventsGateway } from "../../websockets/events.gateway";
import { byIdAndUser } from "@common/query-helpers";

@Injectable()
export class WorkspacesService {
    constructor(
        private readonly drizzleService: DrizzleService,
        private readonly eventsGateway: EventsGateway,
    ) {}

    async create(payload: WorkspaceInsert, userId: string): Promise<Workspace> {
        const existing = await this.drizzleService.db
            .select()
            .from(workspaces)
            .where(eq(workspaces.name, payload.name));

        if (existing.length > 0) {
            throw new ConflictException("Workspace existant");
        }

        const [newWorkspace] = await this.drizzleService.db
            .insert(workspaces)
            .values({
                ...payload,
                userId,
            })
            .returning();

        this.eventsGateway.emitWorkspaceCreated(newWorkspace);
        return newWorkspace;
    }

    async findOne(id: string, userId: string): Promise<Workspace> {
        const [workspace] = await this.drizzleService.db
            .select()
            .from(workspaces)
            .where(byIdAndUser(workspaces, id, userId));

        if (!workspace) {
            throw new NotFoundException("Le workspace n'existe pas ou ne vous appartient pas");
        }

        return workspace;
    }

    async update(id: string, payload: WorkspaceUpdate, userId: string): Promise<Workspace> {
        // Vérifier que le workspace appartient à l'utilisateur
        await this.findOne(id, userId);

        const [updated] = await this.drizzleService.db
            .update(workspaces)
            .set(payload)
            .where(byIdAndUser(workspaces, id, userId))
            .returning();

        this.eventsGateway.emitWorkspaceUpdated(updated);
        return updated;
    }
}
