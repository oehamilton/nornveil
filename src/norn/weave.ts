import { cardById } from "./cards";
import { runeById } from "./runes";
import type { DrawnCard, TarotCard } from "./types";

function clip(text: string, n = 72): string {
  const t = text.trim().replace(/\s+/g, " ");
  if (t.length <= n) return t;
  return `${t.slice(0, n - 1).trim()}…`;
}

export function weaveSentence(card: TarotCard, previous: TarotCard[], seeking: string): string {
  const ask = clip(seeking, 64);
  if (previous.length === 0) {
    return `This first stave opens the matter of ${ask}.`;
  }
  const last = previous[previous.length - 1]!;
  const older = previous[0]!;
  const templates = [
    `Read against ${last.name}, ${card.name} says the ${last.keywords[0]} already named must now answer to ${card.keywords[0]}.`,
    `Where ${last.name} left ${last.keywords[1]}, ${card.name} arrives as ${card.keywords[1]} — and the seeking (${ask}) changes temperature.`,
    `${card.name} does not cancel ${last.name}; it binds ${last.keywords[2]} to ${card.keywords[0]} inside what you asked.`,
    `After ${older.name} and ${last.name}, this stave turns the thread: ${card.keywords[0]} is how ${ask} will actually move.`,
  ];
  return templates[(previous.length - 1) % templates.length]!;
}

export function buildNotes(cardIds: string[], seeking: string): DrawnCard[] {
  const notes: DrawnCard[] = [];
  const prev: TarotCard[] = [];
  for (const id of cardIds) {
    const card = cardById(id);
    notes.push({
      cardId: id,
      meaning: card.upright,
      weave: prev.length === 0 ? null : weaveSentence(card, prev, seeking),
    });
    prev.push(card);
  }
  return notes;
}

export function localSummary(
  runeId: string,
  cardIds: string[],
  seeking: string,
): string {
  const rune = runeById(runeId);
  const names = cardIds.map((id) => cardById(id).name);
  const last = names[names.length - 1] ?? "the last stave";
  const first = names[0] ?? "the first stave";
  const mid = names.slice(1, -1);
  const midLine =
    mid.length > 0
      ? `Between them stand ${mid.slice(0, 4).join(", ")}${mid.length > 4 ? ", and the rest of the shape" : ""}.`
      : "";
  return [
    `The Norns laid ${rune.name} (${rune.glyph}) across your question of ${clip(seeking, 80)}.`,
    `${rune.meaning}`,
    `${first} opened the work; ${last} is where it must be stood.`,
    midLine,
    `Walk the stave in order. Do not skip a position to reach a kinder card.`,
  ]
    .filter(Boolean)
    .join(" ");
}

export function readingPrompt(input: {
  seeking: string;
  birthDate: string | null;
  birthTime: string | null;
  runeId: string;
  notes: DrawnCard[];
}): string {
  const rune = runeById(input.runeId);
  const natal =
    input.birthDate != null
      ? `Natal mark: ${input.birthDate}${input.birthTime ? ` at ${input.birthTime}` : ""}.`
      : "No natal hour was given.";
  const cards = input.notes
    .map((n, i) => {
      const c = cardById(n.cardId);
      return `${i + 1}. ${c.name} (${c.epithet}) — ${n.meaning}`;
    })
    .join("\n");
  return `You are a Norn at Urðarbrunnr, speaking a finished stave-reading.
The seeker asked: "${input.seeking}"
${natal}
The day's stave is ${rune.name} ${rune.glyph} — ${rune.meaning}
Cards in the order they were laid:
${cards}

Write the final reading in 4 to 6 short sentences.
Voice: dark, concrete, Norse, intimate. No self-help slogans, no bullet lists, no emoji, no stage directions.
Address the seeking directly. The last sentence must name ${rune.name} and tell them how to walk the shape.
Do not repeat the card meanings verbatim; weave them.`;
}
