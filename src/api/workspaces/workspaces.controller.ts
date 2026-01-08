import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from "@nestjs/common";
import { WorkspacesService } from "./workspaces.service";
import { ApiTags } from "@nestjs/swagger";
import { ZodValidationPipe } from "@common/zod-validation.pipe";
import type { Workspace, WorkspaceInsert, WorkspaceUpdate } from "@db/workspace.schema";
import { workspaceInsertSchema, workspaceUpdateSchema } from "@db/workspace.schema";

@ApiTags("workspaces")
@Controller("workspaces")
export class WorkspacesController {
    constructor(private readonly workspacesService: WorkspacesService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    create(@Body(new ZodValidationPipe(workspaceInsertSchema)) payload: WorkspaceInsert): Promise<Workspace> {
        return this.workspacesService.create(payload);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    findAll(): Promise<Workspace[]> {
        return this.workspacesService.findAll();
    }

    @Get(":id")
    @HttpCode(HttpStatus.OK)
    findOne(@Param("id", ParseUUIDPipe) id: string): Promise<Workspace> {
        return this.workspacesService.findOne(id);
    }

    @Get(":id/with-columns")
    @HttpCode(HttpStatus.OK)
    findOneWithColumns(@Param("id", ParseUUIDPipe) id: string) {
        return this.workspacesService.findOneWithColumns(id);
    }

    @Patch(":id")
    @HttpCode(HttpStatus.OK)
    update(
        @Param("id", ParseUUIDPipe) id: string,
        @Body(new ZodValidationPipe(workspaceUpdateSchema)) payload: WorkspaceUpdate,
    ): Promise<Workspace> {
        return this.workspacesService.update(id, payload);
    }
}
