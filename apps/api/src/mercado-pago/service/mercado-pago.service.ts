import {
  BadGatewayException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { In, Repository } from 'typeorm';

import { Subscription } from '../../subscription/entity/subscription.entity';
import {
  UserAdminSubscriptions,
  UserAdminSubscriptionStatus,
} from '../../user-admin/entity/user-admin-subscriptions.entity';
import { UserAdmin } from '../../user-admin/entity/user-admin.entity';
import { CreateMercadoPagoPreferenceInput } from '../dtos/create-mercado-pago-preference.input';
import { MercadoPagoPreference } from '../dtos/mercado-pago-preference.type';

type MercadoPagoPreferenceResponse = {
  id: string;
  init_point: string;
  sandbox_init_point?: string;
};

type MercadoPagoPaymentResponse = {
  id: number;
  status: string;
  external_reference?: string;
};

@Injectable()
export class MercadoPagoService {
  private readonly baseUrl =
    process.env.MERCADO_PAGO_API_URL ?? 'https://api.mercadopago.com';

  constructor(
    @InjectRepository(Subscription)
    private readonly subscriptionRepository: Repository<Subscription>,
    @InjectRepository(UserAdminSubscriptions)
    private readonly userAdminSubscriptionsRepository: Repository<UserAdminSubscriptions>,
  ) { }

  async createPreference(
    userAdmin: UserAdmin,
    data: CreateMercadoPagoPreferenceInput,
  ): Promise<MercadoPagoPreference> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { id: data.subscriptionId },
    });

    if (!subscription) {
      throw new NotFoundException('Subscription nao encontrada');
    }

    const activeUserAdminSubscription =
      await this.userAdminSubscriptionsRepository.findOne({
        where: {
          userAdminId: userAdmin.id,
          status: In([
            UserAdminSubscriptionStatus.Active,
            UserAdminSubscriptionStatus.Pending,
          ]),
        },
      });

    if (activeUserAdminSubscription) {
      throw new ConflictException(
        'Ja existe uma assinatura pendente ou ativa para este usuario',
      );
    }

    const userAdminSubscription =
      this.userAdminSubscriptionsRepository.create({
        id: randomUUID(),
        userAdminId: userAdmin.id,
        subscriptionsId: subscription.id,
        mercadoPagoId: '',
        status: UserAdminSubscriptionStatus.Pending,
      });

    const preferenceResponse =
      await this.createMercadoPagoCheckoutPreference(
        userAdmin,
        subscription,
        userAdminSubscription.id,
        data,
      );

    userAdminSubscription.mercadoPagoId = preferenceResponse.id;
    await this.userAdminSubscriptionsRepository.save(userAdminSubscription);

    return {
      id: preferenceResponse.id,
      initPoint: preferenceResponse.init_point,
      sandboxInitPoint: preferenceResponse.sandbox_init_point,
      userAdminSubscriptionId: userAdminSubscription.id,
    };
  }

  async findPendingPreference(
    userAdmin: UserAdmin,
  ): Promise<MercadoPagoPreference> {
    const userAdminSubscription =
      await this.userAdminSubscriptionsRepository.findOne({
        where: {
          userAdminId: userAdmin.id,
          status: UserAdminSubscriptionStatus.Pending,
        },
      });

    if (!userAdminSubscription) {
      throw new NotFoundException('Assinatura pendente nao encontrada');
    }

    const preferenceResponse = await this.getPreference(
      userAdminSubscription.mercadoPagoId,
    );

    return {
      id: preferenceResponse.id,
      initPoint: preferenceResponse.init_point,
      sandboxInitPoint: preferenceResponse.sandbox_init_point,
      userAdminSubscriptionId: userAdminSubscription.id,
    };
  }

  async handleWebhook(
    paymentId: string | undefined,
    type: string | undefined,
    signature: string | undefined,
    requestId: string | undefined,
  ): Promise<void> {
    if (!paymentId || type !== 'payment') {
      return;
    }

    if (!this.isWebhookSignatureValid(paymentId, signature, requestId)) {
      throw new BadGatewayException('Assinatura do Mercado Pago invalida');
    }

    const payment = await this.getPayment(paymentId);

    if (!payment.external_reference) {
      return;
    }

    const userAdminSubscription =
      await this.userAdminSubscriptionsRepository.findOne({
        where: { id: payment.external_reference },
      });

    if (!userAdminSubscription) {
      return;
    }

    userAdminSubscription.status = this.mapPaymentStatus(payment.status);
    await this.userAdminSubscriptionsRepository.save(userAdminSubscription);
  }

  private async createMercadoPagoCheckoutPreference(
    userAdmin: UserAdmin,
    subscription: Subscription,
    externalReference: string,
    data: CreateMercadoPagoPreferenceInput,
  ): Promise<MercadoPagoPreferenceResponse> {
    const backUrls = this.getBackUrls(data);
    const notificationUrl =
      data.notificationUrl ?? process.env.MERCADO_PAGO_NOTIFICATION_URL;

    const payload = {
      items: [
        {
          id: subscription.id,
          title: subscription.title,
          description: subscription.description,
          quantity: 1,
          currency_id: process.env.MERCADO_PAGO_CURRENCY_ID ?? 'BRL',
          unit_price: Number(subscription.price),
        },
      ],
      payer: {
        name: userAdmin.name,
        email: userAdmin.email,
      },
      external_reference: externalReference,
      ...(notificationUrl ? { notification_url: notificationUrl } : {}),
      ...(backUrls ? { back_urls: backUrls, auto_return: 'approved' } : {}),
    };

    return this.request<MercadoPagoPreferenceResponse>(
      '/checkout/preferences',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
  }

  private getPayment(paymentId: string): Promise<MercadoPagoPaymentResponse> {
    return this.request<MercadoPagoPaymentResponse>(`/v1/payments/${paymentId}`);
  }

  private getPreference(
    preferenceId: string,
  ): Promise<MercadoPagoPreferenceResponse> {
    return this.request<MercadoPagoPreferenceResponse>(
      `/checkout/preferences/${preferenceId}`,
    );
  }

  private async request<T>(path: string, init?: RequestInit): Promise<T> {
    const accessToken = process.env.MERCADO_PAGO_ACCESS_TOKEN;

    if (!accessToken) {
      throw new InternalServerErrorException(
        'MERCADO_PAGO_ACCESS_TOKEN nao configurado',
      );
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        ...init?.headers,
      },
    });

    if (!response.ok) {
      const message = await response.text();

      throw new BadGatewayException(
        `Erro ao comunicar com Mercado Pago: ${message}`,
      );
    }

    return response.json() as Promise<T>;
  }

  private getBackUrls(data: CreateMercadoPagoPreferenceInput) {
    const success =
      data.successUrl ?? process.env.MERCADO_PAGO_SUCCESS_URL ?? undefined;
    const failure =
      data.failureUrl ?? process.env.MERCADO_PAGO_FAILURE_URL ?? undefined;
    const pending =
      data.pendingUrl ?? process.env.MERCADO_PAGO_PENDING_URL ?? undefined;

    if (!success && !failure && !pending) {
      return undefined;
    }

    return {
      ...(success ? { success } : {}),
      ...(failure ? { failure } : {}),
      ...(pending ? { pending } : {}),
    };
  }

  private mapPaymentStatus(status: string): UserAdminSubscriptionStatus {
    if (status === 'approved') {
      return UserAdminSubscriptionStatus.Active;
    }

    if (status === 'expired') {
      return UserAdminSubscriptionStatus.Expired;
    }

    if (
      status === 'cancelled' ||
      status === 'canceled' ||
      status === 'refunded'
    ) {
      return UserAdminSubscriptionStatus.Cancelled;
    }

    if (status === 'charged_back' || status === 'rejected') {
      return UserAdminSubscriptionStatus.Cancelled;
    }

    return UserAdminSubscriptionStatus.Pending;
  }

  private isWebhookSignatureValid(
    paymentId: string,
    signature: string | undefined,
    requestId: string | undefined,
  ): boolean {
    const secret = process.env.MERCADO_PAGO_WEBHOOK_SECRET;

    if (!secret) {
      return true;
    }

    if (!signature || !requestId) {
      return false;
    }

    const signatureParts = Object.fromEntries(
      signature.split(',').map((part) => part.split('=')),
    );
    const timestamp = signatureParts.ts;
    const hash = signatureParts.v1;

    if (!timestamp || !hash) {
      return false;
    }

    const manifest = `id:${paymentId};request-id:${requestId};ts:${timestamp};`;
    const expectedHash = createHmac('sha256', secret)
      .update(manifest)
      .digest('hex');

    const expectedBuffer = Buffer.from(expectedHash);
    const hashBuffer = Buffer.from(hash);

    if (expectedBuffer.length !== hashBuffer.length) {
      return false;
    }

    return timingSafeEqual(expectedBuffer, hashBuffer);
  }
}
