import { Module } from '@nestjs/common';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { GraphQLModule } from '@nestjs/graphql';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { loadEnvFile } from 'node:process';

import { AppResolver } from './app.resolver';
import { AppService } from './app.service';
import { AuthAdminModule } from './auth-admin/auth-admin.module';
import { AuthModule } from './auth/auth.module';
import { CategoryModule } from './category/category.module';
import { DeliveryFeeModule } from './delivery-fee/delivery-fee.module';
import { MercadoPagoModule } from './mercado-pago/mercado-pago.module';
import { OpenRouteServiceModule } from './open-route-service/open-route-service.module';
import { OrderModule } from './order/order.module';
import { ProductModule } from './product/product.module';
import { SubscriptionModule } from './subscription/subscription.module';
import { TableModule } from './table/table.module';
import { UploadModule } from './upload/upload.module';
import { UserAddressModule } from './user-address/user-address.module';
import { UserAdminAddressModule } from './user-admin-address/user-admin-address.module';
import { UserAdminModule } from './user-admin/user-admin.module';
import { UserModule } from './user/user.module';

const envFilePath = existsSync(join(process.cwd(), '.env'))
  ? join(process.cwd(), '.env')
  : join(process.cwd(), 'apps/api/.env');

if (existsSync(envFilePath)) {
  loadEnvFile(envFilePath);
}

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mssql',
      host: process.env.DATABASE_HOST ?? 'localhost',
      port: Number(process.env.DATABASE_PORT ?? 1433),
      username: process.env.DATABASE_USERNAME ?? 'sa',
      password: process.env.DATABASE_PASSWORD ?? 'password',
      database: process.env.DATABASE_NAME ?? 'pedidos',
      autoLoadEntities: true,
      synchronize: process.env.TYPEORM_SYNCHRONIZE === 'true',
      options: {
        encrypt: process.env.DATABASE_ENCRYPT === 'true',
        trustServerCertificate:
          process.env.DATABASE_TRUST_SERVER_CERTIFICATE !== 'false',
      },
    }),
    GraphQLModule.forRoot<ApolloDriverConfig>({
      driver: ApolloDriver,
      autoSchemaFile: true,
      context: ({ req }) => ({ req }),
      playground: false,
      plugins: [ApolloServerPluginLandingPageLocalDefault()],
    }),
    AuthAdminModule,
    AuthModule,
    CategoryModule,
    DeliveryFeeModule,
    MercadoPagoModule,
    OpenRouteServiceModule,
    OrderModule,
    ProductModule,
    SubscriptionModule,
    TableModule,
    UploadModule,
    UserAddressModule,
    UserAdminAddressModule,
    UserAdminModule,
    UserModule,
  ],
  providers: [AppService, AppResolver],
})
export class AppModule {}
