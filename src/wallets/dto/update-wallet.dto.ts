import {
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
  MinLength,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { WalletType } from '../entities/wallet.entity';

export class UpdateWalletDto {
  @ApiPropertyOptional({
    description: 'Updated wallet name',
    example: 'Company Wallet',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated wallet type',
    enum: WalletType,
    example: WalletType.COMPANY,
  })
  @IsOptional()
  @IsEnum(WalletType)
  type?: WalletType;

  @ApiPropertyOptional({
    description: 'Updated owner id, set null to detach owner',
    example: 'a47995e8-dd2c-4ece-82a1-85c71c5072a3',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  ownerId?: string | null;
}
