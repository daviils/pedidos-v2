# Security Audit Report: `apps/api`

**Data:** 2026-07-02

---

## Sumário

| Severidade | Quantidade |
|------------|-----------|
| Crítico | 8 |
| Alto | 10 |
| Médio | 10 |
| Baixo | 5 |
| Informativo | 4 |

---

## CRÍTICO

### C-01: Secrets em texto puro no `.env` [NÃO AJUSTAR]

**Arquivo:** `apps/api/.env` (linhas 8–32)

**Descrição:** Senha do banco (`Xu6C_0b55hZW`), chave do Azure Storage (`hNVLZPm/...==`), token do Mercado Pago (`TEST-486180...`), webhook secret e API key expostos em texto puro.

**Recomendação:** Usar Azure Key Vault ou secrets manager. Rotacionar todos os secrets imediatamente. Manter apenas `.env.example` no repositório.

---

### C-02: Senhas armazenadas sem hash (plaintext)

**Arquivos:**
- `apps/api/src/auth/service/auth.service.ts:19` — `user.password !== password`
- `apps/api/src/auth-admin/service/auth-admin.service.ts:19` — `userAdmin.password !== password`
- `apps/api/src/user/service/user.service.ts:17-22` — `create()` salva plaintext no banco

**Descrição:** A comparação é feita com `!==` em texto puro. Não há `bcrypt` ou `argon2` no `package.json`. Se o banco for comprometido, todas as senhas são expostas.

**Recomendação:** Adicionar `bcrypt` e fazer hash das senhas antes de salvar. Usar `bcrypt.compare()` no login.

---

### C-03: JWT secret fraco e hardcoded como fallback

**Arquivo:** `apps/api/src/auth/constant/jwt.constant.ts:2`

**Descrição:** `secret: process.env.JWT_SECRET ?? 'pedidos-api-jwt-secret'` — fallback hardcoded e fraco.

**Recomendação:** Remover fallback e lançar erro se `JWT_SECRET` não estiver definido.

---

### C-04: `synchronize: true` habilitado

**Arquivo:** `apps/api/.env:13` e `apps/api/src/app.module.ts:49`

**Descrição:** `TYPEORM_SYNCHRONIZE=true` — o TypeORM altera o schema automaticamente, podendo dropar tabelas/colunas em produção.

**Recomendação:** Forçar `false` em produção. Usar migrations.

---

### C-05: Nenhuma autenticação nos resolvers de User/UserAdmin

**Arquivos:**
- `apps/api/src/user/resolver/user.resolver.ts` (todos os métodos)
- `apps/api/src/user-admin/resolver/user-admin.resolver.ts` (todos os métodos)

**Descrição:** Zero decorators `@UseGuards()`. Qualquer pessoa pode criar, listar, atualizar ou deletar usuários e admins. Não há verificação de ownership (IDOR).

**Recomendação:** Adicionar `@UseGuards(GqlAuthGuard)` / `@UseGuards(GqlAuthAdminGuard)` nos resolvers. Verificar ownership nas mutações update/delete.

---

### C-06: Criação de admin sem autenticação

**Arquivo:** `apps/api/src/user-admin/resolver/user-admin.resolver.ts:12-17`

**Descrição:** `createUserAdmin()` não tem `@UseGuards`. Qualquer pessoa não autenticada pode criar uma conta de administrador.

**Recomendação:** Adicionar `@UseGuards(GqlAuthAdminGuard)` na mutation `createUserAdmin`.

---

### C-07: Insecure Direct Object Reference (IDOR) em User/UserAdmin

**Arquivos:**
- `apps/api/src/user/resolver/user.resolver.ts:22-38`
- `apps/api/src/user-admin/resolver/user-admin.resolver.ts:24-44`

**Descrição:** Qualquer ID passado como argumento é usado diretamente no banco sem verificar se o usuário logado tem permissão. Um usuário pode ler/alterar/deletar contas de outros usuários.

**Recomendação:** Extrair o `sub` (user ID) do JWT e usá-lo nas queries, ignorando o `id` da requisição quando aplicável.

---

### C-08: Dados sensíveis comprometidos no `.env` versionado

**Arquivo:** `apps/api/.env` (committed no repositório Git)

