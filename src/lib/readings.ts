import { createServerFn } from "@tanstack/react-start";
import { getSql } from "@/lib/db";
import { authMiddleware } from "@/lib/auth/middleware";
import { DECK } from "@/norn/cards";
import { RUNES } from "@/norn/runes";
import { pickIndex, shuffleIds, todayStamp } from "@/norn/seed";
import { buildNotes, localSummary, readingPrompt } from "@/norn/weave";
import type { DrawnCard, ReadingRecord } from "@/norn/types";

type ReadingRow = {
  id: number;
  day: string;
  seeking: string;
  birth_date: string | null;
  birth_time: string | null;
  rune_id: string;
  card_ids: unknown;
  card_notes: unknown;
  summary: string;
  complete: boolean;
  created_at: string;
};

async function ensureReadingsTable() {
  const sql = await getSql();
  await sql.query(`
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
      active      boolean not null default true,
      created_at  timestamptz not null default now()
    )
  `);
  await sql.query(`alter table readings add column if not exists active boolean not null default true`);
  await sql.query(`alter table readings drop constraint if exists readings_user_id_day_key`);
  await sql.query(`create index if not exists readings_user_id_idx on readings (user_id)`);
  await sql.query(`create index if not exists readings_user_day_idx on readings (user_id, day desc)`);
  await sql.query(
    `create index if not exists readings_user_active_day_idx on readings (user_id, day desc) where active`,
  );
  await sql.query(`
    create table if not exists seeker_marks (
      user_id     text primary key,
      birth_date  date,
      birth_time  text,
      updated_at  timestamptz not null default now()
    )
  `);
}

function asIds(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? parsed.map(String) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function asNotes(value: unknown): DrawnCard[] {
  if (Array.isArray(value)) return value as DrawnCard[];
  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value) as unknown;
      return Array.isArray(parsed) ? (parsed as DrawnCard[]) : [];
    } catch {
      return [];
    }
  }
  return [];
}

function toRecord(row: ReadingRow): ReadingRecord {
  return {
    id: row.id,
    day: String(row.day).slice(0, 10),
    seeking: row.seeking,
    birthDate: row.birth_date ? String(row.birth_date).slice(0, 10) : null,
    birthTime: row.birth_time,
    runeId: row.rune_id,
    cards: asNotes(row.card_notes),
    summary: row.summary,
    complete: Boolean(row.complete),
    createdAt: String(row.created_at),
  };
}

function validDay(day: string): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new Error("Invalid day");
  const today = todayStamp();
  const y = todayStamp(new Date(Date.now() - 86400000));
  const t = todayStamp(new Date(Date.now() + 86400000));
  if (day !== today && day !== y && day !== t) throw new Error("Day is not current");
  return day;
}

function grokText(body: unknown): string {
  const choices = (body as { choices?: { message?: { content?: unknown } }[] })?.choices;
  const content = choices?.[0]?.message?.content;
  if (typeof content === "string") return content.trim();
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (part && typeof part === "object" && "text" in part) {
          return String((part as { text?: unknown }).text ?? "");
        }
        return "";
      })
      .join("")
      .trim();
  }
  return "";
}

function asTime(value: string | null | undefined): string | null {
  if (!value) return null;
  const match = /^(\d{2}:\d{2})/.exec(value.trim());
  return match ? match[1] : null;
}

function asDay(value: string | null | undefined): string | null {
  if (!value) return null;
  const day = String(value).slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(day) ? day : null;
}

export type SeekerMark = {
  birthDate: string | null;
  birthTime: string | null;
};

async function upsertSeekerMark(userId: string, mark: SeekerMark) {
  const sql = await getSql();
  await sql`
    insert into seeker_marks (user_id, birth_date, birth_time, updated_at)
    values (${userId}, ${mark.birthDate}::date, ${mark.birthTime}, now())
    on conflict (user_id) do update
    set birth_date = excluded.birth_date,
        birth_time = excluded.birth_time,
        updated_at = now()
  `;
}

