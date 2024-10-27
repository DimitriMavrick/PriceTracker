import { Controller, Post, Get, Body, Query } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { CreateAlertDto } from './dto/create-alert.dto';

@Controller('alerts')
export class AlertsController {
    constructor(private readonly alertsService: AlertsService) {}

    @Post()
    createAlert(@Body() createAlertDto: CreateAlertDto) {
        return this.alertsService.createPriceAlert(
            createAlertDto.token,
            createAlertDto.targetPrice,
            createAlertDto.email
        );
    }

    @Get()
    getActiveAlerts(@Query('email') email: string) {
        return this.alertsService.getActiveAlerts(email);
    }
}