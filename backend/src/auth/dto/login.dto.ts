import { IsString, IsNotEmpty, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class AdminLoginDto {
  @ApiProperty({ example: 'admin@fastman.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

export class CourierLoginDto {
  @ApiProperty({ example: '+201000000011' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiProperty({ example: 'Courier123!' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ description: 'Optional FCM device token for push notifications' })
  @IsOptional()
  @IsString()
  deviceToken?: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsIn...' })
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}
