import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { SignOptions } from 'jsonwebtoken';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthRegisterResponse extends AuthTokens {
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async register(dto: CreateUserDto): Promise<AuthRegisterResponse> {
    const user = await this.usersService.create(dto);
    const tokens = await this.login(dto.email, dto.password);
    return {
      ...tokens,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
      },
    };
  }

  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await this.usersService.verifyPassword(user, password);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.issueTokens(user);
    await this.usersService.storeRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const payload = await this.verifyRefreshToken(refreshToken);
    const user = await this.usersService.findById(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const matches = await this.usersService.verifyRefreshToken(
      user.id,
      refreshToken,
    );
    if (!matches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.issueTokens(user);
    await this.usersService.storeRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.usersService.clearRefreshToken(userId);
  }

  private async issueTokens(user: User): Promise<AuthTokens> {
    const accessSecret = process.env.JWT_ACCESS_SECRET ?? 'dev_access_secret';
    const refreshSecret = process.env.JWT_REFRESH_SECRET ?? 'dev_refresh_secret';
    const accessExpiresIn = process.env.JWT_ACCESS_EXPIRES_IN ?? '15m';
    const refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES_IN ?? '7d';

    const basePayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(basePayload, {
        secret: accessSecret,
        expiresIn: accessExpiresIn as SignOptions['expiresIn'],
      }),
      this.jwtService.signAsync(basePayload, {
        secret: refreshSecret,
        expiresIn: refreshExpiresIn as SignOptions['expiresIn'],
      }),
    ]);

    return { accessToken, refreshToken };
  }

  private async verifyRefreshToken(refreshToken: string): Promise<{ sub: string }> {
    const refreshSecret = process.env.JWT_REFRESH_SECRET ?? 'dev_refresh_secret';
    try {
      const payload = await this.jwtService.verifyAsync<{ sub: string }>(refreshToken, {
        secret: refreshSecret,
      });
      return payload;
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }
}
