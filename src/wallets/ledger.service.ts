import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  LedgerEntry,
  LedgerEntryReferenceType,
  LedgerEntryType,
} from './entities/ledger-entry.entity';
import { Wallet } from './entities/wallet.entity';

@Injectable()
export class LedgerService {
  constructor(
    @InjectRepository(LedgerEntry)
    private readonly ledgerEntriesRepository: Repository<LedgerEntry>,
    @InjectRepository(Wallet)
    private readonly walletsRepository: Repository<Wallet>,
  ) {}

  async credit(
    walletId: string,
    amount: number,
    referenceType: LedgerEntryReferenceType,
    referenceId: string,
  ): Promise<LedgerEntry> {
    return this.createEntry(
      walletId,
      amount,
      LedgerEntryType.CREDIT,
      referenceType,
      referenceId,
    );
  }

  async debit(
    walletId: string,
    amount: number,
    referenceType: LedgerEntryReferenceType,
    referenceId: string,
  ): Promise<LedgerEntry> {
    return this.createEntry(
      walletId,
      amount,
      LedgerEntryType.DEBIT,
      referenceType,
      referenceId,
    );
  }

  private async createEntry(
    walletId: string,
    amount: number,
    type: LedgerEntryType,
    referenceType: LedgerEntryReferenceType,
    referenceId: string,
  ): Promise<LedgerEntry> {
    if (amount <= 0) {
      throw new BadRequestException('Amount must be greater than 0');
    }

    const wallet = await this.walletsRepository.findOne({ where: { id: walletId } });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const entry = this.ledgerEntriesRepository.create({
      wallet,
      amount,
      type,
      referenceType,
      referenceId,
    });

    return this.ledgerEntriesRepository.save(entry);
  }
}
