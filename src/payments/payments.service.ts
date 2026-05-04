import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Project } from '../projects/entities/project.entity';
import { LedgerEntryReferenceType } from '../wallets/entities/ledger-entry.entity';
import { Wallet } from '../wallets/entities/wallet.entity';
import { LedgerService } from '../wallets/ledger.service';
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from './entities/payment.entity';

@Injectable()
export class PaymentsService {
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
      await this.paymentsRepository.remove(saved);
      throw err;
    }

    return saved;
  }

  async findAll(): Promise<Payment[]> {
    return this.paymentsRepository.find({
      relations: ['project', 'receivedByWallet'],
      order: { date: 'DESC', createdAt: 'DESC' },
    });
  }
}
