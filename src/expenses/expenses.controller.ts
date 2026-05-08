import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { Expose, plainToInstance, Type } from 'class-transformer';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiProperty,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { ApiPaginatedResponse } from '../common/decorators/api-paginated-response.decorator';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { UserRole } from '../users/entities/user.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { Expense } from './entities/expense.entity';
import { ExpensesService } from './expenses.service';

class ExpenseWalletResponseItem {
  @Expose()
  @ApiProperty({ example: '581d788e-dc8b-4dd4-b959-f726b12ea310' })
  id!: string;

  @Expose()
  @ApiProperty({ example: 'Zeeshan Wallet' })
  name!: string;

  @Expose()
  @ApiProperty({ example: 'partner' })
  type!: string;
}

class ExpenseResponseItem {
  @Expose()
  @ApiProperty({ example: 'a47995e8-dd2c-4ece-82a1-85c71c5072a3' })
  id!: string;

  @Expose()
  @ApiProperty({ example: 'Office rent' })
  title!: string;

  @Expose()
  @ApiProperty({ example: 1000 })
  amount!: number;

  @Expose()
  @ApiProperty({ example: 'USD' })
  currency!: 'USD';

  @Expose()
  @ApiProperty({ example: 'rent' })
  category!: string;

  @Expose()
  @ApiProperty({ example: '2026-05-04T12:00:00.000Z' })
  transactionDate!: Date;

  @Expose()
  @ApiProperty({ type: ExpenseWalletResponseItem })
  @Type(() => ExpenseWalletResponseItem)
  wallet!: ExpenseWalletResponseItem;

  @Expose()
  @ApiProperty({ example: '2026-05-04T12:28:44.913Z' })
  createdAt!: Date;
}

@ApiTags('Expenses')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.PARTNER)
@Controller('expenses')
export class ExpensesController {
  constructor(private readonly expensesService: ExpensesService) {}

  @ApiOperation({ summary: 'Create an expense and ledger debit entry' })
  @Post()
  async create(@Body() dto: CreateExpenseDto): Promise<ExpenseResponseItem> {
    const expense = await this.expensesService.create(dto);
    return this.toExpenseResponse(expense);
  }

  @ApiOperation({ summary: 'List expenses with pagination' })
  @ApiPaginatedResponse(ExpenseResponseItem)
  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ): Promise<PaginatedResult<ExpenseResponseItem>> {
    const paginated = await this.expensesService.findAll(
      Number.parseInt(page, 10) || 1,
      Number.parseInt(limit, 10) || 10,
    );
    return {
      ...paginated,
      results: paginated.results.map((item) => this.toExpenseResponse(item)),
    };
  }

  private toExpenseResponse(expense: Expense): ExpenseResponseItem {
    return plainToInstance(
      ExpenseResponseItem,
      {
        id: expense.id,
        title: expense.title,
        amount: expense.amount,
        currency: 'USD',
        category: expense.category,
        transactionDate: expense.date,
        wallet: {
          id: expense.paidByWallet.id,
          name: expense.paidByWallet.name,
          type: expense.paidByWallet.type,
        },
        createdAt: expense.createdAt,
      },
      { excludeExtraneousValues: true },
    );
  }
}
