import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Validation pipe with transform enabled
  app.useGlobalPipes(new ValidationPipe({
    transform: true,
    transformOptions: { enableImplicitConversion: true },
    whitelist: true,
    forbidNonWhitelisted: true,
  }));

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('Blockchain Price Tracker')
    .setDescription('API documentation for blockchain price tracking system')
    .setVersion('1.0')
    .addTag('prices', 'Price-related endpoints')
    .addTag('alerts', 'Alert-related endpoints')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}
bootstrap();