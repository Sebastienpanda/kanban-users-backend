import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { AllExceptionsFilter } from "@common/all-exceptions-filter.filter";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ConfigService } from "@nestjs/config";

async function bootstrap() {
    const app = await NestFactory.create<NestFastifyApplication>(
        AppModule,
        new FastifyAdapter({
            logger: true,
        }),
    );

    app.setGlobalPrefix("/api");
    app.enableCors({
        origin: ["http://localhost:4200"],
        methods: ["GET", "POST", "PATCH"],
    });
    app.useGlobalFilters(new AllExceptionsFilter());

    const customCss = readFileSync(join(__dirname, "..", "swagger.css"), "utf8");

    const config = new DocumentBuilder()
        .setTitle("Api de Kanbano")
        .setDescription("Documentation de l'API de Kanbano")
        .setVersion("0.0.1")
        .build();

    const documentFactory = () => SwaggerModule.createDocument(app, config);
    SwaggerModule.setup("documentation", app, documentFactory, {
        customSiteTitle: "Kanban Documentation Api",
        customCss,
    });
    const configS = app.get(ConfigService);
    const port = Number(configS.get("PORT"));
    await app.listen(port, "0.0.0.0");
}
bootstrap();
