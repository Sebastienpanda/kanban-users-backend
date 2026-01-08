import { applyDecorators, HttpStatus } from "@nestjs/common";
import { ApiResponse } from "@nestjs/swagger";

export function ApiStandardResponsesDocSwaggerDecorator() {
    return applyDecorators(
        ApiResponse({
            status: HttpStatus.INTERNAL_SERVER_ERROR,
            description: "Erreur serveur",
        }),
    );
}
