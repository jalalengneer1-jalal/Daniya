# Local SQL verification

`local_bootstrap.sql` creates only the minimal roles and schemas needed to compile the production migration in a disposable PostgreSQL database. It is not a deployment migration.

After applying the production migration to that disposable database, `security_smoke.sql` verifies trusted order-price calculation, generated line totals, contact/order RPCs, explicit admin authorization, admin reports, order status updates, and audit logging.

The test harness should additionally run direct statements as `anon` and as a non-admin `authenticated` role and assert that private reads and all forbidden writes fail. These tests must never target production.
