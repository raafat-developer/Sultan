import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CompaniesService } from './companies.service';
import {
  CreateCompanyDto,
  UpdateCompanyDto,
  RenewLicenseDto,
  UpdateCompanyStatusDto,
} from './dto/company.dto';

@ApiTags('Companies & SaaS Licensing')
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) {}

  @Get('summary')
  @ApiOperation({ summary: 'Get Developer Platform SaaS Overview (MRR, Total Companies, Fleet size)' })
  getSummary() {
    return this.companiesService.getPlatformSaaSSummary();
  }

  @Get('license/verify')
  @ApiOperation({ summary: 'Verify company license key' })
  @ApiQuery({ name: 'licenseKey', required: true })
  verifyLicense(@Query('licenseKey') licenseKey: string) {
    return this.companiesService.verifyLicense(licenseKey);
  }

  @Get()
  @ApiOperation({ summary: 'List all client companies / tenants (Developer Master)' })
  @ApiQuery({ name: 'search', required: false })
  findAll(@Query('search') search?: string) {
    return this.companiesService.findAll(search);
  }

  @Get(':idOrSlug')
  @ApiOperation({ summary: 'Get client company details by ID or Slug' })
  findOne(@Param('idOrSlug') idOrSlug: string) {
    return this.companiesService.findOne(idOrSlug);
  }

  @Post()
  @ApiOperation({ summary: 'Onboard a new client company with license generation and admin creation' })
  @ApiResponse({ status: 201, description: 'Company created successfully.' })
  create(@Body() dto: CreateCompanyDto) {
    return this.companiesService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update company details, logo, branding' })
  update(@Param('id') id: string, @Body() dto: UpdateCompanyDto) {
    return this.companiesService.update(id, dto);
  }

  @Post(':id/license/renew')
  @ApiOperation({ summary: 'Renew or extend company license duration' })
  renewLicense(@Param('id') id: string, @Body() dto: RenewLicenseDto) {
    return this.companiesService.renewLicense(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Suspend or activate company license' })
  updateStatus(@Param('id') id: string, @Body() dto: UpdateCompanyStatusDto) {
    return this.companiesService.updateStatus(id, dto);
  }
}
