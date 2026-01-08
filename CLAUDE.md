# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

A NestJS backend API for a Kanban task management system. Uses Fastify as the HTTP server, Drizzle ORM with Neon PostgreSQL for database operations, and Zod for schema validation. The API includes comprehensive Swagger documentation.

## Development Commands

```bash
# Install dependencies (uses pnpm)
pnpm install

# Development
pnpm run start:dev          # Run with watch mode
pnpm run start:debug        # Run with debug mode

# Build
pnpm run build

# Production
pnpm run start:prod

# Linting & Formatting
pnpm run lint               # ESLint with auto-fix
pnpm run format             # Prettier formatting

# Testing
pnpm run test               # Run tests with Vitest
pnpm run test:watch         # Run tests in watch mode
```

## Database Commands

```bash
# Generate migration files from schema changes
npx drizzle-kit generate

# Push schema changes directly to database (development)
npx drizzle-kit push

# Open Drizzle Studio (database GUI)
npx drizzle-kit studio
```

## Architecture

### Core Stack
- **Framework**: NestJS with Fastify adapter (not Express)
- **ORM**: Drizzle ORM with Neon serverless PostgreSQL
- **Validation**: Zod schemas with custom validation pipe
- **Documentation**: Swagger/OpenAPI with custom decorators

### Module Structure

The codebase follows NestJS module architecture with feature-based organization:

```
src/
├── api/                    # Feature modules (controller + service + module)
│   └── tasks/
│       ├── tasks.controller.ts
│       ├── tasks.service.ts
│       ├── tasks.module.ts
│       └── decorators/     # Swagger decorators for this feature
├── db/                     # Database schemas
│   ├── schema.ts           # Main schema export
│   └── task.schema.ts      # Individual table schemas with Zod validation
├── common/                 # Shared utilities
│   ├── zod-validation.pipe.ts
│   └── all-exceptions-filter.filter.ts
└── drizzle/               # Database provider (separate from src/)
    ├── drizzle.module.ts   # Global module
    ├── drizzle.service.ts  # Injectable service
    └── drizzle.provider.ts # Database connection factory
```

### Path Aliases

TypeScript path aliases are configured in `tsconfig.json`:
- `@api/*` → `src/api/*`
- `@db/*` → `src/db/*`
- `@common/*` → `src/common/*`
- `@drizzle/*` → `drizzle/*`

Always use these aliases instead of relative imports.

### Database Layer

**Drizzle Setup**:
- DrizzleModule is a `@Global()` module, making DrizzleService available everywhere without imports
- Access the database via `DrizzleService.db` injected into services
- Schema is located in `src/db/schema.ts` and re-exports individual table schemas
- Database uses Neon serverless PostgreSQL driver (`drizzle-orm/neon-http`)

**Schema Pattern**:
Each schema file defines:
1. Table schema using Drizzle (`pgTable`, `pgEnum`, etc.)
2. TypeScript types derived from schema (`InferSelectModel`, `InferInsertModel`)
3. Zod validation schemas using `drizzle-zod` (`createInsertSchema`, `createUpdateSchema`)

Example from `task.schema.ts`:
```typescript
export const taskStatusEnum = pgEnum("task_status", ["todo", "in_progress", "done"]);
export const tasks = pgTable("tasks", { ... });
export type Task = InferSelectModel<typeof tasks>;
export const taskInsertSchema = createInsertSchema(tasks).omit({ id: true })...
```

### Validation Pattern

All request validation uses Zod schemas with `ZodValidationPipe`:
```typescript
@Post()
async create(@Body(new ZodValidationPipe(taskInsertSchema)) payload: TaskInsert) { ... }
```

The pipe automatically:
- Parses the request body using the Zod schema
- Throws `BadRequestException` with the first validation error message
- Returns the parsed/transformed data

### Error Handling

**Global Exception Filter**: `AllExceptionsFilter` is registered globally in `main.ts` and:
- Catches all exceptions (HTTP and non-HTTP)
- Logs errors with stack traces
- Returns consistent JSON error responses with `statusCode`, `message`, `error`, `timestamp`
- Used for all endpoints automatically

**Service-Level Exceptions**: Services throw NestJS HTTP exceptions (`NotFoundException`, `ConflictException`, etc.) which are caught and formatted by the global filter.

### Swagger Documentation

Swagger is configured at `/documentation` endpoint with custom CSS (`swagger.css`).

**Documentation Pattern**: Each controller method uses a custom decorator from `decorators/` that combines multiple Swagger decorators:
```typescript
@ApiCreateTaskSwaggerDecorator()  // Custom decorator
async create(...) { ... }
```

These decorators use `applyDecorators()` to combine:
- `@ApiOperation()` - Summary and description
- `@ApiBody()` - Request schema with examples
- `@ApiResponse()` - Response schemas for all status codes
- `@ApiStandardResponsesDocSwaggerDecorator()` - Common responses (500, etc.)

When adding new endpoints, create a similar custom decorator in the feature's `decorators/` folder.

### Server Configuration

- Uses Fastify adapter, not Express
- Global API prefix: `/api` (all routes are prefixed with this)
- Port: `process.env.PORT` or 3000
- Fastify logger is enabled by default

### Code Style

- **Indentation**: 4 spaces (enforced by EditorConfig and Prettier)
- **Quotes**: Double quotes
- **Semicolons**: Required
- **Line width**: 120 characters
- **Trailing commas**: Always
- **TypeScript**: Strict mode with `noImplicitAny: false` and `strictBindCallApply: false`

### Environment Variables

Required in `.env`:
- `DATABASE_URL` - Neon PostgreSQL connection string (used by both Drizzle and drizzle-kit)
- `PORT` - Server port (optional, defaults to 3000)

## Adding New Features

1. Create a new feature module in `src/api/<feature>/`
2. Define schema in `src/db/<feature>.schema.ts` with Drizzle tables and Zod schemas
3. Create service that injects `DrizzleService` for database access
4. Create controller with path alias imports and Zod validation
5. Create Swagger decorators in `<feature>/decorators/`
6. Import the feature module in `AppModule`
7. Generate and run migrations: `npx drizzle-kit generate` then push changes

## Testing

- Test runner: Vitest (configured in `vitest.config.ts`)
- Global test utilities enabled (`globals: true`)
- Path aliases configured to match TypeScript aliases