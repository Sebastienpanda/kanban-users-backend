import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from "@nestjs/common";
import { TasksService } from "@api/tasks/tasks.service";
import type { Task, TaskInsert, TaskUpdate, TaskReorder } from "@db/task.schema";
import { taskInsertSchema, taskUpdateSchema, taskReorderSchema } from "@db/task.schema";
import { ZodValidationPipe } from "@common/zod-validation.pipe";
import { ApiTags } from "@nestjs/swagger";
import { ApiCreateTaskSwaggerDecorator } from "@api/tasks/decorators/api-create-task-swagger.decorator";
import { ApiGetAllTasksDocSwaggerDecorator } from "@api/tasks/decorators/api-find-all-task-swagger.decorator";
import { ApiGetOneTaskSwaggerDecorator } from "@api/tasks/decorators/api-find-one-task-swagger.decorator";
import { ApiUpdateTaskSwaggerDecorator } from "@api/tasks/decorators/api-update-task-swagger.decorator.ts.decorator";

@ApiTags("tasks")
@Controller("tasks")
export class TasksController {
    constructor(private readonly tasksService: TasksService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiCreateTaskSwaggerDecorator()
    create(@Body(new ZodValidationPipe(taskInsertSchema)) payload: TaskInsert): Promise<Task> {
        return this.tasksService.create(payload);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiGetAllTasksDocSwaggerDecorator()
    findAll(): Promise<Task[]> {
        return this.tasksService.findAll();
    }

    @Get(":id")
    @HttpCode(HttpStatus.OK)
    @ApiGetOneTaskSwaggerDecorator()
    findOne(@Param("id", ParseUUIDPipe) id: string): Promise<Task> {
        return this.tasksService.findOne(id);
    }

    @Patch(":id")
    @HttpCode(HttpStatus.OK)
    @ApiUpdateTaskSwaggerDecorator()
    update(
        @Param("id", ParseUUIDPipe) id: string,
        @Body(new ZodValidationPipe(taskUpdateSchema)) payload: TaskUpdate,
    ): Promise<Task> {
        return this.tasksService.update(id, payload);
    }

    @Patch(":id/reorder")
    @HttpCode(HttpStatus.OK)
    reorder(
        @Param("id", ParseUUIDPipe) id: string,
        @Body(new ZodValidationPipe(taskReorderSchema)) payload: TaskReorder,
    ): Promise<Task> {
        return this.tasksService.reorder(id, payload.newOrder, payload.newColumnId);
    }
}
