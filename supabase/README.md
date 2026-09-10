# Daniya Supabase deployment

This folder targets a new, dedicated Supabase project. Never link or deploy it to the legacy project.

1. Create the new project and copy its URL and browser-safe publishable key into a local `.env` based on `.env.example`.
2. Install the Supabase CLI, run `supabase login`, then `supabase link --project-ref <NEW_PROJECT_REF>`.
3. Apply the schema with `supabase db push`.
4. Set Edge Function secrets (server-side only):

   `supabase secrets set ALLOWED_ORIGINS=https://your-domain.example RATE_LIMIT_SALT=<LONG_RANDOM_VALUE>`

   Supabase supplies `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to deployed functions. Never add the service-role key to Vite variables.
5. Deploy the public functions:

   `supabase functions deploy create-order --no-verify-jwt`

   `supabase functions deploy submit-contact --no-verify-jwt`

   `supabase functions deploy ingest-analytics --no-verify-jwt`

6. In Supabase Authentication, disable public sign-up. Create an administrator user manually, copy its UUID, and run this once in the SQL editor while signed in as the project owner:

   `insert into public.admin_users (user_id, role, active) values ('AUTH_USER_UUID', 'admin', true);`

There is deliberately no public admin-registration flow. Removing or deactivating that row immediately revokes database authorization even if the user still has an Auth session.

The `gallery` bucket is public for reads and restricted to active admins for upload/update/delete. Orders, contacts, analytics, audit logs, and rate-limit data have no anonymous read policy. Public order/contact/analytics writes go only through validated, rate-limited Edge Functions.
