import { Module } from '@nestjs/common';
import { AlertsController } from './alerts.controller';
import { AlertsService } from './alerts.service';
import { DatabaseService } from '../database/database.service';

@Module({
  controllers: [AlertsController],
  providers: [AlertsService, DatabaseService],
  exports: [AlertsService]
})
export class AlertsModule {}
