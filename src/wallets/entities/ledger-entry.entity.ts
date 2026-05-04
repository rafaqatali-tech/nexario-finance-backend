import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Wallet } from './wallet.entity';

export enum LedgerEntryType {
  CREDIT = 'credit',
  DEBIT = 'debit',
}

export enum LedgerEntryReferenceType {
  PAYMENT = 'payment',
  EXPENSE = 'expense',
}

@Entity({ name: 'ledger_entries' })
export class LedgerEntry {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @ManyToOne(() => Wallet, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'wallet_id' })
  wallet!: Wallet;

  @RelationId((entry: LedgerEntry) => entry.wallet)
  walletId!: string;

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

  @Column({
    type: 'enum',
    enum: LedgerEntryType,
    enumName: 'ledger_entry_type_enum',
    name: 'type',
  })
  type!: LedgerEntryType;

  @Column({
    type: 'enum',
    enum: LedgerEntryReferenceType,
    enumName: 'ledger_entry_reference_type_enum',
    name: 'reference_type',
  })
  referenceType!: LedgerEntryReferenceType;

  @Column({ type: 'varchar', name: 'reference_id' })
  referenceId!: string;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;
}
