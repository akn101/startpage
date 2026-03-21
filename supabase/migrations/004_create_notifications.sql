create table if not exists notifications (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  body text not null,
  source text not null default 'other',
  created_at timestamptz not null default now()
);

-- Auto-prune: keep only last 200 notifications
create or replace function prune_notifications() returns trigger language plpgsql as $$
begin
  delete from notifications
  where id in (
    select id from notifications
    order by created_at desc
    offset 200
  );
  return null;
end;
$$;

create trigger trg_prune_notifications
after insert on notifications
execute function prune_notifications();
