import { defineConfig } from "vitest/config";
import { resolve } from "node:path";

export default defineConfig({
    test: {
        globals: true,
        environment: "node",
        // Inclure seulement les fichiers de test dans src/
        include: ["src/**/*.{test,spec}.{js,ts}"],
        // Exclure le dossier dist/ et node_modules/
        exclude: ["node_modules", "dist", "drizzle/migrations"],
    },
    resolve: {
        alias: {
            "@api": resolve(__dirname, "./src/api"),
            "@db": resolve(__dirname, "./src/db"),
            "@common": resolve(__dirname, "./src/common"),
            "@drizzle": resolve(__dirname, "./drizzle"),
        },
    },
});
