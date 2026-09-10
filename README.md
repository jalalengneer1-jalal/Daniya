# Daniya Store

Daniya is a production-oriented multilingual storefront and administration dashboard for natural products, spices, honey, dates, nuts, food, and oils. The public site supports Arabic (RTL), English, and French, with persistent theme and language preferences, a local cart, transactional order creation, and a WhatsApp handoff. The backend targets a **new, dedicated Supabase project**.

## What is included

- Responsive public pages: home, about, products, gallery, contact, cart, checkout, and not-found.
- Search and category filters backed by URL parameters.
- Arabic, English, and French content with correct RTL/LTR switching.
- Persistent cart with quantity controls, validation, and trusted server-side price calculation.
- WhatsApp order handoff after the order is committed successfully.
- Protected admin login and dashboard.
- Admin CRUD for products, advertisements, and gallery media.
- Admin order management, contact inbox, audit trail support, and real analytics reports.
- Lazy-loaded routes, semantic metadata, sitemap, manifest, and deployment security headers.
- A complete Supabase schema, RLS policies, storage policies, validated Edge Functions, and local SQL security tests.

## Architecture

```text
Browser (React + Vite)
  |-- anonymous reads ----------> Supabase REST (products, ads, gallery only)
  |-- validated public writes --> Edge Functions
  |                                 |-- rate limiting
  |                                 |-- payload validation
  |                                 `-- service-role RPCs
  |-- admin session ------------> Supabase Auth + RLS-protected admin queries
  `-- completed order ----------> WhatsApp deep link for customer confirmation

Supabase PostgreSQL
  |-- catalog: products, advertisements, gallery
  |-- commerce: orders, order_items
  |-- operations: contacts, admin_users
  `-- observability: analytics_events, admin_audit_logs, rate_limit_buckets
```

Key directories:

- `src/pages` contains public routes and the `admin` dashboard routes.
- `src/services` is the browser data-access boundary.
- `src/contexts` owns authentication, cart, locale, and theme state.
- `src/locales/translations.js` contains matching AR/EN/FR dictionaries.
- `supabase/migrations` contains the deployable database schema and policies.
- `supabase/functions` contains the public order, contact, and analytics gateways.
- `supabase/tests` contains local bootstrap and security smoke tests.
- `dist` is the verified production build included in the delivery archive.

## Local setup

Requirements: Node.js `20.19.1` or a newer supported release and npm.

```powershell
Copy-Item .env.example .env
npm install
npm run dev
```

Fill `.env` using values from the **new Daniya Supabase project**. The legacy project must not be reused.

### Browser environment variables

| Variable | Purpose | Exposure |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | URL of the new Supabase project | Browser-safe |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | New project's publishable key | Browser-safe; RLS remains mandatory |
| `VITE_WHATSAPP_ORDER_NUMBER` | Destination number without `+` or spaces | Browser-safe |
| `VITE_SITE_URL` | Canonical production origin | Browser-safe |

Server-only values such as `SUPABASE_SERVICE_ROLE_KEY` and `RATE_LIMIT_SALT` must be stored as Supabase Edge Function secrets. Never prefix a secret with `VITE_`, place it in `.env`, or commit it.

If browser configuration is missing, the site renders a controlled configuration error instead of silently connecting to another project.

## New Supabase project deployment

Follow [`supabase/README.md`](supabase/README.md). In summary:

```powershell
supabase login
supabase link --project-ref <NEW_PROJECT_REF>
supabase db push
supabase secrets set ALLOWED_ORIGINS=https://your-domain.example RATE_LIMIT_SALT=<LONG_RANDOM_VALUE>
supabase functions deploy create-order --no-verify-jwt
supabase functions deploy submit-contact --no-verify-jwt
supabase functions deploy ingest-analytics --no-verify-jwt
```

Then disable public sign-up, create the administrator in Supabase Auth, and add that user's UUID to `public.admin_users` as documented. There is intentionally no public registration or role-selection flow.

## Data and security decisions

- Row Level Security is enabled on every application table.
- Anonymous users can only read products, advertisements, gallery records, and public gallery objects.
- Anonymous clients cannot insert directly into orders, contacts, or analytics tables.
- Public writes pass through narrow Edge Functions with origin checks, request-size limits, payload validation, event allowlists, IP-hash rate limits, and safe error responses.
- The service-role key exists only in the Edge Function runtime.
- Order creation accepts product IDs and quantities, then reads current names and prices in PostgreSQL. Client-supplied prices and totals are never trusted.
- Orders and their line items are committed atomically. Duplicate product lines, excessive quantities, and unknown products are rejected.
- Admin authorization is checked server-side against `admin_users`; route protection in React is only an additional UX boundary.
- Admin mutations to managed business tables are recorded in `admin_audit_logs`.
- Storage uploads use generated paths and allowlisted image/video MIME types and size limits.
- CSP, anti-clickjacking, referrer, MIME-sniffing, permissions, and HSTS headers are supplied for Netlify-style hosts, Apache, and Vercel.
- Analytics stores a random session identifier and a small allowlisted metadata object; it does not store search terms or arbitrary client fields.
- The original embedded Supabase credentials and Google Maps browser key were removed. Rotate/restrict any keys that were previously committed and retire the legacy Supabase project after exporting anything still needed.

## Ordering and WhatsApp

Checkout first creates the authoritative database order. Only after success does it build a message from the trusted returned order and open `wa.me`. This is the credential-free WhatsApp integration level: the user must still press **Send** in WhatsApp, so the dashboard records an order as created, not as a confirmed WhatsApp delivery.

Automatic message delivery and delivery receipts require an approved Meta WhatsApp Business API account, sender ID, access token, templates, and webhook secret. Those credentials were not provided and are deliberately not simulated.

## Verification

```powershell
npm run lint
npm run build
npm audit --audit-level=moderate
```

Final verification completed successfully with:

- ESLint: zero warnings/errors.
- Vite production build: successful, with route-level chunks.
- npm audit: zero known vulnerabilities across production and development dependencies.
- Responsive browser smoke tests: home, products, contact, checkout, cart, and admin login at mobile/tablet/desktop sizes; no document-level horizontal overflow.
- Locale smoke tests: Arabic RTL and English/French LTR.
- PostgreSQL security smoke suite: schema application, RLS denials, admin authorization, atomic trusted-price orders, status constraints, rate limiting, analytics constraints, reports, and audit logging.

The SQL tests can be run against a disposable local PostgreSQL database. See [`supabase/tests/README.md`](supabase/tests/README.md). Do not run the bootstrap fixture against production.

## Production deployment

1. Deploy the new Supabase schema/functions and create the first administrator.
2. Set the four browser environment variables in the hosting provider.
3. Run `npm ci && npm run build` and deploy `dist`.
4. Confirm the host applies the supplied SPA fallback and security headers.
5. Add the production origin to `ALLOWED_ORIGINS` and test checkout, contact, storage upload, and admin access against the new project.
6. Restrict/rotate previously exposed keys and decommission the legacy project only after migration validation.

## Known operational limits

- No live new-project connection or deployment was possible without the new Supabase project reference and credentials; local PostgreSQL and browser behavior were tested instead.
- WhatsApp opening is observable, but actual sending/delivery is not available with a deep link.
- Anonymous analytics are session-oriented and intentionally avoid invasive identity tracking; they are not a unique-human measurement system.
- Anti-spam currently combines a honeypot, strict validation, origin checks, and server-side rate limiting. High-volume deployments may add a privacy-conscious CAPTCHA in the Edge Function flow.
- Gallery file deletion and database-record deletion are separate Supabase operations; an interrupted network request can require manual orphan cleanup.
