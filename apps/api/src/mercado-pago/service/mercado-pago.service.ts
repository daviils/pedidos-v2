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

type MercadoPagoPaymentResponse = {
  id: number;
  status: string;
  external_reference?: string;
};

type MercadoPagoPreapprovalResponse = {
  id: string;
  init_point: string;
  sandbox_init_point?: string;
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
      await this.createMercadoPagoPreapproval(
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

    const preferenceResponse = await this.getPreapproval(
      userAdminSubscription.mercadoPagoId,
    );

    return {
      id: preferenceResponse.id,
      initPoint: preferenceResponse.init_point,
      sandboxInitPoint: preferenceResponse.sandbox_init_point,
      userAdminSubscriptionId: userAdminSubscription.id,
    };
  }

  async cancelSubscription(
    userAdmin: UserAdmin,
  ): Promise<UserAdminSubscriptions> {
    const userAdminSubscription =
      await this.userAdminSubscriptionsRepository.findOne({
        where: {
          userAdminId: userAdmin.id,
          status: In([
            UserAdminSubscriptionStatus.Active,
            UserAdminSubscriptionStatus.Pending,
          ]),
        },
      });

    if (!userAdminSubscription) {
      throw new NotFoundException('Assinatura ativa ou pendente nao encontrada');
    }

    await this.cancelMercadoPagoPreapproval(
      userAdminSubscription.mercadoPagoId,
    );

    userAdminSubscription.status = UserAdminSubscriptionStatus.Cancelled;
    return this.userAdminSubscriptionsRepository.save(userAdminSubscription);
  }

  async handleWebhook(
    paymentId: string | undefined,
    type: string | undefined,
    signature: string | undefined,
    requestId: string | undefined,
  ): Promise<void> {
    if (!paymentId) {
      return;
    }

    if (!this.isWebhookSignatureValid(paymentId, signature, requestId)) {
      throw new BadGatewayException('Assinatura do Mercado Pago invalida');
    }

    if (type === 'subscription_preapproval') {
      await this.handlePreapprovalWebhook(paymentId);
      return;
    }

    if (type !== 'payment') {
      return;
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

  private async handlePreapprovalWebhook(preapprovalId: string): Promise<void> {
    const preapproval = await this.getPreapproval(preapprovalId);

    const userAdminSubscription =
      await this.userAdminSubscriptionsRepository.findOne({
        where: [
          { mercadoPagoId: preapproval.id },
          ...(preapproval.external_reference
            ? [{ id: preapproval.external_reference }]
            : []),
        ],
      });

    if (!userAdminSubscription) {
      return;
    }

    userAdminSubscription.status = this.mapPreapprovalStatus(
      preapproval.status,
    );
    await this.userAdminSubscriptionsRepository.save(userAdminSubscription);
  }

  private async createMercadoPagoPreapproval(
    userAdmin: UserAdmin,
    subscription: Subscription,
    externalReference: string,
    data: CreateMercadoPagoPreferenceInput,
  ): Promise<MercadoPagoPreapprovalResponse> {
    const backUrl = this.getBackUrl(data);
    const notificationUrl =
      data.notificationUrl ?? process.env.MERCADO_PAGO_NOTIFICATION_URL;

    const payload = {
      reason: subscription.title,
      external_reference: externalReference,
      payer_email: userAdmin.email,
      auto_recurring: {
        frequency: Number(process.env.MERCADO_PAGO_SUBSCRIPTION_FREQUENCY ?? 1),
        frequency_type:
          process.env.MERCADO_PAGO_SUBSCRIPTION_FREQUENCY_TYPE ?? 'months',
        transaction_amount: Number(subscription.price),
        currency_id: process.env.MERCADO_PAGO_CURRENCY_ID ?? 'BRL',
      },
      status: 'pending',
      ...(backUrl ? { back_url: backUrl } : {}),
      ...(notificationUrl ? { notification_url: notificationUrl } : {}),
    };

    return this.request<MercadoPagoPreapprovalResponse>(
      '/preapproval',
      {
        method: 'POST',
        body: JSON.stringify(payload),
      },
    );
  }

  private getPayment(paymentId: string): Promise<MercadoPagoPaymentResponse> {
    return this.request<MercadoPagoPaymentResponse>(`/v1/payments/${paymentId}`);
  }

  private getPreapproval(
    preapprovalId: string,
  ): Promise<MercadoPagoPreapprovalResponse> {
    return this.request<MercadoPagoPreapprovalResponse>(
      `/preapproval/${preapprovalId}`,
    );
  }

  private async cancelMercadoPagoPreapproval(
    preapprovalId: string,
  ): Promise<void> {
    await this.request<MercadoPagoPreapprovalResponse>(
      `/preapproval/${preapprovalId}`,
      {
        method: 'PUT',
        body: JSON.stringify({ status: 'canceled' }),
      },
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

  private getBackUrl(data: CreateMercadoPagoPreferenceInput) {
    return (
      data.successUrl ??
      data.pendingUrl ??
      data.failureUrl ??
      process.env.MERCADO_PAGO_SUCCESS_URL ??
      process.env.MERCADO_PAGO_PENDING_URL ??
      process.env.MERCADO_PAGO_FAILURE_URL ??
      undefined
    );
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

  private mapPreapprovalStatus(status: string): UserAdminSubscriptionStatus {
    if (status === 'authorized') {
      return UserAdminSubscriptionStatus.Active;
    }

    if (status === 'cancelled' || status === 'canceled' || status === 'paused') {
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