**Descrição:** O arquivo `.env` com credenciais reais está no histórico do Git. Qualquer pessoa com acesso ao repositório (ou ao histórico) obtém acesso ao banco, storage e gateway de pagamento.

**Recomendação:** Remover do histórico com `git filter-branch` ou `bfg`. Adicionar `.env` ao `.gitignore`.

---

## ALTO

### H-01: Ausência de `bcrypt`/`argon2` no `package.json`

**Arquivo:** `apps/api/package.json`

**Descrição:** Confirma que nenhuma lib de hash está disponível (relacionado ao C-02).

**Recomendação:** Adicionar `bcrypt` como dependência e hash no `createUser` e no `login`.

---

### H-02: CORS permissivo (wildcard) [RESOLVIDO]

**Arquivo:** `apps/api/src/main.ts:8`

**Descrição:** `app.enableCors()` sem opções — qualquer origem, header e método são aceitos. Combinado com a ausência de CSRF, permite ataques cross-origin.

**Recomendação:** Restringir origins aos domínios dos apps admin e web (`credentials: true` com origens específicas).

**Resolvido em:** `main.ts` — `enableCors()` agora aceita `CORS_ORIGINS` do env ou fallback para `localhost:4200,4201` com `credentials: true`.

---

### H-03: Endpoint de geocode sem autenticação

**Arquivo:** `apps/api/src/open-route-service/controller/open-route-service.controller.ts:42`

**Descrição:** `GET /open-route-service/geocode?address=...` sem guard. Qualquer um pode consumir a API key.

**Recomendação:** Adicionar `@UseGuards`.

---

### H-04: Sem validação de input no geocode

**Arquivo:** `apps/api/src/open-route-service/controller/open-route-service.controller.ts:43`

**Descrição:** O parâmetro `address` só faz `.trim()` — sem limite de tamanho, sem whitelist de caracteres.

**Recomendação:** Adicionar `class-validator` com `@Length()` e `@Matches()`.

---

### H-05: Sem rate limiting

**Arquivo:** Em toda a aplicação.

**Descrição:** Nenhum rate limiter configurado. Endpoints de login, criação de conta e upload estão desprotegidos contra brute-force e DoS.

**Recomendação:** Instalar `@nestjs/throttler` e configurar limites globais e específicos (ex.: 5 tentativas/minuto no login).

---

### H-06: Dependências vulneráveis

**Arquivo:** `apps/api/package-lock.json`

**Descrição:** 10 vulnerabilidades (9 alta, 1 média): `multer` (DoS), `ws` (DoS por fragmentos), `js-yaml` (complexidade quadrática).

**Recomendação:** Rodar `npm audit fix` e atualizar `@nestjs/platform-express` e `@nestjs/graphql`.

---

### H-07: Bypass de assinatura do webhook quando secret não configurado

**Arquivo:** `apps/api/src/mercado-pago/service/mercado-pago.service.ts:441-445`

**Descrição:** Quando `MERCADO_PAGO_WEBHOOK_SECRET` não está definido, `return true` — qualquer requisição é aceita como legítima.

**Recomendação:** Tornar o webhook secret obrigatório e lançar erro se não estiver configurado.

---

### H-08: Informação sensível vazada em erros de serviços externos

**Arquivos:**
- `apps/api/src/mercado-pago/service/mercado-pago.service.ts:378-382`
- `apps/api/src/open-route-service/service/open-route-service.service.ts:73-78`

**Descrição:** O corpo da resposta de APIs externas é incluído na mensagem de erro retornada ao cliente.

**Recomendação:** Logar o erro detalhado no servidor, retornar mensagem genérica ao cliente.

---

### H-09: Mass assignment via `Object.assign`

**Arquivos:** Múltiplos services (`user.service.ts`, `user-admin.service.ts`, `category.service.ts`, `product.service.ts`, `table.service.ts`, `table-session.service.ts`, `subscription.service.ts`, `delivery-fee.service.ts`, `user-address.service.ts`, `user-admin-address.service.ts`)

**Descrição:** `Object.assign(entity, data)` copia todas as propriedades do input para a entidade. Se um campo sensível for adicionado ao DTO no futuro (ex.: `role`, `isAdmin`), ele se torna imediatamente atribuível sem mapeamento explícito.

**Recomendação:** Substituir por atribuição explícita campo a campo ou usar `pick()` do lodash.

---

