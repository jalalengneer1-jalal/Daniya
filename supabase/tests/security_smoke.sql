\set ON_ERROR_STOP on

insert into public.products
  (name, name_en, name_fr, description, description_en, description_fr, category, price, image)
values
  ('عسل سدر', 'Sidr honey', 'Miel de jujubier', 'عسل طبيعي', 'Natural honey', 'Miel naturel', 'honey', 25, 'https://example.com/honey.jpg');

set role service_role;
select public.submit_contact_internal('Test customer', 'customer@example.com', '+25377000000', 'A valid test message.');
select public.create_order_internal(
  'Test customer', '+25377000000', 'Djibouti', 'Smoke test',
  '[{"product_id":1,"quantity":2}]'::jsonb, 'en', '11111111-1111-4111-8111-111111111111'
);
reset role;

do $$
begin
  if (select total_amount from public.orders where id = 1) <> 50 then
    raise exception 'server-calculated order total is incorrect';
  end if;
  if (select unit_price from public.order_items where order_id = 1) <> 25 then
    raise exception 'trusted unit price was not preserved';
  end if;
  if (select line_total from public.order_items where order_id = 1) <> 50 then
    raise exception 'generated line total is incorrect';
  end if;
  if has_function_privilege('anon', 'public.create_order_internal(text,text,text,text,jsonb,text,uuid)', 'EXECUTE') then
    raise exception 'anonymous role can execute trusted order function';
  end if;
  if has_table_privilege('anon', 'public.contacts', 'SELECT')
     or has_table_privilege('anon', 'public.orders', 'INSERT')
     or has_table_privilege('anon', 'public.analytics_events', 'INSERT') then
    raise exception 'anonymous role has a forbidden table privilege';
  end if;
  begin
    perform public.create_order_internal(
      'Duplicate test', '123456', '', '',
      '[{"product_id":1,"quantity":1},{"product_id":1,"quantity":1}]'::jsonb,
      'en', null
    );
    raise exception 'duplicate order items were accepted';
  exception when sqlstate '22023' then
    null;
  end;
  if (select count(*) from public.orders) <> 1 then
    raise exception 'rejected order was not atomic';
  end if;
end $$;

set role service_role;
do $$
begin
  if not public.consume_rate_limit('smoke', repeat('a', 64), 2, 60)
     or not public.consume_rate_limit('smoke', repeat('a', 64), 2, 60)
     or public.consume_rate_limit('smoke', repeat('a', 64), 2, 60) then
    raise exception 'rate limiter behavior failed';
  end if;
end $$;
reset role;

insert into auth.users(id, email) values
  ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'admin@example.com'),
  ('bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb', 'user@example.com');
insert into public.admin_users(user_id, role, active)
values ('aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', 'admin', true);

select set_config('request.jwt.claim.sub', 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa', false);
set role authenticated;
do $$ begin if not public.is_admin() then raise exception 'admin check failed'; end if; end $$;
update public.orders set status = 'confirmed' where id = 1;
select public.admin_dashboard_summary();
select public.admin_analytics_report(now() - interval '30 days', now());
reset role;

do $$
begin
  if (select status from public.orders where id = 1) <> 'confirmed' then
    raise exception 'admin order status update failed';
  end if;
  if not exists (select 1 from public.admin_audit_logs where entity_type = 'orders' and entity_id = '1') then
    raise exception 'admin audit log was not written';
  end if;
end $$;
