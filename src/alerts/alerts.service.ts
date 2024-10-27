import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { DatabaseService } from '../database/database.service';
import * as nodemailer from 'nodemailer';

@Injectable()
export class AlertsService {
  private readonly logger = new Logger(AlertsService.name);
  private transporter: nodemailer.Transporter;

  constructor(
    private readonly configService: ConfigService,
    private readonly dbService: DatabaseService,
  ) {
    this.initializeEmailTransporter();
  }

  private initializeEmailTransporter() {
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('EMAIL_USER'),
        pass: this.configService.get<string>('EMAIL_PASS'),
      },
    });
  }

  async createPriceAlert(token: string, targetPrice: number, email: string) {
    try {
      const result = await this.dbService.query(
        `INSERT INTO price_alerts (token, target_price, email) 
         VALUES ($1, $2, $3) 
         RETURNING id, token, target_price, email, created_at`,
        [token.toUpperCase(), targetPrice, email]
      );

      this.logger.log(`Created price alert for ${token} at ${targetPrice}`);
      return result.rows[0];
    } catch (error) {
      this.logger.error('Error creating price alert:', error);
      throw error;
    }
  }

  async checkPriceIncrease(token: string, currentPrice: number) {
    try {
      // Get price from 1 hour ago
      const result = await this.dbService.query(`
        SELECT price
        FROM token_prices
        WHERE token = $1 
        AND last_update <= NOW() - INTERVAL '1 HOUR'
        ORDER BY last_update DESC
        LIMIT 1
      `, [token]);
  
      if (result.rows.length > 0) {
        const oldPrice = parseFloat(result.rows[0].price);
        const priceIncrease = ((currentPrice - oldPrice) / oldPrice) * 100;
  
        if (priceIncrease > 3) {
          // Send alert email
          const mailOptions = {
            from: this.configService.get<string>('EMAIL_USER'),
            to: 'hyperhire_assignment@hyperhire.in',
            subject: `Price Alert: ${token} increased by more than 3%`,
            html: `
              <h2>Price Increase Alert</h2>
              <p>${token} price has increased by ${priceIncrease.toFixed(2)}% in the last hour</p>
              <ul>
                <li>Previous Price: $${oldPrice.toFixed(2)}</li>
                <li>Current Price: $${currentPrice.toFixed(2)}</li>
                <li>Increase: ${priceIncrease.toFixed(2)}%</li>
              </ul>
            `
          };
  
          await this.transporter.sendMail(mailOptions);
          this.logger.log(`Sent price increase alert for ${token}`);
        }
      }
    } catch (error) {
      this.logger.error(`Error checking price increase for ${token}:`, error);
      throw error;
    }
  }

  async checkPriceAlerts(token: string, currentPrice: number) {
    try {
      // Get active alerts for the token where current price matches target price (within 1%)
      const alerts = await this.dbService.query(
        `SELECT * FROM price_alerts 
         WHERE token = $1 
         AND triggered = false
         AND target_price BETWEEN $2 AND $3`,
        [token, currentPrice * 0.99, currentPrice * 1.01]
      );

      for (const alert of alerts.rows) {
        await this.sendPriceAlert(alert, currentPrice);
        await this.markAlertAsTriggered(alert.id);
      }

      return alerts.rows;
    } catch (error) {
      this.logger.error(`Error checking price alerts for ${token}:`, error);
      throw error;
    }
  }

  private async sendPriceAlert(alert: any, currentPrice: number) {
    const mailOptions = {
      from: this.configService.get<string>('EMAIL_USER'),
      to: alert.email,
      subject: `Price Alert: ${alert.token} has reached your target price!`,
      html: `
        <h2>Price Alert Notification</h2>
        <p>Your price alert for ${alert.token} has been triggered!</p>
        <ul>
          <li>Target Price: $${alert.target_price}</li>
          <li>Current Price: $${currentPrice}</li>
          <li>Alert Created: ${new Date(alert.created_at).toLocaleString()}</li>
        </ul>
        <p>Take action now if needed!</p>
      `
    };

    try {
      await this.transporter.sendMail(mailOptions);
      this.logger.log(`Sent price alert email for ${alert.token} to ${alert.email}`);
    } catch (error) {
      this.logger.error('Error sending price alert email:', error);
      throw error;
    }
  }

  private async markAlertAsTriggered(alertId: number) {
    try {
      await this.dbService.query(
        'UPDATE price_alerts SET triggered = true WHERE id = $1',
        [alertId]
      );
    } catch (error) {
      this.logger.error('Error marking alert as triggered:', error);
      throw error;
    }
  }

  async getActiveAlerts(email: string) {
    try {
      const result = await this.dbService.query(
        `SELECT id, token, target_price, email, created_at 
         FROM price_alerts 
         WHERE email = $1 AND triggered = false 
         ORDER BY created_at DESC`,
        [email]
      );
      return result.rows;
    } catch (error) {
      this.logger.error('Error fetching active alerts:', error);
      throw error;
    }
  }
}
