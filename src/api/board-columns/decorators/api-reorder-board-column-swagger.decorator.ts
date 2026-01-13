import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiProduces, ApiResponse } from "@nestjs/swagger";
import { ApiStandardResponsesDocSwaggerDecorator } from "@common/api-standard-responses-doc-swagger.decorator";

export function ApiReorderBoardColumnSwaggerDecorator() {
    return applyDecorators(
        ApiOperation({
            summary: "Réordonner une colonne",
            description:
                "Change la position d'une colonne dans le workspace. Les autres colonnes sont automatiquement réordonnées.",
        }),
        ApiConsumes("application/json"),
        ApiProduces("application/json"),
        ApiParam({
            name: "id",
            type: String,
            format: "uuid",
            description: "UUID de la colonne à réordonner",
            example: "550e8400-e29b-41d4-a716-446655440000",
        }),
        ApiBody({
            description: "Nouvelle position de la colonne",
            schema: {
                type: "object",
                properties: {
                    newPosition: {
                        type: "number",
                        description: "Nouvelle position (index, commence à 0)",
                        example: 1,
                        minimum: 0,
                    },
                },
                required: ["newPosition"],
            },
            examples: {
                "Déplacer en première position": {
                    summary: "Mettre la colonne en premier",
                    value: {
                        newPosition: 0,
                    },
                },
                "Déplacer en troisième position": {
                    summary: "Déplacer vers l'index 2",
                    value: {
                        newPosition: 2,
                    },
                },
            },
        }),
        ApiResponse({
            status: HttpStatus.OK,
            description: "Colonne réordonnée avec succès",
            schema: {
                example: {
                    id: "550e8400-e29b-41d4-a716-446655440000",
                    name: "In Progress",
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
                        "position-invalide": {
                            summary: "Position négative",
                            value: {
                                statusCode: 400,
                                message: "La position doit être un nombre positif",
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
                    message: "La colonne n'existe pas",
                    error: "Not Found",
                    timestamp: "2026-01-08T14:54:40.936Z",
                },
            },
        }),
        ApiStandardResponsesDocSwaggerDecorator(),
    );
}
