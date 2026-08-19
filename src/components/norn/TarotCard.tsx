import { useEffect } from "react";
import type { DrawnCard, TarotCard as TarotCardData } from "@/norn/types";
import { cn } from "@/lib/utils";

export function CardBack({ className }: { className?: string }) {
  return (
    <div className={cn("relative h-full w-full overflow-hidden rounded-[10px] border border-border bg-surface-2", className)}>
      <img src="/cards/back.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
    </div>
  );
}

export function CardFace({ card, className }: { card: TarotCardData; className?: string }) {
  return (
    <article className={cn("relative h-full w-full overflow-hidden rounded-[10px] border border-border bg-surface", className)}>
      <img src={`/cards/${card.id}.jpg`} alt={card.name} className="absolute inset-0 h-full w-full object-cover" />
      <div className="absolute inset-x-0 bottom-0 bg-bg/75 px-1.5 py-1.5 text-center">
        <p className="font-display text-[10px] font-medium leading-tight tracking-wide text-fg sm:text-[11px]">{card.name}</p>
      </div>
    </article>
  );
}

export function FlippableCard({
  card,
  flipped,
  className,
}: {
  card: TarotCardData;
  flipped: boolean;
  className?: string;
}) {
  return (
    <div className={cn("h-full w-full [perspective:1100px]", className)}>
      <div
        className="relative h-full w-full transition-transform duration-500 [transform-style:preserve-3d]"
        style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
      >
        <div className="absolute inset-0 [backface-visibility:hidden]">
          <CardBack />
        </div>
        <div className="absolute inset-0 [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <CardFace card={card} />
        </div>
      </div>
    </div>
  );
}

export function CardDetail({
  card,
  note,
  index,
  total,
  onClose,
}: {
  card: TarotCardData;
  note: DrawnCard;
  index: number;
  total: number;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-bg/80 px-4 py-8"
      role="dialog"
      aria-modal="true"
      aria-label={card.name}
      onClick={onClose}
    >
      <div
        className="grid w-full max-w-3xl gap-6 sm:grid-cols-[minmax(0,18rem)_1fr] sm:items-start"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mx-auto aspect-[2/3] w-56 max-w-full sm:w-full">
          <CardFace card={card} />
        </div>
        <div className="rounded-[var(--radius-lg)] border border-border bg-surface p-5">
          <p className="text-xs uppercase tracking-[0.16em] text-muted">
            Stave {index + 1} of {total}
          </p>
          <h3 className="mt-2 font-display text-3xl">{card.name}</h3>
          <p className="text-sm italic text-muted">{card.epithet}</p>
          <p className="mt-4 text-sm leading-relaxed">{note.meaning}</p>
          {note.weave && <p className="mt-3 text-sm leading-relaxed text-muted">{note.weave}</p>}
          <button
            type="button"
            className="mt-6 inline-flex h-11 items-center rounded-[var(--radius-sm)] border border-border px-4 text-sm hover:bg-surface-2"
            onClick={onClose}
          >
            Return to the stave
          </button>
        </div>
      </div>
    </div>
  );
}

export function CardZoom({
  card,
  onClose,
}: {
  card: TarotCardData;
  onClose: () => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-bg/85 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label={card.name}
      onClick={onClose}
    >
      <figure
        className="flex max-h-[92dvh] w-full max-w-lg flex-col items-center"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={`/cards/${card.id}.jpg`}
          alt={card.name}
          className="max-h-[78dvh] w-auto rounded-[12px] border border-border object-contain shadow-lg"
        />
        <figcaption className="mt-4 text-center">
          <p className="font-display text-2xl">{card.name}</p>
          <p className="text-sm italic text-muted">{card.epithet}</p>
        </figcaption>
        <button
          type="button"
          className="mt-4 inline-flex h-11 items-center rounded-[var(--radius-sm)] border border-border px-4 text-sm hover:bg-surface-2"
          onClick={onClose}
        >
          Close the plate
        </button>
      </figure>
    </div>
  );
}
