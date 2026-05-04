import { ConflictException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { QueryFailedError, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';

export type UserPublic = Omit<User, 'password'>;

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
      role: dto.role,
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

  async findAll(): Promise<UserPublic[]> {
    return this.usersRepository.find({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        role: true,
        createdAt: true,
        updatedAt: true,
      },
    });
  }
}
