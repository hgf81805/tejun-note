create table public.tejun_documents (
 owner_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
 id text not null check (char_length(id) between 1 and 120),
 title text not null check (char_length(title) between 1 and 80),
 category text not null check (category in ('総務','IT','人事','経理')),
 description text not null check (char_length(description) between 1 and 160),
 steps jsonb not null check (jsonb_typeof(steps) = 'array' and jsonb_array_length(steps) between 1 and 100),
 step_details jsonb not null default '[]'::jsonb check (jsonb_typeof(step_details) = 'array'),
 favorite boolean not null default false,
 revision integer not null default 1 check (revision > 0),
 updated_at timestamptz not null default now(),
 primary key (owner_id,id)
);
alter table public.tejun_documents enable row level security;
revoke all on public.tejun_documents from anon;
grant select, insert, update, delete on public.tejun_documents to authenticated;
create policy tejun_owner_select on public.tejun_documents for select to authenticated using ((select auth.uid()) = owner_id);
create policy tejun_owner_insert on public.tejun_documents for insert to authenticated with check ((select auth.uid()) = owner_id);
create policy tejun_owner_update on public.tejun_documents for update to authenticated using ((select auth.uid()) = owner_id) with check ((select auth.uid()) = owner_id);
create policy tejun_owner_delete on public.tejun_documents for delete to authenticated using ((select auth.uid()) = owner_id);
comment on table public.tejun_documents is '手順ノート専用。ログイン本人のみアクセス可能。';
create policy tejun_verified_login on public.tejun_documents as restrictive for all to authenticated using (coalesce((select auth.jwt()->>'is_anonymous'),'false') = 'false') with check (coalesce((select auth.jwt()->>'is_anonymous'),'false') = 'false');
