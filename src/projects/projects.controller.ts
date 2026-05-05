import { Body, Controller, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';
import { Expose, plainToInstance } from 'class-transformer';
import { ApiOperation, ApiProperty, ApiTags } from '@nestjs/swagger';
import { ApiPaginatedResponse } from '../common/decorators/api-paginated-response.decorator';
import { PaginatedResult } from '../common/interfaces/paginated-result.interface';
import { CreateProjectDto } from './dto/create-project.dto';
import { UpdateProjectDto } from './dto/update-project.dto';
import { Project } from './entities/project.entity';
import { ProjectsService } from './projects.service';

class ProjectResponseItem {
  @Expose()
  @ApiProperty({ example: '4bab3f31-7992-4192-b16c-1ae95df65f3e' })
  id!: string;

  @Expose()
  @ApiProperty({ example: 'Website Revamp' })
  name!: string;

  @Expose()
  @ApiProperty({ example: 'Asian Hockey Federation' })
  clientName!: string;

  @Expose()
  @ApiProperty({ example: 10000 })
  totalValue!: number;

  @Expose()
  @ApiProperty({ example: 'USD' })
  currency!: 'USD';

  @Expose()
  @ApiProperty({ example: 'active' })
  status!: string;

  @Expose()
  @ApiProperty({ example: '2026-05-04T12:28:44.913Z' })
  createdAt!: Date;
}

@ApiTags('Projects')
@Controller('projects')
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @ApiOperation({ summary: 'Create a project' })
  @Post()
  async create(@Body() dto: CreateProjectDto): Promise<ProjectResponseItem> {
    const project = await this.projectsService.create(dto);
    return this.toProjectResponse(project);
  }

  @ApiOperation({ summary: 'List projects with pagination' })
  @ApiPaginatedResponse(ProjectResponseItem)
  @Get()
  async findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
  ): Promise<PaginatedResult<ProjectResponseItem>> {
    const paginated = await this.projectsService.findAll(
      Number.parseInt(page, 10) || 1,
      Number.parseInt(limit, 10) || 10,
    );
    return {
      ...paginated,
      results: paginated.results.map((item) => this.toProjectResponse(item)),
    };
  }

  @ApiOperation({ summary: 'Get project by id' })
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<ProjectResponseItem> {
    const project = await this.projectsService.findOne(id);
    return this.toProjectResponse(project);
  }

  @ApiOperation({ summary: 'Update project by id' })
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateProjectDto,
  ): Promise<ProjectResponseItem> {
    const project = await this.projectsService.update(id, dto);
    return this.toProjectResponse(project);
  }

  @ApiOperation({ summary: 'Delete project by id' })
  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ success: true }> {
    await this.projectsService.remove(id);
    return { success: true };
  }

  private toProjectResponse(project: Project): ProjectResponseItem {
    return plainToInstance(
      ProjectResponseItem,
      {
        id: project.id,
        name: project.name,
        clientName: project.clientName,
        totalValue: project.totalValue,
        currency: 'USD',
        status: project.status,
        createdAt: project.createdAt,
      },
      { excludeExtraneousValues: true },
    );
  }
}
