import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { LedgerEntryReferenceType } from '../wallets/entities/ledger-entry.entity';
import { Wallet } from '../wallets/entities/wallet.entity';
import { LedgerService } from '../wallets/ledger.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { Expense } from './entities/expense.entity';
// Logger 
@Injectable()
export class ExpensesService {
  constructor(
    @InjectRepository(Expense)
    private readonly expensesRepository: Repository<Expense>,
    @InjectRepository(Wallet)
    private readonly walletsRepository: Repository<Wallet>,
    private readonly ledgerService: LedgerService,
  ) {}

  async create(dto: CreateExpenseDto): Promise<Expense> {
    const wallet = await this.walletsRepository.findOne({
      where: { id: dto.paidByWalletId },
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const expense = this.expensesRepository.create({
      title: dto.title,
      amount: dto.amount,
      category: dto.category,
      paidByWallet: wallet,
      date: new Date(dto.date),
    });
    const saved = await this.expensesRepository.save(expense);

    try {
      await this.ledgerService.debit(
        dto.paidByWalletId,
        dto.amount,
        LedgerEntryReferenceType.EXPENSE,
        saved.id,
      );
    } catch (err) {
      await this.expensesRepository.remove(saved);
      throw err;
    }

    return saved;
  }

  async findAll(): Promise<Expense[]> {
    return this.expensesRepository.find({
      relations: ['paidByWallet'],
      order: { date: 'DESC', createdAt: 'DESC' },
    });
  }
}
