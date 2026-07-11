import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import * as dotenv from 'dotenv';
dotenv.config();

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'postgres',
      url: process.env.DATABASE_URL,
      autoLoadEntities: true,
      synchronize: false, // Jangan gunakan sinkronisasi otomatis untuk produksi, kita akan pakai seed manual
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
