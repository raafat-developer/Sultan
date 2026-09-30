import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsEnum,
  MinLength,
} from 'class-validator';

export class CreateCompanyDto {
  @ApiProperty({ example: 'Al-Buraq Motorcycle Logistics' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'alburaq' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiPropertyOptional({ example: 'https://images.unsplash.com/photo-1558981806-ec527fa84c39' })
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional({ example: '#E50914' })
  @IsString()
  @IsOptional()
  brandColor?: string;

  @ApiProperty({ example: 'contact@alburaq-delivery.com' })
  @IsEmail()
  contactEmail: string;

  @ApiProperty({ example: '+201099887766' })
  @IsString()
  @IsNotEmpty()
  contactPhone: string;

  @ApiPropertyOptional({ example: '10 Makram Ebeid, Nasr City, Cairo' })
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional({ example: 'PRO', enum: ['STARTER', 'PRO', 'ENTERPRISE'] })
  @IsString()
  @IsOptional()
  plan?: string;

  @ApiPropertyOptional({ example: 12, description: 'License validity in months' })
  @IsNumber()
  @IsOptional()
  durationMonths?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsNumber()
  @IsOptional()
  maxCouriers?: number;

  // Initial Company Admin
  @ApiProperty({ example: 'Karim Mostafa' })
  @IsString()
  @IsNotEmpty()
  adminName: string;

  @ApiProperty({ example: 'admin@alburaq.com' })
  @IsEmail()
  adminEmail: string;

  @ApiProperty({ example: 'Password123!' })
  @IsString()
  @MinLength(6)
  adminPassword: string;

  @ApiProperty({ example: '+201099887711' })
  @IsString()
  @IsNotEmpty()
  adminPhone: string;
}

export class UpdateCompanyDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  brandColor?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  contactEmail?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  contactPhone?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  address?: string;

  @ApiPropertyOptional()
  @IsNumber()
  @IsOptional()
  maxCouriers?: number;
}

export class RenewLicenseDto {
  @ApiProperty({ example: 12, description: 'Additional months' })
  @IsNumber()
  durationMonths: number;

  @ApiPropertyOptional({ example: 'PRO' })
  @IsString()
  @IsOptional()
  plan?: string;
}

export class UpdateCompanyStatusDto {
  @ApiProperty({ example: 'ACTIVE', enum: ['ACTIVE', 'SUSPENDED', 'TRIAL', 'EXPIRED'] })
  @IsString()
  @IsNotEmpty()
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'EXPIRED';
}
