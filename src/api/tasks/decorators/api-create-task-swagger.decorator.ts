import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiOperation, ApiProduces, ApiResponse } from "@nestjs/swagger";
import { ApiStandardResponsesDocSwaggerDecorator } from "@common/api-standard-responses-doc-swagger.decorator";

export function ApiCreateTaskSwaggerDecorator() {
    return applyDecorators(
        ApiOperation({
            summary: "Créer une tâche",
            description: "Crée une nouvelle tâche dans le système Kanban. Le statut par défaut est 'todo'.",
        }),
        ApiConsumes("application/json"),
        ApiProduces("application/json"),
        ApiBody({
            description: "Données de la nouvelle tâche",
            schema: {
                type: "object",
                properties: {
                    title: {
                        type: "string",
                        description: "Titre de la tâche (minimum 5 caractères)",
                        example: "Ma première tâche",
                        minLength: 5,
                        maxLength: 255,
                    },
                    description: {
                        type: "string",
                        description: "Description détaillée de la tâche",
                        example: "Description de la tâche",
                    },
                    status: {
                        type: "string",
                        enum: ["todo", "in_progress", "done"],
                        description: "Statut initial de la tâche (optionnel, défaut: todo)",
                        default: "todo",
                    },
                },
                required: ["title", "description"],
                examples: {
                    "Tache simple": {
                        value: {
                            title: "Faire les courses",
                            description: "Acheter du pain et du lait",
                        },
                    },
                    "Tache avec statut": {
                        value: {
                            title: "Implémenter l'API",
                            description: "Créer les endpoints CRUD pour les tâches",
                            status: "in_progress",
                        },
                    },
                },
            },
        }),
        ApiResponse({
            status: HttpStatus.CREATED,
            description: "Tâche créée avec succès",
            schema: {
                example: {
                    id: "f3f2083e-db76-4650-9a3a-90ae9526dbcc",
                    title: "Ma première tâches",
                    description: "Description de la tâche",
                    status: "todo",
                    createdAt: "2026-01-03T16:19:12.423Z",
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
                        "titre-trop-court": {
                            summary: "Titre trop court",
                            value: {
                                statusCode: 400,
                                message: "Le titre doit contenir au moins 5 caractères",
                                error: "Bad Request",
                                timestamp: "2026-01-05T14:31:10.036Z",
                            },
                        },
                        "description-vide": {
                            summary: "Description manquante",
                            value: {
                                statusCode: 400,
                                message: "La description est obligatoire",
                                error: "Bad Request",
                                timestamp: "2026-01-05T14:31:10.036Z",
                            },
                        },
                    },
                },
            },
        }),
        ApiResponse({
            status: HttpStatus.CONFLICT,
            description: "Une tâche avec ce titre existe déjà",
            schema: {
                example: {
                    statusCode: 409,
                    message: "Tâche déjà existante",
                    error: "Conflict",
                    timestamp: "2026-01-05T14:31:10.036Z",
                },
            },
        }),
        ApiStandardResponsesDocSwaggerDecorator(),
    );
}
