import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiProduces, ApiResponse } from "@nestjs/swagger";
import { ApiStandardResponsesDocSwaggerDecorator } from "@common/api-standard-responses-doc-swagger.decorator";

export function ApiFindOneWorkspaceSwaggerDecorator() {
    return applyDecorators(
        ApiOperation({
            summary: "Récupérer un workspace par ID",
            description: "Retourne les détails d'un workspace spécifique à partir de son UUID",
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
            description: "Workspace récupéré avec succès",
            schema: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        format: "uuid",
                        example: "550e8400-e29b-41d4-a716-446655440000",
                        description: "Identifiant unique du workspace",
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
                example: {
                    id: "550e8400-e29b-41d4-a716-446655440000",
                    name: "Mon Projet",
                    createdAt: "2026-01-08T16:19:12.423Z",
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