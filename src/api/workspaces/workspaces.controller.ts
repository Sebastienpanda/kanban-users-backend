import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from "@nestjs/common";
import { WorkspacesService } from "./workspaces.service";
import { ApiTags } from "@nestjs/swagger";
import { ZodValidationPipe } from "@common/zod-validation.pipe";
import type { Workspace, WorkspaceInsert, WorkspaceUpdate, WorkspaceWithColumnsAndTasks } from "@db/workspace.schema";
import { workspaceInsertSchema, workspaceUpdateSchema } from "@db/workspace.schema";
import { ApiCreateWorkspaceSwaggerDecorator } from "./decorators/api-create-workspace-swagger.decorator";
import { ApiFindAllWorkspacesSwaggerDecorator } from "./decorators/api-find-all-workspaces-swagger.decorator";
import { ApiFindOneWorkspaceSwaggerDecorator } from "./decorators/api-find-one-workspace-swagger.decorator";
import { ApiFindOneWorkspaceWithColumnsSwaggerDecorator } from "./decorators/api-find-one-workspace-with-columns-swagger.decorator";
import { ApiUpdateWorkspaceSwaggerDecorator } from "./decorators/api-update-workspace-swagger.decorator";

@ApiTags("workspaces")
@Controller("workspaces")
export class WorkspacesController {
    constructor(private readonly workspacesService: WorkspacesService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiCreateWorkspaceSwaggerDecorator()
    create(@Body(new ZodValidationPipe(workspaceInsertSchema)) payload: WorkspaceInsert): Promise<Workspace> {
        return this.workspacesService.create(payload);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiFindAllWorkspacesSwaggerDecorator()
    findAll(): Promise<Workspace[]> {
        return this.workspacesService.findAll();
    }

    @Get(":id")
    @HttpCode(HttpStatus.OK)
    @ApiFindOneWorkspaceSwaggerDecorator()
    findOne(@Param("id", ParseUUIDPipe) id: string): Promise<WorkspaceWithColumnsAndTasks> {
        return this.workspacesService.findOne(id);
    }

    @Get(":id/with-columns")
    @HttpCode(HttpStatus.OK)
    @ApiFindOneWorkspaceWithColumnsSwaggerDecorator()
    findOneWithColumns(@Param("id", ParseUUIDPipe) id: string): Promise<WorkspaceWithColumnsAndTasks> {
        return this.workspacesService.findOneWithColumns(id);
    }

    @Patch(":id")
    @HttpCode(HttpStatus.OK)
    @ApiUpdateWorkspaceSwaggerDecorator()
    update(
        @Param("id", ParseUUIDPipe) id: string,
        @Body(new ZodValidationPipe(workspaceUpdateSchema)) payload: WorkspaceUpdate,
    ): Promise<Workspace> {
        return this.workspacesService.update(id, payload);
    }
}
