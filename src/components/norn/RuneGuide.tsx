import { runeById } from "@/norn/runes";
import type { RuneStave } from "@/norn/types";
import { cn } from "@/lib/utils";

export function RuneDiagram({
  rune,
  className,
  showSlots = true,
}: {
  rune: RuneStave;
  className?: string;
  showSlots?: boolean;
}) {
  return (
    <svg viewBox="0 0 100 100" className={cn("text-fg", className)} aria-hidden>
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
            strokeWidth="2.2"
            strokeLinecap="square"
          />
        );
      })}
      {showSlots &&
        rune.positions.map((p, i) => (
          <rect
            key={i}
            x={p.x - 5}
            y={p.y - 7}
            width="10"
            height="14"
            rx="1.2"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.4"
          />
        ))}
    </svg>
  );
}

export function RuneGuide({
  runeId,
  className,
}: {
  runeId: string;
  className?: string;
}) {
  const rune = runeById(runeId);
  return (
    <div className={cn("flex items-center gap-4", className)}>
      <div className="grid size-20 shrink-0 place-items-center rounded-[var(--radius-md)] border border-border bg-surface-2 sm:size-24">
        <span className="font-display text-5xl leading-none sm:text-6xl">{rune.glyph}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">The stave</p>
        <p className="font-display text-xl leading-tight">
          {rune.name}{" "}
          <span className="text-muted">
            {rune.glyph} · {rune.phonetic}
          </span>
        </p>
        <p className="mt-1 text-sm text-muted">{rune.meaning}</p>
        <p className="mt-1 text-xs text-subtle">
          {rune.positions.length} cards laid as {rune.name}
        </p>
      </div>
      <div className="hidden h-20 w-16 shrink-0 text-fg/70 sm:block">
        <RuneDiagram rune={rune} />
      </div>
    </div>
  );
}

export function RuneBoardGhost({ rune }: { rune: RuneStave }) {
  return (
    <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 text-fg/25" aria-hidden>
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
          x={p.x - 8}
          y={p.y - 11}
          width="16"
          height="22"
          rx="1.4"
          fill="none"
          stroke="currentColor"
          strokeWidth="0.55"
        />
      ))}
    </svg>
  );
}
