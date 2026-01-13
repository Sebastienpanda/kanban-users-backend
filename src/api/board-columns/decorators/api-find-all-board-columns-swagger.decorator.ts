import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiProduces, ApiResponse } from "@nestjs/swagger";
import { ApiStandardResponsesDocSwaggerDecorator } from "@common/api-standard-responses-doc-swagger.decorator";

export function ApiFindAllBoardColumnsSwaggerDecorator() {
    return applyDecorators(
        ApiOperation({
            summary: "Récupérer toutes les colonnes",
            description: "Retourne la liste complète de toutes les colonnes avec leurs tâches, triées par position",
        }),
        ApiProduces("application/json"),
        ApiResponse({
            status: HttpStatus.OK,
            description: "Liste des colonnes récupérée avec succès",
            schema: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            format: "uuid",
                            example: "f3f2083e-db76-4650-9a3a-90ae9526dbcc",
                        },
                        name: {
                            type: "string",
                            example: "To Do",
                            description: "Nom de la colonne",
                        },
                        workspaceId: {
                            type: "string",
                            format: "uuid",
                            example: "550e8400-e29b-41d4-a716-446655440000",
                            description: "ID du workspace parent",
                        },
                        position: {
                            type: "number",
                            example: 0,
                            description: "Position de la colonne dans le workspace",
                        },
                        tasks: {
                            type: "array",
                            description: "Liste des tâches de la colonne",
                            items: {
                                type: "object",
                                properties: {
                                    id: { type: "string", format: "uuid" },
                                    title: { type: "string" },
                                    description: { type: "string" },
                                    status: { type: "string", enum: ["todo", "in_progress", "done"] },
                                    columnId: { type: "string", format: "uuid" },
                                    order: { type: "number" },
                                    createdAt: { type: "string", format: "date-time" },
                                    updatedAt: { type: "string", format: "date-time", nullable: true },
                                },
                            },
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
                            description: "Date de dernière modification (null si jamais modifiée)",
                        },
                    },
                    example: [
                        {
                            id: "f3f2083e-db76-4650-9a3a-90ae9526dbcc",
                            name: "To Do",
                            workspaceId: "550e8400-e29b-41d4-a716-446655440000",
                            position: 0,
                            tasks: [
                                {
                                    id: "a1b2c3d4-e5f6-4789-0abc-def123456789",
                                    title: "Implémenter l'API",
                                    description: "Créer les endpoints CRUD",
                                    status: "todo",
                                    columnId: "f3f2083e-db76-4650-9a3a-90ae9526dbcc",
                                    order: 0,
                                    createdAt: "2026-01-08T10:00:00.000Z",
                                    updatedAt: null,
                                },
                            ],
                            createdAt: "2026-01-08T10:00:00.000Z",
                            updatedAt: null,
                        },
                        {
                            id: "12345678-90ab-cdef-1234-567890abcdef",
                            name: "In Progress",
                            workspaceId: "550e8400-e29b-41d4-a716-446655440000",
                            position: 1,
                            tasks: [],
                            createdAt: "2026-01-08T14:20:00.000Z",
                            updatedAt: null,
                        },
                    ],
                },
            },
        }),
        ApiStandardResponsesDocSwaggerDecorator(),
    );
}
