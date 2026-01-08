import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiOperation, ApiProduces, ApiResponse } from "@nestjs/swagger";
import { ApiStandardResponsesDocSwaggerDecorator } from "@common/api-standard-responses-doc-swagger.decorator";

export function ApiGetAllTasksDocSwaggerDecorator() {
    return applyDecorators(
        ApiOperation({
            summary: "Récupérer toutes les tâches",
            description: "Retourne la liste complète de toutes les tâches du système",
        }),
        ApiProduces("application/json"),
        ApiResponse({
            status: HttpStatus.OK,
            description: "Liste des tâches récupérée avec succès",
            schema: {
                type: "array",
                items: {
                    type: "object",
                    properties: {
                        id: {
                            type: "string",
                            format: "uuid",
                            example: "f3f2083e-db76-4650-9a3a-90ae9526dbcc",
                        },
                        title: {
                            type: "string",
                            example: "Ma première tâche",
                            description: "Titre de la tâche",
                        },
                        description: {
                            type: "string",
                            example: "Description détaillée de la tâche",
                            description: "Description complète",
                        },
                        status: {
                            type: "string",
                            enum: ["todo", "in_progress", "done"],
                            example: "todo",
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
                    example: [
                        {
                            id: "f3f2083e-db76-4650-9a3a-90ae9526dbcc",
                            title: "Implémenter l'authentification",
                            description: "Ajouter JWT avec NeonDB Auth",
                            status: "in_progress",
                            createdAt: "2026-01-03T10:00:00.000Z",
                            updatedAt: "2026-01-05T14:30:00.000Z",
                        },
                        {
                            id: "a1b2c3d4-e5f6-4789-0abc-def123456789",
                            title: "Corriger les tests",
                            description: "Mettre à jour les tests unitaires",
                            status: "todo",
                            createdAt: "2026-01-04T08:15:00.000Z",
                            updatedAt: null,
                        },
                        {
                            id: "12345678-90ab-cdef-1234-567890abcdef",
                            title: "Déployer en production",
                            description: "Configurer Dokploy et déployer",
                            status: "done",
                            createdAt: "2026-01-02T14:20:00.000Z",
                            updatedAt: "2026-01-03T09:45:00.000Z",
                        },
                    ],
                },
            },
        }),
        ApiStandardResponsesDocSwaggerDecorator(),
    );
}
