alter table readings add column if not exists active boolean not null default true;
alter table readings drop constraint if exists readings_user_id_day_key;
create index if not exists readings_user_active_day_idx on readings (user_id, day desc) where active;
