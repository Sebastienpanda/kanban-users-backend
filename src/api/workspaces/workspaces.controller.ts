import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { WorkspacesService } from "./workspaces.service";
import { ApiTags } from "@nestjs/swagger";
import { ZodValidationPipe } from "@common/zod-validation.pipe";
import type { Workspace, WorkspaceInsert, WorkspaceUpdate } from "@db/workspace.schema";
import { workspaceInsertSchema, workspaceUpdateSchema } from "@db/workspace.schema";
import { ApiCreateWorkspaceSwaggerDecorator } from "./decorators/api-create-workspace-swagger.decorator";
import { ApiFindOneWorkspaceSwaggerDecorator } from "./decorators/api-find-one-workspace-swagger.decorator";
import { ApiUpdateWorkspaceSwaggerDecorator } from "./decorators/api-update-workspace-swagger.decorator";
import { AuthGuard } from "../../auth.guard";
import { AccessToken } from "../../access-token.decorator";

@ApiTags("workspaces")
@Controller("workspaces")
export class WorkspacesController {
    constructor(private readonly workspacesService: WorkspacesService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard)
    @ApiCreateWorkspaceSwaggerDecorator()
    create(
        @AccessToken() userId: string,
        @Body(new ZodValidationPipe(workspaceInsertSchema)) payload: WorkspaceInsert,
    ): Promise<Workspace> {
        return this.workspacesService.create(payload, userId);
    }

    @Get(":id")
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiFindOneWorkspaceSwaggerDecorator()
    findOne(@AccessToken() userId: string, @Param("id", ParseUUIDPipe) id: string): Promise<Workspace> {
        return this.workspacesService.findOne(id, userId);
    }

    @Patch(":id")
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiUpdateWorkspaceSwaggerDecorator()
    update(
        @AccessToken() userId: string,
        @Param("id", ParseUUIDPipe) id: string,
        @Body(new ZodValidationPipe(workspaceUpdateSchema)) payload: WorkspaceUpdate,
    ): Promise<Workspace> {
        return this.workspacesService.update(id, payload, userId);
    }
}
