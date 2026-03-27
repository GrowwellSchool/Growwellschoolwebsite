-- Add fit column to events table
alter table public.events add column if not exists fit text default 'contain';

-- Add fit column to blogs table
alter table public.blogs add column if not exists fit text default 'contain';

-- Add fit column to news table
alter table public.news add column if not exists fit text default 'contain';
