import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post } from "@nestjs/common";
import { BoardColumnsService } from "./board-columns.service";
import { ApiTags } from "@nestjs/swagger";
import { ZodValidationPipe } from "@common/zod-validation.pipe";
import type {
    BoardColumns,
    BoardColumnsInsert,
    BoardColumnsReorder,
    BoardColumnsUpdate,
} from "@db/bord-columns.schema";
import { boardColumnsInsertSchema, boardColumnsReorderSchema, boardColumnsUpdateSchema } from "@db/bord-columns.schema";
import { ApiCreateBoardColumnSwaggerDecorator } from "./decorators/api-create-board-column-swagger.decorator";
import { ApiFindAllBoardColumnsSwaggerDecorator } from "./decorators/api-find-all-board-columns-swagger.decorator";
import { ApiFindOneBoardColumnSwaggerDecorator } from "./decorators/api-find-one-board-column-swagger.decorator";
import { ApiUpdateBoardColumnSwaggerDecorator } from "./decorators/api-update-board-column-swagger.decorator";
import { ApiReorderBoardColumnSwaggerDecorator } from "./decorators/api-reorder-board-column-swagger.decorator";

@ApiTags("board-columns")
@Controller("board-columns")
export class BoardColumnsController {
    constructor(private readonly boardColumnsService: BoardColumnsService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @ApiCreateBoardColumnSwaggerDecorator()
    create(
        @Body(new ZodValidationPipe(boardColumnsInsertSchema)) payload: BoardColumnsInsert,
    ): Promise<BoardColumns> {
        return this.boardColumnsService.create(payload);
    }

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiFindAllBoardColumnsSwaggerDecorator()
    findAll(): Promise<BoardColumns[]> {
        return this.boardColumnsService.findAll();
    }

    @Get(":id")
    @HttpCode(HttpStatus.OK)
    @ApiFindOneBoardColumnSwaggerDecorator()
    findOne(@Param("id", ParseUUIDPipe) id: string): Promise<BoardColumns> {
        return this.boardColumnsService.findOne(id);
    }

    @Get(":id/with-tasks")
    @HttpCode(HttpStatus.OK)
    @ApiFindOneBoardColumnSwaggerDecorator()
    findOneWithTasks(@Param("id", ParseUUIDPipe) id: string): Promise<BoardColumns> {
        return this.boardColumnsService.findOneWithTasks(id);
    }

    @Patch(":id")
    @HttpCode(HttpStatus.OK)
    @ApiUpdateBoardColumnSwaggerDecorator()
    update(
        @Param("id", ParseUUIDPipe) id: string,
        @Body(new ZodValidationPipe(boardColumnsUpdateSchema)) payload: BoardColumnsUpdate,
    ): Promise<BoardColumns> {
        return this.boardColumnsService.update(id, payload);
    }

    @Patch(":id/reorder")
    @HttpCode(HttpStatus.OK)
    @ApiReorderBoardColumnSwaggerDecorator()
    reorder(
        @Param("id", ParseUUIDPipe) id: string,
        @Body(new ZodValidationPipe(boardColumnsReorderSchema)) payload: BoardColumnsReorder,
    ): Promise<BoardColumns> {
        return this.boardColumnsService.reorder(id, payload.newPosition);
    }
}
