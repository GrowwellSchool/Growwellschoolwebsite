insert into public.site_settings (key, value)
values (
  'home.news',
  jsonb_build_object(
    'items',
    jsonb_build_array(),
    'fit',
    'cover',
    'version',
    (extract(epoch from now()) * 1000)::bigint
  )
)
on conflict (key) do nothing;
