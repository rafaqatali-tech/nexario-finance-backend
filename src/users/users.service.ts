import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { QueryFailedError, Repository } from 'typeorm';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserRole } from './entities/user.entity';

export type UserPublic = Omit<User, 'password' | 'refreshTokenHash'>;

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateUserDto): Promise<UserPublic> {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = this.usersRepository.create({
      firstName: dto.firstName,
      lastName: dto.lastName,
      email: dto.email.toLowerCase().trim(),
      password: passwordHash,
      role: dto.role ?? UserRole.PARTNER,
    });
    try {
      const saved = await this.usersRepository.save(user);
      return {
        id: saved.id,
        firstName: saved.firstName,
        lastName: saved.lastName,
        email: saved.email,
        role: saved.role,
        createdAt: saved.createdAt,
        updatedAt: saved.updatedAt,
      };
    } catch (err: unknown) {
      if (
        err instanceof QueryFailedError &&
        typeof err.driverError === 'object' &&
        err.driverError !== null &&
        'code' in err.driverError &&
        (err.driverError as { code: string }).code === '23505'
      ) {
        throw new ConflictException('Email already in use');
      }
      throw err;
    }
  }

  async findAll(page = 1, limit = 10): Promise<PaginatedResult<UserPublic>> {
    const [results, total] = await this.usersRepository.findAndCount({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      results,
      total,
      page,
      limit,
    };
  }

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email: email.toLowerCase().trim() },
    });
  }

  findById(id: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async storeRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const hashedRefreshToken = await bcrypt.hash(refreshToken, 10);
    await this.usersRepository.update(userId, {
      refreshTokenHash: hashedRefreshToken,
    });
  }

  async clearRefreshToken(userId: string): Promise<void> {
    await this.usersRepository.update(userId, { refreshTokenHash: null });
  }

  async verifyRefreshToken(userId: string, refreshToken: string): Promise<boolean> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      select: {
        id: true,
        refreshTokenHash: true,
      },
    });

    if (!user?.refreshTokenHash) {
      return false;
    }

    return bcrypt.compare(refreshToken, user.refreshTokenHash);
  }
}
