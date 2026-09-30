import { IsString, IsNotEmpty, IsEnum, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CourierStatus } from '@prisma/client';

export class UpdateCourierStatusDto {
  @ApiProperty({ enum: CourierStatus, example: CourierStatus.AVAILABLE })
  @IsEnum(CourierStatus)
  @IsNotEmpty()
  status: CourierStatus;
}

export class UpdateLocationDto {
  @ApiProperty({ example: 30.0444 })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: 31.2357 })
  @IsNumber()
  longitude: number;

  @ApiPropertyOptional({ example: 10.5 })
  @IsOptional()
  @IsNumber()
  accuracy?: number;

  @ApiPropertyOptional({ example: 45.0 })
  @IsOptional()
  @IsNumber()
  heading?: number;

  @ApiPropertyOptional({ example: 35.2 })
  @IsOptional()
  @IsNumber()
  speed?: number;

  @ApiPropertyOptional({ example: 85 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  batteryLevel?: number;

  @ApiPropertyOptional({ description: 'Active Order ID if currently on delivery' })
  @IsOptional()
  @IsString()
  activeOrderId?: string;
}

export class UpdateCourierProfileDto {
  @ApiPropertyOptional({ example: 'MOTORCYCLE' })
  @IsOptional()
  @IsString()
  vehicleType?: string;

  @ApiPropertyOptional({ example: 'ق ل م 123' })
  @IsOptional()
  @IsString()
  plateNumber?: string;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  isApproved?: boolean;
}
