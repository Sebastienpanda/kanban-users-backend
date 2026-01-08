import { ConflictException, Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { DrizzleService } from "@drizzle/drizzle.service";
import { eq, and, gte, lte, desc, max, gt, lt, sql, asc } from "drizzle-orm";
import { Task, TaskInsert, tasks, TaskUpdate } from "@db/task.schema";

@Injectable()
export class TasksService {
    constructor(private readonly drizzleService: DrizzleService) {}

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

    async reorder(id: string, newOrder: number): Promise<Task> {
        const task = await this.findOne(id);

        if (!task) {
            throw new NotFoundException("La tâche n'existe pas");
        }

        const oldOrder = task.order;

        if (oldOrder === newOrder) {
            return task;
        }

        if (newOrder < oldOrder) {
            await this.drizzleService.db
                .update(tasks)
                .set({ order: sql`${tasks.order} + 1` })
                .where(and(eq(tasks.columnId, task.columnId), gte(tasks.order, newOrder), lt(tasks.order, oldOrder)));
        } else {
            await this.drizzleService.db
                .update(tasks)
                .set({ order: sql`${tasks.order} - 1` })
                .where(and(eq(tasks.columnId, task.columnId), gt(tasks.order, oldOrder), lte(tasks.order, newOrder)));
        }

        const [updatedTask] = await this.drizzleService.db
            .update(tasks)
            .set({ order: newOrder })
            .where(eq(tasks.id, id))
            .returning();

        return updatedTask;
    }
}
