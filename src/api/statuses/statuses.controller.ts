import { Body, Controller, Get, HttpCode, HttpStatus, Param, ParseUUIDPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { StatusesService } from "./statuses.service";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { ZodValidationPipe } from "@common/zod-validation.pipe";
import type { Statuses, StatusesInsert, StatusesUpdate } from "@db/statuses.schema";
import { statusesInsertSchema, statusesUpdateSchema } from "@db/statuses.schema";
import { AuthGuard } from "../../auth.guard";
import { AccessToken } from "../../access-token.decorator";

@ApiTags("statuses")
@Controller("statuses")
export class StatusesController {
    constructor(private readonly statusesService: StatusesService) {}

    @Post()
    @HttpCode(HttpStatus.CREATED)
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: "Créer un nouveau statut" })
    @ApiResponse({ status: 201, description: "Statut créé avec succès" })
    create(
        @AccessToken() userId: string,
        @Body(new ZodValidationPipe(statusesInsertSchema)) payload: StatusesInsert,
    ): Promise<Statuses> {
        return this.statusesService.create(payload, userId);
    }

    @Get(":id")
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: "Récupérer un statut par son ID" })
    @ApiResponse({ status: 200, description: "Statut trouvé" })
    findOne(@AccessToken() userId: string, @Param("id", ParseUUIDPipe) id: string): Promise<Statuses> {
        return this.statusesService.findOne(id, userId);
    }

    @Patch(":id")
    @HttpCode(HttpStatus.OK)
    @UseGuards(AuthGuard)
    @ApiOperation({ summary: "Mettre à jour un statut" })
    @ApiResponse({ status: 200, description: "Statut mis à jour avec succès" })
    update(
        @AccessToken() userId: string,
        @Param("id", ParseUUIDPipe) id: string,
        @Body(new ZodValidationPipe(statusesUpdateSchema)) payload: StatusesUpdate,
    ): Promise<Statuses> {
        return this.statusesService.update(id, payload, userId);
    }
}
