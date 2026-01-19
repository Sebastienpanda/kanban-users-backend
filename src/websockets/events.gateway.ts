import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Task } from "@db/task.schema";
import { BoardColumns } from "@db/bord-columns.schema";
import { Workspace } from "@db/workspace.schema";
import { Statuses } from "@db/statuses.schema";
import { ConfigService } from "@nestjs/config";
import { createRemoteJWKSet, jwtVerify, JWTPayload } from "jose";

interface CustomJwtPayload extends JWTPayload {
    sub?: string;
    id?: string;
}

interface AuthenticatedSocket extends Socket {
    userId?: string;
}

@WebSocketGateway({
    cors: {
        origin: ["http://localhost:4200", "https://kanban.kanbano.fr"],
    },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    private readonly jwks: ReturnType<typeof createRemoteJWKSet>;

    constructor(private readonly configService: ConfigService) {
        const jwksUrl = this.configService.getOrThrow<string>("JWKS_URL");
        this.jwks = createRemoteJWKSet(new URL(jwksUrl));
    }

    async handleConnection(client: AuthenticatedSocket): Promise<void> {
        try {
            const token = client.handshake.auth.token || client.handshake.headers.authorization?.split(" ")[1];

            if (!token) {
                console.log(`[WS] Client rejeté: ${client.id} - Token manquant`);
                client.disconnect();
                return;
            }

            const { payload } = await jwtVerify(token, this.jwks, {
                algorithms: ["EdDSA"],
            });

            const typedPayload = payload as CustomJwtPayload;
            const userId = typedPayload.sub || typedPayload.id;

            if (!userId) {
                console.log(`[WS] Client rejeté: ${client.id} - User ID introuvable`);
                client.disconnect();
                return;
            }

            client.userId = userId;
            console.log(`[WS] Client connecté: ${client.id} (userId: ${userId})`);
            console.log(`[WS] Nombre de clients connectés: ${this.server.sockets.sockets.size}`);
        } catch (error) {
            console.error(`[WS] Erreur d'authentification:`, error);
            client.disconnect();
        }
    }

    handleDisconnect(client: AuthenticatedSocket): void {
        console.log(`[WS] Client déconnecté: ${client.id} (userId: ${client.userId})`);
    }

    private emitToUser(userId: string, event: string, data: any): void {
        this.server.sockets.sockets.forEach((socket: AuthenticatedSocket) => {
            if (socket.userId === userId) {
                socket.emit(event, data);
            }
        });
    }

    emitTaskCreated(task: Task): void {
        console.log(`[WS] Émission task:created`, task);
        this.emitToUser(task.userId, "task:created", task);
    }

    emitTaskUpdated(task: Task): void {
        console.log(`[WS] Émission task:updated`, task);
        this.emitToUser(task.userId, "task:updated", task);
    }

    emitTaskReordered(task: Task): void {
        console.log(`[WS] Émission task:reordered`, task);
        this.emitToUser(task.userId, "task:reordered", task);
    }

    emitTaskStatusChanged(task: Task, oldStatus: string | null): void {
        console.log(`[WS] Émission task:status-changed`, { task, oldStatus });
        this.emitToUser(task.userId, "task:status-changed", { task, oldStatus, newStatus: task.statusId });
    }

    emitColumnReordered(column: BoardColumns): void {
        console.log(`[WS] Émission column:reordered`, column);
        this.emitToUser(column.userId, "column:reordered", column);
    }

    emitColumnCreated(column: BoardColumns): void {
        console.log(`[WS] Émission column:created`, column);
        this.emitToUser(column.userId, "column:created", column);
    }

    emitColumnUpdated(column: BoardColumns): void {
        console.log(`[WS] Émission column:updated`, column);
        this.emitToUser(column.userId, "column:updated", column);
    }

    emitWorkspaceCreated(workspace: Workspace): void {
        console.log(`[WS] Émission workspace:created`, workspace);
        this.emitToUser(workspace.userId, "workspace:created", workspace);
    }

    emitWorkspaceUpdated(workspace: Workspace): void {
        console.log(`[WS] Émission workspace:updated`, workspace);
        this.emitToUser(workspace.userId, "workspace:updated", workspace);
    }

    emitStatusCreated(status: Statuses): void {
        console.log(`[WS] Émission status:created`, status);
        this.emitToUser(status.userId, "status:created", status);
    }

    emitStatusUpdated(status: Statuses): void {
        console.log(`[WS] Émission status:updated`, status);
        this.emitToUser(status.userId, "status:updated", status);
    }
}
