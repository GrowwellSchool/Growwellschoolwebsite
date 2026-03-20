create table if not exists public.galleries (
  id text primary key,
  src text not null,
  cat text not null,
  title text default '',
  description text default '',
  fit text default 'cover',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.blogs (
  id text primary key,
  title text not null,
  excerpt text default '',
  author text default '',
  date text default '',
  cat text default '',
  img text not null,
  featured boolean default false,
  read_time text default '',
  cat_color text default 'bg-school-green',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.news (
  id text primary key,
  tag text default 'Update',
  date text default '',
  title text not null,
  excerpt text default '',
  href text default '',
  image text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.events (
  id text primary key,
  title text not null,
  date text default '',
  time text default '',
  venue text default '',
  img text not null,
  cat text default '',
  cat_color text default 'bg-school-green',
  description text default '',
  highlight boolean default false,
  type text default 'upcoming',
  year text default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS & triggers for galleries
alter table public.galleries enable row level security;
create trigger galleries_set_updated_at before update on public.galleries for each row execute function public.set_updated_at();
create policy "galleries_select_all" on public.galleries for select to public using (true);
create policy "galleries_insert_admin" on public.galleries for insert to authenticated with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "galleries_update_admin" on public.galleries for update to authenticated using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')) with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "galleries_delete_admin" on public.galleries for delete to authenticated using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- RLS & triggers for blogs (same as galleries)
alter table public.blogs enable row level security;
create trigger blogs_set_updated_at before update on public.blogs for each row execute function public.set_updated_at();
create policy "blogs_select_all" on public.blogs for select to public using (true);
create policy "blogs_insert_admin" on public.blogs for insert to authenticated with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "blogs_update_admin" on public.blogs for update to authenticated using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')) with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "blogs_delete_admin" on public.blogs for delete to authenticated using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- RLS & triggers for news
alter table public.news enable row level security;
create trigger news_set_updated_at before update on public.news for each row execute function public.set_updated_at();
create policy "news_select_all" on public.news for select to public using (true);
create policy "news_insert_admin" on public.news for insert to authenticated with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "news_update_admin" on public.news for update to authenticated using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')) with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "news_delete_admin" on public.news for delete to authenticated using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- RLS & triggers for events
alter table public.events enable row level security;
create trigger events_set_updated_at before update on public.events for each row execute function public.set_updated_at();
create policy "events_select_all" on public.events for select to public using (true);
create policy "events_insert_admin" on public.events for insert to authenticated with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "events_update_admin" on public.events for update to authenticated using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')) with check (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));
create policy "events_delete_admin" on public.events for delete to authenticated using (exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin'));

-- JSON Extraction (Migration from site_settings)
-- Insert galleries
insert into public.galleries (id, src, cat, title, description, fit)
select 
  coalesce(nullif(item->>'id', ''), gen_random_uuid()::text),
  coalesce(item->>'src', item->>'url', item->>'image', ''),
  coalesce(nullif(section->>'id', ''), 'all'),
  coalesce(item->>'title', item->>'common', ''),
  coalesce(item->>'desc', item->>'details', ''),
  coalesce(section->>'fit', 'cover')
from public.site_settings s, 
jsonb_array_elements(s.value->'sections') section,
jsonb_array_elements(coalesce(section->'items', section->'images', '[]'::jsonb)) item
where s.key = 'gallery.page'
on conflict (id) do nothing;

-- Insert blogs
insert into public.blogs (id, title, excerpt, author, date, cat, img, featured, read_time, cat_color)
select 
  coalesce(nullif(item->>'id', ''), gen_random_uuid()::text),
  coalesce(item->>'title', ''),
  coalesce(item->>'excerpt', ''),
  coalesce(item->>'author', ''),
  coalesce(item->>'date', ''),
  coalesce(item->>'cat', ''),
  coalesce(item->>'img', ''),
  coalesce((item->>'featured')::boolean, false),
  coalesce(item->>'readTime', ''),
  coalesce(item->>'catColor', 'bg-school-green')
from public.site_settings s,
jsonb_array_elements(s.value->'items') item
where s.key = 'blogs.page'
on conflict (id) do nothing;

-- Insert news/announcements (home.news)
insert into public.news (id, tag, date, title, excerpt, href, image)
select 
  coalesce(nullif(item->>'id', ''), gen_random_uuid()::text),
  coalesce(nullif(item->>'tag', ''), 'Update'),
  coalesce(item->>'date', ''),
  coalesce(item->>'title', ''),
  coalesce(item->>'desc', item->>'summary', item->>'details', ''),
  coalesce(item->>'href', coalesce(item->>'url', '')),
  coalesce(item->>'image', item->>'img', item#>>'{photo,url}', '')
from public.site_settings s,
jsonb_array_elements(
  case 
    when jsonb_typeof(s.value) = 'array' then s.value
    else coalesce(s.value->'items', '[]'::jsonb)
  end
) item
where s.key = 'home.news'
on conflict (id) do nothing;

-- Insert upcoming events
insert into public.events (id, title, date, time, venue, img, cat, cat_color, description, highlight, type)
select 
  coalesce(nullif(item->>'id', ''), gen_random_uuid()::text),
  coalesce(item->>'title', ''),
  coalesce(item->>'date', ''),
  coalesce(item->>'time', ''),
  coalesce(item->>'venue', ''),
  coalesce(item->>'img', ''),
  coalesce(item->>'cat', ''),
  coalesce(item->>'catColor', 'bg-school-green'),
  coalesce(item->>'desc', ''),
  coalesce((item->>'highlight')::boolean, false),
  'upcoming'
from public.site_settings s,
jsonb_array_elements(s.value->'calendar') item
where s.key = 'events.page'
on conflict (id) do nothing;

-- Insert past events (moments)
insert into public.events (id, title, year, description, img, type)
select 
  coalesce(nullif(item->>'id', ''), gen_random_uuid()::text),
  coalesce(item->>'title', ''),
  coalesce(item->>'year', ''),
  coalesce(item->>'desc', ''),
  coalesce(item->>'img', ''),
  'past'
from public.site_settings s,
jsonb_array_elements(s.value->'moments') item
where s.key = 'events.page'
on conflict (id) do nothing;
