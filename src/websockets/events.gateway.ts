import { OnGatewayConnection, OnGatewayDisconnect, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Task } from "@db/task.schema";
import { BoardColumns } from "@db/bord-columns.schema";
import { Workspace } from "@db/workspace.schema";

@WebSocketGateway({
    cors: {
        origin: ["http://localhost:4200", "https://kanban.kanbano.fr"],
    },
})
export class EventsGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server!: Server;

    handleConnection(client: Socket): void {
        console.log(`[WS] Client connecté: ${client.id}`);
        console.log(`[WS] Nombre de clients connectés: ${this.server.sockets.sockets.size}`);
    }

    handleDisconnect(client: Socket): void {
        console.log(`[WS] Client déconnecté: ${client.id}`);
    }

    emitTaskCreated(task: Task): void {
        console.log(`[WS] Émission task:created`, task);
        console.log(`[WS] Server existe: ${!!this.server}`);
        console.log(`[WS] Nombre de clients: ${this.server?.sockets?.sockets?.size ?? 0}`);
        this.server.emit("task:created", task);
        console.log(`[WS] Événement émis`);
    }

    emitTaskUpdated(task: Task): void {
        console.log(`[WS] Émission task:updated`, task);
        this.server.emit("task:updated", task);
    }

    emitTaskReordered(task: Task): void {
        console.log(`[WS] Émission task:reordered`, task);
        this.server.emit("task:reordered", task);
    }

    emitTaskStatusChanged(task: Task, oldStatus: string): void {
        console.log(`[WS] Émission task:status-changed`, { task, oldStatus });
        this.server.emit("task:status-changed", { task, oldStatus, newStatus: task.status });
    }

    emitColumnReordered(column: BoardColumns): void {
        console.log(`[WS] Émission column:reordered`, column);
        this.server.emit("column:reordered", column);
    }

    emitColumnCreated(column: BoardColumns): void {
        console.log(`[WS] Émission column:created`, column);
        this.server.emit("column:created", column);
    }

    emitWorkspaceCreated(workspace: Workspace): void {
        console.log(`[WS] Émission workspace:created`, workspace);
        this.server.emit("workspace:created", workspace);
    }
}
