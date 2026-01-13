import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiProduces, ApiResponse } from "@nestjs/swagger";
import { ApiStandardResponsesDocSwaggerDecorator } from "@common/api-standard-responses-doc-swagger.decorator";

export function ApiFindOneBoardColumnSwaggerDecorator() {
    return applyDecorators(
        ApiOperation({
            summary: "Récupérer une colonne par ID",
            description: "Retourne les détails d'une colonne spécifique à partir de son UUID",
        }),
        ApiProduces("application/json"),
        ApiParam({
            name: "id",
            type: String,
            format: "uuid",
            description: "UUID de la colonne à récupérer",
            example: "f3f2083e-db76-4650-9a3a-90ae9526dbcc",
        }),
        ApiResponse({
            status: HttpStatus.OK,
            description: "Colonne récupérée avec succès",
            schema: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        format: "uuid",
                        example: "f3f2083e-db76-4650-9a3a-90ae9526dbcc",
                        description: "Identifiant unique de la colonne",
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
                        description: "Position de la colonne",
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
                example: {
                    id: "f3f2083e-db76-4650-9a3a-90ae9526dbcc",
                    name: "To Do",
                    workspaceId: "550e8400-e29b-41d4-a716-446655440000",
                    position: 0,
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
            description: "Colonne non trouvée avec cet ID",
            schema: {
                example: {
                    statusCode: 404,
                    message: "Le boardColumns, n'existe pas",
                    error: "Not Found",
                    timestamp: "2026-01-08T14:54:40.936Z",
                },
            },
        }),
        ApiStandardResponsesDocSwaggerDecorator(),
    );
}
