import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { DrizzleService } from "@drizzle/drizzle.service";
import { and, asc, eq, gt, gte, lt, lte, max, sql } from "drizzle-orm";
import { Task, TaskInsert, tasks, TaskUpdate } from "@db/task.schema";
import { boardColumns } from "@db/bord-columns.schema";

@Injectable()
export class TasksService {
    constructor(private readonly drizzleService: DrizzleService) {}

    private getStatusFromColumnName(columnName: string): "todo" | "in_progress" | "done" {
        const normalizedName = columnName.toLowerCase().trim();

        if (normalizedName === "à faire") return "todo";
        if (normalizedName === "en cours") return "in_progress";
        if (normalizedName === "terminé") return "done";

        throw new Error(`Nom de colonne invalide: ${columnName}`);
    }

    async create(payload: TaskInsert): Promise<Task> {
        const existing = await this.drizzleService.db
            .select()
            .from(tasks)
            .where(eq(tasks.title, payload.title))
            .limit(1);

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
                title: payload.title,
                description: payload.description,
                status: payload.status,
                columnId: payload.columnId,
                order: nextOrder,
            })
            .returning();

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
        const [updated] = await this.drizzleService.db.update(tasks).set(payload).where(eq(tasks.id, id)).returning();

        return updated;
    }

    async reorder(id: string, newOrder: number, newColumnId?: string): Promise<Task> {
        const task = await this.findOne(id);

        const oldOrder = task.order;
        const oldColumnId = task.columnId;
        const targetColumnId = newColumnId || oldColumnId;

        if (newColumnId && newColumnId !== oldColumnId) {
            return await this.drizzleService.db.transaction(async (tx) => {
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
                const [updatedTask] = await tx
                    .update(tasks)
                    .set({ order: newOrder, columnId: targetColumnId, status: newStatus })
                    .where(eq(tasks.id, id))
                    .returning();

                return updatedTask;
            });
        }

        if (oldOrder === newOrder) {
            return task;
        }

        return await this.drizzleService.db.transaction(async (tx) => {
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

            const [updatedTask] = await tx.update(tasks).set({ order: newOrder }).where(eq(tasks.id, id)).returning();

            return updatedTask;
        });
    }
}
