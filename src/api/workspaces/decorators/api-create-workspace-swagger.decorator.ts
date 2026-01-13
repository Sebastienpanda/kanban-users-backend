import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiOperation, ApiProduces, ApiResponse } from "@nestjs/swagger";
import { ApiStandardResponsesDocSwaggerDecorator } from "@common/api-standard-responses-doc-swagger.decorator";

export function ApiCreateWorkspaceSwaggerDecorator() {
    return applyDecorators(
        ApiOperation({
            summary: "Créer un workspace",
            description: "Crée un nouveau workspace pour organiser vos colonnes et tâches.",
        }),
        ApiConsumes("application/json"),
        ApiProduces("application/json"),
        ApiBody({
            description: "Données du nouveau workspace",
            schema: {
                type: "object",
                properties: {
                    name: {
                        type: "string",
                        description: "Nom du workspace (minimum 3 caractères)",
                        example: "Mon Projet",
                        minLength: 3,
                        maxLength: 100,
                    },
                },
                required: ["name"],
                examples: {
                    "Workspace simple": {
                        value: {
                            name: "Mon Projet",
                        },
                    },
                    "Workspace équipe": {
                        value: {
                            name: "Équipe Marketing Q1 2026",
                        },
                    },
                },
            },
        }),
        ApiResponse({
            status: HttpStatus.CREATED,
            description: "Workspace créé avec succès",
            schema: {
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
            description: "Validation échouée",
            content: {
                "application/json": {
                    examples: {
                        "nom-trop-court": {
                            summary: "Nom trop court",
                            value: {
                                statusCode: 400,
                                message: "Le nom du workspace doit contenir au moins 3 caractères",
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
            description: "Un workspace avec ce nom existe déjà",
            schema: {
                example: {
                    statusCode: 409,
                    message: "Workspace existant",
                    error: "Conflict",
                    timestamp: "2026-01-08T14:31:10.036Z",
                },
            },
        }),
        ApiStandardResponsesDocSwaggerDecorator(),
    );
}
