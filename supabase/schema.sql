-- À exécuter dans Supabase > SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  reference text not null unique,
  type text not null check (type in ('plainte', 'partenariat', 'reinsertion')),
  status text not null default 'recu' check (status in ('recu', 'en_etude', 'accepte', 'refuse', 'classe')),
  payload jsonb not null default '{}'::jsonb,
  discord_name text,
  staff_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.submissions enable row level security;

create policy "Citoyen: créer son dossier"
on public.submissions for insert
to authenticated
with check (auth.uid() = user_id);

create policy "Citoyen: lire ses dossiers"
on public.submissions for select
to authenticated
using (auth.uid() = user_id);

-- Les droits du personnel DOJ seront ajoutés dans la prochaine phase
-- avec une table profiles et un rôle staff/admin.
