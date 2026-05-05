import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { LedgerEntryReferenceType } from '../wallets/entities/ledger-entry.entity';
import { Wallet } from '../wallets/entities/wallet.entity';
import { LedgerService } from '../wallets/ledger.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { Expense } from './entities/expense.entity';

@Injectable()
export class ExpensesService {
  private readonly logger = new Logger(ExpensesService.name);

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
      this.logger.warn(
        `Expense ${saved.id} rolled back: ledger debit failed — ${String(err)}`,
      );
      await this.expensesRepository.remove(saved);
      throw err;
    }

    this.logger.log(
      `Expense created id=${saved.id} amount=${dto.amount} category=${dto.category} wallet=${dto.paidByWalletId}`,
    );
    const created = await this.expensesRepository.findOne({
      where: { id: saved.id },
      relations: ['paidByWallet'],
    });
    if (!created) {
      throw new NotFoundException('Expense not found after creation');
    }
    return created;
  }

  async findAll(page = 1, limit = 10): Promise<PaginatedResult<Expense>> {
    const [results, total] = await this.expensesRepository.findAndCount({
      relations: ['paidByWallet'],
      skip: (page - 1) * limit,
      take: limit,
      order: { date: 'DESC', createdAt: 'DESC' },
    });
    return {
      results,
      total,
      page,
      limit,
    };
  }
}
