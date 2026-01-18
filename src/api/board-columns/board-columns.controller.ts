import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, UseGuards } from "@nestjs/common";
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
import { ApiFindOneBoardColumnSwaggerDecorator } from "./decorators/api-find-one-board-column-swagger.decorator";
import { ApiUpdateBoardColumnSwaggerDecorator } from "./decorators/api-update-board-column-swagger.decorator";
import { ApiReorderBoardColumnSwaggerDecorator } from "./decorators/api-reorder-board-column-swagger.decorator";
import { AuthGuard } from "../../auth.guard";
import { AccessToken } from "../../access-token.decorator";

@ApiTags("board-columns")
@Controller("board-columns")
export class BoardColumnsController {
    constructor(private readonly boardColumnsService: BoardColumnsService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard)
    @ApiCreateBoardColumnSwaggerDecorator()
    create(
        @AccessToken() userId: string,
        @Body(new ZodValidationPipe(boardColumnsInsertSchema)) payload: BoardColumnsInsert,
    ): Promise<BoardColumns> {
        return this.boardColumnsService.create(payload, userId);
    }

    @Get(":id")
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiFindOneBoardColumnSwaggerDecorator()
    findOne(@AccessToken() userId: string, @Param("id", ParseUUIDPipe) id: string): Promise<BoardColumns> {
        return this.boardColumnsService.findOne(id, userId);
    }

    @Patch(":id")
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiUpdateBoardColumnSwaggerDecorator()
    update(
        @AccessToken() userId: string,
        @Param("id", ParseUUIDPipe) id: string,
        @Body(new ZodValidationPipe(boardColumnsUpdateSchema)) payload: BoardColumnsUpdate,
    ): Promise<BoardColumns> {
        return this.boardColumnsService.update(id, payload, userId);
    }

    @Patch(":id/reorder")
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiReorderBoardColumnSwaggerDecorator()
    reorder(
        @AccessToken() userId: string,
        @Param("id", ParseUUIDPipe) id: string,
        @Body(new ZodValidationPipe(boardColumnsReorderSchema)) payload: BoardColumnsReorder,
    ): Promise<BoardColumns> {
        return this.boardColumnsService.reorder(id, payload.newPosition, userId);
    }
}
