import { Body, Controller, Get, Param, Post, Query } from '@nestjs/common';
import { Expose, plainToInstance, Type } from 'class-transformer';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../common/decorators/api-paginated-response.decorator';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { Wallet } from './entities/wallet.entity';
import { WalletsService } from './wallets.service';

class WalletOwnerResponseItem {
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
}

class WalletResponseItem {
  @Expose()
  @ApiProperty({ example: '581d788e-dc8b-4dd4-b959-f726b12ea310' })
  id!: string;

  @Expose()
  @ApiProperty({ example: 'Zeeshan Wallet' })
  name!: string;

  @Expose()
  @ApiProperty({ example: 'partner' })
  type!: string;

  @Expose()
  @ApiProperty({ type: WalletOwnerResponseItem, nullable: true })
  @Type(() => WalletOwnerResponseItem)
  owner!: WalletOwnerResponseItem | null;

  @Expose()
  @ApiProperty({ example: '2026-05-04T12:28:44.913Z' })
  createdAt!: Date;
}

@ApiTags('Wallets')
@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @ApiOperation({ summary: 'Create a wallet' })
  @Post()
  async create(@Body() dto: CreateWalletDto): Promise<WalletResponseItem> {
    const wallet = await this.walletsService.create(dto);
    return this.toWalletResponse(wallet);
  }

  @ApiOperation({ summary: 'List wallets with pagination' })
  @ApiPaginatedResponse(WalletResponseItem)
  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ): Promise<PaginatedResult<WalletResponseItem>> {
    const paginated = await this.walletsService.findAll(
      Number.parseInt(page, 10) || 1,
      Number.parseInt(limit, 10) || 10,
    );
    return {
      ...paginated,
      results: paginated.results.map((item) => this.toWalletResponse(item)),
    };
  }

  @ApiOperation({ summary: 'Get computed wallet balance from ledger' })
  @Get(':id/balance')
  async getBalance(
    @Param('id') id: string,
  ): Promise<{ walletId: string; balance: number; currency: 'USD' }> {
    const result = await this.walletsService.getWalletBalance(id);
    return {
      ...result,
      currency: 'USD',
    };
  }

  private toWalletResponse(wallet: Wallet): WalletResponseItem {
    return plainToInstance(
      WalletResponseItem,
      {
        id: wallet.id,
        name: wallet.name,
        type: wallet.type,
        owner: wallet.owner
          ? {
              id: wallet.owner.id,
              name: `${wallet.owner.firstName} ${wallet.owner.lastName}`.trim(),
              email: wallet.owner.email,
              role: wallet.owner.role,
            }
          : null,
        createdAt: wallet.createdAt,
      },
      { excludeExtraneousValues: true },
    );
  }
}
