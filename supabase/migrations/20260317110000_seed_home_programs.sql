insert into public.site_settings (key, value)
values (
  'home.programs',
  jsonb_build_object(
    'items',
    jsonb_build_array(
      jsonb_build_object('title', '', 'details', '', 'image', ''),
      jsonb_build_object('title', '', 'details', '', 'image', ''),
      jsonb_build_object('title', '', 'details', '', 'image', ''),
      jsonb_build_object('title', '', 'details', '', 'image', ''),
      jsonb_build_object('title', '', 'details', '', 'image', ''),
      jsonb_build_object('title', '', 'details', '', 'image', '')
    ),
    'version',
    (extract(epoch from now()) * 1000)::bigint
  )
)
on conflict (key) do nothing;
