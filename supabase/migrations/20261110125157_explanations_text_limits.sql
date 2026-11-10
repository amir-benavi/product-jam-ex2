-- Length limits on the Hebrew title and summary, the same numbers as
-- MAX_TITLE_LENGTH and MAX_SUMMARY_LENGTH in shared/schemas/apod.ts. The
-- server checks them with Zod first; this is the last line of defence.
--
-- A new migration, not an edit of 20261110122340_explanations.sql, because
-- that one is already pushed. Every row saved so far passed the same Zod
-- limits, so adding the checks can't fail on old rows.
--
-- (That each tag appears only once is checked by Zod only: a check
-- constraint can't run the subquery it would need.)

alter table public.explanations
  add constraint explanations_title_he_length
    check (char_length(title_he) between 1 and 200),
  add constraint explanations_summary_he_length
    check (char_length(summary_he) between 1 and 1000);
