import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { Workspace, WorkspaceInsert, workspaces, WorkspaceUpdate } from "@db/workspace.schema";
import { DrizzleService } from "@drizzle/drizzle.service";
import { eq } from "drizzle-orm";

@Injectable()
export class WorkspacesService {
    constructor(private readonly drizzleService: DrizzleService) {}

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

        return newWorkspace;
    }

    findAll(): Promise<Workspace[]> {
        return this.drizzleService.db.select().from(workspaces);
    }

    async findAllWithColumns() {
        return this.drizzleService.db.query.workspaces.findMany({
            with: {
                columns: {
                    with: {
                        tasks: {
                            orderBy: (tasks, { asc }) => [asc(tasks.order)],
                        },
                    },
                },
            },
        });
    }

    async findOne(id: string): Promise<Workspace> {
        const [data] = await this.drizzleService.db.select().from(workspaces).where(eq(workspaces.id, id));

        if (!data) {
            throw new NotFoundException("Le workspace n'existe pas");
        }

        return data;
    }

    async findOneWithColumns(id: string) {
        const data = await this.drizzleService.db.query.workspaces.findFirst({
            where: eq(workspaces.id, id),
            with: {
                columns: {
                    with: {
                        tasks: {
                            orderBy: (tasks, { asc }) => [asc(tasks.order)],
                        },
                    },
                },
            },
        });

        if (!data) {
            throw new NotFoundException("Le workspace n'existe pas");
        }

        return data;
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
