import { Controller, Get, HttpCode, HttpStatus, ServiceUnavailableException } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Public } from '../modules/auth/decorators/public.decorator';
import { HealthService } from './health.service';

/**
 * Kubernetes-style probes (SDLC §10.3):
 *   • GET /health  — full component report (used by dashboards / synthetic checks)
 *   • GET /health/live  — liveness (process is up)
 *   • GET /health/ready — readiness (dependencies reachable)
 */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly health: HealthService) {}

  @Public()
  @Get()
  @ApiOperation({ summary: 'Full health report' })
  check() {
    return this.health.check();
  }

  @Public()
  @Get('live')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Liveness probe' })
  live() {
    return { status: 'alive' };
  }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: 'Readiness probe' })
  async ready() {
    const ready = await this.health.isReady();
    if (!ready) {
      throw new ServiceUnavailableException('Dependencies not ready');
    }
    return { status: 'ready' };
  }
}
