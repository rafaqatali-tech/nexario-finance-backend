import { IsEnum, IsNumber, IsString, Min, MinLength } from 'class-validator';
import { ProjectStatus } from '../entities/project.entity';

export class CreateProjectDto {
  @IsString()
  @MinLength(1)
  name!: string;

  @IsString()
  @MinLength(1)
  clientName!: string;

  @IsNumber()
  @Min(0)
  totalValue!: number;

  @IsEnum(ProjectStatus)
  status!: ProjectStatus;
}
