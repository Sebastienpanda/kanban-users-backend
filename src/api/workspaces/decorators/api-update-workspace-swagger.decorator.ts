import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiProduces, ApiResponse } from "@nestjs/swagger";
import { ApiStandardResponsesDocSwaggerDecorator } from "@common/api-standard-responses-doc-swagger.decorator";

export function ApiUpdateWorkspaceSwaggerDecorator() {
    return applyDecorators(
        ApiOperation({
            summary: "Mettre à jour un workspace",
            description: "Modifie partiellement un workspace existant. Tous les champs sont optionnels.",
        }),
        ApiConsumes("application/json"),
        ApiProduces("application/json"),
        ApiParam({
            name: "id",
            type: String,
            format: "uuid",
            description: "UUID du workspace à modifier",
            example: "550e8400-e29b-41d4-a716-446655440000",
        }),
        ApiBody({
            description: "Données à mettre à jour (tous les champs sont optionnels)",
            schema: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        description: "Nouveau nom (minimum 3 caractères)",
                        example: "Projet Q2 2026",
                        minLength: 3,
                        maxLength: 100,
                    },
                },
            },
            examples: {
                "Modifier le nom": {
                    summary: "Renommer le workspace",
                    value: {
                        name: "Projet Q2 2026",
                    },
                },
            },
        }),
        ApiResponse({
            status: HttpStatus.OK,
            description: "Workspace mis à jour avec succès",
            schema: {
                example: {
                    id: "550e8400-e29b-41d4-a716-446655440000",
                    name: "Projet Q2 2026",
                    createdAt: "2026-01-08T12:00:00Z",
                    updatedAt: "2026-01-08T15:30:00Z",
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
                                message: "Le nom doit contenir au moins 3 caractères",
                                error: "Bad Request",
                                timestamp: "2026-01-08T14:31:10.036Z",
                            },
                        },
                        "body-vide": {
                            summary: "Aucun champ fourni",
                            value: {
                                statusCode: 400,
                                message: "Le champ ne peux pas être vide",
                                error: "Bad Request",
                                timestamp: "2026-01-08T14:31:10.036Z",
                            },
                        },
                        "uuid-invalide": {
                            summary: "UUID invalide",
                            value: {
                                statusCode: 400,
                                message: "Validation failed (uuid is expected)",
                                error: "Bad Request",
                                timestamp: "2026-01-08T14:20:12.110Z",
                            },
                        },
                    },
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
        ApiResponse({
            status: HttpStatus.CONFLICT,
            description: "Le nom existe déjà pour un autre workspace",
            schema: {
                example: {
                    statusCode: 409,
                    message: "Workspace existant",
                    error: "Conflict",
                    timestamp: "2026-01-08T16:45:00.000Z",
                },
            },
        }),
        ApiStandardResponsesDocSwaggerDecorator(),
    );
}