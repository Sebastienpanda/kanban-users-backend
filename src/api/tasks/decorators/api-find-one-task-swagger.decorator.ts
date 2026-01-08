import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiParam, ApiProduces, ApiResponse } from "@nestjs/swagger";
import { ApiStandardResponsesDocSwaggerDecorator } from "@common/api-standard-responses-doc-swagger.decorator";

export function ApiGetOneTaskSwaggerDecorator() {
    return applyDecorators(
        ApiOperation({
            summary: "Récupérer une tâche par ID",
            description: "Retourne les détails d'une tâche spécifique à partir de son UUID",
        }),
        ApiProduces("application/json"),
        ApiParam({
            name: "id",
            type: String,
            format: "uuid",
            description: "UUID de la tâche à récupérer",
            example: "f3f2083e-db76-4650-9a3a-90ae9526dbcc",
        }),
        ApiResponse({
            status: HttpStatus.OK,
            description: "Tâche récupérée avec succès",
            schema: {
                type: "object",
                properties: {
                    id: {
                        type: "string",
                        format: "uuid",
                        example: "f3f2083e-db76-4650-9a3a-90ae9526dbcc",
                        description: "Identifiant unique de la tâche",
                    },
                    title: {
                        type: "string",
                        example: "Implémenter l'authentification",
                        description: "Titre de la tâche",
                    },
                    description: {
                        type: "string",
                        example: "Ajouter JWT avec NeonDB Auth",
                        description: "Description détaillée",
                    },
                    status: {
                        type: "string",
                        enum: ["todo", "in_progress", "done"],
                        example: "in_progress",
                        description: "Statut actuel de la tâche",
                    },
                    createdAt: {
                        type: "string",
                        format: "date-time",
                        example: "2026-01-03T16:19:12.423Z",
                        description: "Date de création",
                    },
                    updatedAt: {
                        type: "string",
                        format: "date-time",
                        nullable: true,
                        example: "2026-01-05T14:30:00.000Z",
                        description: "Date de dernière modification (null si jamais modifiée)",
                    },
                },
                example: {
                    id: "f3f2083e-db76-4650-9a3a-90ae9526dbcc",
                    title: "Implémenter l'authentification",
                    description: "Ajouter JWT avec NeonDB Auth",
                    status: "in_progress",
                    createdAt: "2026-01-03T16:19:12.423Z",
                    updatedAt: "2026-01-05T14:30:00.000Z",
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
                    timestamp: "2026-01-05T14:31:10.036Z",
                },
            },
        }),
        ApiResponse({
            status: HttpStatus.NOT_FOUND,
            description: "Tâche non trouvée avec cet ID",
            schema: {
                example: {
                    statusCode: 404,
                    message: "La tâche n'existe pas",
                    error: "Not Found",
                    timestamp: "2026-01-04T14:54:40.936Z",
                },
            },
        }),
        ApiStandardResponsesDocSwaggerDecorator(),
    );
}
