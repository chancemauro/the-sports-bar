-- Prevent normal users from changing their own role/approval fields.
-- Run this after 001. Admin mutations should use the RPC below.

create or replace function public.update_my_profile(p_display_name text, p_bio text, p_avatar_url text)
returns void language sql security definer set search_path='' as $$
  update public.profiles set display_name=p_display_name,bio=p_bio,avatar_url=p_avatar_url,updated_at=now() where id=auth.uid();
$$;

drop policy if exists "profile owner limited update" on public.profiles;
create policy "profiles self editable metadata" on public.profiles for update to authenticated using (id=auth.uid()) with check (id=auth.uid());

revoke update on public.profiles from authenticated;
grant execute on function public.update_my_profile(text,text,text) to authenticated;

create or replace function public.admin_set_user_access(target_id uuid,new_role public.app_role,new_approval public.approval_status,new_can_post boolean)
returns void language plpgsql security definer set search_path='' as $$
begin
 if not public.is_admin(auth.uid()) then raise exception 'Not authorized'; end if;
 if exists(select 1 from public.profiles where id=target_id and role='owner') and target_id<>auth.uid() then raise exception 'Owner role protected'; end if;
 update public.profiles set role=new_role,approval_status=new_approval,can_post=new_can_post,updated_at=now() where id=target_id;
end; $$;
grant execute on function public.admin_set_user_access(uuid,public.app_role,public.approval_status,boolean) to authenticated;
