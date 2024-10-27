// src/prices/prices.module.ts
import { Module } from '@nestjs/common';
import { PricesController } from './prices.controller';
import { PricesService } from './prices.service';
import { DatabaseService } from '../database/database.service';

@Module({
  controllers: [PricesController],
  providers: [PricesService, DatabaseService],
  exports: [PricesService]  // Make sure this is here
})
export class PricesModule {}