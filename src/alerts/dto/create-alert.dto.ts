import { IsEmail, IsNumber, IsString, IsPositive, IsIn } from 'class-validator';
import { Transform } from 'class-transformer';

export class CreateAlertDto {
    @IsString()
    @Transform(({ value }) => value.toUpperCase())
    @IsIn(['ETH', 'MATIC'])
    token: string;

    @IsNumber()
    @IsPositive()
    targetPrice: number;

    @IsEmail()
    email: string;
}