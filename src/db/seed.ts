import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { faker } from "@faker-js/faker/locale/fr";
import * as schema from "@db/schema";

const { workspaces, boardColumns, tasks, statuses } = schema;

const WORKSPACE_COUNT = 4;

const columnsData = [
    { name: "À faire", position: 0 },
    { name: "En cours", position: 1 },
    { name: "Terminé", position: 2 },
];

const statusesData = [
    { name: "Urgent", color: "red" as const },
    { name: "En attente", color: "yellow" as const },
    { name: "Approuvé", color: "green" as const },
    { name: "En révision", color: "orange" as const },
    { name: "Bloqué", color: "red" as const },
    { name: "Prioritaire", color: "purple" as const },
    { name: "Optionnel", color: "gray" as const },
];

const tasksPerColumn = [8, 3, 2];

async function seed() {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL n'est pas définie dans le fichier .env");
    }

    const db = drizzle(process.env.DATABASE_URL, { schema });

    console.log("🌱 Début du seed...\n");

    const createdWorkspaces: (typeof workspaces.$inferSelect)[] = [];
    let totalTasks = 0;

    for (let workspaceIndex = 0; workspaceIndex < WORKSPACE_COUNT; workspaceIndex++) {
        console.log(`📦 Création du workspace ${workspaceIndex + 1}/${WORKSPACE_COUNT}...`);
        const [workspace] = await db
            .insert(workspaces)
            .values({
                name: faker.company.name(),
                userId: "eaeddb9c-c71e-4be4-8865-d9b0c7926ed4",
            })
            .returning();

        createdWorkspaces.push(workspace);
        console.log(`✅ Workspace créé: ${workspace.name}\n`);

        // 2. Créer les statuts avec leurs couleurs
        console.log("🎨 Création des statuts...");

        const createdStatuses: (typeof statuses.$inferSelect)[] = [];

        for (const statusData of statusesData) {
            const [status] = await db
                .insert(statuses)
                .values({
                    name: statusData.name,
                    color: statusData.color,
                    workspaceId: workspace.id,
                    userId: "eaeddb9c-c71e-4be4-8865-d9b0c7926ed4",
                })
                .returning();

            createdStatuses.push(status);
            console.log(`  ✓ Statut créé: ${status.name} (${status.color})`);
        }

        console.log();

        // 3. Créer les 3 colonnes avec leurs positions
        console.log("📋 Création des colonnes...");

        const createdColumns: (typeof boardColumns.$inferSelect)[] = [];

        for (const columnData of columnsData) {
            const [column] = await db
                .insert(boardColumns)
                .values({
                    name: columnData.name,
                    workspaceId: workspace.id,
                    position: columnData.position,
                    userId: "eaeddb9c-c71e-4be4-8865-d9b0c7926ed4",
                })
                .returning();

            createdColumns.push(column);
            console.log(`  ✓ Colonne créée: ${column.name} (position: ${column.position})`);
        }

        console.log("📝 Création des tâches...\n");

        for (let i = 0; i < createdColumns.length; i++) {
            const column = createdColumns[i];
            const taskCount = tasksPerColumn[i];

            console.log(`  Colonne "${column.name}" (${taskCount} tâches):`);

            for (let order = 0; order < taskCount; order++) {
                const title = faker.lorem.sentence({ min: 3, max: 8 });
                const description = faker.lorem.paragraph({ min: 1, max: 3 });

                // 30% de chance de ne pas avoir de statut
                const shouldHaveStatus = Math.random() > 0.3;
                const statusId = shouldHaveStatus
                    ? createdStatuses[Math.floor(Math.random() * createdStatuses.length)].id
                    : null;

                await db.insert(tasks).values({
                    title: `${title} - ${column.name}`,
                    description,
                    statusId,
                    columnId: column.id,
                    userId: "eaeddb9c-c71e-4be4-8865-d9b0c7926ed4",
                    order,
                });

                const statusInfo = statusId ? createdStatuses.find((s) => s.id === statusId)?.name : "Aucun";
                console.log(
                    `    ✓ Tâche #${order + 1}: ${title.substring(0, 50)}... (order: ${order}, statut: ${statusInfo})`,
                );
                totalTasks++;
            }
        }

        console.log(`--- Workspace "${workspace.name}" terminé ---\n`);
    }

    console.log("✨ Seed terminé avec succès !");

    console.log(`\n📊 Résumé:`);
    console.log(`  - ${WORKSPACE_COUNT} workspaces créés:`);
    createdWorkspaces.forEach((ws, index) => {
        console.log(`      ${index + 1}. ${ws.name}`);
    });
    console.log(`  - ${WORKSPACE_COUNT * statusesData.length} statuts au total (${statusesData.length} par workspace)`);
    console.log(`  - ${WORKSPACE_COUNT * 3} colonnes au total (3 par workspace)`);
    console.log(`  - ${totalTasks} tâches créées au total (13 par workspace)`);

    process.exit(0);
}

seed().catch((error) => {
    console.error("❌ Erreur lors du seed:", error);
    process.exit(1);
});
