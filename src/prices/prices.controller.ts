import { Controller, Get, Query } from '@nestjs/common';
import { PricesService } from './prices.service';
import { ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { SwapRateQueryDto } from './dto/swap-rate.dto';

@ApiTags('prices')
@Controller('prices')
export class PricesController {
    constructor(private readonly pricesService: PricesService) {}

    @Get()
    @ApiOperation({ summary: 'Get current token prices' })
    @ApiResponse({ status: 200, description: 'Returns current prices for ETH and MATIC' })
    getTokenPrices() {
        return this.pricesService.getTokenPrices();
    }

    @Get('hourly')
    @ApiOperation({ summary: 'Get hourly prices for the last 24 hours' })
    @ApiResponse({ status: 200, description: 'Returns hourly price data' })
    getHourlyPrices() {
        return this.pricesService.getHourlyPrices();
    }

    @Get('swap-rate')
    @ApiOperation({ 
        summary: 'Get ETH to BTC swap rate',
        description: 'Calculate how much BTC you can get for a given amount of ETH'
    })
    @ApiQuery({ 
        name: 'amount', 
        type: Number,
        required: true,
        description: 'Amount of ETH to swap',
        example: 1
    })
    getSwapRate(@Query() query: SwapRateQueryDto) {
        return this.pricesService.getSwapRate(query.amount);
    }
}