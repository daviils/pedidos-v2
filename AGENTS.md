# Repository Guidelines

## Project Structure & Module Organization

This repository is a Node workspace monorepo with three applications under `apps/`.

- `apps/api`: NestJS API. Source files live in `apps/api/src`, starting with `main.ts`, `app.module.ts`, `app.controller.ts`, and `app.service.ts`.
- `apps/admin`: Angular admin application. Source files live in `apps/admin/src`; static assets belong in `apps/admin/public`.
- `apps/web`: Angular web application. Source files live in `apps/web/src`; static assets belong in `apps/web/public`.
- Shared TypeScript and Angular compiler settings are in `tsconfig.base.json`.

Keep new code inside the application it belongs to. Add shared packages only when duplicated behavior clearly needs to be reused across apps.

## Build, Test, and Development Commands

Install dependencies from the repository root:

```bash
npm install
```

Run local development servers:

```bash
npm run api:start:dev
npm run admin:start
npm run web:start
```

Build applications:

```bash
npm run api:build
npm run admin:build
npm run web:build
```

No test command is configured yet. Add app-specific test scripts before documenting or requiring test execution.

## Coding Style & Naming Conventions

Use TypeScript for all application code. Keep formatting consistent with the existing files: two-space indentation in JSON, semicolons in TypeScript, and single quotes for imports and strings.

NestJS files should follow framework naming patterns such as `*.module.ts`, `*.controller.ts`, and `*.service.ts`. Angular components currently use standalone components with colocated files such as `app.ts`, `app.html`, and `app.css`.

Use clear, domain-focused names in Portuguese or English consistently within the same feature. Avoid broad utility abstractions until there is repeated usage.

## Testing Guidelines

Testing frameworks are not installed or configured in this initial scaffold. When tests are added, place them near the code they cover and follow the framework convention for the app:

- NestJS: `*.spec.ts` beside services, controllers, or modules.
- Angular: component and service specs beside their source files.

Do not run tests in automation unless the project owner explicitly asks for it.

## Commit & Pull Request Guidelines

There is no Git history available in this workspace to infer commit conventions. Use short, imperative commit messages, for example `Add initial Nest API scaffold`.

Pull requests should include a concise description, changed apps (`api`, `admin`, `web`), manual verification steps, and screenshots for visible UI changes. Link related issues when available.

## Security & Configuration Tips

Do not commit `.env` files or secrets. Use environment variables for runtime configuration such as API ports, database URLs, and external service credentials.
