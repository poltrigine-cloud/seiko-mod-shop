-- ════════════════════════════════════════════════════════════════════════════
-- MODWATCH — Schema SQL
-- Ejecutar en: Supabase → SQL Editor → New query → pegar todo → Run
-- ════════════════════════════════════════════════════════════════════════════

-- Extensión UUID
create extension if not exists "uuid-ossp";

-- ─── TABLAS ──────────────────────────────────────────────────────────────────

create table public.products (
  id          uuid primary key default uuid_generate_v4(),
  name        text not null,
  description text,
  price       decimal(10,2) not null,
  images      text[] default '{}',
  category    text not null default 'general',
  stock       integer not null default 0,
  featured    boolean not null default false,
  specs       jsonb default '{}',
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create table public.contact_messages (
  id         uuid primary key default uuid_generate_v4(),
  name       text not null,
  email      text not null,
  message    text not null,
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  full_name  text,
  phone      text,
  address    jsonb default '{}',
  created_at timestamptz not null default now()
);

-- ─── ÍNDICES ─────────────────────────────────────────────────────────────────

create index idx_products_category on public.products(category);
create index idx_products_featured  on public.products(featured);

-- ─── FUNCIÓN: updated_at automático ──────────────────────────────────────────

create or replace function public.handle_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger products_updated_at
  before update on public.products
  for each row execute function public.handle_updated_at();

-- ─── FUNCIÓN: crear perfil al registrarse ────────────────────────────────────

create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, full_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ─── FUNCIÓN HELPER: detectar admin ──────────────────────────────────────────
-- IMPORTANTE: cambia el email por el tuyo si es diferente

create or replace function public.is_admin()
returns boolean language sql stable security definer as $$
  select coalesce(auth.jwt() ->> 'email', '') = 'poltrigine@gmail.com'
$$;

-- ─── ROW LEVEL SECURITY ──────────────────────────────────────────────────────

alter table public.products         enable row level security;
alter table public.contact_messages enable row level security;
alter table public.profiles         enable row level security;

-- Products: cualquiera puede leer, solo admin puede escribir
create policy "products_select_all"
  on public.products for select using (true);

create policy "products_admin_insert"
  on public.products for insert
  with check (public.is_admin());

create policy "products_admin_update"
  on public.products for update
  using (public.is_admin());

create policy "products_admin_delete"
  on public.products for delete
  using (public.is_admin());

-- Contact messages: cualquiera puede insertar, solo admin puede leer
create policy "contact_messages_insert_all"
  on public.contact_messages for insert with check (true);

create policy "contact_messages_select_admin"
  on public.contact_messages for select
  using (public.is_admin());

create policy "contact_messages_update_admin"
  on public.contact_messages for update
  using (public.is_admin());

-- Profiles: cada usuario lee/edita el suyo propio; admin lee todos
create policy "profiles_select_own_or_admin"
  on public.profiles for select
  using (auth.uid() = id or public.is_admin());

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);
