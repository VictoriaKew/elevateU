-- Keeps assessment history immutable while separating the latest recommendation
-- from the pathway a student has deliberately chosen to follow.
alter table public.assessment_results add column if not exists career_selection_source text not null default 'assessment'
  check (career_selection_source in ('assessment', 'manual'));
alter table public.assessment_results add column if not exists wellness_score integer;
alter table public.assessment_submissions add column if not exists wellness_score integer;

update public.assessment_results
set career_selection_source = 'assessment'
where career_selection_source is null;

create or replace function public.complete_career_assessment(
  p_answers jsonb, p_scores jsonb, p_recommended_career text,
  p_wellness_score integer, p_wellness_risk text, p_scoring_version text default 'supabase-content-v2'
) returns public.assessment_results
language plpgsql security invoker set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_current public.assessment_results;
  v_result public.assessment_results;
  v_next_active text;
begin
  if v_user is null then raise exception 'Authentication required'; end if;
  select * into v_current from public.assessment_results where user_id = v_user for update;
  insert into public.assessment_submissions (user_id, answers, scores, recommended_career, wellness_score, wellness_risk, scoring_version)
  values (v_user, p_answers, p_scores, p_recommended_career, p_wellness_score, p_wellness_risk, p_scoring_version);

  -- A manual pathway is intentionally preserved. Assessment-driven pathways
  -- change only after the replacement result has been safely saved.
  v_next_active := case when v_current.user_id is null or v_current.active_career is null then p_recommended_career
    when v_current.career_selection_source = 'assessment' then p_recommended_career else v_current.active_career end;
  if v_current.user_id is not null and v_current.career_selection_source = 'assessment'
     and v_current.active_career is distinct from p_recommended_career then
    delete from public.roadmap_progress where user_id = v_user;
  end if;
  insert into public.assessment_results (user_id, scores, recommended_career, active_career, career_selection_source, wellness_score, wellness_risk, scoring_version, updated_at)
  values (v_user, p_scores, p_recommended_career, v_next_active, 'assessment', p_wellness_score, p_wellness_risk, p_scoring_version, now())
  on conflict (user_id) do update set
    scores = excluded.scores, recommended_career = excluded.recommended_career,
    active_career = case when assessment_results.career_selection_source = 'manual' then assessment_results.active_career else excluded.active_career end,
    career_selection_source = case when assessment_results.career_selection_source = 'manual' then 'manual' else 'assessment' end,
    wellness_score = excluded.wellness_score, wellness_risk = excluded.wellness_risk,
    scoring_version = excluded.scoring_version, updated_at = now()
  returning * into v_result;
  return v_result;
end;
$$;

create or replace function public.switch_active_career(p_career text)
returns public.assessment_results language plpgsql security invoker set search_path = public
as $$
declare v_result public.assessment_results;
begin
  if auth.uid() is null then raise exception 'Authentication required'; end if;
  update public.assessment_results set active_career = p_career, career_selection_source = 'manual', updated_at = now()
  where user_id = auth.uid() returning * into v_result;
  if not found then raise exception 'Complete Career Match before selecting a pathway'; end if;
  delete from public.roadmap_progress where user_id = auth.uid();
  return v_result;
end;
$$;

grant execute on function public.complete_career_assessment(jsonb, jsonb, text, integer, text, text) to authenticated;
grant execute on function public.switch_active_career(text) to authenticated;
