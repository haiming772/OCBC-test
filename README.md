# AccessPilot Web

AccessPilot Web is a mock OCBC-style Internet Banking experience built with Next.js 14 (App Router), Prisma + SQLite, Tailwind CSS, and secure credential auth. It focuses on accessibility, OCBC-inspired visuals, and predictable testing selectors so automation extensions can drive the UI later.

## Tech stack
- Next.js 14 App Router with TypeScript server components
- Tailwind CSS with custom OCBC palette and utility buttons
- Prisma ORM + SQLite (`file:./prisma/dev.db`) with seeded demo data
- bcrypt / JWT auth (HttpOnly cookie `ap_token`)
- Zod-validated server actions + REST API routes
- Playbook-ready UI components (`Card`, `Field`, `Table`, `Toast`, etc.) with `data-testid`s

## Getting started
1. **Install dependencies**
   ```bash
   npm install
   ```
2. **Configure environment variables**
   ```bash
   cp .env .env.local # or set your own secrets
   # update JWT_SECRET if deploying
   ```
3. **Database**
   ```bash
   npm run db:generate
   npm run db:migrate     # creates dev.db
   npm run db:seed        # loads demo data + statements
   ```
4. **Run the app**
   ```bash
   npm run dev
   ```
5. **Sign in** with the seeded user:
   - Email: `demo@ocbc.local`
   - Password: `Passw0rd!`

## Scripts
| Command | Description |
| --- | --- |
| `npm run dev` | Start Next.js in development mode |
| `npm run build` | Production build |
| `npm run start` | Run the built app |
| `npm run lint` | ESLint via `next lint` |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:migrate` | Run dev migration (`--name init`) |
| `npm run db:seed` | Seed demo users/accounts/payees/statements |

## Key features
- **Protected banking shell**: Middleware-free but guarded via `(bank)/layout` requiring an auth cookie before rendering the dashboard, accounts, statements, payments, support, and profile pages.
- **Accessible, high-contrast UI**: OCBC-red palette, large tap targets, skip-link, labelled forms, `aria-live` alerts, and WCAG-friendly focus rings.
- **Testing selectors everywhere**: All actionable buttons, inputs, and links expose `data-testid` attributes for automation suites.
- **Comprehensive banking flows**:
  - Dashboard with quick actions, account cards, and recent transactions
  - Account list/detail with filters, pagination, and CSV export via `/api/accounts/:id/export`
  - Payments (PayNow, Bill Pay, Transfers) backed by Prisma `$transaction` updates and toast confirmations
  - Statements list/detail with downloadable PDFs from `/public/statements`
  - Profile management (display name + password changes)
  - Support FAQs/contact section
- **API routes** that mirror server actions for future integrations (`/api/auth/*`, `/api/payments/*`, `/api/statements`).

## Tests
Playwright specs are not included in this iteration, but the UI was built with deterministic selectors so tests can be added quickly. Run `npm run lint` to validate coding standards.

## Notes
- JWTs expire after 24 hours; update `JWT_SECRET` in production.
- The PDF files under `public/statements` are lightweight placeholders.
- To reset the demo, rerun `npm run db:seed`.
