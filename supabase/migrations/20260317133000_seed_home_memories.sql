insert into public.site_settings (key, value)
values (
  'home.memories',
  jsonb_build_object(
    'items',
    jsonb_build_array(
      jsonb_build_object('common', '', 'binomial', '', 'photo', jsonb_build_object('url', '', 'text', '', 'pos', '50% 50%', 'by', '')),
      jsonb_build_object('common', '', 'binomial', '', 'photo', jsonb_build_object('url', '', 'text', '', 'pos', '50% 50%', 'by', '')),
      jsonb_build_object('common', '', 'binomial', '', 'photo', jsonb_build_object('url', '', 'text', '', 'pos', '50% 50%', 'by', '')),
      jsonb_build_object('common', '', 'binomial', '', 'photo', jsonb_build_object('url', '', 'text', '', 'pos', '50% 50%', 'by', '')),
      jsonb_build_object('common', '', 'binomial', '', 'photo', jsonb_build_object('url', '', 'text', '', 'pos', '50% 50%', 'by', '')),
      jsonb_build_object('common', '', 'binomial', '', 'photo', jsonb_build_object('url', '', 'text', '', 'pos', '50% 50%', 'by', '')),
      jsonb_build_object('common', '', 'binomial', '', 'photo', jsonb_build_object('url', '', 'text', '', 'pos', '50% 50%', 'by', '')),
      jsonb_build_object('common', '', 'binomial', '', 'photo', jsonb_build_object('url', '', 'text', '', 'pos', '50% 50%', 'by', '')),
      jsonb_build_object('common', '', 'binomial', '', 'photo', jsonb_build_object('url', '', 'text', '', 'pos', '50% 50%', 'by', '')),
      jsonb_build_object('common', '', 'binomial', '', 'photo', jsonb_build_object('url', '', 'text', '', 'pos', '50% 50%', 'by', ''))
    ),
    'fit',
    'cover',
    'version',
    (extract(epoch from now()) * 1000)::bigint
  )
)
on conflict (key) do nothing;
