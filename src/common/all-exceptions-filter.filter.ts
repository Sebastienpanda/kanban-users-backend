import { ArgumentsHost, Catch, ExceptionFilter, HttpException, Logger } from "@nestjs/common";
import { FastifyReply } from "fastify";

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
    private readonly logger = new Logger(AllExceptionsFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<FastifyReply>();

        let status = 500;
        let message: string = "Internal server error";

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();

            if (typeof exceptionResponse === "string") {
                message = exceptionResponse;
            } else if (typeof exceptionResponse === "object" && exceptionResponse !== null) {
                message = (exceptionResponse as any).message || JSON.stringify(exceptionResponse);

                if (Array.isArray(message)) {
                    message = message.join(", ");
                }
            }
        } else if (exception instanceof Error) {
            message = exception.message;
        }

        this.logger.error(`Exception caught: ${message}`, exception instanceof Error ? exception.stack : "");

        response.status(status).send({
            statusCode: status,
            message,
            error: this.getErrorName(status),
            timestamp: new Date().toISOString(),
        });
    }

    private getErrorName(status: number): string {
        switch (status) {
            case 400:
                return "Bad Request";
            case 401:
                return "Unauthorized";
            case 403:
                return "Forbidden";
            case 404:
                return "Not Found";
            case 409:
                return "Conflict";
            case 500:
                return "Internal Server Error";
            default:
                return "Error";
        }
    }
}
