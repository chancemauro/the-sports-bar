create index if not exists articles_author_idx on public.articles(author_id);
create index if not exists posts_author_idx on public.posts(author_id);
create index if not exists post_likes_user_idx on public.post_likes(user_id);
create index if not exists reposts_user_idx on public.reposts(user_id);
create index if not exists follows_following_idx on public.follows(following_id);
alter function public.is_admin(uuid) security invoker;
alter function public.can_publish(uuid) security invoker;
