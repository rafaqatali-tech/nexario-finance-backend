import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { WalletType } from '../entities/wallet.entity';

export class CreateWalletDto {
  @ApiProperty({
    description: 'Display name for the wallet',
    example: 'Zeeshan Wallet',
  })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({
    description: 'Wallet type',
    enum: WalletType,
    example: WalletType.PARTNER,
  })
  @IsEnum(WalletType)
  type!: WalletType;

  @ApiPropertyOptional({
    description: 'Optional owner user id',
    example: 'a47995e8-dd2c-4ece-82a1-85c71c5072a3',
  })
  @IsOptional()
  @IsUUID()
  ownerId?: string;
}
