import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  RelationId,
} from 'typeorm';
import { Wallet } from '../../wallets/entities/wallet.entity';

export enum ExpenseCategory {
  RENT = 'rent',
  SALARY = 'salary',
  TOOLS = 'tools',
  MISC = 'misc',
}

@Entity({ name: 'expenses' })
export class Expense {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar' })
  title!: string;

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
    enum: ExpenseCategory,
    enumName: 'expense_category_enum',
  })
  category!: ExpenseCategory;

  @ManyToOne(() => Wallet, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'paid_by_wallet_id' })
  paidByWallet!: Wallet;

  @RelationId((expense: Expense) => expense.paidByWallet)
  paidByWalletId!: string;

  @Column({ type: 'timestamp', name: 'date' })
  date!: Date;

  @CreateDateColumn({
    type: 'timestamp',
    name: 'created_at',
    default: () => 'CURRENT_TIMESTAMP',
  })
  createdAt!: Date;
}
