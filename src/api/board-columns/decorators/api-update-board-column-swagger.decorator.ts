import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiProduces, ApiResponse } from "@nestjs/swagger";
import { ApiStandardResponsesDocSwaggerDecorator } from "@common/api-standard-responses-doc-swagger.decorator";

export function ApiUpdateBoardColumnSwaggerDecorator() {
    return applyDecorators(
        ApiOperation({
            summary: "Mettre à jour une colonne",
            description: "Modifie partiellement une colonne existante. Tous les champs sont optionnels.",
        }),
        ApiConsumes("application/json"),
        ApiProduces("application/json"),
        ApiParam({
            name: "id",
            type: String,
            format: "uuid",
            description: "UUID de la colonne à modifier",
            example: "550e8400-e29b-41d4-a716-446655440000",
        }),
        ApiBody({
            description: "Données à mettre à jour (tous les champs sont optionnels)",
            schema: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        description: "Nouveau nom (minimum 5 caractères)",
                        example: "Doing",
                        minLength: 5,
                        maxLength: 50,
                    },
                    workspaceId: {
                        type: "string",
                        format: "uuid",
                        description: "Nouveau workspace parent",
                        example: "123e4567-e89b-12d3-a456-426614174000",
                    },
                },
            },
            examples: {
                "Modifier le nom": {
                    summary: "Modification du nom uniquement",
                    value: {
                        name: "Doing",
                    },
                },
                "Changer de workspace": {
                    summary: "Déplacer vers un autre workspace",
                    value: {
                        workspaceId: "123e4567-e89b-12d3-a456-426614174000",
                    },
                },
                "Modification complète": {
                    summary: "Modifier plusieurs champs",
                    value: {
                        name: "In Review",
                        workspaceId: "123e4567-e89b-12d3-a456-426614174000",
                    },
                },
            },
        }),
        ApiResponse({
            status: HttpStatus.OK,
            description: "Colonne mise à jour avec succès",
            schema: {
                example: {
                    id: "550e8400-e29b-41d4-a716-446655440000",
                    name: "Doing",
                    workspaceId: "123e4567-e89b-12d3-a456-426614174000",
                    position: 1,
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
                                message: "Le nom de la colonne doit contenir au moins 5 caractères",
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
        ApiResponse({
            status: HttpStatus.CONFLICT,
            description: "Le nom existe déjà pour une autre colonne",
            schema: {
                example: {
                    statusCode: 409,
                    message: "Board columns déja existante",
                    error: "Conflict",
                    timestamp: "2026-01-08T16:45:00.000Z",
                },
            },
        }),
        ApiStandardResponsesDocSwaggerDecorator(),
    );
}
