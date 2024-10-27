// src/prices/prices.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import Moralis from 'moralis';

@Injectable()
export class PricesService implements OnModuleInit {
  private readonly logger = new Logger(PricesService.name);
  private static isMoralisInitialized = false;

  constructor(
    private readonly configService: ConfigService,
    private readonly dbService: DatabaseService,
  ) {}

  async onModuleInit() {
    await this.initializeMoralis();
  }

  private async initializeMoralis() {
    if (!PricesService.isMoralisInitialized) {
      try {
        await Moralis.start({
          apiKey: this.configService.get<string>('MORALIS_API_KEY'),
        });
        PricesService.isMoralisInitialized = true;
        this.logger.log('Moralis initialized successfully');
      } catch (error) {
        this.logger.error('Failed to initialize Moralis:', error);
        throw error;
      }
    }
  }

  // Current prices
  async getTokenPrices() {
    try {
      const result = await this.dbService.query(`
        SELECT token, price, last_update as timestamp
        FROM token_prices
        WHERE last_update >= NOW() - INTERVAL '24 HOURS'
        ORDER BY last_update DESC;
      `);
      return result.rows;
    } catch (error) {
      this.logger.error('Error fetching token prices:', error);
      throw error;
    }
  }

  // Add the missing getHourlyPrices method
  async getHourlyPrices() {
    try {
      const result = await this.dbService.query(`
        SELECT 
          token,
          DATE_TRUNC('hour', last_update) AS hour,
          AVG(price) AS avg_price
        FROM token_prices
        WHERE last_update >= NOW() - INTERVAL '24 HOURS'
        GROUP BY token, DATE_TRUNC('hour', last_update)
        ORDER BY token, hour DESC;
      `);
      
      return result.rows.map(row => ({
        token: row.token,
        hour: row.hour,
        price: parseFloat(row.avg_price)
      }));
    } catch (error) {
      this.logger.error('Error fetching hourly prices:', error);
      throw error;
    }
  }

  // Swap rate calculation
  async getSwapRate(amountETH: number) {
    try {
      const ethResponse = await Moralis.EvmApi.token.getTokenPrice({
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2', // WETH
        chain: '0x1',
      });

      const btcResponse = await Moralis.EvmApi.token.getTokenPrice({
        address: '0x2260fac5e5542a773aa44fbcfedf7c193bc2c599', // WBTC
        chain: '0x1',
      });

      const ethToUsdPrice = ethResponse.raw.usdPrice;
      const btcToUsdPrice = btcResponse.raw.usdPrice;

      const totalUSD = amountETH * ethToUsdPrice;
      const amountBTC = totalUSD / btcToUsdPrice;

      const feePercentage = 0.0003;
      const feeETH = amountETH * feePercentage;
      const feeUSD = totalUSD * feePercentage;

      return {
        input: {
          amount: amountETH,
          currency: 'ETH',
        },
        output: {
          amount: amountBTC.toFixed(8),
          currency: 'BTC',
        },
        exchangeRates: {
          ETH_USD: ethToUsdPrice.toFixed(2),
          BTC_USD: btcToUsdPrice.toFixed(2),
        },
        fees: {
          percentage: '0.03%',
          eth: feeETH.toFixed(6),
          usd: feeUSD.toFixed(2),
        },
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error calculating swap rate:', error);
      throw error;
    }
  }

  // Price fetching and saving
  async fetchAndSavePrices() {
    try {
      const ethResponse = await Moralis.EvmApi.token.getTokenPrice({
        address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
        chain: '0x1',
      });

      const maticResponse = await Moralis.EvmApi.token.getTokenPrice({
        address: '0x7d1afa7b718fb893db30a3abc0cfc608aacfebb0',
        chain: '0x1',
      });

      const ethPrice = ethResponse.raw.usdPrice;
      const maticPrice = maticResponse.raw.usdPrice;

      await this.dbService.query(
        'INSERT INTO token_prices (token, price) VALUES ($1, $2), ($3, $4)',
        ['ETH', ethPrice, 'MATIC', maticPrice]
      );

      return { ethPrice, maticPrice };
    } catch (error) {
      this.logger.error('Error fetching and saving prices:', error);
      throw error;
    }
  }
}