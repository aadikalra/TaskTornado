begin;

-- A shared class keeps its original ID. Personal class grades are never exposed.
create table public.classroom_collaborations (
  class_id uuid primary key references public.classes(id) on delete cascade,
  created_at timestamptz not null default now()
);
create table public.classroom_members (
  class_id uuid not null references public.classroom_collaborations(class_id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  joined_at timestamptz not null default now(),
  primary key (class_id, user_id)
);
create index on public.classroom_members(user_id);
create table public.classroom_invites (
  token_hash text primary key,
  class_id uuid not null references public.classroom_collaborations(class_id) on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '7 days',
  revoked_at timestamptz
);
create index on public.classroom_invites(class_id);
create table public.classroom_revisions (
  class_id uuid primary key references public.classroom_collaborations(class_id) on delete cascade,
  revision bigint not null default 1
);
create table public.classroom_test_results (
  test_id uuid not null references public.tests(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  score double precision, max_score double precision, grade text, weight double precision,
  primary key(test_id,user_id)
);

create function public.classroom_is_shared(p_class_id uuid) returns boolean
language sql stable security definer set search_path=pg_catalog,public as $$
  select exists(select 1 from public.classroom_collaborations where class_id=p_class_id);
$$;
create function public.classroom_is_member(p_class_id uuid) returns boolean
language sql stable security definer set search_path=pg_catalog,public as $$
  select public.is_launch_eligible(auth.uid()) and exists(
    select 1 from public.classroom_members where class_id=p_class_id and user_id=auth.uid()
  );
$$;
create function public.classroom_assert_eligible() returns void
language plpgsql stable security definer set search_path=pg_catalog,public as $$
begin
  if auth.uid() is null or not public.is_launch_eligible(auth.uid()) then
    raise exception 'Sign in with an eligible TaskTornado account to continue.' using errcode='42501';
  end if;
end;
$$;

-- No direct reads of invite tokens, other members' personal grades or test results.
alter table public.classroom_collaborations enable row level security;
alter table public.classroom_members enable row level security;
alter table public.classroom_invites enable row level security;
alter table public.classroom_revisions enable row level security;
alter table public.classroom_test_results enable row level security;
revoke all on public.classroom_collaborations,public.classroom_members,public.classroom_invites,public.classroom_revisions,public.classroom_test_results from anon,authenticated;
grant select on public.classroom_revisions,public.classroom_members to authenticated;
create policy classroom_revision_read on public.classroom_revisions for select to authenticated using(public.classroom_is_member(class_id));
create policy classroom_own_membership_read on public.classroom_members for select to authenticated using(user_id=auth.uid() and public.is_launch_eligible(auth.uid()));

create policy classroom_homework_read on public.homework for select to authenticated using(public.classroom_is_member(class_id));
create policy classroom_homework_insert on public.homework for insert to authenticated with check(public.classroom_is_member(class_id) and user_id=auth.uid());
create policy classroom_homework_update on public.homework for update to authenticated using(public.classroom_is_member(class_id)) with check(public.classroom_is_member(class_id));
create policy classroom_homework_delete on public.homework for delete to authenticated using(public.classroom_is_member(class_id));
-- Revocation also removes access to shared rows the former member authored.
create policy classroom_homework_membership_required on public.homework as restrictive for all to authenticated
  using(not public.classroom_is_shared(class_id) or public.classroom_is_member(class_id))
  with check(not public.classroom_is_shared(class_id) or public.classroom_is_member(class_id));
create policy classroom_tests_membership_required on public.tests as restrictive for all to authenticated
  using(not public.classroom_is_shared(class_id) or public.classroom_is_member(class_id))
  with check(not public.classroom_is_shared(class_id) or public.classroom_is_member(class_id));

create function public.classroom_guard_task_identity() returns trigger
language plpgsql security definer set search_path=pg_catalog,public as $$
begin
  if auth.uid() is null and (auth.role()='service_role' or (auth.role() is null and session_user in ('postgres','supabase_admin'))) then return new; end if;
  if tg_op='INSERT' or new.class_id is distinct from old.class_id then
    if not exists(select 1 from public.classes c where c.id=new.class_id and c.user_id=auth.uid())
       and not public.classroom_is_member(new.class_id) then
      raise exception 'You cannot add work to this class.' using errcode='42501';
    end if;
  end if;
  if tg_op='UPDATE' and (new.user_id<>old.user_id or (public.classroom_is_shared(old.class_id) and new.class_id<>old.class_id)) then
    raise exception 'Shared work must stay in its collaborative class and keep its creator.' using errcode='42501';
  end if;
  return new;
end;
$$;
create trigger classroom_test_identity before insert or update on public.tests for each row execute function public.classroom_guard_task_identity();
create trigger classroom_homework_identity before insert or update on public.homework for each row execute function public.classroom_guard_task_identity();

create function public.classroom_bump_revision() returns trigger
language plpgsql security definer set search_path=pg_catalog,public as $$
declare cid uuid;
begin
  if tg_table_name='classes' then cid := coalesce(new.id,old.id);
  else cid := coalesce(new.class_id,old.class_id); end if;
  if public.classroom_is_shared(cid) then
    insert into public.classroom_revisions(class_id) values(cid)
      on conflict(class_id) do update set revision=public.classroom_revisions.revision+1;
    -- Database broadcasts carry only an invalidation, never task or grade data.
    perform realtime.send(jsonb_build_object('class_id',cid),'changed','classroom:'||cid::text,true);
  end if;
  return null;
end;
$$;
create trigger classroom_homework_changed after insert or update or delete on public.homework for each row execute function public.classroom_bump_revision();
create trigger classroom_test_changed after insert or update or delete on public.tests for each row execute function public.classroom_bump_revision();
create trigger classroom_class_changed after update on public.classes for each row execute function public.classroom_bump_revision();
create trigger classroom_members_changed after insert or delete on public.classroom_members for each row execute function public.classroom_bump_revision();

create function public.classroom_create_invite(p_class_id uuid) returns jsonb
language plpgsql security definer set search_path=pg_catalog,public as $$
declare token text; expiry timestamptz:=now()+interval '7 days';
begin
  perform public.classroom_assert_eligible();
  perform 1 from public.classes where id=p_class_id and user_id=auth.uid() for update;
  if not found then raise exception 'Only the class creator can invite classmates.' using errcode='42501'; end if;
  insert into public.classroom_collaborations(class_id) values(p_class_id) on conflict do nothing;
  insert into public.classroom_members(class_id,user_id) values(p_class_id,auth.uid()) on conflict do nothing;
  -- Two independently generated UUIDs provide an unguessable invitation secret.
  token:=replace(gen_random_uuid()::text,'-','')||replace(gen_random_uuid()::text,'-','');
  insert into public.classroom_invites(token_hash,class_id,expires_at)
    values(encode(sha256(convert_to(token,'UTF8')),'hex'),p_class_id,expiry);
  return jsonb_build_object('token',token,'expires_at',expiry);
end;
$$;
create function public.classroom_preview_invite(p_token text) returns jsonb
language plpgsql stable security definer set search_path=pg_catalog,public as $$
declare result jsonb;
begin
  perform public.classroom_assert_eligible();
  if p_token !~ '^[a-f0-9]{64}$' then raise exception 'This invite link is invalid or expired.'; end if;
  select jsonb_build_object('id',c.id,'name',c.name,'icon',c.icon,'color',c.color,'already_joined',public.classroom_is_member(c.id)) into result
    from public.classroom_invites i join public.classes c on c.id=i.class_id
    where i.token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex') and i.revoked_at is null and i.expires_at>now();
  if result is null then raise exception 'This invite link is invalid, expired, or has been revoked.'; end if;
  return result;
end;
$$;
create function public.classroom_join(p_token text) returns uuid
language plpgsql security definer set search_path=pg_catalog,public as $$
declare cid uuid;
begin
  perform public.classroom_assert_eligible();
  if p_token !~ '^[a-f0-9]{64}$' then raise exception 'This invite link is invalid or expired.'; end if;
  select class_id into cid from public.classroom_invites
    where token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex') and revoked_at is null and expires_at>now();
  if cid is null then raise exception 'This invite link is invalid, expired, or has been revoked.'; end if;
  -- All membership operations lock class -> invite -> membership, avoiding
  -- join/removal races and keeping revocation atomic.
  perform 1 from public.classes where id=cid for update;
  if not found then raise exception 'This class no longer exists.'; end if;
  perform 1 from public.classroom_invites where class_id=cid and token_hash=encode(sha256(convert_to(p_token,'UTF8')),'hex') and revoked_at is null and expires_at>now() for update;
  if not found then raise exception 'This invite link is invalid, expired, or has been revoked.'; end if;
  insert into public.classroom_members(class_id,user_id) values(cid,auth.uid()) on conflict do nothing;
  return cid;
end;
$$;
create function public.classroom_classes() returns jsonb
language sql stable security definer set search_path=pg_catalog,public as $$
  select coalesce(jsonb_agg(jsonb_build_object(
    'id',c.id,'name',c.name,'icon',c.icon,'color',c.color,'user_id',c.user_id,'created_at',c.created_at,'updated_at',c.updated_at,
    'is_shared',true,'shared_owner_id',c.user_id,'member_count',(select count(*) from public.classroom_members where class_id=c.id)
  )), '[]'::jsonb)
  from public.classes c where public.classroom_is_member(c.id);
$$;
create function public.classroom_members_list(p_class_id uuid) returns jsonb
language plpgsql stable security definer set search_path=pg_catalog,public as $$
begin
  if not public.classroom_is_member(p_class_id) then raise exception 'You no longer have access to this class.' using errcode='42501'; end if;
  return (select coalesce(jsonb_agg(jsonb_build_object('user_id',m.user_id,'name',coalesce(nullif(p.full_name,''),'Classmate'),'is_owner',m.user_id=c.user_id) order by m.joined_at),'[]'::jsonb)
    from public.classroom_members m join public.classes c on c.id=m.class_id left join public.profiles p on p.id=m.user_id where m.class_id=p_class_id);
end;
$$;
create function public.classroom_remove_member(p_class_id uuid,p_user_id uuid) returns void
language plpgsql security definer set search_path=pg_catalog,public as $$
declare owner_id uuid;
begin
  perform public.classroom_assert_eligible();
  select user_id into owner_id from public.classes where id=p_class_id for update;
  if owner_id=p_user_id then raise exception 'The creator cannot leave their own class. Delete the class to end collaboration.'; end if;
  if auth.uid()<>owner_id and auth.uid()<>p_user_id then raise exception 'Only the creator can remove another member.' using errcode='42501'; end if;
  delete from public.classroom_members where class_id=p_class_id and user_id=p_user_id;
  if auth.uid()=owner_id then
    update public.classroom_invites set revoked_at=now() where class_id=p_class_id and revoked_at is null;
  end if;
end;
$$;
create function public.classroom_revoke_invites(p_class_id uuid) returns void
language plpgsql security definer set search_path=pg_catalog,public as $$
begin
  perform public.classroom_assert_eligible();
  perform 1 from public.classes where id=p_class_id and user_id=auth.uid() for update;
  if not found then raise exception 'Only the creator can revoke invite links.' using errcode='42501'; end if;
  update public.classroom_invites set revoked_at=now() where class_id=p_class_id and revoked_at is null;
end;
$$;
create function public.classroom_delete_or_leave(p_class_id uuid) returns void
language plpgsql security definer set search_path=pg_catalog,public as $$
begin
  perform public.classroom_assert_eligible();
  perform 1 from public.classes where id=p_class_id and user_id=auth.uid() for update;
  if found then
    delete from public.homework where class_id=p_class_id;
    delete from public.tests where class_id=p_class_id;
    delete from public.classes where id=p_class_id;
  elsif public.classroom_is_member(p_class_id) then
    delete from public.classroom_members where class_id=p_class_id and user_id=auth.uid();
  else raise exception 'You no longer have access to this class.' using errcode='42501';
  end if;
end;
$$;

-- Shared schedules are visible; grades/results are overlaid for the current account only.
create function public.classroom_tests() returns jsonb
language sql stable security definer set search_path=pg_catalog,public as $$
 select coalesce(jsonb_agg(to_jsonb(t)||jsonb_build_object(
   'score',case when r.user_id is not null then r.score when t.user_id=auth.uid() then t.score else null end,
   'max_score',case when r.user_id is not null then r.max_score when t.user_id=auth.uid() then t.max_score else null end,
   'grade',case when r.user_id is not null then r.grade when t.user_id=auth.uid() then t.grade else null end,
   'weight',case when r.user_id is not null then r.weight when t.user_id=auth.uid() then t.weight else null end
 )), '[]'::jsonb)
 from public.tests t left join public.classroom_test_results r on r.test_id=t.id and r.user_id=auth.uid()
 where public.classroom_is_member(t.class_id);
$$;
create function public.classroom_write_test(p_id uuid,p_data jsonb,p_delete boolean default false) returns jsonb
language plpgsql security definer set search_path=pg_catalog,public as $$
declare item public.tests; cid uuid; shared boolean; existed boolean; patch jsonb; result jsonb;
begin
  perform public.classroom_assert_eligible();
  select * into item from public.tests where id=p_id for update;
  existed:=found;
  cid:=case when existed then item.class_id else (p_data->>'class_id')::uuid end;
  shared:=public.classroom_is_shared(cid);
  if shared then
    if not public.classroom_is_member(cid) then raise exception 'You no longer have access to this class.' using errcode='42501'; end if;
    if p_data ? 'class_id' and (p_data->>'class_id')::uuid<>cid then raise exception 'Shared work must stay in its collaborative class.'; end if;
  elsif not exists(select 1 from public.classes where id=cid and user_id=auth.uid()) or (existed and item.user_id<>auth.uid()) then
    raise exception 'You cannot modify this test.' using errcode='42501';
  end if;
  if p_delete then
    if not existed then raise exception 'This test no longer exists.'; end if;
    delete from public.tests where id=p_id; return '{}'::jsonb;
  end if;
  select coalesce(jsonb_object_agg(key,value),'{}'::jsonb) into patch from jsonb_each(p_data)
    where key=any(array['title','description','test_date','test_time','test_type','location','duration','priority','status','study_materials','notes','completed_at']);
  if not shared then
    patch:=patch||(p_data-array['id','user_id','created_at','updated_at']);
  elsif not existed or item.user_id=auth.uid() then
    -- Preserve the creator's existing direct grade views while other members'
    -- personal results remain isolated in classroom_test_results.
    patch:=patch||(select coalesce(jsonb_object_agg(key,value),'{}'::jsonb) from jsonb_each(p_data) where key=any(array['score','max_score','grade','weight']));
  end if;
  if not existed then
    item:=jsonb_populate_record(null::public.tests,patch||jsonb_build_object('id',coalesce(p_id,gen_random_uuid()),'class_id',cid,'user_id',auth.uid(),'status',coalesce(patch->>'status','upcoming'),'created_at',now(),'updated_at',now()));
    insert into public.tests select (item).*;
  else
    item:=jsonb_populate_record(item,patch);
    update public.tests set title=item.title,description=item.description,test_date=item.test_date,test_time=item.test_time,test_type=item.test_type,
      location=item.location,duration=item.duration,priority=item.priority,status=item.status,study_materials=item.study_materials,notes=item.notes,
      completed_at=item.completed_at,score=item.score,max_score=item.max_score,grade=item.grade,weight=item.weight,updated_at=now() where id=item.id;
  end if;
  if shared and p_data ?| array['score','max_score','grade','weight'] then
    insert into public.classroom_test_results(test_id,user_id,score,max_score,grade,weight)
      values(item.id,auth.uid(),(p_data->>'score')::double precision,(p_data->>'max_score')::double precision,p_data->>'grade',(p_data->>'weight')::double precision)
      on conflict(test_id,user_id) do update set
        score=case when p_data?'score' then excluded.score else public.classroom_test_results.score end,
        max_score=case when p_data?'max_score' then excluded.max_score else public.classroom_test_results.max_score end,
        grade=case when p_data?'grade' then excluded.grade else public.classroom_test_results.grade end,
        weight=case when p_data?'weight' then excluded.weight else public.classroom_test_results.weight end;
  end if;
  if shared then
    select value into result from jsonb_array_elements(public.classroom_tests()) where value->>'id'=item.id::text;
    return result;
  end if;
  return to_jsonb(item);
end;
$$;

-- Merge checklist edits by step and field under a row lock. Edits to different
-- steps (or different fields on one step) cannot overwrite one another.
create function public.classroom_update_homework(p_id uuid,p_changes jsonb,p_before jsonb) returns jsonb
language plpgsql security invoker set search_path=pg_catalog,public as $$
declare item public.homework; before_step jsonb; after_step jsonb; current_step jsonb;
  merged jsonb; incoming jsonb:=p_changes->'subtasks'; patch jsonb; field_name text;
begin
  perform public.classroom_assert_eligible();
  select * into item from public.homework where id=p_id for update;
  if not found then raise exception 'This homework no longer exists or you no longer have access.' using errcode='42501'; end if;
  if not public.valid_homework_subtasks(p_before) or not public.valid_homework_subtasks(incoming) then raise exception 'The subtask checklist is invalid.'; end if;
  merged:=item.subtasks;
  for before_step in select value from jsonb_array_elements(p_before) loop
    select value into after_step from jsonb_array_elements(incoming) where value->>'id'=before_step->>'id';
    select value into current_step from jsonb_array_elements(merged) where value->>'id'=before_step->>'id';
    if after_step is null then
      if current_step is not null and current_step<>before_step then raise exception 'This step was edited by a classmate. Refresh before removing it.'; end if;
      select coalesce(jsonb_agg(value),'[]'::jsonb) into merged from jsonb_array_elements(merged) where value->>'id'<>before_step->>'id';
    elsif after_step<>before_step then
      if current_step is null then raise exception 'This step was removed by a classmate. Refresh to see the latest work.'; end if;
      foreach field_name in array array['title','completed'] loop
        if after_step->field_name is distinct from before_step->field_name then
          if current_step->field_name is distinct from before_step->field_name and current_step->field_name is distinct from after_step->field_name then
            raise exception 'This step was edited by a classmate. Refresh to see their changes.';
          end if;
          current_step:=jsonb_set(current_step,array[field_name],after_step->field_name);
        end if;
      end loop;
      select jsonb_agg(case when value->>'id'=current_step->>'id' then current_step else value end) into merged from jsonb_array_elements(merged);
    end if;
  end loop;
  for after_step in select value from jsonb_array_elements(incoming) loop
    if not exists(select 1 from jsonb_array_elements(p_before) s where s.value->>'id'=after_step->>'id') then
      select value into current_step from jsonb_array_elements(merged) where value->>'id'=after_step->>'id';
      if current_step is null then merged:=merged||jsonb_build_array(after_step);
      elsif current_step<>after_step then raise exception 'A subtask changed. Refresh and try again.'; end if;
    end if;
  end loop;
  if not public.valid_homework_subtasks(merged) then raise exception 'This homework can have up to 100 named subtasks.'; end if;
  select coalesce(jsonb_object_agg(key,value),'{}'::jsonb) into patch from jsonb_each(p_changes)
    where key=any(array['title','description','due_date','class_id','completed','priority','links','pinned']);
  item:=jsonb_populate_record(item,patch||jsonb_build_object('subtasks',merged));
  update public.homework set title=item.title,description=item.description,due_date=item.due_date,class_id=item.class_id,
    completed=item.completed,priority=item.priority,links=item.links,pinned=item.pinned,subtasks=merged,updated_at=now() where id=p_id returning * into item;
  return to_jsonb(item);
end;
$$;

-- Private broadcast topics are authorized by current class membership.
create function public.classroom_topic_member(topic_name text) returns boolean
language plpgsql stable security definer set search_path=pg_catalog,public as $$
begin
  if topic_name !~ '^classroom:[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then return false; end if;
  return public.classroom_is_member(substring(topic_name from 11)::uuid);
end;
$$;
grant select on realtime.messages to authenticated;
create policy classroom_broadcast_read on realtime.messages for select to authenticated
  using(extension='broadcast' and public.classroom_topic_member(realtime.topic()));
create policy classroom_broadcast_boundary on realtime.messages as restrictive for select to authenticated
  using(realtime.topic() not like 'classroom:%' or public.classroom_topic_member(realtime.topic()));

-- Only explicitly granted RPCs may be called by signed-in, eligible accounts.
do $$
declare f record;
begin
 for f in select p.oid::regprocedure as signature from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname like 'classroom_%' loop
   execute format('revoke all on function %s from public, anon, authenticated',f.signature);
   if f.signature::text not like '%classroom_bump_revision%' and f.signature::text not like '%classroom_guard_task_identity%' then
     execute format('grant execute on function %s to authenticated',f.signature);
   end if;
 end loop;
 if exists(select 1 from pg_publication where pubname='supabase_realtime') then
   alter publication supabase_realtime add table public.classroom_revisions,public.classroom_members;
 end if;
end;
$$;
notify pgrst, 'reload schema';
commit;
