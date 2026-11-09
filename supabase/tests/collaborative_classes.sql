-- Runs under the migration/admin connection; every fixture is rolled back.
begin;
select set_config('test.owner',gen_random_uuid()::text,true),
       set_config('test.member',gen_random_uuid()::text,true),
       set_config('test.outsider',gen_random_uuid()::text,true),
       set_config('test.class',gen_random_uuid()::text,true),
       set_config('test.homework',gen_random_uuid()::text,true);
insert into auth.users(id,email,raw_user_meta_data)
select current_setting('test.'||role_name)::uuid,'collaboration-'||gen_random_uuid()::text||'@example.invalid',
  '{"full_name":"Collaboration test","date_of_birth":"2000-01-01","country_code":"US"}'::jsonb
from unnest(array['owner','member','outsider']) role_name;
update public.profiles set date_of_birth='2000-01-01',country_code='US',parental_consent_status='approved'
where id in(current_setting('test.owner')::uuid,current_setting('test.member')::uuid,current_setting('test.outsider')::uuid);
select set_config('request.jwt.claim.role','authenticated',true),set_config('request.jwt.claim.sub',current_setting('test.owner'),true);
set local role authenticated;
insert into public.classes(id,user_id,name) values(current_setting('test.class')::uuid,auth.uid(),'QA collaboration');
insert into public.homework(id,user_id,class_id,title,due_date,priority,subtasks) values(current_setting('test.homework')::uuid,auth.uid(),current_setting('test.class')::uuid,'Shared spread',now(),'medium','[{"id":"photos","title":"Choose photos","completed":false},{"id":"captions","title":"Write captions","completed":false}]');
select set_config('test.token',public.classroom_create_invite(current_setting('test.class')::uuid)->>'token',true);
select set_config('test.testid',(public.classroom_write_test(null,jsonb_build_object('class_id',current_setting('test.class'),'title','Shared test','test_date','2026-12-01','score',95,'max_score',100,'grade','A'))->>'id'),true);

select set_config('request.jwt.claim.sub',current_setting('test.member'),true);
do $$ begin
  if exists(select 1 from public.homework where id=current_setting('test.homework')::uuid) then raise exception 'Nonmember could read shared homework'; end if;
  if jsonb_array_length(public.classroom_classes())<>0 then raise exception 'Nonmember could list classes'; end if;
  if public.classroom_preview_invite(current_setting('test.token'))->>'name'<>'QA collaboration' then raise exception 'Valid invite preview failed'; end if;
end $$;
select public.classroom_join(current_setting('test.token'));
select public.classroom_join(current_setting('test.token'));
do $$ declare cls jsonb; t jsonb; begin
  cls:=public.classroom_classes()->0;
  if cls->>'id'<>current_setting('test.class') or jsonb_array_length(public.classroom_classes())<>1 then raise exception 'Join duplicated class identity'; end if;
  if cls ? 'grade' or cls ? 'grade_data' then raise exception 'Private class grades were exposed'; end if;
  if exists(select 1 from public.classes where id=current_setting('test.class')::uuid) then raise exception 'Raw private class row exposed'; end if;
  if not exists(select 1 from public.homework where id=current_setting('test.homework')::uuid) then raise exception 'Joined member cannot read original homework'; end if;
  if exists(select 1 from public.tests where id=current_setting('test.testid')::uuid) then raise exception 'Raw test grades exposed'; end if;
  select value into t from jsonb_array_elements(public.classroom_tests()) where value->>'id'=current_setting('test.testid');
  if t->>'score' is not null or t->>'grade' is not null then raise exception 'Creator test grade leaked'; end if;
end $$;
insert into public.homework(user_id,class_id,title,due_date,priority) values(auth.uid(),current_setting('test.class')::uuid,'Member-created work',now(),'medium');
update public.homework set completed=true where id=current_setting('test.homework')::uuid;
select public.classroom_write_test(current_setting('test.testid')::uuid,'{"description":"Edited together","score":72,"grade":"C"}');

select set_config('request.jwt.claim.sub',current_setting('test.owner'),true);
do $$ declare t jsonb; begin
  if not (select completed from public.homework where id=current_setting('test.homework')::uuid) then raise exception 'Member completion did not sync'; end if;
  select value into t from jsonb_array_elements(public.classroom_tests()) where value->>'id'=current_setting('test.testid');
  if (t->>'score')::int<>95 or t->>'description'<>'Edited together' then raise exception 'Test schedule did not sync or personal results overwritten'; end if;
end $$;
select public.classroom_update_homework(current_setting('test.homework')::uuid,
 '{"subtasks":[{"id":"photos","title":"Choose photos","completed":true},{"id":"captions","title":"Write captions","completed":false}]}',
 '[{"id":"photos","title":"Choose photos","completed":false},{"id":"captions","title":"Write captions","completed":false}]');
