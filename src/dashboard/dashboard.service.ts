import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Expense } from '../expenses/entities/expense.entity';
import { Payment } from '../payments/entities/payment.entity';
import { LedgerEntryType } from '../wallets/entities/ledger-entry.entity';
import { Wallet } from '../wallets/entities/wallet.entity';

interface WalletBalanceItem {
  wallet: string;
  balance: number;
}

export interface DashboardSummary {
  totalRevenue: number;
  totalExpenses: number;
  net: number;
  walletBalances: WalletBalanceItem[];
}

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(Expense)
    private readonly expensesRepository: Repository<Expense>,
    @InjectRepository(Wallet)
    private readonly walletsRepository: Repository<Wallet>,
  ) {}

  async getSummary(): Promise<DashboardSummary> {
    const revenueRaw = await this.paymentsRepository
      .createQueryBuilder('payment')
      .select('COALESCE(SUM(payment.amount), 0)', 'totalRevenue')
      .getRawOne<{ totalRevenue: string }>();

    const expensesRaw = await this.expensesRepository
      .createQueryBuilder('expense')
      .select('COALESCE(SUM(expense.amount), 0)', 'totalExpenses')
      .getRawOne<{ totalExpenses: string }>();

    const walletBalancesRaw = await this.walletsRepository
      .createQueryBuilder('wallet')
      .leftJoin('ledger_entries', 'entry', 'entry.wallet_id = wallet.id')
      .select('wallet.name', 'wallet')
      .addSelect(
        `COALESCE(SUM(CASE WHEN entry.type = :creditType THEN entry.amount ELSE -entry.amount END), 0)`,
        'balance',
      )
      .groupBy('wallet.id')
      .addGroupBy('wallet.name')
      .setParameter('creditType', LedgerEntryType.CREDIT)
      .orderBy('wallet.name', 'ASC')
      .getRawMany<{ wallet: string; balance: string }>();

    const totalRevenue = Number(revenueRaw?.totalRevenue ?? 0);
    const totalExpenses = Number(expensesRaw?.totalExpenses ?? 0);
    const walletBalances = walletBalancesRaw.map((row) => ({
      wallet: row.wallet,
      balance: Number(row.balance ?? 0),
    }));

    return {
      totalRevenue,
      totalExpenses,
      net: totalRevenue - totalExpenses,
      walletBalances,
    };
  }
}
