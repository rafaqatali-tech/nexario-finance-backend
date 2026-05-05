import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { Project } from '../projects/entities/project.entity';
import { LedgerEntryReferenceType } from '../wallets/entities/ledger-entry.entity';
import { Wallet } from '../wallets/entities/wallet.entity';
import { LedgerService } from '../wallets/ledger.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(Project)
    private readonly projectsRepository: Repository<Project>,
    @InjectRepository(Wallet)
    private readonly walletsRepository: Repository<Wallet>,
    private readonly ledgerService: LedgerService,
  ) {}

  async create(dto: CreatePaymentDto): Promise<Payment> {
    const project = await this.projectsRepository.findOne({
      where: { id: dto.projectId },
    });
    if (!project) {
      throw new NotFoundException('Project not found');
    }

    const wallet = await this.walletsRepository.findOne({
      where: { id: dto.receivedByWalletId },
    });
    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const payment = this.paymentsRepository.create({
      project,
      receivedByWallet: wallet,
      amount: dto.amount,
      date: new Date(dto.date),
    });

    const saved = await this.paymentsRepository.save(payment);

    try {
      await this.ledgerService.credit(
        dto.receivedByWalletId,
        dto.amount,
        LedgerEntryReferenceType.PAYMENT,
        saved.id,
      );
    } catch (err) {
      this.logger.warn(
        `Payment ${saved.id} rolled back: ledger credit failed — ${String(err)}`,
      );
      await this.paymentsRepository.remove(saved);
      throw err;
    }

    this.logger.log(
      `Payment created id=${saved.id} amount=${dto.amount} wallet=${dto.receivedByWalletId} project=${dto.projectId}`,
    );
    const created = await this.paymentsRepository.findOne({
      where: { id: saved.id },
      relations: ['project', 'receivedByWallet'],
    });
    if (!created) {
      throw new NotFoundException('Payment not found after creation');
    }
    return created;
  }

  async findAll(page = 1, limit = 10): Promise<PaginatedResult<Payment>> {
    const [results, total] = await this.paymentsRepository.findAndCount({
      relations: ['project', 'receivedByWallet'],
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
