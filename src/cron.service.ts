// src/cron.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PricesService } from './prices/prices.service';
import { AlertsService } from './alerts/alerts.service';

@Injectable()
export class CronService {
  private readonly logger = new Logger(CronService.name);

  constructor(
    private readonly pricesService: PricesService,
    private readonly alertsService: AlertsService,
  ) {}

  @Cron('*/5 * * * *') // Every 5 minutes
  async checkPricesAndAlerts() {
    try {
      this.logger.log('Starting scheduled price check');
      
      // Fetch and save prices using PricesService
      const { ethPrice, maticPrice } = await this.pricesService.fetchAndSavePrices();
      
      // Check price alerts
      await this.alertsService.checkPriceAlerts('ETH', ethPrice);
      await this.alertsService.checkPriceAlerts('MATIC', maticPrice);
      
      this.logger.log('Completed price check and alerts');
    } catch (error) {
      this.logger.error('Error in scheduled task:', error);
    }
  }
}