create table if not exists readings (
  id          serial primary key,
  user_id     text not null,
  day         date not null,
  seeking     text not null,
  birth_date  date,
  birth_time  text,
  rune_id     text not null,
  card_ids    jsonb not null,
  card_notes  jsonb not null default '[]'::jsonb,
  summary     text not null default '',
  complete    boolean not null default false,
  created_at  timestamptz not null default now(),
  unique (user_id, day)
);

create index if not exists readings_user_id_idx on readings (user_id);
create index if not exists readings_user_day_idx on readings (user_id, day desc);
