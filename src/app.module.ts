// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { DatabaseService } from './database/database.service';
import { PricesModule } from './prices/prices.module';
import { AlertsModule } from './alerts/alerts.module';
import { CronService } from './cron.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    ScheduleModule.forRoot(),
    PricesModule,
    AlertsModule,
  ],
  providers: [DatabaseService, CronService],
})
export class AppModule {}