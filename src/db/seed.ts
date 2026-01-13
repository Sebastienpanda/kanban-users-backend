import "dotenv/config";
import { drizzle } from "drizzle-orm/neon-http";
import { faker } from "@faker-js/faker/locale/fr";
import * as schema from "@db/schema";

const { workspaces, boardColumns, tasks } = schema;

const WORKSPACE_COUNT = 4;

const columnsData = [
    { name: "À faire", position: 0, status: "todo" as const },
    { name: "En cours", position: 1, status: "in_progress" as const },
    { name: "Terminé", position: 2, status: "done" as const },
];

const tasksPerColumn = [8, 3, 2];

type ColumnWithStatus = typeof boardColumns.$inferSelect & { status: "todo" | "in_progress" | "done" };

async function seed() {
    if (!process.env.DATABASE_URL) {
        throw new Error("DATABASE_URL n'est pas définie dans le fichier .env");
    }

    const db = drizzle(process.env.DATABASE_URL, { schema });

    console.log("🌱 Début du seed...\n");

    const createdWorkspaces: (typeof workspaces.$inferSelect)[] = [];
    let totalTasks = 0;

    for (let workspaceIndex = 0; workspaceIndex < WORKSPACE_COUNT; workspaceIndex++) {
        // 1. Créer le workspace
        console.log(`📦 Création du workspace ${workspaceIndex + 1}/${WORKSPACE_COUNT}...`);
        const [workspace] = await db
            .insert(workspaces)
            .values({
                name: faker.company.name(),
            })
            .returning();

        createdWorkspaces.push(workspace);
        console.log(`✅ Workspace créé: ${workspace.name}\n`);

        // 2. Créer les 3 colonnes avec leurs positions
        console.log("📋 Création des colonnes...");

        const createdColumns: ColumnWithStatus[] = [];

        for (const columnData of columnsData) {
            const [column] = await db
                .insert(boardColumns)
                .values({
                    name: columnData.name,
                    workspaceId: workspace.id,
                    position: columnData.position,
                })
                .returning();

            createdColumns.push({ ...column, status: columnData.status });
            console.log(`  ✓ Colonne créée: ${column.name} (position: ${column.position})`);
        }

        console.log("");

        // 3. Créer les tâches pour chaque colonne
        console.log("📝 Création des tâches...\n");

        for (let i = 0; i < createdColumns.length; i++) {
            const column = createdColumns[i];
            const taskCount = tasksPerColumn[i];

            console.log(`  Colonne "${column.name}" (${taskCount} tâches):`);

            for (let order = 0; order < taskCount; order++) {
                const title = faker.lorem.sentence({ min: 3, max: 8 });
                const description = faker.lorem.paragraph({ min: 1, max: 3 });

                await db.insert(tasks).values({
                    title: `${title} - ${column.name} #${order + 1}`,
                    description,
                    status: column.status,
                    columnId: column.id,
                    order,
                });

                console.log(
                    `    ✓ Tâche #${order + 1}: ${title.substring(0, 50)}... (order: ${order}, status: ${column.status})`,
                );
                totalTasks++;
            }

            console.log("");
        }

        console.log(`--- Workspace "${workspace.name}" terminé ---\n`);
    }

    console.log("✨ Seed terminé avec succès !");

    console.log(`\n📊 Résumé:`);
    console.log(`  - ${WORKSPACE_COUNT} workspaces créés:`);
    createdWorkspaces.forEach((ws, index) => {
        console.log(`      ${index + 1}. ${ws.name}`);
    });
    console.log(`  - ${WORKSPACE_COUNT * 3} colonnes au total (3 par workspace)`);
    console.log(`  - ${totalTasks} tâches créées au total (13 par workspace)`);

    process.exit(0);
}

seed().catch((error) => {
    console.error("❌ Erreur lors du seed:", error);
    process.exit(1);
});
