-- Additive migration: preserves all existing users, results and resources.
alter table public.assessment_results add column if not exists active_career text;
alter table public.assessment_submissions add column if not exists scores jsonb not null default '{}'::jsonb;
alter table public.assessment_submissions add column if not exists recommended_career text;
alter table public.assessment_submissions add column if not exists wellness_risk text;
alter table public.assessment_submissions add column if not exists scoring_version text not null default 'legacy';

-- Existing latest results become the initial active pathway, without removing data.
update public.assessment_results
set active_career = recommended_career
where active_career is null and recommended_career is not null;

create index if not exists assessment_submissions_user_created_idx
  on public.assessment_submissions (user_id, created_at desc);

-- Recover a latest-result row for users whose older app version only wrote
-- assessment_submissions. Existing active_career selections are never replaced.
insert into public.assessment_results (user_id, scores, recommended_career, active_career, wellness_risk, scoring_version)
select distinct on (s.user_id)
  s.user_id,
  coalesce(s.scores, '{}'::jsonb),
  s.recommended_career,
  s.recommended_career,
  s.wellness_risk,
  coalesce(s.scoring_version, 'history-backfill')
from public.assessment_submissions s
where s.recommended_career is not null
order by s.user_id, s.created_at desc
on conflict (user_id) do update
set active_career = coalesce(public.assessment_results.active_career, excluded.active_career),
    recommended_career = coalesce(public.assessment_results.recommended_career, excluded.recommended_career),
    scores = case when public.assessment_results.scores = '{}'::jsonb then excluded.scores else public.assessment_results.scores end,
    wellness_risk = coalesce(public.assessment_results.wellness_risk, excluded.wellness_risk);
