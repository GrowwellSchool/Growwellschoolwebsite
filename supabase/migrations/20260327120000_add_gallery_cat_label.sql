-- Add cat_label column to galleries table to store the human-readable category name
-- Previously this was stored only in site_settings JSON blob
alter table public.galleries add column if not exists cat_label text default '';

-- Backfill cat_label from site_settings for existing rows
update public.galleries g
set cat_label = coalesce(section->>'label', section->>'title', g.cat)
from public.site_settings s,
jsonb_array_elements(s.value->'sections') section
where s.key = 'gallery.page'
  and section->>'id' = g.cat
  and (g.cat_label is null or g.cat_label = '');
