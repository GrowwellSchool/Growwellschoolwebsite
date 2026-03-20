alter table public.contact_messages
  add column if not exists replied boolean not null default false,
  add column if not exists replied_at timestamptz,
  add column if not exists replied_by uuid references auth.users(id) on delete set null,
  add column if not exists reply_note text;

create index if not exists contact_messages_replied_created_at_idx
  on public.contact_messages (replied, created_at desc);
