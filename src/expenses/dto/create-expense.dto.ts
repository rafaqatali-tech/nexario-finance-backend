import { IsDateString, IsEnum, IsNumber, IsString, IsUUID, Min, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ExpenseCategory } from '../entities/expense.entity';

export class CreateExpenseDto {
  @ApiProperty({
    description: 'Expense title',
    example: 'Office rent',
  })
  @IsString()
  @MinLength(1)
  title!: string;

  @ApiProperty({
    description: 'Expense amount',
    example: 1000,
  })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({
    description: 'Expense category',
    enum: ExpenseCategory,
    example: ExpenseCategory.RENT,
  })
  @IsEnum(ExpenseCategory)
  category!: ExpenseCategory;

  @ApiProperty({
    description: 'Wallet id used to pay this expense',
    example: '581d788e-dc8b-4dd4-b959-f726b12ea310',
  })
  @IsUUID()
  paidByWalletId!: string;

  @ApiProperty({
    description: 'Expense transaction date in ISO-8601 format',
    example: '2026-05-04T12:00:00.000Z',
  })
  @IsDateString()
  date!: string;
}
