import { and, eq, SQL } from "drizzle-orm";

/**
 * Helper pour filtrer par userId
 * @param table - La table Drizzle
 * @param userId - L'ID de l'utilisateur
 * @returns Condition SQL pour filtrer par userId
 */
export const byUserId = (table: any, userId: string): SQL => {
    return eq(table.userId, userId);
};

/**
 * Helper pour filtrer par id ET userId (vérification de propriété)
 * @param table - La table Drizzle
 * @param id - L'ID de la ressource
 * @param userId - L'ID de l'utilisateur
 * @returns Condition SQL combinée avec AND
 */
export const byIdAndUser = (table: any, id: string, userId: string): SQL | undefined => {
    return and(eq(table.id, id), eq(table.userId, userId));
};

/**
 * Helper pour filtrer par workspaceId ET userId
 * @param table - La table Drizzle
 * @param workspaceId - L'ID du workspace
 * @param userId - L'ID de l'utilisateur
 * @returns Condition SQL combinée avec AND
 */
export const byWorkspaceAndUser = (table: any, workspaceId: string, userId: string): SQL | undefined => {
    return and(eq(table.workspaceId, workspaceId), eq(table.userId, userId));
};
