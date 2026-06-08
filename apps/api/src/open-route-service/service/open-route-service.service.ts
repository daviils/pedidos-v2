import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

type OpenRouteServiceGeocodeResponse = {
  features?: {
    geometry?: {
      coordinates?: [number, number];
    };
    properties?: {
      label?: string;
    };
  }[];
};

export type GeocodeAddressResponse = {
  address: string;
  latitude: number;
  longitude: number;
};

@Injectable()
export class OpenRouteServiceService {
  private readonly baseUrl =
    process.env.OPEN_ROUTE_SERVICE_API_URL ??
    'https://api.openrouteservice.org';

  async geocodeAddress(address: string): Promise<GeocodeAddressResponse> {
    const normalizedAddress = address?.trim();

    if (!normalizedAddress) {
      throw new BadRequestException('Endereco obrigatorio');
    }

    const response =
      await this.request<OpenRouteServiceGeocodeResponse>(
        `/geocode/search?text=${encodeURIComponent(normalizedAddress)}`,
      );
    const [feature] = response.features ?? [];
    const [longitude, latitude] = feature?.geometry?.coordinates ?? [];

    if (latitude === undefined || longitude === undefined) {
      throw new NotFoundException('Endereco nao encontrado');
    }

    return {
      address: feature?.properties?.label ?? normalizedAddress,
      latitude,
      longitude,
    };
  }

  private async request<T>(path: string): Promise<T> {
    const apiKey = process.env.OPEN_ROUTE_SERVICE_API_KEY;

    if (!apiKey) {
      throw new InternalServerErrorException(
        'OPEN_ROUTE_SERVICE_API_KEY nao configurado',
      );
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      headers: {
        Authorization: apiKey,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const message = await response.text();

      throw new BadGatewayException(
        `Erro ao comunicar com OpenRouteService: ${message}`,
      );
    }

    return response.json() as Promise<T>;
  }
}
