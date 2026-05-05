import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { User } from '../users/entities/user.entity';
import { CreateWalletDto } from './dto/create-wallet.dto';
import { UpdateWalletDto } from './dto/update-wallet.dto';
import { LedgerEntry } from './entities/ledger-entry.entity';
import { Wallet } from './entities/wallet.entity';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(Wallet)
    private readonly walletsRepository: Repository<Wallet>,
    @InjectRepository(LedgerEntry)
    private readonly ledgerEntriesRepository: Repository<LedgerEntry>,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) {}

  async create(dto: CreateWalletDto): Promise<Wallet> {
    const owner = dto.ownerId
      ? await this.usersRepository.findOne({ where: { id: dto.ownerId } })
      : null;
    const wallet = this.walletsRepository.create({
      name: dto.name,
      type: dto.type,
      owner,
    });
    const saved = await this.walletsRepository.save(wallet);
    return this.findOne(saved.id);
  }

  async findAll(page = 1, limit = 10): Promise<PaginatedResult<Wallet>> {
    const [results, total] = await this.walletsRepository.findAndCount({
      relations: ['owner'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    return {
      results,
      total,
      page,
      limit,
    };
  }

  async findOne(id: string): Promise<Wallet> {
    const wallet = await this.walletsRepository.findOne({
      where: { id },
      relations: ['owner'],
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }
    return wallet;
  }

  async update(id: string, dto: UpdateWalletDto): Promise<Wallet> {
    const wallet = await this.findOne(id);
    if (dto.ownerId === null) {
      wallet.owner = null;
    } else if (dto.ownerId !== undefined) {
      const owner = await this.usersRepository.findOne({
        where: { id: dto.ownerId },
      });
      if (!owner) {
        throw new NotFoundException('Owner user not found');
      }
      wallet.owner = owner;
    }
    if (dto.name !== undefined) {
      wallet.name = dto.name;
    }
    if (dto.type !== undefined) {
      wallet.type = dto.type;
    }
    return this.walletsRepository.save(wallet);
  }

  async remove(id: string): Promise<void> {
    const wallet = await this.findOne(id);
    await this.walletsRepository.remove(wallet);
  }

  async getWalletBalance(
    walletId: string,
  ): Promise<{ walletId: string; balance: number }> {
    await this.findOne(walletId);

    const result = await this.ledgerEntriesRepository
      .createQueryBuilder('entry')
      .select(
        "COALESCE(SUM(CASE WHEN entry.type = 'credit' THEN entry.amount ELSE -entry.amount END), 0)",
        'balance',
      )
      .where('entry.wallet_id = :walletId', { walletId })
      .getRawOne<{ balance: string }>();

    return {
      walletId,
      balance: Number(result?.balance ?? 0),
    };
  }
}
