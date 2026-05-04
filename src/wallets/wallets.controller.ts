import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { Wallet } from './entities/wallet.entity';
import { WalletsService } from './wallets.service';

@Controller('wallets')
export class WalletsController {
  constructor(private readonly walletsService: WalletsService) {}

  @Post()
  create(@Body() dto: CreateWalletDto): Promise<Wallet> {
    return this.walletsService.create(dto);
  }

  @Get()
  findAll(): Promise<Wallet[]> {
    return this.walletsService.findAll();
  }

  @Get(':id/balance')
  getBalance(
    @Param('id') id: string,
  ): Promise<{ walletId: string; balance: number }> {
    return this.walletsService.getWalletBalance(id);
  }
}
