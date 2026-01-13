import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiProduces, ApiResponse } from "@nestjs/swagger";
import { ApiStandardResponsesDocSwaggerDecorator } from "@common/api-standard-responses-doc-swagger.decorator";

export function ApiFindOneWorkspaceWithColumnsSwaggerDecorator() {
    return applyDecorators(
        ApiOperation({
            summary: "Récupérer un workspace avec ses colonnes et tâches",
            description:
                "Retourne un workspace avec toutes ses colonnes (triées par position) et leurs tâches (triées par order)",
        }),
        ApiProduces("application/json"),
        ApiParam({
            name: "id",
            type: String,
            format: "uuid",
            description: "UUID du workspace à récupérer",
            example: "550e8400-e29b-41d4-a716-446655440000",
        }),
        ApiResponse({
            status: HttpStatus.OK,
            description: "Workspace avec colonnes et tâches récupéré avec succès",
            schema: {
                type: "object",
                properties: {
                    id: { type: "string", format: "uuid" },
                    name: { type: "string" },
                    columns: {
                        type: "array",
                        items: {
                            type: "object",
                            properties: {
                                id: { type: "string", format: "uuid" },
                                name: { type: "string" },
                                workspaceId: { type: "string", format: "uuid" },
                                position: { type: "number" },
                                tasks: {
                                    type: "array",
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
                                createdAt: { type: "string", format: "date-time" },
                                updatedAt: { type: "string", format: "date-time", nullable: true },
                            },
                        },
                    },
                    createdAt: { type: "string", format: "date-time" },
                    updatedAt: { type: "string", format: "date-time", nullable: true },
                },
                example: {
                    id: "550e8400-e29b-41d4-a716-446655440000",
                    name: "Mon Projet",
                    columns: [
                        {
                            id: "f3f2083e-db76-4650-9a3a-90ae9526dbcc",
                            name: "To Do",
                            workspaceId: "550e8400-e29b-41d4-a716-446655440000",
                            position: 0,
                            tasks: [
                                {
                                    id: "a1b2c3d4-e5f6-4789-0abc-def123456789",
                                    title: "Créer la base de données",
                                    description: "Configurer Neon PostgreSQL",
                                    status: "todo",
                                    columnId: "f3f2083e-db76-4650-9a3a-90ae9526dbcc",
                                    order: 0,
                                    createdAt: "2026-01-08T10:00:00.000Z",
                                    updatedAt: null,
                                },
                            ],
                            createdAt: "2026-01-08T09:00:00.000Z",
                            updatedAt: null,
                        },
                        {
                            id: "12345678-90ab-cdef-1234-567890abcdef",
                            name: "In Progress",
                            workspaceId: "550e8400-e29b-41d4-a716-446655440000",
                            position: 1,
                            tasks: [],
                            createdAt: "2026-01-08T09:05:00.000Z",
                            updatedAt: null,
                        },
                    ],
                    createdAt: "2026-01-08T08:00:00.000Z",
                    updatedAt: null,
                },
            },
        }),
        ApiResponse({
            status: HttpStatus.BAD_REQUEST,
            description: "UUID invalide ou mal formaté",
            schema: {
                example: {
                    statusCode: 400,
                    message: "Validation failed (uuid is expected)",
                    error: "Bad Request",
                    timestamp: "2026-01-08T14:31:10.036Z",
                },
            },
        }),
        ApiResponse({
            status: HttpStatus.NOT_FOUND,
            description: "Workspace non trouvé avec cet ID",
            schema: {
                example: {
                    statusCode: 404,
                    message: "Le workspace n'existe pas",
                    error: "Not Found",
                    timestamp: "2026-01-08T14:54:40.936Z",
                },
            },
        }),
        ApiStandardResponsesDocSwaggerDecorator(),
    );
}