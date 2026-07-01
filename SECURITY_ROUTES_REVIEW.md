# Security routes review - apps/api

Run date: 2026-07-01

Requested branch: `codex/auto`

Status: branch switch/create was attempted from `develop`, but Git could not create `.git/refs/heads/codex/auto.lock` due to filesystem permission denied. Review was completed on the current checkout.

## Scope

Reviewed NestJS GraphQL resolvers and REST controllers under `apps/api/src` for routes that can expose sensitive data or allow unintended access to sensitive resources.

## Findings

### High - public user GraphQL queries expose customer identity data

Files:

- `apps/api/src/user/resolver/user.resolver.ts:17`
- `apps/api/src/user/resolver/user.resolver.ts:22`
- `apps/api/src/user/entity/user.entity.ts:21`
- `apps/api/src/user/entity/user.entity.ts:25`
- `apps/api/src/user/entity/user.entity.ts:29`
- `apps/api/src/user/entity/user.entity.ts:40`

Routes:

- `users`
- `user(id: String)`

Risk:

The `users` and `user` queries have no `@UseGuards(...)`, so anyone with GraphQL access can enumerate users and fetch user records by UUID. The exposed GraphQL fields include `id`, `email`, `name`, `profile`, and the `addresses` relationship. The `password` column is not exposed as a GraphQL field, which is good, but identity and address-related data are still sensitive.

Suggested fix:

- Add `@UseGuards(GqlAuthAdminGuard)` to `users` and probably `user`, if these are admin-only operations.
- If regular customers need a self-service read, replace `user(id)` with a guarded `me` style query using `@CurrentUser()` and never accept arbitrary user IDs from the client.
- Return a safe output type instead of the persistence entity, for example `UserPublic` or `UserMe`, with only the fields required by the caller.
- Keep `addresses` behind the existing guarded `UserAddressResolver` flow instead of exposing it through a public `User` relationship.

### High - public user mutations allow unauthorized account changes and deletion

Files:

- `apps/api/src/user/resolver/user.resolver.ts:27`
- `apps/api/src/user/resolver/user.resolver.ts:35`

Routes:

- `updateUser(id: String, data: UpdateUserInput)`
- `deleteUser(id: String)`

Risk:

The update and delete mutations have no guard and accept an arbitrary user ID. This is more than data exposure: it allows unauthenticated modification or deletion of user records if the GraphQL endpoint is reachable.

Suggested fix:

- Guard these mutations with `GqlAuthGuard` and restrict them to the current user where appropriate.
- For admin-only maintenance, guard with `GqlAuthAdminGuard`.
- In the service or resolver, enforce ownership: the authenticated user ID must match the target ID unless the request is from an admin context.
- Consider splitting public account registration from protected account management.

### High - public admin GraphQL queries expose administrator identity and business relationships

Files:

- `apps/api/src/user-admin/resolver/user-admin.resolver.ts:19`
- `apps/api/src/user-admin/resolver/user-admin.resolver.ts:24`
- `apps/api/src/user-admin/entity/user-admin.entity.ts:14`
- `apps/api/src/user-admin/entity/user-admin.entity.ts:18`
- `apps/api/src/user-admin/entity/user-admin.entity.ts:25`
- `apps/api/src/user-admin/entity/user-admin.entity.ts:29`

Routes:

- `usersAdmin`
- `userAdmin(id: String)`

Risk:

The admin user list and detail queries have no `@UseGuards(...)`. They expose admin IDs, emails, names, addresses, and delivery fee relationships to any GraphQL caller. The `password` column is not exposed as a GraphQL field, but the visible fields are still sensitive and can help account enumeration or targeted attacks.

Suggested fix:

- Add `@UseGuards(GqlAuthAdminGuard)` at the resolver class level or at least on all list/detail/update/delete admin operations.
- Return a dedicated admin-safe output DTO rather than the TypeORM entity.
- Avoid exposing `addresses` and `deliveryFees` from the `UserAdmin` entity unless the caller is authenticated as that same admin or an authorized backoffice role.

### Critical - public admin mutations allow unauthorized admin account changes and deletion

Files:

- `apps/api/src/user-admin/resolver/user-admin.resolver.ts:31`
- `apps/api/src/user-admin/resolver/user-admin.resolver.ts:39`

Routes:

- `updateUserAdmin(id: String, data: UpdateUserAdminInput)`
- `deleteUserAdmin(id: String)`

Risk:

The admin update and delete mutations have no guard and accept arbitrary admin IDs. If exposed, a caller can alter or remove admin accounts without authentication.

Suggested fix:

- Add `@UseGuards(GqlAuthAdminGuard)` to these mutations.
- Enforce that only the current admin, or a future higher-privilege role, can update/delete the target admin.
- Consider temporarily removing delete mutations from the public schema until role-based authorization is implemented.

### Medium - public geocoding route can expose queried addresses and consume paid API quota

Files:

- `apps/api/src/open-route-service/controller/open-route-service.controller.ts:16`
- `apps/api/src/open-route-service/controller/open-route-service.controller.ts:42`

Route:

- `GET /open-route-service/geocode?address=...`

Risk:

The endpoint is unauthenticated and forwards user-provided addresses to OpenRouteService, returning normalized address and coordinates. This can reveal sensitive address lookups through logs, browser history, proxies, and third-party API telemetry. It can also be abused to consume external API quota.

Suggested fix:

- Require authentication for address geocoding unless it is explicitly intended as public.
- Add rate limiting and input length limits.
- Avoid logging raw address values.
- If public access is needed for checkout, consider a narrow purpose-specific endpoint with throttling and abuse detection.

### Medium - Mercado Pago webhook silently disables signature validation when secret is missing

Files:

- `apps/api/src/mercado-pago/controller/mercado-pago.controller.ts:16`
- `apps/api/src/mercado-pago/service/mercado-pago.service.ts`

Route:

- `POST /mercado-pago/webhook`

Risk:

The webhook is intentionally public, but signature validation depends on `MERCADO_PAGO_WEBHOOK_SECRET`. In the service, if the secret is not configured, validation returns true. A missing production secret would allow forged webhook calls to drive subscription state changes.

Suggested fix:

- Fail closed in production when `MERCADO_PAGO_WEBHOOK_SECRET` is missing.
- Keep any bypass restricted to local development through an explicit environment flag such as `ALLOW_UNSIGNED_WEBHOOKS=true`.
- Log rejected webhook metadata without logging sensitive payment details.

## Routes reviewed with lower concern

- `products` and `product(id)` are public in `apps/api/src/product/resolver/product.resolver.ts`; this looks consistent with catalog browsing.
- `categories` and `category(id)` are public in `apps/api/src/category/resolver/category.resolver.ts`; this looks consistent with catalog browsing.
- `subscriptions` and `subscription(id)` are public in `apps/api/src/subscription/resolver/subscription.resolver.ts`; this may be acceptable for public pricing, but should be admin-only if plans are internal.
- `upload/upload-product` is guarded with `AuthAdminGuard`.
- `userAddresses` and `userAdminAddresses` are guarded and scoped to the current authenticated user/admin.
- `orders`, `tables`, `tableSessions`, `deliveryFees`, and Mercado Pago GraphQL operations are guarded with `GqlAuthAdminGuard` in the resolver layer.

## Recommended priority

1. Guard or remove public user/admin list/detail/update/delete operations.
2. Replace entity return types with safe GraphQL DTOs for user and admin account reads.
3. Make Mercado Pago webhook signature validation fail closed in production.
4. Add auth/rate limiting to geocoding or document why it must remain public.
