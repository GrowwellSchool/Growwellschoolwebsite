create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  phone text,
  subject text not null,
  message text not null,
  created_at timestamptz not null default now()
);

alter table public.contact_messages enable row level security;

drop policy if exists "contact_messages_insert_public" on public.contact_messages;
create policy "contact_messages_insert_public"
on public.contact_messages
for insert
to public
with check (true);

drop policy if exists "contact_messages_select_admin" on public.contact_messages;
create policy "contact_messages_select_admin"
on public.contact_messages
for select
to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "contact_messages_update_admin" on public.contact_messages;
create policy "contact_messages_update_admin"
on public.contact_messages
for update
to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'))
with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

drop policy if exists "contact_messages_delete_admin" on public.contact_messages;
create policy "contact_messages_delete_admin"
on public.contact_messages
for delete
to authenticated
using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
