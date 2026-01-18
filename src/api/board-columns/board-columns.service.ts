import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { DrizzleService } from "@drizzle/drizzle.service";
import { boardColumns, BoardColumns, BoardColumnsInsert, BoardColumnsUpdate } from "@db/bord-columns.schema";
import { and, eq, gt, gte, lt, lte, max, sql } from "drizzle-orm";
import { EventsGateway } from "../../websockets/events.gateway";
import { byIdAndUser } from "@common/query-helpers";
import { workspaces } from "@db/workspace.schema";

@Injectable()
export class BoardColumnsService {
    constructor(
        private readonly drizzleService: DrizzleService,
        private readonly eventsGateway: EventsGateway,
    ) {}

    async create(payload: BoardColumnsInsert, userId: string): Promise<BoardColumns> {
        const existing = await this.drizzleService.db
            .select()
            .from(boardColumns)
            .where(eq(boardColumns.name, payload.name))
            .limit(1);

        if (existing.length > 0) {
            throw new ConflictException("Board columns déja existante");
        }

        // Vérifier que le workspace appartient à l'utilisateur
        const [workspace] = await this.drizzleService.db
            .select()
            .from(workspaces)
            .where(byIdAndUser(workspaces, payload.workspaceId, userId))
            .limit(1);

        if (!workspace) {
            throw new NotFoundException("Le workspace n'existe pas ou ne vous appartient pas");
        }

        const [maxPositionResult] = await this.drizzleService.db
            .select({ maxPosition: max(boardColumns.position) })
            .from(boardColumns)
            .where(eq(boardColumns.workspaceId, payload.workspaceId));

        const nextPosition = maxPositionResult.maxPosition !== null ? maxPositionResult.maxPosition + 1 : 0;

        const [newBoardColumns] = await this.drizzleService.db
            .insert(boardColumns)
            .values({
                ...payload,
                position: nextPosition,
                userId,
            })
            .returning();

        this.eventsGateway.emitColumnCreated(newBoardColumns);
        return newBoardColumns;
    }

    async findOne(id: string, userId: string): Promise<BoardColumns> {
        const [data] = await this.drizzleService.db
            .select()
            .from(boardColumns)
            .where(byIdAndUser(boardColumns, id, userId));

        if (!data) {
            throw new NotFoundException("La colonne n'existe pas ou ne vous appartient pas");
        }

        return data;
    }

    async update(id: string, payload: BoardColumnsUpdate, userId: string): Promise<BoardColumns> {
        // Vérifier que la colonne appartient à l'utilisateur
        await this.findOne(id, userId);

        // Vérifier que le nouveau workspace appartient à l'utilisateur si fourni
        if (payload.workspaceId) {
            const [workspace] = await this.drizzleService.db
                .select()
                .from(workspaces)
                .where(byIdAndUser(workspaces, payload.workspaceId, userId))
                .limit(1);

            if (!workspace) {
                throw new NotFoundException("Le workspace n'existe pas ou ne vous appartient pas");
            }
        }

        const [updated] = await this.drizzleService.db
            .update(boardColumns)
            .set(payload)
            .where(byIdAndUser(boardColumns, id, userId))
            .returning();

        return updated;
    }

    async reorder(id: string, newPosition: number, userId: string): Promise<BoardColumns> {
        const column = await this.findOne(id, userId);

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
