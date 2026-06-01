import { Body, Controller, Headers, Post, Query } from '@nestjs/common';

import { MercadoPagoService } from '../service/mercado-pago.service';

type MercadoPagoWebhookBody = {
  type?: string;
  data?: {
    id?: string;
  };
};

@Controller('mercado-pago')
export class MercadoPagoController {
  constructor(private readonly mercadoPagoService: MercadoPagoService) {}

  @Post('webhook')
  async webhook(
    @Body() body: MercadoPagoWebhookBody,
    @Query('type') typeQuery: string | undefined,
    @Query('data.id') dataIdQuery: string | undefined,
    @Headers('x-signature') signature: string | undefined,
    @Headers('x-request-id') requestId: string | undefined,
  ): Promise<{ received: boolean }> {
    await this.mercadoPagoService.handleWebhook(
      dataIdQuery ?? body.data?.id,
      typeQuery ?? body.type,
      signature,
      requestId,
    );

    return { received: true };
  }
}
