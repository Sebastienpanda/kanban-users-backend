import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { DrizzleService } from "@drizzle/drizzle.service";
import { boardColumns, BoardColumns, BoardColumnsInsert, BoardColumnsUpdate } from "@db/bord-columns.schema";
import { eq } from "drizzle-orm";

@Injectable()
export class BoardColumnsService {
    constructor(private readonly drizzleService: DrizzleService) {}

    async create(payload: BoardColumnsInsert): Promise<BoardColumns> {
        const existing = await this.drizzleService.db
            .select()
            .from(boardColumns)
            .where(eq(boardColumns.name, payload.name))
            .limit(1);

        if (existing.length > 0) {
            throw new ConflictException("Board columns déja existante");
        }

        const [newBoardColumns] = await this.drizzleService.db
            .insert(boardColumns)
            .values({
                name: payload.name,
                workspaceId: payload.workspaceId,
            })
            .returning();

        return newBoardColumns;
    }

    findAll(): Promise<BoardColumns[]> {
        return this.drizzleService.db.query.boardColumns.findMany({
            with: {
                tasks: {
                    orderBy: (tasks, { asc }) => [asc(tasks.order)],
                },
            },
        });
    }

    async findOne(id: string): Promise<BoardColumns> {
        const [data] = await this.drizzleService.db.select().from(boardColumns).where(eq(boardColumns.id, id));

        if (!data) {
            throw new NotFoundException("Le boardColumns, n'existe pas");
        }

        return data;
    }

    async findOneWithTasks(id: string) {
        const data = await this.drizzleService.db.query.boardColumns.findFirst({
            where: eq(boardColumns.id, id),
            with: {
                tasks: {
                    orderBy: (tasks, { asc }) => [asc(tasks.order)],
                },
            },
        });

        if (!data) {
            throw new NotFoundException("Le boardColumns, n'existe pas");
        }

        return data;
    }

    async update(id: string, payload: BoardColumnsUpdate): Promise<BoardColumns> {
        const [updated] = await this.drizzleService.db
            .update(boardColumns)
            .set(payload)
            .where(eq(boardColumns.id, id))
            .returning();

        return updated;
    }
}
