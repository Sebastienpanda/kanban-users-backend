import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { DrizzleService } from "@drizzle/drizzle.service";
import { and, eq, gt, gte, lt, lte, max, sql } from "drizzle-orm";
import { Task, TaskInsert, tasks, TaskUpdate } from "@db/task.schema";
import { boardColumns } from "@db/bord-columns.schema";
import { EventsGateway } from "../../websockets/events.gateway";
import { byIdAndUser } from "@common/query-helpers";
import { statuses } from "@db/statuses.schema";

@Injectable()
export class TasksService {
    constructor(
        private readonly drizzleService: DrizzleService,
        private readonly eventsGateway: EventsGateway,
    ) {}

    async create(payload: TaskInsert, userId: string): Promise<Task> {
        const existing = await this.drizzleService.db
            .select()
            .from(tasks)
            .where(eq(tasks.title, payload.title))
            .limit(1);

        if (existing.length > 0) {
            throw new ConflictException("Tâche déjà existante");
        }

        const [column] = await this.drizzleService.db
            .select()
            .from(boardColumns)
            .where(byIdAndUser(boardColumns, payload.columnId, userId))
            .limit(1);

        if (!column) {
            throw new NotFoundException("La colonne n'existe pas ou ne vous appartient pas");
        }

        if (payload.statusId) {
            const [status] = await this.drizzleService.db
                .select()
                .from(statuses)
                .where(byIdAndUser(statuses, payload.statusId, userId))
                .limit(1);

            if (!status) {
                throw new NotFoundException("Le statut n'existe pas ou ne vous appartient pas");
            }
        }

        const [maxOrderResult] = await this.drizzleService.db
            .select({ maxOrder: max(tasks.order) })
            .from(tasks)
            .where(eq(tasks.columnId, payload.columnId));

        const nextOrder = maxOrderResult.maxOrder === null ? 0 : maxOrderResult.maxOrder + 1;

        const [newTask] = await this.drizzleService.db
            .insert(tasks)
            .values({
                ...payload,
                order: nextOrder,
                userId,
            })
            .returning();

        this.eventsGateway.emitTaskCreated(newTask);

        return newTask;
    }

    async findOne(id: string, userId: string): Promise<Task> {
        const [data] = await this.drizzleService.db
            .select()
            .from(tasks)
            .where(byIdAndUser(tasks, id, userId));

        if (!data) {
            throw new NotFoundException("La tâche n'existe pas ou ne vous appartient pas");
        }

        return data;
    }

    async update(id: string, payload: TaskUpdate, userId: string): Promise<Task> {
        const oldTask = await this.findOne(id, userId);

        // Vérifier que le nouveau statut appartient à l'utilisateur si fourni
        if (payload.statusId) {
            const [status] = await this.drizzleService.db
                .select()
                .from(statuses)
                .where(byIdAndUser(statuses, payload.statusId, userId))
                .limit(1);

            if (!status) {
                throw new NotFoundException("Le statut n'existe pas ou ne vous appartient pas");
            }
        }

        // Vérifier que la nouvelle colonne appartient à l'utilisateur si fournie
        if (payload.columnId && payload.columnId !== oldTask.columnId) {
            const [column] = await this.drizzleService.db
                .select()
                .from(boardColumns)
                .where(byIdAndUser(boardColumns, payload.columnId, userId))
                .limit(1);

            if (!column) {
                throw new NotFoundException("La colonne n'existe pas ou ne vous appartient pas");
            }
        }

        const [updated] = await this.drizzleService.db
            .update(tasks)
            .set(payload)
            .where(byIdAndUser(tasks, id, userId))
            .returning();

        if (payload.statusId && payload.statusId !== oldTask.statusId) {
            this.eventsGateway.emitTaskStatusChanged(updated, oldTask.statusId);
        } else {
            this.eventsGateway.emitTaskUpdated(updated);
        }

        return updated;
    }
    async reorder(id: string, newOrder: number, userId: string, newColumnId?: string): Promise<Task> {
        const task = await this.findOne(id, userId);

        const oldOrder = task.order;
        const oldColumnId = task.columnId;
        const targetColumnId = newColumnId || oldColumnId;

        if (newColumnId && newColumnId !== oldColumnId) {
            const updatedTask = await this.drizzleService.db.transaction(async (tx) => {
                const [targetColumn] = await tx
                    .select()
                    .from(boardColumns)
                    .where(byIdAndUser(boardColumns, targetColumnId, userId))
                    .limit(1);

                if (!targetColumn) {
                    throw new NotFoundException("La colonne cible n'existe pas ou ne vous appartient pas");
                }

                await tx
                    .update(tasks)
                    .set({ order: sql`${tasks.order} - 1` })
                    .where(and(eq(tasks.columnId, oldColumnId), gt(tasks.order, oldOrder)));

                const [result] = await tx
                    .update(tasks)
                    .set({ order: sql`${tasks.order} + 1` })
                    .where(and(eq(tasks.columnId, targetColumnId), gte(tasks.order, newOrder)))
                    .returning();

                return result;
            });

            this.eventsGateway.emitTaskReordered(updatedTask);
            return updatedTask;
        }

        if (oldOrder === newOrder) {
            return task;
        }

        const updatedTask = await this.drizzleService.db.transaction(async (tx) => {
            if (newOrder < oldOrder) {
                await tx
                    .update(tasks)
                    .set({ order: sql`${tasks.order} + 1` })
                    .where(
                        and(eq(tasks.columnId, task.columnId), gte(tasks.order, newOrder), lt(tasks.order, oldOrder)),
                    );
            } else {
                await tx
                    .update(tasks)
                    .set({ order: sql`${tasks.order} - 1` })
                    .where(
                        and(eq(tasks.columnId, task.columnId), gt(tasks.order, oldOrder), lte(tasks.order, newOrder)),
                    );
            }

            const [result] = await tx
                .update(tasks)
                .set({ order: newOrder })
                .where(byIdAndUser(tasks, id, userId))
                .returning();

            return result;
        });

        this.eventsGateway.emitTaskReordered(updatedTask);
        return updatedTask;
    }
}
