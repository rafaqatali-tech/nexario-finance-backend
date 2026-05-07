import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'User email',
    example: 'zeeshan@example.com',
  })
  @IsEmail()
  email!: string;

  @ApiProperty({
    description: 'User password',
    example: 'StrongPass123',
  })
  @IsString()
  @MinLength(1)
  password!: string;
}
