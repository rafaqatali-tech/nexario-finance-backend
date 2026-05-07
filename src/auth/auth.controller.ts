import { Body, Controller, Post } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService, AuthTokens } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

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
}
