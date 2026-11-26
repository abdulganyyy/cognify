-- 1. Auto-create profile row when a new user registers in auth.users
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, full_name, avatar_url, preferred_language)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data ->> 'avatar_url',
    coalesce(new.raw_user_meta_data ->> 'preferred_language', 'id')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Backfill any existing auth.users missing a profile row
insert into public.profiles (id, full_name, avatar_url, preferred_language)
select
  u.id,
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name', split_part(u.email, '@', 1)),
  u.raw_user_meta_data ->> 'avatar_url',
  'id'
from auth.users u
where not exists (
  select 1 from public.profiles p where p.id = u.id
);

-- 2. Auto-update updated_at column
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare
  tbl text;
begin
  foreach tbl in array array[
    'profiles',
    'documents',
    'document_sections',
    'document_summaries',
    'document_topics',
    'flashcards',
    'chat_sessions',
    'bookmarks'
  ]
  loop
    execute format('drop trigger if exists set_updated_at_%I on public.%I', tbl, tbl);
    execute format(
      'create trigger set_updated_at_%I before update on public.%I for each row execute function public.set_updated_at()',
      tbl,
      tbl
    );
  end loop;
end;
$$;

-- 3. Expand bookmark types to support document & summary bookmarks
alter table public.bookmarks drop constraint if exists bookmarks_type_check;
alter table public.bookmarks
  add constraint bookmarks_type_check
  check (
    (bookmark_type)::text = any (
      (array['document'::character varying, 'summary'::character varying, 'section'::character varying, 'topic'::character varying, 'flashcard'::character varying, 'text'::character varying])::text[]
    )
  );
