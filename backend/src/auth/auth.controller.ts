import { Controller, Post, Body, Get, UseGuards, Req, Ip, Headers } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { AdminLoginDto, CourierLoginDto, RefreshTokenDto } from './dto/login.dto';
import { Public } from '../common/decorators/public.decorator';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('admin/login')
  @ApiOperation({ summary: 'Admin/Dispatcher Email & Password Login' })
  @ApiResponse({ status: 200, description: 'Authentication successful with tokens and role' })
  async loginAdmin(
    @Body() dto: AdminLoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.loginAdmin(dto, ip, userAgent);
  }

  @Public()
  @Post('courier/login')
  @ApiOperation({ summary: 'Courier Phone & Password/OTP Login' })
  @ApiResponse({ status: 200, description: 'Courier authentication successful' })
  async loginCourier(
    @Body() dto: CourierLoginDto,
    @Ip() ip: string,
    @Headers('user-agent') userAgent: string,
  ) {
    return this.authService.loginCourier(dto, ip, userAgent);
  }

  @Public()
  @Post('refresh')
  @ApiOperation({ summary: 'Refresh expired JWT access token' })
  async refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refreshToken(dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @ApiOperation({ summary: 'Logout and revoke refresh token' })
  async logout(@CurrentUser('id') userId: string) {
    return this.authService.logout(userId);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ summary: 'Get current authenticated user profile' })
  async getProfile(@CurrentUser() user: any) {
    return user;
  }
}
