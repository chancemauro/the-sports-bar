create extension if not exists pgcrypto;

create type public.app_role as enum ('user','contributor','writer','editor','admin','owner','suspended');
create type public.approval_status as enum ('pending','approved','rejected');
create type public.article_status as enum ('draft','review','published','archived');

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  display_name text,
  bio text default '',
  avatar_url text,
  role public.app_role not null default 'user',
  approval_status public.approval_status not null default 'pending',
  can_post boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.articles (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  slug text unique not null,
  summary text not null,
  body text not null,
  sport text,
  cover_url text,
  status public.article_status not null default 'draft',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.posts (
  id uuid primary key default gen_random_uuid(),
  author_id uuid not null references public.profiles(id) on delete cascade,
  parent_id uuid references public.posts(id) on delete cascade,
  body text not null default '',
  image_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.post_likes (
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(post_id,user_id)
);

create table public.reposts (
  post_id uuid references public.posts(id) on delete cascade,
  user_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(post_id,user_id)
);

create table public.follows (
  follower_id uuid references public.profiles(id) on delete cascade,
  following_id uuid references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(follower_id,following_id),
  check(follower_id <> following_id)
);

create or replace function public.handle_new_user() returns trigger
language plpgsql security definer set search_path='' as $$
begin
  insert into public.profiles(id,username,display_name)
  values(new.id,coalesce(nullif(new.raw_user_meta_data->>'username',''),'user_'||substr(new.id::text,1,8)),coalesce(new.raw_user_meta_data->>'username','New User'));
  return new;
end; $$;
revoke all on function public.handle_new_user() from public, anon, authenticated;

create trigger on_auth_user_created after insert on auth.users
for each row execute procedure public.handle_new_user();

create or replace function public.is_admin(uid uuid default auth.uid()) returns boolean
language sql stable security definer set search_path='' as $$
  select uid is not null and exists(
    select 1 from public.profiles p where p.id=uid and p.role in ('admin','owner')
  );
$$;
revoke all on function public.is_admin(uuid) from public, anon;
grant execute on function public.is_admin(uuid) to authenticated;

create or replace function public.can_publish(uid uuid default auth.uid()) returns boolean
language sql stable security definer set search_path='' as $$
  select uid is not null and exists(
    select 1 from public.profiles p
    where p.id=uid and p.role in ('writer','editor','admin','owner') and p.approval_status='approved'
  );
$$;
revoke all on function public.can_publish(uuid) from public, anon;
grant execute on function public.can_publish(uuid) to authenticated;

create or replace function public.update_my_profile(p_display_name text, p_bio text, p_avatar_url text)
returns void language plpgsql security definer set search_path='' as $$
begin
  if auth.uid() is null then raise exception 'Not authenticated'; end if;
  update public.profiles
  set display_name=p_display_name,bio=p_bio,avatar_url=p_avatar_url,updated_at=now()
  where id=auth.uid();
end; $$;
revoke all on function public.update_my_profile(text,text,text) from public, anon;
grant execute on function public.update_my_profile(text,text,text) to authenticated;

create or replace function public.admin_set_user_access(target_id uuid,new_role public.app_role,new_approval public.approval_status,new_can_post boolean)
returns void language plpgsql security definer set search_path='' as $$
begin
  if auth.uid() is null or not public.is_admin(auth.uid()) then raise exception 'Not authorized'; end if;
  if exists(select 1 from public.profiles where id=target_id and role='owner') and target_id<>auth.uid() then
    raise exception 'Owner role protected';
  end if;
  update public.profiles
  set role=new_role,approval_status=new_approval,can_post=new_can_post,updated_at=now()
  where id=target_id;
end; $$;
revoke all on function public.admin_set_user_access(uuid,public.app_role,public.approval_status,boolean) from public, anon;
grant execute on function public.admin_set_user_access(uuid,public.app_role,public.approval_status,boolean) to authenticated;

alter table public.profiles enable row level security;
alter table public.articles enable row level security;
alter table public.posts enable row level security;
alter table public.post_likes enable row level security;
alter table public.reposts enable row level security;
alter table public.follows enable row level security;

grant select on public.profiles,public.articles,public.posts,public.post_likes,public.reposts,public.follows to anon, authenticated;
grant insert,update,delete on public.articles,public.posts,public.post_likes,public.reposts,public.follows to authenticated;

create policy "profiles public read" on public.profiles for select using (true);

create policy "published articles public read" on public.articles for select
using (status='published' or author_id=auth.uid() or public.is_admin());
create policy "approved writers insert articles" on public.articles for insert to authenticated
with check (author_id=auth.uid() and public.can_publish());
create policy "authors update own articles" on public.articles for update to authenticated
using ((author_id=auth.uid() and public.can_publish()) or public.is_admin())
with check ((author_id=auth.uid() and public.can_publish()) or public.is_admin());
create policy "authors delete own articles" on public.articles for delete to authenticated
using ((author_id=auth.uid() and public.can_publish()) or public.is_admin());

create policy "posts public read" on public.posts for select using (true);
create policy "signed in post" on public.posts for insert to authenticated
with check (author_id=auth.uid() and exists(
  select 1 from public.profiles p where p.id=auth.uid() and p.role<>'suspended' and p.can_post=true
));
create policy "own posts update" on public.posts for update to authenticated
using (author_id=auth.uid() or public.is_admin())
with check (author_id=auth.uid() or public.is_admin());
create policy "own posts delete" on public.posts for delete to authenticated
using (author_id=auth.uid() or public.is_admin());

create policy "likes public read" on public.post_likes for select using (true);
create policy "like as self" on public.post_likes for insert to authenticated with check (user_id=auth.uid());
create policy "unlike as self" on public.post_likes for delete to authenticated using (user_id=auth.uid());
create policy "reposts public read" on public.reposts for select using (true);
create policy "repost as self" on public.reposts for insert to authenticated with check (user_id=auth.uid());
create policy "unrepost as self" on public.reposts for delete to authenticated using (user_id=auth.uid());
create policy "follows public read" on public.follows for select using (true);
create policy "follow as self" on public.follows for insert to authenticated with check (follower_id=auth.uid());
create policy "unfollow as self" on public.follows for delete to authenticated using (follower_id=auth.uid());

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types) values
('avatars','avatars',true,5242880,array['image/jpeg','image/png','image/webp']),
('post-media','post-media',true,10485760,array['image/jpeg','image/png','image/webp','image/gif']),
('article-media','article-media',true,15728640,array['image/jpeg','image/png','image/webp'])
on conflict (id) do nothing;

create policy "public media read" on storage.objects for select
using (bucket_id in ('avatars','post-media','article-media'));
create policy "users upload own media" on storage.objects for insert to authenticated
with check (bucket_id in ('avatars','post-media','article-media') and (storage.foldername(name))[1]=auth.uid()::text);
create policy "users update own media" on storage.objects for update to authenticated
using (bucket_id in ('avatars','post-media','article-media') and (storage.foldername(name))[1]=auth.uid()::text)
with check (bucket_id in ('avatars','post-media','article-media') and (storage.foldername(name))[1]=auth.uid()::text);
create policy "users delete own media" on storage.objects for delete to authenticated
using (bucket_id in ('avatars','post-media','article-media') and (storage.foldername(name))[1]=auth.uid()::text);

create index articles_status_published_idx on public.articles(status,published_at desc);
create index posts_created_idx on public.posts(created_at desc);
create index posts_parent_idx on public.posts(parent_id);
