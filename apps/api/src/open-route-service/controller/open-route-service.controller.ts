import { Controller, Get, Query } from '@nestjs/common';
import { ApiOkResponse, ApiQuery, ApiTags } from '@nestjs/swagger';

import {
  GeocodeAddressResponse,
  OpenRouteServiceService,
} from '../service/open-route-service.service';

@ApiTags('open-route-service')
@Controller('open-route-service')
export class OpenRouteServiceController {
  constructor(
    private readonly openRouteServiceService: OpenRouteServiceService,
  ) {}

  @Get('geocode')
  @ApiQuery({
    name: 'address',
    required: true,
    example: 'Avenida Paulista, 1000, Sao Paulo, SP',
  })
  @ApiOkResponse({
    description: 'Endereco convertido em coordenadas',
    schema: {
      type: 'object',
      properties: {
        address: {
          type: 'string',
          example: 'Avenida Paulista, Sao Paulo, Brasil',
        },
        latitude: {
          type: 'number',
          example: -23.561414,
        },
        longitude: {
          type: 'number',
          example: -46.655881,
        },
      },
    },
  })
  geocodeAddress(
    @Query('address') address: string,
  ): Promise<GeocodeAddressResponse> {
    return this.openRouteServiceService.geocodeAddress(address);
  }
}
