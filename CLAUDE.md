# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Is

A CLI scaffolding tool (`codelords-stack`) that generates Next.js starter projects with optional features (auth, email, payments). Two distinct contexts exist: the **CLI tool** and the **templates** it copies.

## Commands

```bash
npm run dev          # Run CLI in development (via tsx)
npm run build        # Compile TypeScript (tsc)
npx .                # Test the built CLI locally
```

There are no automated tests. To verify changes, run the CLI, generate a project, then test it:

```bash
npm run dev                                    # generates a project
cd <project-name>
# set DATABASE_URL in .env
pnpm prisma generate && pnpm prisma db push
pnpm dev                                       # starts Next.js dev server (generated project uses pnpm)
# verify at http://localhost:3000/status
```

## Architecture

```
packages/
├── cli/index.ts          # Single-file CLI entry point (prompts, copies, installs)
└── templates/
    ├── base/             # Always copied — full Next.js + Prisma + Tailwind + shadcn/ui
    ├── auth/             # Merged into src/ when auth selected (Better Auth)
    ├── mailgun/          # Single file → src/lib/mailgun.ts
    └── lemonsqueezy/     # WIP placeholder
```

**Scaffolding flow**: Base template copied first → `.env.example` copied to `.env` → feature templates merged into `src/` → dependencies installed via `npm install` → secrets generated (e.g., `BETTER_AUTH_SECRET` via `crypto.randomBytes`).

The CLI is a single file (`packages/cli/index.ts`) that handles everything: prompts, file copying, env manipulation, and dependency installation. The compiled JS at `packages/cli/index.js` is the npm `bin` entry.

## Key Patterns

**Prisma client** — templates use a dynamic factory, not direct instantiation:
```typescript
import { getPrismaClient } from "@/lib/prisma";
const prisma = await getPrismaClient();
```

**Better Auth** — server config in `auth/lib/auth.ts` (uses `prismaAdapter`), client helpers in `auth/lib/auth-client.ts` (exports `signIn`, `signUp`, `signOut`, `useSession`), catch-all route at `app/api/auth/[...all]/route.ts`.

**Import aliases** in templates: `@/*` maps to `src/*`.

## Template Modification Rules

- Base template changes affect ALL generated projects
- Feature templates must be self-contained and mergeable into `src/`
- New features require: a CLI prompt in `index.ts`, template files, and dependency installation logic
- Update `env.example` when adding new environment variables

## Template Stack

Next.js 16 (App Router, Turbopack), React 19, Prisma 6, Tailwind CSS 4, shadcn/ui (New York style), next-themes, Better Auth.

## Environment Variables by Feature

| Feature | Variables |
|---------|-----------|
| Base | `DATABASE_URL` |
| Auth | `BETTER_AUTH_SECRET` (auto-generated), `BETTER_AUTH_URL` |
| Mailgun | `MAILGUN_API_KEY`, `MAILGUN_DOMAIN`, `MAILGUN_FROM_NAME` |
