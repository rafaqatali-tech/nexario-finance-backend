import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateUserDto } from '../users/dto/create-user.dto';
import {
  AuthRegisterResponse,
  AuthService,
  AuthTokens,
} from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import type { JwtPayload } from './interfaces/jwt-payload.interface';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user account' })
  @Post('register')
  register(@Body() dto: CreateUserDto): Promise<AuthRegisterResponse> {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Login and receive access/refresh tokens' })
  @Post('login')
  login(@Body() dto: LoginDto): Promise<AuthTokens> {
    return this.authService.login(dto.email, dto.password);
  }

  @ApiOperation({ summary: 'Refresh tokens using refreshToken' })
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto): Promise<AuthTokens> {
    return this.authService.refresh(dto.refreshToken);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ summary: 'Logout and clear stored refresh token' })
  @Post('logout')
  async logout(@Req() req: { user: JwtPayload }): Promise<{ success: true }> {
    await this.authService.logout(req.user.sub);
    return { success: true };
  }
}
