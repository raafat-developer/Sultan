import { IsString, IsNotEmpty, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AssignOrderDto {
  @ApiProperty({ description: 'Courier UUID to assign order to' })
  @IsString()
  @IsNotEmpty()
  courierId: string;
}

export class CancelOrderDto {
  @ApiProperty({ example: 'Customer requested cancellation due to delay' })
  @IsString()
  @IsNotEmpty()
  reason: string;
}

export class VerifyDeliveryDto {
  @ApiProperty({ example: '4827', description: '4-digit OTP provided by customer' })
  @IsString()
  @IsNotEmpty()
  otp: string;

  @ApiPropertyOptional({ example: 350.0, description: 'Actual cash amount collected by courier' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  collectedAmount?: number;

  @ApiPropertyOptional({ description: 'Explanation if collectedAmount does not equal expected COD' })
  @IsOptional()
  @IsString()
  discrepancyReason?: string;

  @ApiPropertyOptional({ description: 'Proof photo URL if required' })
  @IsOptional()
  @IsString()
  photoUrl?: string;

  @ApiPropertyOptional({ description: 'Customer signature image URL or data' })
  @IsOptional()
  @IsString()
  signatureUrl?: string;
}

export class UpdateOrderStatusDto {
  @ApiPropertyOptional({ description: 'Optional operational reason' })
  @IsOptional()
  @IsString()
  reason?: string;
}
