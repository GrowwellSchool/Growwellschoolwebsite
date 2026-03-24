-- Migration: Add start_time and end_time columns to events table
-- Created: 2026-03-24

-- Add new columns for time range
alter table public.events 
  add column if not exists start_time text default '',
  add column if not exists end_time text default '';

-- Migrate existing data: if time exists, put it in start_time
update public.events 
  set start_time = time 
  where time is not null and time != '' and (start_time is null or start_time = '');

-- Optional: Remove old time column after migration (commented out for safety)
-- alter table public.events drop column if exists time;
