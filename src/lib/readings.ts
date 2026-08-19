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
      created_at  timestamptz not null default now(),
      unique (user_id, day)
    )
  `);
  await sql.query(`create index if not exists readings_user_id_idx on readings (user_id)`);
  await sql.query(`create index if not exists readings_user_day_idx on readings (user_id, day desc)`);
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
      where user_id = ${context.userId} and day = ${day}::date
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
      order by day desc
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
      where user_id = ${context.userId} and day = ${data.day}::date
      limit 1
    `;
    if (existing[0]) return toRecord(existing[0]);

    const seedKey = [
      context.userId,
      data.day,
      data.seeking,
      data.birthDate ?? "",
      data.birthTime ?? "",
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
        user_id, day, seeking, birth_date, birth_time, rune_id, card_ids, card_notes, summary, complete
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
        ${false}
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

    let summary = localSummary(current.runeId, notes.map((n) => n.cardId), current.seeking);
    const apiKey = process.env.XAI_API_KEY;
    if (apiKey) {
      try {
        const res = await fetch("https://api.x.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
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
        if (res.ok) {
          const body = (await res.json()) as {
            choices?: { message?: { content?: string } }[];
          };
          const text = body.choices?.[0]?.message?.content?.trim();
          if (text) summary = text;
        }
      } catch {
        // keep local weaving
      }
    }

    const updated = await sql<ReadingRow>`
      update readings
      set summary = ${summary},
          card_notes = ${JSON.stringify(notes)}::jsonb,
          complete = true
      where id = ${id} and user_id = ${context.userId}
      returning id, day::text as day, seeking, birth_date::text as birth_date,
                birth_time, rune_id, card_ids, card_notes, summary, complete,
                created_at::text as created_at
    `;
    return updated[0] ? toRecord(updated[0]) : { ...current, summary, cards: notes, complete: true };
  });
