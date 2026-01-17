import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import {
    Workspace,
    WorkspaceInsert,
    workspaces,
    WorkspaceUpdate,
    WorkspaceWithColumnsAndTasks,
} from "@db/workspace.schema";
import { DrizzleService } from "@drizzle/drizzle.service";
import { asc, eq } from "drizzle-orm";
import { boardColumns } from "@db/bord-columns.schema";
import { tasks } from "@db/task.schema";
import { EventsGateway } from "../../websockets/events.gateway";

@Injectable()
export class WorkspacesService {
    constructor(
        private readonly drizzleService: DrizzleService,
        private readonly eventsGateway: EventsGateway,
    ) {}

    async create(payload: WorkspaceInsert): Promise<Workspace> {
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
                name: payload.name,
            })
            .returning();

        this.eventsGateway.emitWorkspaceCreated(newWorkspace);
        return newWorkspace;
    }

    findAll(): Promise<Workspace[]> {
        return this.drizzleService.db.select().from(workspaces);
    }

    async findOne(id: string): Promise<WorkspaceWithColumnsAndTasks> {
        return this.findWorkspaceWithRelations(id);
    }

    async findOneWithColumns(id: string): Promise<WorkspaceWithColumnsAndTasks> {
        return this.findWorkspaceWithRelations(id);
    }

    private async findWorkspaceWithRelations(id: string): Promise<WorkspaceWithColumnsAndTasks> {
        const workspace = await this.drizzleService.db.query.workspaces.findFirst({
            where: eq(workspaces.id, id),
            with: {
                columns: {
                    orderBy: asc(boardColumns.position),
                    with: {
                        tasks: {
                            orderBy: asc(tasks.order),
                        },
                    },
                },
            },
        });

        if (!workspace) {
            throw new NotFoundException("Le workspace n'existe pas");
        }

        return workspace;
    }

    async update(id: string, payload: WorkspaceUpdate): Promise<Workspace> {
        const [updated] = await this.drizzleService.db
            .update(workspaces)
            .set(payload)
            .where(eq(workspaces.id, id))
            .returning();

        return updated;
    }
}
