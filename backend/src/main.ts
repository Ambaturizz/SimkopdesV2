import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  // Mengaktifkan CORS karena diakses oleh Web (browser) dan Capacitor (mobile)
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });
  await app.listen(3942);
  console.log('Simkopdes Unified API Gateway is running on: http://localhost:3942');
}
bootstrap();
