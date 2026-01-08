import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiProduces, ApiResponse } from "@nestjs/swagger";
import { ApiStandardResponsesDocSwaggerDecorator } from "@common/api-standard-responses-doc-swagger.decorator";

export function ApiUpdateTaskSwaggerDecorator() {
    return applyDecorators(
        ApiOperation({
            summary: "Mettre à jour une tâche",
            description: "Modifie partiellement une tâche existante. Tous les champs sont optionnels.",
        }),
        ApiConsumes("application/json"),
        ApiProduces("application/json"),
        ApiParam({
            name: "id",
            type: String,
            format: "uuid",
            description: "UUID de la tâche à modifier",
            example: "550e8400-e29b-41d4-a716-446655440000",
        }),
        ApiBody({
            description: "Données à mettre à jour (tous les champs sont optionnels)",
            schema: {
                type: "object",
                properties: {
                    title: {
                        type: "string",
                        description: "Nouveau titre (minimum 5 caractères)",
                        example: "Titre modifié",
                        minLength: 5,
                        maxLength: 255,
                    },
                    description: {
                        type: "string",
                        description: "Nouvelle description",
                        example: "Description mise à jour",
                    },
                    status: {
                        type: "string",
                        enum: ["todo", "in_progress", "done"],
                        description: "Nouveau statut",
                        example: "in_progress",
                    },
                },
            },
            examples: {
                "Modifier le titre": {
                    summary: "Modification du titre uniquement",
                    value: {
                        title: "Nouveau titre de tâche",
                    },
                },
                "Modifier le statut": {
                    summary: "Changer le statut en terminé",
                    value: {
                        status: "done",
                    },
                },
                "Modification complete": {
                    summary: "Modifier plusieurs champs",
                    value: {
                        title: "Tâche mise à jour",
                        description: "Description complète",
                        status: "in_progress",
                    },
                },
            },
        }),
        ApiResponse({
            status: HttpStatus.OK,
            description: "Tâche mise à jour avec succès",
            schema: {
                example: {
                    id: "550e8400-e29b-41d4-a716-446655440000",
                    title: "Titre modifié",
                    description: "Description",
                    status: "in_progress",
                    createdAt: "2026-01-04T12:00:00Z",
                    updatedAt: "2026-01-04T15:30:00Z",
                },
            },
        }),
        ApiResponse({
            status: HttpStatus.BAD_REQUEST,
            description: "Erreur de validation",
            content: {
                "application/json": {
                    examples: {
                        "validation-zod": {
                            summary: "Validation Zod échouée",
                            value: {
                                statusCode: 400,
                                message: "Le titre doit contenir au moins 5 caractères",
                                error: "Bad Request",
                                timestamp: "2026-01-05T14:31:10.036Z",
                            },
                        },
                        "body-vide": {
                            summary: "Aucun champ fourni",
                            value: {
                                statusCode: 400,
                                message: "Au moins un champ doit être fourni pour la mise à jour",
                                error: "Bad Request",
                                timestamp: "2026-01-05T14:31:10.036Z",
                            },
                        },
                        "uuid-invalide": {
                            summary: "UUID invalide",
                            value: {
                                statusCode: 400,
                                message: {
                                    message: "Validation failed (uuid is expected)",
                                    error: "Bad Request",
                                    statusCode: 400,
                                },
                                timestamp: "2026-01-05T14:20:12.110Z",
                            },
                        },
                    },
                },
            },
        }),
        ApiResponse({
            status: HttpStatus.NOT_FOUND,
            description: "Tâche non trouvée avec cet ID",
            schema: {
                example: {
                    statusCode: 404,
                    message: {
                        message: "La tâche n'existe pas",
                        error: "Not Found",
                        statusCode: 404,
                    },
                    timestamp: "2026-01-04T14:54:40.936Z",
                },
            },
        }),
        ApiResponse({
            status: HttpStatus.CONFLICT,
            description: "Le titre existe déjà pour une autre tâche",
            schema: {
                example: {
                    statusCode: 409,
                    message: "Ce titre existe déjà",
                    error: "Conflict",
                    timestamp: "2026-01-05T16:45:00.000Z",
                },
            },
        }),
        ApiStandardResponsesDocSwaggerDecorator(),
    );
}
