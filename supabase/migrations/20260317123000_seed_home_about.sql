insert into public.site_settings (key, value)
values (
  'home.about',
  jsonb_build_object(
    'images',
    jsonb_build_array('', '', ''),
    'fit',
    'cover',
    'details',
    '',
    'mission',
    '',
    'vision',
    '',
    'version',
    (extract(epoch from now()) * 1000)::bigint
  )
)
on conflict (key) do nothing;
