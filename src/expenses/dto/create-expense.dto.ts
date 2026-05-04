import { IsDateString, IsEnum, IsNumber, IsString, IsUUID, Min, MinLength } from 'class-validator';
import { ExpenseCategory } from '../entities/expense.entity';

export class CreateExpenseDto {
  @IsString()
  @MinLength(1)
  title!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsEnum(ExpenseCategory)
  category!: ExpenseCategory;

  @IsUUID()
  paidByWalletId!: string;

  @IsDateString()
  date!: string;
}