### H-10: Sem proteção CSRF

**Arquivo:** Em toda a aplicação.

**Descrição:** Nenhum token CSRF ou config `SameSite` em cookies. Combinado com CORS permissivo, qualquer site pode fazer requisições na API do usuário logado.

**Recomendação:** Implementar CSRF tokens para endpoints REST. Configurar `SameSite=Strict/Lax`.

---

## MÉDIO

### M-01: Sem headers de segurança (Helmet)

**Arquivo:** `apps/api/src/main.ts:7-8`

**Descrição:** `helmet` não está instalado/configurado. Headers como `X-Content-Type-Options`, `X-Frame-Options`, `Strict-Transport-Security` ausentes.

**Recomendação:** Instalar `helmet` e configurar `app.use(helmet())`.

---

### M-02: Swagger exposto sem autenticação

**Arquivo:** `apps/api/src/main.ts:10-19`

**Descrição:** Swagger disponível em `/docs` quando `NODE_ENV !== 'production'` — `NODE_ENV` pode ser falsificado.

**Recomendação:** Adicionar autenticação ao `/docs` ou desabilitar completamente em produção.

---

### M-03: GraphQL introspection/playground habilitado

**Arquivo:** `apps/api/src/app.module.ts:57-62`

**Descrição:** Apollo Sandbox habilitado fora de produção. Schema completo exposto.

**Recomendação:** Desabilitar introspection em todos os ambientes ou proteger com token admin.

---

### M-04: Validação de MIME type em upload pode ser bypassada

**Arquivo:** `apps/api/src/upload/controller/upload.controller.ts:63-68`

**Descrição:** A validação `file.mimetype.startsWith('image/')` confia no header HTTP enviado pelo cliente. Sem varredura de vírus.

**Recomendação:** Validar magic bytes do arquivo real. Usar `file-type` para detecção por conteúdo.

---

### M-05: Extensão de arquivo não validada no upload

**Arquivo:** `apps/api/src/upload/service/upload.service.ts:33-34`

**Descrição:** A extensão vem diretamente do `file.originalname` sem whitelist. Um arquivo `malicioso.jpg.exe` pode ser salvo.

**Recomendação:** Whitelist de extensões permitidas (`.jpg`, `.png`, `.webp`). Ignorar a extensão original.

---

### M-06: SSRF via `back_url` / `notification_url` no Mercado Pago

**Arquivo:** `apps/api/src/mercado-pago/service/mercado-pago.service.ts:306-308`

**Descrição:** O input `CreateMercadoPagoPreferenceInput` permite que o usuário controle URLs de callback.

**Recomendação:** Validar URLs contra whitelist. Usar sempre URLs configuradas no servidor.

---

### M-07: Sem limites de tamanho em campos string

**Arquivo:** Todos os DTOs em `src/**/dtos/*.input.ts`

**Descrição:** Campos como `name`, `email`, `password`, `description` aceitam strings de tamanho ilimitado. Sem `class-validator` em nenhum DTO.

**Recomendação:** Adicionar `@Length()`, `@MaxLength()`, `@IsEmail()`, `@IsString()` com `class-validator`.

---

### M-08: JWT sem claim de role/perfil

**Arquivos:**
- `apps/api/src/auth/type/jwt-payload.type.ts:1-4`
- `apps/api/src/auth/service/auth.service.ts:23-26`
- `apps/api/src/auth-admin/service/auth-admin.service.ts:23-26`

**Descrição:** O payload só contém `sub` e `email` — sem `role` para diferenciar user de admin.

**Recomendação:** Adicionar `role` ao payload. Usar diferentes secrets ou `audience` para user vs admin.

---

### M-09: Sem logging ou audit trail

**Arquivo:** Em toda a aplicação.

**Descrição:** Eventos de segurança (login, criação de conta, alteração de dados) não são logados.

**Recomendação:** Usar `Logger` do NestJS. Logar tentativas de auth, mutações sensíveis e uploads.

---

### M-10: Sem autenticação nas queries de Subscription

**Arquivo:** `apps/api/src/subscription/resolver/subscription.resolver.ts:22-32`

**Descrição:** `subscriptions()` e `subscription()` não têm `@UseGuards`. Dados de preço e descrição expostos publicamente.

**Recomendação:** Avaliar se deve ser público. Se for interno, adicionar guard.

