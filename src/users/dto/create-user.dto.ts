import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    description: 'First name of the user',
    example: 'Rafaqat',
  })
  @IsString()
  @MinLength(1)
  firstName!: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Ali',
  })
  @IsString()
  @MinLength(1)
  lastName!: string;

  @ApiProperty({
    description: 'Email address of the user',
    example: 'zeeshan@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'Password for user authentication',
    example: 'StrongPass123',
  })
  @IsString()
  @MinLength(8)
  password!: string;

  @ApiPropertyOptional({
    description: 'Role of the user in the system',
    enum: UserRole,
    example: UserRole.PARTNER,
    default: UserRole.PARTNER,
  })
  @IsOptional()
  @IsEnum(UserRole)
  role?: UserRole;
}
