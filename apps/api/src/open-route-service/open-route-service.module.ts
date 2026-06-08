import { Module } from '@nestjs/common';

import { OpenRouteServiceController } from './controller/open-route-service.controller';
import { OpenRouteServiceService } from './service/open-route-service.service';

@Module({
  controllers: [OpenRouteServiceController],
  providers: [OpenRouteServiceService],
  exports: [OpenRouteServiceService],
})
export class OpenRouteServiceModule {}
