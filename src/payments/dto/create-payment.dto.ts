import { IsDateString, IsNumber, IsUUID, Min } from 'class-validator';

export class CreatePaymentDto {
  @IsUUID()
  projectId!: string;

  @IsNumber()
  @Min(0.01)
  amount!: number;

  @IsUUID()
  receivedByWalletId!: string;

  @IsDateString()
  date!: string;
}
