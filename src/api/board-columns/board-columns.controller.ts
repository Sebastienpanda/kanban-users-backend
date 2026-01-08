import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from "@nestjs/common";
import { BoardColumnsService } from "./board-columns.service";
import { ApiTags } from "@nestjs/swagger";
import { ZodValidationPipe } from "@common/zod-validation.pipe";
import type { BoardColumns, BoardColumnsInsert, BoardColumnsUpdate } from "@db/bord-columns.schema";
import { boardColumnsInsertSchema, boardColumnsUpdateSchema } from "@db/bord-columns.schema";

@ApiTags("board-columns")
@Controller("board-columns")
export class BoardColumnsController {
    constructor(private readonly boardColumnsService: BoardColumnsService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    async create(
        @Body(new ZodValidationPipe(boardColumnsInsertSchema)) payload: BoardColumnsInsert,
    ): Promise<BoardColumns> {
        return this.boardColumnsService.create(payload);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    findAll(): Promise<BoardColumns[]> {
        return this.boardColumnsService.findAll();
    }

    @Get(":id")
    @HttpCode(HttpStatus.OK)
    findOne(@Param("id", ParseUUIDPipe) id: string): Promise<BoardColumns> {
        return this.boardColumnsService.findOne(id);
    }

    @Get(":id/with-tasks")
    @HttpCode(HttpStatus.OK)
    findOneWithTasks(@Param("id", ParseUUIDPipe) id: string) {
        return this.boardColumnsService.findOneWithTasks(id);
    }

    @Patch(":id")
    @HttpCode(HttpStatus.OK)
    update(
        @Param("id", ParseUUIDPipe) id: string,
        @Body(new ZodValidationPipe(boardColumnsUpdateSchema)) payload: BoardColumnsUpdate,
    ) {
        return this.boardColumnsService.update(id, payload);
    }
}
