import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiOperation, ApiProduces, ApiResponse } from "@nestjs/swagger";
import { ApiStandardResponsesDocSwaggerDecorator } from "@common/api-standard-responses-doc-swagger.decorator";

export function ApiCreateBoardColumnSwaggerDecorator() {
    return applyDecorators(
        ApiOperation({
            summary: "Créer une colonne",
            description: "Crée une nouvelle colonne dans un workspace. La position est calculée automatiquement.",
        }),
        ApiConsumes("application/json"),
        ApiProduces("application/json"),
        ApiBody({
            description: "Données de la nouvelle colonne",
            schema: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        description: "Nom de la colonne (minimum 5 caractères)",
                        example: "To Do",
                        minLength: 5,
                        maxLength: 50,
                    },
                    workspaceId: {
                        type: "string",
                        format: "uuid",
                        description: "UUID du workspace parent",
                        example: "550e8400-e29b-41d4-a716-446655440000",
                    },
                },
                required: ["name", "workspaceId"],
                examples: {
                    "Colonne simple": {
                        value: {
                            name: "To Do",
                            workspaceId: "550e8400-e29b-41d4-a716-446655440000",
                        },
                    },
                    "Colonne In Progress": {
                        value: {
                            name: "In Progress",
                            workspaceId: "550e8400-e29b-41d4-a716-446655440000",
                        },
                    },
                },
            },
        }),
        ApiResponse({
            status: HttpStatus.CREATED,
            description: "Colonne créée avec succès",
            schema: {
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
            description: "Validation échouée",
            content: {
                "application/json": {
                    examples: {
                        "nom-trop-court": {
                            summary: "Nom trop court",
                            value: {
                                statusCode: 400,
                                message: "Le nom de la colonne doit contenir au moins 5 caractères",
                                error: "Bad Request",
                                timestamp: "2026-01-08T14:31:10.036Z",
                            },
                        },
                        "workspace-id-invalide": {
                            summary: "UUID workspace invalide",
                            value: {
                                statusCode: 400,
                                message: "L'ID du workspace doit être un UUID valide",
                                error: "Bad Request",
                                timestamp: "2026-01-08T14:31:10.036Z",
                            },
                        },
                    },
                },
            },
        }),
        ApiResponse({
            status: HttpStatus.CONFLICT,
            description: "Une colonne avec ce nom existe déjà",
            schema: {
                example: {
                    statusCode: 409,
                    message: "Board columns déja existante",
                    error: "Conflict",
                    timestamp: "2026-01-08T14:31:10.036Z",
                },
            },
        }),
        ApiStandardResponsesDocSwaggerDecorator(),
    );
}
