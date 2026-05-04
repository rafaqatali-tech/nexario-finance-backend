import { Body, Controller, Get, Post } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UserPublic, UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() dto: CreateUserDto): Promise<UserPublic> {
    return this.usersService.create(dto);
  }

  @Get()
  findAll(): Promise<UserPublic[]> {
    return this.usersService.findAll();
  }
}