export const getSeekerMark = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await ensureReadingsTable();
    const sql = await getSql();
    const rows = await sql<{ birth_date: string | null; birth_time: string | null }>`
      select birth_date::text as birth_date, birth_time
      from seeker_marks
      where user_id = ${context.userId}
      limit 1
    `;
    if (rows[0]) {
      return {
        birthDate: asDay(rows[0].birth_date),
        birthTime: asTime(rows[0].birth_time),
      };
    }
    const prior = await sql<{ birth_date: string | null; birth_time: string | null }>`
      select birth_date::text as birth_date, birth_time
      from readings
      where user_id = ${context.userId}
        and (birth_date is not null or (birth_time is not null and birth_time <> ''))
      order by created_at desc
      limit 1
    `;
    const mark: SeekerMark = {
      birthDate: asDay(prior[0]?.birth_date),
      birthTime: asTime(prior[0]?.birth_time),
    };
    if (mark.birthDate || mark.birthTime) {
      await upsertSeekerMark(context.userId, mark);
    }
    return mark;
  });

export const getTodayReading = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await ensureReadingsTable();
    const sql = await getSql();
    const day = todayStamp();
    const rows = await sql<ReadingRow>`
      select id, day::text as day, seeking, birth_date::text as birth_date,
             birth_time, rune_id, card_ids, card_notes, summary, complete,
             created_at::text as created_at
      from readings
      where user_id = ${context.userId} and day = ${day}::date and active = true
      order by created_at desc
      limit 1
    `;
    return rows[0] ? toRecord(rows[0]) : null;
  });

export const listReadings = createServerFn({ method: "GET" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await ensureReadingsTable();
    const sql = await getSql();
    const rows = await sql<ReadingRow>`
      select id, day::text as day, seeking, birth_date::text as birth_date,
             birth_time, rune_id, card_ids, card_notes, summary, complete,
             created_at::text as created_at
      from readings
      where user_id = ${context.userId} and complete = true
      order by created_at desc
      limit 40
    `;
    return rows.map(toRecord);
  });

export const getReading = createServerFn({ method: "GET" })
  .validator((id: number) => {
    const n = Math.floor(Number(id));
    if (!Number.isFinite(n) || n < 1) throw new Error("Invalid reading");
    return n;
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data: id }) => {
    await ensureReadingsTable();
    const sql = await getSql();
    const rows = await sql<ReadingRow>`
      select id, day::text as day, seeking, birth_date::text as birth_date,
             birth_time, rune_id, card_ids, card_notes, summary, complete,
             created_at::text as created_at
      from readings
      where id = ${id} and user_id = ${context.userId}
      limit 1
    `;
    return rows[0] ? toRecord(rows[0]) : null;
  });

export const beginReading = createServerFn({ method: "POST" })
  .validator((input: { seeking: string; birthDate?: string; birthTime?: string; day: string }) => {
    const seeking = String(input.seeking ?? "").trim().replace(/\s+/g, " ");
    if (seeking.length < 8) throw new Error("Say a little more about what you seek.");
    if (seeking.length > 280) throw new Error("Keep the seeking under 280 letters.");
    const day = validDay(String(input.day ?? ""));
    const birthDate = input.birthDate?.trim() || "";
    const birthTime = input.birthTime?.trim() || "";
    if (birthDate && !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) throw new Error("Invalid birth date");
    if (birthTime && !/^\d{2}:\d{2}$/.test(birthTime)) throw new Error("Invalid birth hour");
    return {
      seeking,
      day,
      birthDate: birthDate || null,
      birthTime: birthTime || null,
    };
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data }) => {
    await ensureReadingsTable();
    const sql = await getSql();
    const existing = await sql<ReadingRow>`
      select id, day::text as day, seeking, birth_date::text as birth_date,
             birth_time, rune_id, card_ids, card_notes, summary, complete,
             created_at::text as created_at
      from readings
      where user_id = ${context.userId} and day = ${data.day}::date and active = true
      order by created_at desc
      limit 1
    `;
    if (existing[0]) return toRecord(existing[0]);

    if (data.birthDate || data.birthTime) {
      await upsertSeekerMark(context.userId, {
        birthDate: data.birthDate,
        birthTime: data.birthTime,
      });
    }

    const seedKey = [
      context.userId,
      data.day,
      data.seeking,
      data.birthDate ?? "",
      data.birthTime ?? "",
      String(Date.now()),
    ].join("|");
    const rune = RUNES[pickIndex(seedKey + "|rune", RUNES.length)]!;
    const order = shuffleIds(
      DECK.map((c) => c.id),
      seedKey + "|deck",
    );
    const cardIds = order.slice(0, rune.positions.length);
    const notes = buildNotes(cardIds, data.seeking);

    const rows = await sql<ReadingRow>`
      insert into readings (
        user_id, day, seeking, birth_date, birth_time, rune_id, card_ids, card_notes, summary, complete, active
      ) values (
        ${context.userId},
        ${data.day}::date,
        ${data.seeking},
        ${data.birthDate}::date,
        ${data.birthTime},
        ${rune.id},
        ${JSON.stringify(cardIds)}::jsonb,
        ${JSON.stringify(notes)}::jsonb,
        ${""},
        ${false},
        ${true}
      )
      returning id, day::text as day, seeking, birth_date::text as birth_date,
                birth_time, rune_id, card_ids, card_notes, summary, complete,
                created_at::text as created_at
    `;
    const row = rows[0];
    if (!row) throw new Error("Could not begin the reading");
    return toRecord(row);
  });

