-- Profiles
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz default now(),
  full_name text,
  avatar_url text
);

-- Budgets (one per user for simplicity)
create table if not exists public.budgets (
  user_id uuid primary key references auth.users(id) on delete cascade,
  updated_at timestamptz default now()
);

-- Incomes/Expenses linked to user
create table if not exists public.incomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  name text not null,
  amount numeric not null
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  category text not null,
  amount numeric not null
);

-- Debt + investment preferences per user
create table if not exists public.debts (
  user_id uuid primary key references auth.users(id) on delete cascade,
  balance numeric not null,
  apr numeric not null,
  payment numeric not null
);

create table if not exists public.investments (
  user_id uuid primary key references auth.users(id) on delete cascade,
  principal numeric not null,
  monthly numeric not null,
  rate numeric not null,
  years int not null
);

-- Row Level Security
alter table profiles enable row level security;
alter table budgets enable row level security;
alter table incomes enable row level security;
alter table expenses enable row level security;
alter table debts enable row level security;
alter table investments enable row level security;

-- Policies: users can manage only their own rows
create policy "profiles_self" on profiles for all using (id = auth.uid());
create policy "budgets_self" on budgets for all using (user_id = auth.uid());
create policy "incomes_self" on incomes for all using (user_id = auth.uid());
create policy "expenses_self" on expenses for all using (user_id = auth.uid());
create policy "debts_self" on debts for all using (user_id = auth.uid());
create policy "investments_self" on investments for all using (user_id = auth.uid());
