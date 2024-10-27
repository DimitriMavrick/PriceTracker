import { IsNumber, IsPositive } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SwapRateQueryDto {
    @ApiProperty({
        description: 'Amount of ETH to swap',
        minimum: 0.0001,
        example: 1,
        required: true,
        type: Number
    })
    @IsNumber()
    @IsPositive()
    @Type(() => Number)
    amount: number;
}