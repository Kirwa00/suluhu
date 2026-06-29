import 'reflect-metadata';
import { Logger } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import compression from 'compression';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { AppConfigService } from './config/app-config.service';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule, { bufferLogs: false });
  const config = app.get(AppConfigService);
  const logger = new Logger('Bootstrap');

  // Security & performance middleware (SDLC §3.2, §7.3)
  app.use(helmet({ contentSecurityPolicy: config.isProduction ? undefined : false }));
  app.use(compression());

  app.enableCors({
    origin: config.http.corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  app.setGlobalPrefix('api/v1');

  // Validation is handled per-route by Zod pipes (see ZodValidationPipe).
  app.enableShutdownHooks();

  // OpenAPI / Swagger (SDLC §9)
  const swaggerConfig = new DocumentBuilder()
    .setTitle('Suluhu Therapy Center API')
    .setDescription('Compliant telehealth platform API — Eldoret, Kenya')
    .setVersion('1.0')
    .addBearerAuth()
    .addServer(config.http.publicUrl)
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document, {
    swaggerOptions: { persistAuthorization: true },
  });

  await app.listen(config.http.port, config.http.host);
  logger.log(`API listening on ${config.http.publicUrl} (env: ${config.nodeEnv})`);
  logger.log(`OpenAPI docs at ${config.http.publicUrl}/docs`);
}

void bootstrap();
