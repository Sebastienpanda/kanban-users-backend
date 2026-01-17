import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { DrizzleService } from "@drizzle/drizzle.service";
import { boardColumns, BoardColumns, BoardColumnsInsert, BoardColumnsUpdate } from "@db/bord-columns.schema";
import { tasks, Task } from "@db/task.schema";
import { and, asc, eq, gt, gte, lt, lte, max, sql } from "drizzle-orm";
import { EventsGateway } from "../../websockets/events.gateway";

@Injectable()
export class BoardColumnsService {
    constructor(
        private readonly drizzleService: DrizzleService,
        private readonly eventsGateway: EventsGateway,
    ) {}

    async create(payload: BoardColumnsInsert): Promise<BoardColumns> {
        const existing = await this.drizzleService.db
            .select()
            .from(boardColumns)
            .where(eq(boardColumns.name, payload.name))
            .limit(1);

        if (existing.length > 0) {
            throw new ConflictException("Board columns déja existante");
        }

        const [maxPositionResult] = await this.drizzleService.db
            .select({ maxPosition: max(boardColumns.position) })
            .from(boardColumns)
            .where(eq(boardColumns.workspaceId, payload.workspaceId));

        const nextPosition = maxPositionResult.maxPosition !== null ? maxPositionResult.maxPosition + 1 : 0;

        const [newBoardColumns] = await this.drizzleService.db
            .insert(boardColumns)
            .values({
                name: payload.name,
                workspaceId: payload.workspaceId,
                position: nextPosition,
            })
            .returning();

        this.eventsGateway.emitColumnCreated(newBoardColumns);
        return newBoardColumns;
    }

    async findAll(): Promise<Array<BoardColumns & { tasks: Task[] }>> {
        const rows = await this.drizzleService.db
            .select()
            .from(boardColumns)
            .leftJoin(tasks, eq(tasks.columnId, boardColumns.id))
            .orderBy(asc(boardColumns.position), asc(tasks.order));

        const grouped = new Map<string, BoardColumns & { tasks: Task[] }>();

        for (const row of rows) {
            if (!grouped.has(row.board_columns.id)) {
                grouped.set(row.board_columns.id, {
                    ...row.board_columns,
                    tasks: [],
                });
            }

            if (row.tasks) {
                grouped.get(row.board_columns.id)!.tasks.push(row.tasks);
            }
        }

        return Array.from(grouped.values());
    }

    async findOne(id: string): Promise<BoardColumns> {
        const [data] = await this.drizzleService.db.select().from(boardColumns).where(eq(boardColumns.id, id));

        if (!data) {
            throw new NotFoundException("Le boardColumns, n'existe pas");
        }

        return data;
    }

    async findOneWithTasks(id: string): Promise<BoardColumns & { tasks: Task[] }> {
        const rows = await this.drizzleService.db
            .select()
            .from(boardColumns)
            .leftJoin(tasks, eq(tasks.columnId, boardColumns.id))
            .where(eq(boardColumns.id, id))
            .orderBy(asc(tasks.order));

        if (rows.length === 0) {
            throw new NotFoundException("Le boardColumns, n'existe pas");
        }

        const column = rows[0].board_columns;
        const columnTasks = rows.filter((row) => row.tasks !== null).map((row) => row.tasks!);

        return {
            ...column,
            tasks: columnTasks,
        };
    }

    async update(id: string, payload: BoardColumnsUpdate): Promise<BoardColumns> {
        const [updated] = await this.drizzleService.db
            .update(boardColumns)
            .set(payload)
            .where(eq(boardColumns.id, id))
            .returning();

        return updated;
    }

    async reorder(id: string, newPosition: number): Promise<BoardColumns> {
        const column = await this.findOne(id);

        const oldPosition = column.position;

        if (oldPosition === newPosition) {
            return column;
        }

        const updatedColumn = await this.drizzleService.db.transaction(async (tx) => {
            if (newPosition < oldPosition) {
                await tx
                    .update(boardColumns)
                    .set({ position: sql`${boardColumns.position} + 1` })
                    .where(
                        and(
                            eq(boardColumns.workspaceId, column.workspaceId),
                            gte(boardColumns.position, newPosition),
                            lt(boardColumns.position, oldPosition),
                        ),
                    );
            } else {
                await tx
                    .update(boardColumns)
                    .set({ position: sql`${boardColumns.position} - 1` })
                    .where(
                        and(
                            eq(boardColumns.workspaceId, column.workspaceId),
                            gt(boardColumns.position, oldPosition),
                            lte(boardColumns.position, newPosition),
                        ),
                    );
            }

            const [result] = await tx
                .update(boardColumns)
                .set({ position: newPosition })
                .where(eq(boardColumns.id, id))
                .returning();

            return result;
        });

        this.eventsGateway.emitColumnReordered(updatedColumn);
        return updatedColumn;
    }
}
