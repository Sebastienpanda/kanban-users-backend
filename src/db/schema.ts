export * from "./task.schema";
export * from "./workspace.schema";
export * from "./bord-columns.schema";

import { tasks, tasksRelations } from "./task.schema";
import { boardColumns, boardColumnsRelations } from "./bord-columns.schema";
import { workspaces, workspacesRelations } from "./workspace.schema";

export const schema = {
    tasks,
    boardColumns,
    workspaces,
    tasksRelations,
    boardColumnsRelations,
    workspacesRelations,
};
