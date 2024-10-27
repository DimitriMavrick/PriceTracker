import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Client } from 'pg';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private client: Client;
  private isConnected: boolean = false;

  constructor(private configService: ConfigService) {
    this.client = new Client({
      connectionString: this.configService.get<string>('DATABASE_URL'),
    });
  }

  async onModuleInit() {
    await this.connect();
    await this.createTables();
  }

  async onModuleDestroy() {
    if (this.isConnected) {
      await this.client.end();
      this.isConnected = false;
    }
  }

  private async connect() {
    try {
      if (!this.isConnected) {
        await this.client.connect();
        this.isConnected = true;
        console.log('✅ Successfully connected to PostgreSQL');
      }
    } catch (error) {
      console.error('❌ Database connection error:', error);
      throw error;
    }
  }

  private async createTables() {
    try {
      // Create token_prices table
      await this.client.query(`
        CREATE TABLE IF NOT EXISTS token_prices (
          id SERIAL PRIMARY KEY,
          token VARCHAR(10) NOT NULL,
          price NUMERIC(20, 10) NOT NULL,
          last_update TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);

      // Create price_alerts table
      await this.client.query(`
        CREATE TABLE IF NOT EXISTS price_alerts (
          id SERIAL PRIMARY KEY,
          token VARCHAR(10) NOT NULL,
          target_price NUMERIC(20, 10) NOT NULL,
          email VARCHAR(255) NOT NULL,
          triggered BOOLEAN DEFAULT FALSE,
          created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
        );
      `);

      console.log('✅ Database tables created successfully');
    } catch (error) {
      console.error('❌ Error creating tables:', error);
      throw error;
    }
  }

  // Method to get client for use in other services
  getClient(): Client {
    if (!this.isConnected) {
      throw new Error('Database is not connected');
    }
    return this.client;
  }

  // Helper method for executing queries
  async query(queryText: string, values: any[] = []): Promise<any> {
    try {
      if (!this.isConnected) {
        await this.connect();
      }
      return await this.client.query(queryText, values);
    } catch (error) {
      console.error('❌ Query execution error:', error);
      throw error;
    }
  }
}