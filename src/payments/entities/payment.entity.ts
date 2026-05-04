import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Project } from '../../projects/entities/project.entity';
import { Wallet } from '../../wallets/entities/wallet.entity';

@Entity({ name: 'payments' })
export class Payment {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Project, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'project_id' })
  project!: Project;

  @RelationId((payment: Payment) => payment.project)
  projectId!: string;

  @Column({
    type: 'numeric',
    precision: 18,
    scale: 2,
    transformer: {
      to: (value: number) => value,
      from: Number,
    },
  })
  amount!: number;

  @ManyToOne(() => Wallet, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'received_by_wallet_id' })
  receivedByWallet!: Wallet;

  @RelationId((payment: Payment) => payment.receivedByWallet)
  receivedByWalletId!: string;

  @Column({ type: 'timestamp', name: 'date' })
  date!: Date;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;
}
