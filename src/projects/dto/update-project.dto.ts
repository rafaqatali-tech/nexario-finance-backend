import { IsEnum, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ProjectStatus } from '../entities/project.entity';

export class UpdateProjectDto {
  @ApiPropertyOptional({
    description: 'Updated project name',
    example: 'Finance Dashboard Revamp',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  name?: string;

  @ApiPropertyOptional({
    description: 'Updated client name',
    example: 'AHF',
  })
  @IsOptional()
  @IsString()
  @MinLength(1)
  clientName?: string;

  @ApiPropertyOptional({
    description: 'Updated total project value',
    example: 12000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  totalValue?: number;

  @ApiPropertyOptional({
    description: 'Updated project status',
    enum: ProjectStatus,
    example: ProjectStatus.COMPLETED,
  })
  @IsOptional()
  @IsEnum(ProjectStatus)
  status?: ProjectStatus;
}
