import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { DashboardService, DashboardSummary } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @ApiOperation({
    summary:
      'Get dashboard summary with revenue, expenses, net, and wallet balances',
  })
  @Get()
  getDashboard(): Promise<DashboardSummary> {
    return this.dashboardService.getSummary();
  }
}
