import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { Expose, plainToInstance } from 'class-transformer';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../common/decorators/api-paginated-response.decorator';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { UserPublic, UsersService } from './users.service';

class UserResponseItem {
  @Expose()
  @ApiProperty({ example: 'a47995e8-dd2c-4ece-82a1-85c71c5072a3' })
  id!: string;

  @Expose()
  @ApiProperty({ example: 'Zeeshan Ali' })
  name!: string;

  @Expose()
  @ApiProperty({ example: 'zeeshan@example.com' })
  email!: string;

  @Expose()
  @ApiProperty({ example: 'partner' })
  role!: string;

  @Expose()
  @ApiProperty({ example: '2026-05-04T12:28:44.913Z' })
  createdAt!: Date;
}

@ApiTags('Users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiOperation({ summary: 'Create a new user' })
  @Post()
  async create(@Body() dto: CreateUserDto): Promise<UserResponseItem> {
    const user = await this.usersService.create(dto);
    return this.toUserResponse(user);
  }

  @ApiOperation({ summary: 'List users with pagination' })
  @ApiPaginatedResponse(UserResponseItem)
  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ): Promise<PaginatedResult<UserResponseItem>> {
    const paginated = await this.usersService.findAll(
      Number.parseInt(page, 10) || 1,
      Number.parseInt(limit, 10) || 10,
    );
    return {
      ...paginated,
      results: paginated.results.map((item) => this.toUserResponse(item)),
    };
  }

  private toUserResponse(user: UserPublic): UserResponseItem {
    return plainToInstance(
      UserResponseItem,
      {
      id: user.id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      },
      { excludeExtraneousValues: true },
    );
  }
}
