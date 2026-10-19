-- Análises de cidades feitas no onboarding. Rodar uma vez no SQL Editor do Supabase.
-- Cada pessoa só lê, cria e apaga as próprias análises (Row Level Security).

create table if not exists public.analises (
    id uuid primary key default gen_random_uuid(),
    user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
    criada_em timestamptz not null default now(),
    versao_questionario integer not null,
    versao_dados text not null,
    respostas jsonb not null,
    resultados jsonb not null -- top 10 do ranking: [{ ibge, cidade, match, pontosFortes, pontosAtencao }]
);

create index if not exists analises_user_id_criada_em_idx on public.analises (user_id, criada_em desc);

alter table public.analises enable row level security;

drop policy if exists "Ler as próprias análises" on public.analises;
create policy "Ler as próprias análises" on public.analises
    for select to authenticated using (user_id = auth.uid());

drop policy if exists "Criar as próprias análises" on public.analises;
create policy "Criar as próprias análises" on public.analises
    for insert to authenticated with check (user_id = auth.uid());

drop policy if exists "Apagar as próprias análises" on public.analises;
create policy "Apagar as próprias análises" on public.analises
    for delete to authenticated using (user_id = auth.uid());
