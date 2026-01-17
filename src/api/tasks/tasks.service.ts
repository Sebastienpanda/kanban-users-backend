import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { DrizzleService } from "@drizzle/drizzle.service";
import { and, asc, eq, gt, gte, lt, lte, max, sql } from "drizzle-orm";
import { Task, TaskInsert, tasks, TaskUpdate } from "@db/task.schema";
import { boardColumns } from "@db/bord-columns.schema";
import { EventsGateway } from "../../websockets/events.gateway";

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

        console.log("[TasksService] Résultat select:", existing);

        if (existing.length > 0) {
            throw new ConflictException("Tâche déjà existante");
        }

        const [maxOrderResult] = await this.drizzleService.db
            .select({ maxOrder: max(tasks.order) })
            .from(tasks)
            .where(eq(tasks.columnId, payload.columnId));

        const nextOrder = maxOrderResult.maxOrder !== null ? maxOrderResult.maxOrder + 1 : 0;

        const [newTask] = await this.drizzleService.db
            .insert(tasks)
            .values({
                ...payload,
                order: nextOrder,
                userId,
            })
            .returning();

        console.log(`[TasksService] Tâche créée, émission websocket...`);
        this.eventsGateway.emitTaskCreated(newTask);
        console.log(`[TasksService] Websocket émis`);

        return newTask;
    }

    findAll(): Promise<Task[]> {
        return this.drizzleService.db.select().from(tasks).orderBy(asc(tasks.order));
    }

    async findOne(id: string): Promise<Task> {
        const [data] = await this.drizzleService.db.select().from(tasks).where(eq(tasks.id, id));

        if (!data) {
            throw new NotFoundException("La tâche n'existe pas");
        }

        return data;
    }

    async update(id: string, payload: TaskUpdate): Promise<Task> {
        const oldTask = await this.findOne(id);

        // Si le status change, on doit aussi changer la colonne
        if (payload.status && payload.status !== oldTask.status) {
            // Récupérer la colonne actuelle pour trouver le workspace
            const [currentColumn] = await this.drizzleService.db
                .select()
                .from(boardColumns)
                .where(eq(boardColumns.id, oldTask.columnId))
                .limit(1);

            // Trouver la colonne correspondant au nouveau status dans le même workspace
            const targetColumnName = this.getColumnNameFromStatus(payload.status);
            const [targetColumn] = await this.drizzleService.db
                .select()
                .from(boardColumns)
                .where(
                    and(
                        eq(boardColumns.workspaceId, currentColumn.workspaceId),
                        eq(boardColumns.name, targetColumnName),
                    ),
                )
                .limit(1);

            if (!targetColumn) {
                throw new NotFoundException(`La colonne "${targetColumnName}" n'existe pas dans ce workspace`);
            }

            // Calculer le nouvel ordre (à la fin de la colonne cible)
            const [maxOrderResult] = await this.drizzleService.db
                .select({ maxOrder: max(tasks.order) })
                .from(tasks)
                .where(eq(tasks.columnId, targetColumn.id));

            const newOrder = maxOrderResult.maxOrder !== null ? maxOrderResult.maxOrder + 1 : 0;

            const [updated] = await this.drizzleService.db
                .update(tasks)
                .set({ ...payload, columnId: targetColumn.id, order: newOrder })
                .where(eq(tasks.id, id))
                .returning();

            this.eventsGateway.emitTaskStatusChanged(updated, oldTask.status);

            return updated;
        }

        const [updated] = await this.drizzleService.db.update(tasks).set(payload).where(eq(tasks.id, id)).returning();

        this.eventsGateway.emitTaskUpdated(updated);

        return updated;
    }

    async reorder(id: string, newOrder: number, newColumnId?: string): Promise<Task> {
        const task = await this.findOne(id);

        const oldOrder = task.order;
        const oldColumnId = task.columnId;
        const targetColumnId = newColumnId || oldColumnId;

        if (newColumnId && newColumnId !== oldColumnId) {
            const updatedTask = await this.drizzleService.db.transaction(async (tx) => {
                // Récupérer la colonne cible pour obtenir le status correspondant
                const [targetColumn] = await tx
                    .select()
                    .from(boardColumns)
                    .where(eq(boardColumns.id, targetColumnId))
                    .limit(1);

                if (!targetColumn) {
                    throw new NotFoundException("La colonne cible n'existe pas");
                }

                const newStatus = this.getStatusFromColumnName(targetColumn.name);

                // Décrémenter les tâches dans l'ancienne colonne
                await tx
                    .update(tasks)
                    .set({ order: sql`${tasks.order} - 1` })
                    .where(and(eq(tasks.columnId, oldColumnId), gt(tasks.order, oldOrder)));

                // Incrémenter les tâches dans la nouvelle colonne pour faire de la place
                await tx
                    .update(tasks)
                    .set({ order: sql`${tasks.order} + 1` })
                    .where(and(eq(tasks.columnId, targetColumnId), gte(tasks.order, newOrder)));

                // Mettre à jour la tâche avec le nouveau order, columnId ET status
                const [result] = await tx
                    .update(tasks)
                    .set({ order: newOrder, columnId: targetColumnId, status: newStatus })
                    .where(eq(tasks.id, id))
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

            const [result] = await tx.update(tasks).set({ order: newOrder }).where(eq(tasks.id, id)).returning();

            return result;
        });

        this.eventsGateway.emitTaskReordered(updatedTask);
        return updatedTask;
    }

    private getStatusFromColumnName(columnName: string): "todo" | "in_progress" | "done" {
        const normalizedName = columnName.toLowerCase().trim();

        if (normalizedName === "à faire") return "todo";
        if (normalizedName === "en cours") return "in_progress";
        if (normalizedName === "terminé") return "done";

        throw new Error(`Nom de colonne invalide: ${columnName}`);
    }

    private getColumnNameFromStatus(status: "todo" | "in_progress" | "done"): string {
        const mapping: Record<string, string> = {
            todo: "À faire",
            in_progress: "En cours",
            done: "Terminé",
        };
        return mapping[status];
    }
}
