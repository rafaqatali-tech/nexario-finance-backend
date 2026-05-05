import { IsEnum, IsNumber, IsString, Min, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ProjectStatus } from '../entities/project.entity';

export class CreateProjectDto {
  @ApiProperty({
    description: 'Project title',
    example: 'Website Revamp',
  })
  @IsString()
  @MinLength(1)
  name!: string;

  @ApiProperty({
    description: 'Client name for the project',
    example: 'Asian Hockey Federation',
  })
  @IsString()
  @MinLength(1)
  clientName!: string;

  @ApiProperty({
    description: 'Total project value',
    example: 10000,
  })
  @IsNumber()
  @Min(0)
  totalValue!: number;

  @ApiProperty({
    description: 'Current project status',
    enum: ProjectStatus,
    example: ProjectStatus.ACTIVE,
  })
  @IsEnum(ProjectStatus)
  status!: ProjectStatus;
}
