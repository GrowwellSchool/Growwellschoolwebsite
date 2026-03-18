insert into public.site_settings (key, value)
values (
  'home.life',
  jsonb_build_object(
    'items',
    jsonb_build_array(
      jsonb_build_object('url', '', 'label', ''),
      jsonb_build_object('url', '', 'label', ''),
      jsonb_build_object('url', '', 'label', ''),
      jsonb_build_object('url', '', 'label', ''),
      jsonb_build_object('url', '', 'label', ''),
      jsonb_build_object('url', '', 'label', '')
    ),
    'fit',
    'cover',
    'version',
    (extract(epoch from now()) * 1000)::bigint
  )
)
on conflict (key) do nothing;
