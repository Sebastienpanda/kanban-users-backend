import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiProduces, ApiResponse } from "@nestjs/swagger";
import { ApiStandardResponsesDocSwaggerDecorator } from "@common/api-standard-responses-doc-swagger.decorator";

export function ApiFindAllWorkspacesSwaggerDecorator() {
    return applyDecorators(
        ApiOperation({
            summary: "Récupérer tous les workspaces",
            description: "Retourne la liste complète de tous les workspaces",
        }),
        ApiProduces("application/json"),
        ApiResponse({
            status: HttpStatus.OK,
            description: "Liste des workspaces récupérée avec succès",
            schema: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            format: "uuid",
                            example: "550e8400-e29b-41d4-a716-446655440000",
                        },
                        name: {
                            type: "string",
                            example: "Mon Projet",
                            description: "Nom du workspace",
                        },
                        createdAt: {
                            type: "string",
                            format: "date-time",
                            example: "2026-01-08T16:19:12.423Z",
                            description: "Date de création",
                        },
                        updatedAt: {
                            type: "string",
                            format: "date-time",
                            nullable: true,
                            example: "2026-01-08T14:30:00.000Z",
                            description: "Date de dernière modification (null si jamais modifié)",
                        },
                    },
                    example: [
                        {
                            id: "550e8400-e29b-41d4-a716-446655440000",
                            name: "Mon Projet",
                            createdAt: "2026-01-08T10:00:00.000Z",
                            updatedAt: null,
                        },
                        {
                            id: "123e4567-e89b-12d3-a456-426614174000",
                            name: "Équipe Marketing",
                            createdAt: "2026-01-07T14:20:00.000Z",
                            updatedAt: "2026-01-08T09:15:00.000Z",
                        },
                    ],
                },
            },
        }),
        ApiStandardResponsesDocSwaggerDecorator(),
    );
}