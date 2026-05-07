import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import type { SignOptions } from 'jsonwebtoken';

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async login(email: string, password: string): Promise<AuthTokens> {
    const user = await this.usersRepository.findOne({
      where: { email: email.toLowerCase().trim() },
    });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.issueTokens(user);
    await this.setRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async refresh(refreshToken: string): Promise<AuthTokens> {
    const payload = await this.verifyRefreshToken(refreshToken);
    const user = await this.usersRepository.findOne({ where: { id: payload.sub } });
    if (!user || !user.refreshTokenHash) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const matches = await bcrypt.compare(refreshToken, user.refreshTokenHash);
    if (!matches) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const tokens = await this.issueTokens(user);
    await this.setRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }

  async logout(userId: string): Promise<void> {
    await this.usersRepository.update({ id: userId }, { refreshTokenHash: null });
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

  private async setRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.usersRepository.update({ id: userId }, { refreshTokenHash: hash });
  }
}