select set_config('request.jwt.claim.sub',current_setting('test.member'),true);
select public.classroom_update_homework(current_setting('test.homework')::uuid,
 '{"subtasks":[{"id":"photos","title":"Choose photos","completed":false},{"id":"captions","title":"Write captions","completed":true}]}',
 '[{"id":"photos","title":"Choose photos","completed":false},{"id":"captions","title":"Write captions","completed":false}]');
do $$ begin
 if exists(select 1 from public.homework h,jsonb_array_elements(h.subtasks) step where h.id=current_setting('test.homework')::uuid and (step->>'completed')::boolean=false) then raise exception 'Concurrent independent step edits overwrote each other'; end if;
 begin
   perform public.classroom_create_invite(current_setting('test.class')::uuid);
   raise exception 'Member created creator-only invitation';
 exception when insufficient_privilege then null; end;
end $$;

select set_config('request.jwt.claim.sub',current_setting('test.owner'),true);
select public.classroom_revoke_invites(current_setting('test.class')::uuid);
select set_config('request.jwt.claim.sub',current_setting('test.outsider'),true);
do $$ begin
 begin
   perform public.classroom_join(current_setting('test.token'));
   raise exception 'REVOKED_INVITE_ACCEPTED';
 exception when others then if sqlerrm='REVOKED_INVITE_ACCEPTED' then raise; end if; end;
end $$;
select set_config('request.jwt.claim.sub',current_setting('test.owner'),true);
select set_config('test.token2',public.classroom_create_invite(current_setting('test.class')::uuid)->>'token',true);
update public.classes set name='Renamed collaborative class' where id=current_setting('test.class')::uuid;
select set_config('request.jwt.claim.sub',current_setting('test.member'),true);
do $$ begin
 if public.classroom_classes()->0->>'name'<>'Renamed collaborative class' then raise exception 'Class metadata failed to sync'; end if;
 if not public.classroom_topic_member('classroom:'||current_setting('test.class')) then raise exception 'Member broadcast authorization failed'; end if;
end $$;
select set_config('request.jwt.claim.sub',current_setting('test.owner'),true);
select public.classroom_remove_member(current_setting('test.class')::uuid,current_setting('test.member')::uuid);
select set_config('request.jwt.claim.sub',current_setting('test.member'),true);
do $$ begin
 if exists(select 1 from public.homework where class_id=current_setting('test.class')::uuid) then raise exception 'Removed member retained access, including to work they created'; end if;
 if jsonb_array_length(public.classroom_classes())<>0 or jsonb_array_length(public.classroom_tests())<>0 then raise exception 'Removed member retained shared records'; end if;
 begin
   perform public.classroom_join(current_setting('test.token2'));
   raise exception 'REMOVED_MEMBER_OLD_LINK_WORKED';
 exception when others then if sqlerrm='REMOVED_MEMBER_OLD_LINK_WORKED' then raise; end if; end;
end $$;
select set_config('request.jwt.claim.sub',current_setting('test.owner'),true);
select set_config('test.expired',public.classroom_create_invite(current_setting('test.class')::uuid)->>'token',true);
reset role;
update public.classroom_invites set expires_at=now()-interval '1 minute' where token_hash=encode(sha256(convert_to(current_setting('test.expired'),'UTF8')),'hex');
select set_config('request.jwt.claim.sub',current_setting('test.outsider'),true);
set local role authenticated;
do $$ begin
 if public.classroom_topic_member('classroom:'||current_setting('test.class')) then raise exception 'Outsider authorized for private broadcast'; end if;
 if public.classroom_topic_member('classroom:not-a-uuid') then raise exception 'Malformed topic authorized'; end if;
 begin
  perform public.classroom_join(current_setting('test.expired'));
  raise exception 'EXPIRED_INVITE_ACCEPTED';
 exception when others then if sqlerrm='EXPIRED_INVITE_ACCEPTED' then raise; end if; end;
end $$;
reset role;
update public.profiles set date_of_birth=current_date-interval '10 years' where id=current_setting('test.outsider')::uuid;
select set_config('request.jwt.claim.sub',current_setting('test.owner'),true);
set local role authenticated;
select set_config('test.token3',public.classroom_create_invite(current_setting('test.class')::uuid)->>'token',true);
select set_config('request.jwt.claim.sub',current_setting('test.outsider'),true);
do $$ begin
 begin
  perform public.classroom_join(current_setting('test.token3'));
  raise exception 'Ineligible account joined';
 exception when insufficient_privilege then null; end;
end $$;
select set_config('request.jwt.claim.sub',current_setting('test.owner'),true);
select public.classroom_delete_or_leave(current_setting('test.class')::uuid);
do $$ begin
 if exists(select 1 from public.homework where class_id=current_setting('test.class')::uuid) then raise exception 'Class deletion left work behind'; end if;
end $$;
reset role;
set local role anon;
do $$ begin
 begin perform public.classroom_preview_invite(current_setting('test.token3')); raise exception 'Anonymous invitation access'; exception when insufficient_privilege then null; end;
end $$;
reset role;
rollback;