export const finishReading = createServerFn({ method: "POST" })
  .validator((id: number) => {
    const n = Math.floor(Number(id));
    if (!Number.isFinite(n) || n < 1) throw new Error("Invalid reading");
    return n;
  })
  .middleware([authMiddleware])
  .handler(async ({ context, data: id }) => {
    await ensureReadingsTable();
    const sql = await getSql();
    const rows = await sql<ReadingRow>`
      select id, day::text as day, seeking, birth_date::text as birth_date,
             birth_time, rune_id, card_ids, card_notes, summary, complete,
             created_at::text as created_at
      from readings
      where id = ${id} and user_id = ${context.userId}
      limit 1
    `;
    const row = rows[0];
    if (!row) throw new Error("Reading not found");
    const current = toRecord(row);
    if (current.complete && current.summary) return current;

    const notes = current.cards.length
      ? current.cards
      : buildNotes(asIds(row.card_ids), current.seeking);

    const fallback = localSummary(
      current.runeId,
      notes.map((n) => n.cardId),
      current.seeking,
    );

    // Persist a weaving immediately so a later Grok timeout still leaves text.
    const saved = await sql<ReadingRow>`
      update readings
      set summary = ${fallback},
          card_notes = ${JSON.stringify(notes)}::jsonb,
          complete = true
      where id = ${id} and user_id = ${context.userId}
      returning id, day::text as day, seeking, birth_date::text as birth_date,
                birth_time, rune_id, card_ids, card_notes, summary, complete,
                created_at::text as created_at
    `;
    let result = saved[0] ? toRecord(saved[0]) : { ...current, summary: fallback, cards: notes, complete: true };

    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return result;

    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        signal: AbortSignal.timeout(8000),
        body: JSON.stringify({
          model: "grok-4.5",
          max_tokens: 380,
          temperature: 0.8,
          messages: [
            {
              role: "user",
              content: readingPrompt({
                seeking: current.seeking,
                birthDate: current.birthDate,
                birthTime: current.birthTime,
                runeId: current.runeId,
                notes,
              }),
            },
          ],
        }),
      });
      if (!res.ok) return result;
      const text = grokText(await res.json());
      if (!text) return result;

      const upgraded = await sql<ReadingRow>`
        update readings
        set summary = ${text}
        where id = ${id} and user_id = ${context.userId}
        returning id, day::text as day, seeking, birth_date::text as birth_date,
                  birth_time, rune_id, card_ids, card_notes, summary, complete,
                  created_at::text as created_at
      `;
      if (upgraded[0]) result = toRecord(upgraded[0]);
      else result = { ...result, summary: text };
    } catch {
      // keep the local weaving already saved
    }

    return result;
  });

export const resetTodayReading = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .handler(async ({ context }) => {
    await ensureReadingsTable();
    const sql = await getSql();
    const day = todayStamp();
    await sql`
      update readings
      set active = false
      where user_id = ${context.userId} and day = ${day}::date and active = true
    `;
    return { ok: true as const };
  });
