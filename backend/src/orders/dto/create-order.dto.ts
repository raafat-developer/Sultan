import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsEnum,
  Min,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PaymentMethod } from '@prisma/client';

export class CreateOrderDto {
  @ApiProperty({ description: 'Existing Customer UUID or null if creating new customer inline' })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiPropertyOptional({ description: 'Customer Name if customerId not provided' })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiPropertyOptional({ description: 'Customer Phone if customerId not provided' })
  @IsOptional()
  @IsString()
  customerPhone?: string;

  @ApiProperty({ example: 'KFC Nasr City' })
  @IsString()
  @IsNotEmpty()
  pickupName: string;

  @ApiProperty({ example: '+201099887701' })
  @IsString()
  @IsNotEmpty()
  pickupPhone: string;

  @ApiProperty({ example: 'Abbas El Akkad, Nasr City, Cairo' })
  @IsString()
  @IsNotEmpty()
  pickupAddress: string;

  @ApiProperty({ example: 30.0571 })
  @IsNumber()
  pickupLatitude: number;

  @ApiProperty({ example: 31.3418 })
  @IsNumber()
  pickupLongitude: number;

  @ApiProperty({ example: '23 Road 9, Maadi, Cairo' })
  @IsString()
  @IsNotEmpty()
  deliveryAddress: string;

  @ApiProperty({ example: 29.9587 })
  @IsNumber()
  deliveryLatitude: number;

  @ApiProperty({ example: 31.2612 })
  @IsNumber()
  deliveryLongitude: number;

  @ApiProperty({ example: 'Family meal box with drinks' })
  @IsString()
  @IsNotEmpty()
  packageDescription: string;

  @ApiPropertyOptional({ example: 'FOOD' })
  @IsOptional()
  @IsString()
  packageType?: string = 'STANDARD';

  @ApiPropertyOptional({ example: 1.5 })
  @IsOptional()
  @IsNumber()
  packageWeight?: number;

  @ApiPropertyOptional({ example: 45.0, description: 'Calculated delivery fee (if omitted, pricing engine computes it)' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  deliveryFee?: number;

  @ApiPropertyOptional({ example: 350.0, description: 'Cash to collect from customer' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  codAmount?: number = 0;

  @ApiPropertyOptional({ enum: PaymentMethod, default: PaymentMethod.COD })
  @IsOptional()
  @IsEnum(PaymentMethod)
  paymentMethod?: PaymentMethod = PaymentMethod.COD;

  @ApiPropertyOptional({ example: 'NORMAL', enum: ['LOW', 'NORMAL', 'HIGH', 'URGENT'] })
  @IsOptional()
  @IsString()
  priority?: string = 'NORMAL';

  @ApiPropertyOptional({ example: 'Please do not ring the doorbell, baby sleeping.' })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiPropertyOptional({ description: 'Optional Courier UUID to assign directly' })
  @IsOptional()
  @IsString()
  courierId?: string;
}