---

## BAIXO

### L-01: Trust server certificate desabilitado

**Arquivo:** `apps/api/.env:16` e `apps/api/src/app.module.ts:52-53`

**Descrição:** `DATABASE_TRUST_SERVER_CERTIFICATE=true` — MITM possível na conexão com o banco.

**Recomendação:** Usar certificado TLS válido e desabilitar trust.

---

### L-02: `.env` presente no disco

**Arquivo:** `apps/api/.env`

**Descrição:** Arquivo com secrets no sistema de arquivos, sujeito a backups, screenshots, pacotes de deploy.

**Recomendação:** Remover do diretório do projeto. Usar variáveis de ambiente no OS/container.

---

### L-03: `noImplicitAny: false` no tsconfig

**Arquivo:** `apps/api/tsconfig.json:9`

**Descrição:** TypeScript permite `any` implícito, reduzindo type safety.

**Recomendação:** Habilitar `"noImplicitAny": true` e idealmente `"strict": true`.

---

### L-04: Inconsistência entre soft e hard delete

**Arquivos:** `category.service.ts`, `table.service.ts` (soft); `user.service.ts`, `user-admin.service.ts`, `order.service.ts` (hard)

**Descrição:** Algumas entidades usam soft-delete, outras hard-delete. Perda permanente de dados em algumas operações.

**Recomendação:** Padronizar para soft-delete com auditoria.

---

### L-05: Sem limite de tamanho do body da requisição

**Arquivo:** `apps/api/src/main.ts`

**Descrição:** Sem `express.json({ limit })`. GraphQL queries complexas podem causar DoS por memória.

**Recomendação:** Configurar `app.use(express.json({ limit: '1mb' }))` e adicionar limitador de profundidade de queries GraphQL.

---

## INFORMATIVO

### I-01: Helmet não instalado

**Arquivo:** `apps/api/src/main.ts`

**Recomendação:** Instalar e configurar `helmet` para headers de segurança.

---

### I-02: Nenhum teste configurado

**Arquivo:** `apps/api/package.json`

**Recomendação:** Adicionar Jest e escrever testes para auth, guards, validators e services.

---

### I-03: Database credentials hardcoded como fallback

**Arquivo:** `apps/api/src/app.module.ts:44-47`

**Descrição:** Fallbacks `localhost`/`sa`/`password`. Se env vars faltarem, conecta com credenciais padrão.

**Recomendação:** Validar env vars obrigatórias no startup e falhar rápido.

---

### I-04: Dockerfile ausente

**Descrição:** Sem configuração de deploy containerizado para revisão.

**Recomendação:** Criar Dockerfile com multi-stage build, usuário não-root e sem inclusão de `.env`.

---

## Dependências Vulneráveis

| Pacote | Severidade | CVE | Versão Afetada |
|--------|-----------|-----|----------------|
| `multer` | ALTA | GHSA-72gw-mp4g-v24j | 1.0.0–2.1.1 |
| `multer` | ALTA | GHSA-3p4h-7m6x-2hcm | 1.0.0–2.1.1 |
| `ws` | ALTA | GHSA-96hv-2xvq-fx4p | 8.0.0–8.20.1 |
| `js-yaml` | MÉDIA | GHSA-h67p-54hq-rp68 | 4.0.0–4.1.1 |

**Total: 10 vulnerabilidades (9 alta, 1 média)**

---

## Recomendações de ação imediata

1. **IMEDIATO** — Rotacionar todos os secrets expostos no `.env` (C-01, C-08)
2. **IMEDIATO** — Fazer hash das senhas com `bcrypt` (C-02)
3. **IMEDIATO** — Adicionar `@UseGuards()` nos resolvers de User e UserAdmin (C-05, C-06)
4. **ALTA** — Adicionar rate limiting (especialmente no login) (H-05)
5. **ALTA** — Remover fallback hardcoded do JWT secret (C-03)
6. **ALTA** — Forçar `TYPEORM_SYNCHRONIZE=false` em produção (C-04)
7. **ALTA** — Restringir CORS a origins específicas (H-02)
8. **ALTA** — Substituir `Object.assign` por atribuição explícita (H-09)
9. **MÉDIA** — Adicionar `helmet` (M-01)
10. **MÉDIA** — Adicionar validação de input com `class-validator` (M-07)
