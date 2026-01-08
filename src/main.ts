import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { AllExceptionsFilter } from "./common/all-exceptions-filter.filter";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { readFileSync } from "node:fs";
import { join } from "node:path";

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter({
            logger: true,
        }),
    );

    app.setGlobalPrefix("/api");
    app.useGlobalFilters(new AllExceptionsFilter());

    const customCss = readFileSync(join(__dirname, "..", "swagger.css"), "utf8");

    const config = new DocumentBuilder()
        .setTitle("Api de Kanbano")
        .setDescription("Documentation de l'API de" + " kanbano")
        .setVersion("0.0.1")
        .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("documentation", app, documentFactory, {
        customSiteTitle: "Kanban Documentation Api",
        customCss,
    });
    await app.listen(process.env.PORT ?? 3000);
}
bootstrap();
