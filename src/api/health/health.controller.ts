import { Controller, Get, HttpCode, HttpStatus } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiResponse } from "@nestjs/swagger";
import { SkipThrottle } from "@nestjs/throttler";
import { DrizzleService } from "@drizzle/drizzle.service";

interface HealthResponse {
    status: "ok" | "error";
    timestamp: string;
    uptime: number;
    database: "connected" | "error";
}

@ApiTags("health")
@Controller("health")
@SkipThrottle() // Pas de rate limiting sur le health check
export class HealthController {
    constructor(private readonly drizzleService: DrizzleService) {}

    @Get()
    @HttpCode(HttpStatus.OK)
    @ApiOperation({ summary: "Vérifier l'état de santé de l'API" })
    @ApiResponse({
        status: 200,
        description: "API opérationnelle",
        schema: {
            example: {
                status: "ok",
                timestamp: "2026-01-18T22:30:00.000Z",
                uptime: 12345,
                database: "connected",
            },
        },
    })
    async checkHealth(): Promise<HealthResponse> {
        let dbStatus: "connected" | "error" = "connected";

        try {
            // Test simple de connexion DB
            await this.drizzleService.db.execute("SELECT 1" as any);
        } catch (error) {
            dbStatus = "error";
        }

        return {
            status: dbStatus === "connected" ? "ok" : "error",
            timestamp: new Date().toISOString(),
            uptime: process.uptime(),
            database: dbStatus,
        };
    }
}
