create table if not exists seeker_marks (
  user_id     text primary key,
  birth_date  date,
  birth_time  text,
  updated_at  timestamptz not null default now()
);
