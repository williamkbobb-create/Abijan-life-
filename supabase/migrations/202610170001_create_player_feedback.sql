create table public.player_feedback (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  player_name text,
  rating smallint not null,
  category text not null,
  message text not null,
  page_path text
);

alter table public.player_feedback
  add constraint player_feedback_name_length
    check (player_name is null or char_length(player_name) <= 40),
  add constraint player_feedback_rating_range
    check (rating between 1 and 5),
  add constraint player_feedback_category_allowed
    check (category in ('gameplay', 'visuals', 'bugs', 'ideas', 'other')),
  add constraint player_feedback_message_length
    check (char_length(message) between 8 and 1200),
  add constraint player_feedback_page_path_length
    check (page_path is null or char_length(page_path) <= 200);

alter table public.player_feedback enable row level security;
revoke all on table public.player_feedback from anon, authenticated;
grant insert (player_name, rating, category, message, page_path)
  on table public.player_feedback to anon;

create policy "Anyone may submit bounded player feedback"
  on public.player_feedback
  for insert
  to anon
  with check (
    (player_name is null or char_length(player_name) <= 40)
    and rating between 1 and 5
    and category in ('gameplay', 'visuals', 'bugs', 'ideas', 'other')
    and char_length(message) between 8 and 1200
    and (page_path is null or char_length(page_path) <= 200)
  );