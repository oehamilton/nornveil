import { cardById } from "@/norn/cards";
import { cardBoxFor } from "@/norn/layout";
import type { DrawnCard } from "@/norn/types";
import type { RuneStave } from "@/norn/types";
import { FlippableCard } from "@/components/norn/TarotCard";

export function RuneBoard({
  rune,
  cards,
  dealt,
  flipped,
  onOpen,
}: {
  rune: RuneStave;
  cards: DrawnCard[];
  dealt: number;
  flipped: number;
  onOpen?: (index: number) => void;
}) {
  const box = cardBoxFor(rune.positions);
  return (
    <div className="relative mx-auto aspect-square w-full max-w-3xl overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface">
      <svg viewBox="0 0 100 100" className="pointer-events-none absolute inset-0 text-fg/30" aria-hidden>
        {rune.links.map(([a, b]) => {
          const p = rune.positions[a];
          const q = rune.positions[b];
          if (!p || !q) return null;
          return (
            <line
              key={`${a}-${b}`}
              x1={p.x}
              y1={p.y}
              x2={q.x}
              y2={q.y}
              stroke="currentColor"
              strokeWidth="0.7"
            />
          );
        })}
        {rune.positions.map((p, i) => (
          <rect
            key={i}
            x={p.x - box.w / 2}
            y={p.y - box.h / 2}
            width={box.w}
            height={box.h}
            rx="1.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="0.45"
          />
        ))}
      </svg>
      {rune.positions.map((pos, i) => {
        const note = cards[i];
        if (!note || i >= dealt) return null;
        const card = cardById(note.cardId);
        const open = i < flipped;
        return (
          <button
            key={note.cardId}
            type="button"
            disabled={!open || !onOpen}
            aria-label={open ? `Open ${card.name}` : card.name}
            onClick={() => open && onOpen?.(i)}
            className="absolute overflow-hidden rounded-[10px] border-0 bg-transparent p-0 shadow-lg disabled:cursor-default"
            style={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              width: `${box.w}%`,
              height: `${box.h}%`,
              transform: "translate(-50%, -50%)",
              zIndex: 10 + i,
            }}
          >
            <FlippableCard card={card} flipped={open} />
          </button>
        );
      })}
    </div>
  );
}
