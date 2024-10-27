// src/prices/prices.controller.ts
import { Controller, Get, Query } from '@nestjs/common';
import { PricesService } from './prices.service';
import { IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';

export class SwapRateQueryDto {
    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    amount: number;
}

@Controller('prices')
export class PricesController {
    constructor(private readonly pricesService: PricesService) {}

    @Get()  // Remove forward slash
    getTokenPrices() {
        return this.pricesService.getTokenPrices();
    }

    @Get('hourly')  // Remove forward slash
    getHourlyPrices() {
        return this.pricesService.getHourlyPrices();
    }

    @Get('swap-rate')  // Remove forward slash
    getSwapRate(@Query() query: SwapRateQueryDto) {
        return this.pricesService.getSwapRate(query.amount);
    }
}