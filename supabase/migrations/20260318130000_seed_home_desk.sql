insert into public.site_settings (key, value)
values (
  'home.desk',
  jsonb_build_object(
    'director',
    jsonb_build_object(
      'name',
      '',
      'role',
      '',
      'message',
      '',
      'image',
      '',
      'quote',
      '',
      'motto',
      ''
    ),
    'principal',
    jsonb_build_object(
      'name',
      '',
      'role',
      '',
      'message',
      '',
      'image',
      '',
      'quote',
      '',
      'motto',
      ''
    ),
    'fit',
    'cover',
    'version',
    (extract(epoch from now()) * 1000)::bigint
  )
)
on conflict (key) do nothing;
