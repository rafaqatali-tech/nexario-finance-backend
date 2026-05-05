import { IsDateString, IsNumber, IsUUID, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePaymentDto {
  @ApiProperty({
    description: 'Project id for this payment',
    example: '4bab3f31-7992-4192-b16c-1ae95df65f3e',
  })
  @IsUUID()
  projectId!: string;

  @ApiProperty({
    description: 'Payment amount',
    example: 5000,
  })
  @IsNumber()
  @Min(0.01)
  amount!: number;

  @ApiProperty({
    description: 'Wallet id that receives this payment',
    example: '581d788e-dc8b-4dd4-b959-f726b12ea310',
  })
  @IsUUID()
  receivedByWalletId!: string;

  @ApiProperty({
    description: 'Transaction date in ISO-8601 format',
    example: '2026-05-04T12:00:00.000Z',
  })
  @IsDateString()
  date!: string;
}
