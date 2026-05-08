create table if not exists public.bookings (
  id uuid primary key,
  booking_date date not null,
  room_name text not null,
  floor text not null,
  from_time text not null,
  to_time text not null,
  team_name text not null,
  purpose text not null,
  created_at timestamptz not null default now()
);

alter table public.bookings enable row level security;

drop policy if exists "Allow public read bookings" on public.bookings;
drop policy if exists "Allow public create bookings" on public.bookings;
drop policy if exists "Allow public update bookings" on public.bookings;
drop policy if exists "Allow public delete bookings" on public.bookings;

create policy "Allow public read bookings"
on public.bookings
for select
to anon
using (true);

create policy "Allow public create bookings"
on public.bookings
for insert
to anon
with check (true);

create policy "Allow public update bookings"
on public.bookings
for update
to anon
using (true)
with check (true);

create policy "Allow public delete bookings"
on public.bookings
for delete
to anon
using (true);

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'bookings'
  ) then
    alter publication supabase_realtime add table public.bookings;
  end if;
end $$;
