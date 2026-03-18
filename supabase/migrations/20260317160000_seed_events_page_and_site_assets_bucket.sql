insert into storage.buckets (id, name, public)
values ('site-assets', 'site-assets', true)
on conflict (id) do nothing;

drop policy if exists "site_assets_select_admin" on storage.objects;
create policy "site_assets_select_admin"
on storage.objects
for select
to authenticated
using (
  bucket_id = 'site-assets'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "site_assets_insert_admin" on storage.objects;
create policy "site_assets_insert_admin"
on storage.objects
for insert
to authenticated
with check (
  bucket_id = 'site-assets'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "site_assets_update_admin" on storage.objects;
create policy "site_assets_update_admin"
on storage.objects
for update
to authenticated
using (
  bucket_id = 'site-assets'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
)
with check (
  bucket_id = 'site-assets'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);

drop policy if exists "site_assets_delete_admin" on storage.objects;
create policy "site_assets_delete_admin"
on storage.objects
for delete
to authenticated
using (
  bucket_id = 'site-assets'
  and exists (select 1 from public.profiles p where p.id = auth.uid() and p.role = 'admin')
);
