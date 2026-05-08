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
import { CreatePaymentDto } from './dto/create-payment.dto';
import { Payment } from './entities/payment.entity';
import { PaymentsService } from './payments.service';

class PaymentProjectResponseItem {
  @Expose()
  @ApiProperty({ example: '4bab3f31-7992-4192-b16c-1ae95df65f3e' })
  id!: string;

  @Expose()
  @ApiProperty({ example: 'Website Revamp' })
  name!: string;

  @Expose()
  @ApiProperty({ example: 'active' })
  status!: string;
}

class PaymentWalletResponseItem {
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

class PaymentResponseItem {
  @Expose()
  @ApiProperty({ example: '9fbe58fa-89ac-4976-9669-16185ecdf9ea' })
  id!: string;

  @Expose()
  @ApiProperty({ example: 5000 })
  amount!: number;

  @Expose()
  @ApiProperty({ example: 'USD' })
  currency!: 'USD';

  @Expose()
  @ApiProperty({ example: '2026-05-04T12:00:00.000Z' })
  transactionDate!: Date;

  @Expose()
  @ApiProperty({ type: PaymentProjectResponseItem })
  @Type(() => PaymentProjectResponseItem)
  project!: PaymentProjectResponseItem;

  @Expose()
  @ApiProperty({ type: PaymentWalletResponseItem })
  @Type(() => PaymentWalletResponseItem)
  wallet!: PaymentWalletResponseItem;

  @Expose()
  @ApiProperty({ example: '2026-05-04T12:28:44.913Z' })
  createdAt!: Date;
}

@ApiTags('Payments')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.PARTNER)
@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @ApiOperation({ summary: 'Create a payment and ledger credit entry' })
  @Post()
  async create(@Body() dto: CreatePaymentDto): Promise<PaymentResponseItem> {
    const payment = await this.paymentsService.create(dto);
    return this.toPaymentResponse(payment);
  }

  @ApiOperation({ summary: 'List payments with pagination' })
  @ApiPaginatedResponse(PaymentResponseItem)
  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ): Promise<PaginatedResult<PaymentResponseItem>> {
    const paginated = await this.paymentsService.findAll(
      Number.parseInt(page, 10) || 1,
      Number.parseInt(limit, 10) || 10,
    );
    return {
      ...paginated,
      results: paginated.results.map((item) => this.toPaymentResponse(item)),
    };
  }

  private toPaymentResponse(payment: Payment): PaymentResponseItem {
    return plainToInstance(
      PaymentResponseItem,
      {
        id: payment.id,
        amount: payment.amount,
        currency: 'USD',
        transactionDate: payment.date,
        project: {
          id: payment.project.id,
          name: payment.project.name,
          status: payment.project.status,
        },
        wallet: {
          id: payment.receivedByWallet.id,
          name: payment.receivedByWallet.name,
          type: payment.receivedByWallet.type,
        },
        createdAt: payment.createdAt,
      },
      { excludeExtraneousValues: true },
    );
  }
}
