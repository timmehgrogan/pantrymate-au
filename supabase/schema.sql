-- PantryMate AU — Supabase schema
-- Run this in the Supabase SQL Editor to set up your database

-- ── Enable UUID generation ────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";

-- ── pantry_items ─────────────────────────────────────────────────────────────
create table if not exists pantry_items (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  brand        text,
  barcode      text,
  category     text not null check (category in ('fridge', 'freezer', 'pantry')),
  quantity     numeric not null default 1,
  unit         text not null default 'pcs',
  expiry_date  date,
  image_url    text,
  notes        text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);

-- Index for fast user queries
create index if not exists pantry_items_user_id_idx on pantry_items(user_id);
create index if not exists pantry_items_category_idx on pantry_items(user_id, category);
create index if not exists pantry_items_expiry_idx on pantry_items(user_id, expiry_date) where expiry_date is not null;

-- Row Level Security
alter table pantry_items enable row level security;

create policy "Users can manage their own pantry items"
  on pantry_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── shopping_items ────────────────────────────────────────────────────────────
create table if not exists shopping_items (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid not null references auth.users(id) on delete cascade,
  name         text not null,
  quantity     numeric not null default 1,
  unit         text not null default 'pcs',
  recipe_id    text,
  recipe_name  text,
  is_checked   boolean not null default false,
  created_at   timestamptz not null default now()
);

create index if not exists shopping_items_user_id_idx on shopping_items(user_id);

alter table shopping_items enable row level security;

create policy "Users can manage their own shopping items"
  on shopping_items for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ── user_profiles ─────────────────────────────────────────────────────────────
create table if not exists user_profiles (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  display_name  text,
  avatar_url    text,
  is_premium    boolean not null default false,
  created_at    timestamptz not null default now()
);

alter table user_profiles enable row level security;

create policy "Users can view and update their own profile"
  on user_profiles for all
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- Auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.user_profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── updated_at trigger ────────────────────────────────────────────────────────
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger pantry_items_updated_at
  before update on pantry_items
  for each row execute function update_updated_at_column();
