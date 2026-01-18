import { Injectable } from "@nestjs/common";
import { DrizzleService } from "@drizzle/drizzle.service";
import { workspaces } from "@db/workspace.schema";
import { boardColumns } from "@db/bord-columns.schema";
import { tasks } from "@db/task.schema";
import { statuses } from "@db/statuses.schema";
import { byUserId } from "@common/query-helpers";
import { asc } from "drizzle-orm";

export interface UserData {
    workspaces: Array<{
        id: string;
        name: string;
        userId: string;
        createdAt: string;
        updatedAt: string | null;
        statuses: Array<{
            id: string;
            name: string;
            color: "blue" | "orange" | "green" | "red" | "purple" | "pink" | "yellow" | "gray" | null;
            workspaceId: string;
            userId: string;
            createdAt: string;
            updatedAt: string | null;
        }>;
        columns: Array<{
            id: string;
            name: string;
            workspaceId: string;
            userId: string;
            position: number;
            createdAt: string;
            updatedAt: string | null;
            tasks: Array<{
                id: string;
                title: string;
                description: string;
                statusId: string | null;
                columnId: string;
                order: number;
                userId: string;
                createdAt: string;
                updatedAt: string | null;
            }>;
        }>;
    }>;
}

@Injectable()
export class UserService {
    constructor(private readonly drizzleService: DrizzleService) {}

    async getAllData(userId: string): Promise<UserData> {
        const userWorkspaces = await this.drizzleService.db.query.workspaces.findMany({
            where: byUserId(workspaces, userId),
            with: {
                statuses: {
                    orderBy: asc(statuses.createdAt),
                },
                columns: {
                    orderBy: asc(boardColumns.position),
                    with: {
                        tasks: {
                            orderBy: asc(tasks.order),
                        },
                    },
                },
            },
        });

        return {
            workspaces: userWorkspaces,
        };
    }
}
