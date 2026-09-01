-- ============================================================================
-- RUMO — Schema do banco de dados (Supabase / Postgres)
-- Rode este arquivo inteiro no SQL Editor do painel do Supabase.
-- ============================================================================

-- Extensão para gerar UUIDs
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------------------
-- 1. HOUSEHOLDS (a "família" — unidade que agrupa todos os dados)
-- ----------------------------------------------------------------------------
create table households (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 2. PROFILES (um perfil por usuário autenticado, ligado a uma household)
-- ----------------------------------------------------------------------------
create table profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  household_id uuid not null references households(id) on delete cascade,
  full_name text not null,
  avatar_color text default '#2F5D50',
  avatar_url text,
  created_at timestamptz not null default now()
);

-- Função auxiliar: retorna o household_id do usuário logado
create or replace function current_household_id()
returns uuid
language sql stable
security definer
set search_path = public
as $$
  select household_id from profiles where id = auth.uid()
$$;

-- ----------------------------------------------------------------------------
-- 3. ACCOUNTS (contas: corrente, poupança, cartão, carteira)
-- ----------------------------------------------------------------------------
create table accounts (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  type text not null check (type in ('corrente', 'poupanca', 'cartao', 'carteira', 'investimento')),
  initial_balance numeric(14,2) not null default 0,
  color text default '#2F5D50',
  archived boolean not null default false,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 4. CATEGORIES
-- ----------------------------------------------------------------------------
create table categories (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  kind text not null check (kind in ('receita', 'despesa')),
  color text default '#2F5D50',
  icon text default 'circle',
  parent_id uuid references categories(id) on delete set null,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 5. RECURRING_RULES (regras de recorrência, base para previsões)
-- ----------------------------------------------------------------------------
create table recurring_rules (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  account_id uuid not null references accounts(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  description text not null,
  amount numeric(14,2) not null,
  frequency text not null check (frequency in ('semanal', 'mensal', 'anual')),
  next_occurrence date not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 6. TRANSACTIONS
-- ----------------------------------------------------------------------------
create table transactions (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  account_id uuid not null references accounts(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  profile_id uuid references profiles(id) on delete set null,
  recurring_rule_id uuid references recurring_rules(id) on delete set null,
  description text not null,
  amount numeric(14,2) not null, -- positivo = receita, negativo = despesa
  occurred_at date not null default current_date,
  notes text,
  created_at timestamptz not null default now()
);

create index transactions_household_idx on transactions(household_id, occurred_at desc);

-- ----------------------------------------------------------------------------
-- 7. BUDGETS (orçamento por categoria e mês)
-- ----------------------------------------------------------------------------
create table budgets (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  category_id uuid not null references categories(id) on delete cascade,
  month date not null, -- sempre dia 1 do mês de referência, ex: 2026-08-01
  limit_amount numeric(14,2) not null,
  created_at timestamptz not null default now(),
  unique (household_id, category_id, month)
);

-- ----------------------------------------------------------------------------
-- 8. GOALS (metas financeiras)
-- ----------------------------------------------------------------------------
create table goals (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  target_amount numeric(14,2) not null,
  current_amount numeric(14,2) not null default 0,
  target_date date,
  color text default '#B08A42',
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 9. INVESTMENTS (opcional — fase posterior)
-- ----------------------------------------------------------------------------
create table investments (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  name text not null,
  asset_type text not null check (asset_type in ('renda_fixa', 'acao', 'fundo', 'cripto', 'outro')),
  invested_amount numeric(14,2) not null,
  current_value numeric(14,2) not null,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

-- ----------------------------------------------------------------------------
-- 9b. BILLS (despesas e compromissos com vencimento — diferente de transaction solta)
-- ----------------------------------------------------------------------------
create table bills (
  id uuid primary key default gen_random_uuid(),
  household_id uuid not null references households(id) on delete cascade,
  category_id uuid references categories(id) on delete set null,
  description text not null,
  amount numeric(14,2) not null,
  due_date date not null,
  status text not null default 'pendente' check (status in ('pendente', 'pago', 'atrasado')),
  recurring boolean not null default false,
  created_at timestamptz not null default now()
);

create index bills_household_idx on bills(household_id, due_date);

-- ============================================================================
-- ROW LEVEL SECURITY — cada household só enxerga seus próprios dados
-- ============================================================================
alter table households enable row level security;
alter table profiles enable row level security;
alter table accounts enable row level security;
alter table categories enable row level security;
alter table recurring_rules enable row level security;
alter table transactions enable row level security;
alter table budgets enable row level security;
alter table goals enable row level security;
alter table investments enable row level security;
alter table bills enable row level security;

-- households: só vê a própria
create policy "select own household" on households
  for select using (id = current_household_id());

-- profiles: vê perfis da mesma household
create policy "select household profiles" on profiles
  for select using (household_id = current_household_id());
create policy "update own profile" on profiles
  for update using (id = auth.uid());

-- Política genérica reaproveitada em todas as tabelas "filhas" da household
create policy "select own household data" on accounts
  for select using (household_id = current_household_id());
create policy "modify own household data" on accounts
  for all using (household_id = current_household_id())
  with check (household_id = current_household_id());

create policy "select own household data" on categories
  for select using (household_id = current_household_id());
create policy "modify own household data" on categories
  for all using (household_id = current_household_id())
  with check (household_id = current_household_id());

create policy "select own household data" on recurring_rules
  for select using (household_id = current_household_id());
create policy "modify own household data" on recurring_rules
  for all using (household_id = current_household_id())
  with check (household_id = current_household_id());

create policy "select own household data" on transactions
  for select using (household_id = current_household_id());
create policy "modify own household data" on transactions
  for all using (household_id = current_household_id())
  with check (household_id = current_household_id());

create policy "select own household data" on budgets
  for select using (household_id = current_household_id());
create policy "modify own household data" on budgets
  for all using (household_id = current_household_id())
  with check (household_id = current_household_id());

create policy "select own household data" on goals
  for select using (household_id = current_household_id());
create policy "modify own household data" on goals
  for all using (household_id = current_household_id())
  with check (household_id = current_household_id());

create policy "select own household data" on investments
  for select using (household_id = current_household_id());
create policy "modify own household data" on investments
  for all using (household_id = current_household_id())
  with check (household_id = current_household_id());

create policy "select own household data" on bills
  for select using (household_id = current_household_id());
create policy "modify own household data" on bills
  for all using (household_id = current_household_id())
  with check (household_id = current_household_id());

-- ============================================================================
-- STORAGE: bucket público de avatars, cada usuário só escreve no próprio arquivo
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

create policy "avatar images are publicly accessible"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "users can upload their own avatar"
  on storage.objects for insert
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "users can update their own avatar"
  on storage.objects for update
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- ============================================================================
-- TRIGGER: ao criar um novo usuário (signup), cria household + profile
-- Assim, o primeiro membro da família já entra pronto para uso.
-- ============================================================================
create or replace function handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  new_household_id uuid;
begin
  insert into households (name) values (coalesce(new.raw_user_meta_data->>'household_name', 'Minha família'))
  returning id into new_household_id;

  insert into profiles (id, household_id, full_name)
  values (new.id, new_household_id, coalesce(new.raw_user_meta_data->>'full_name', 'Novo usuário'));

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();
