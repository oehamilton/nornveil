import type { TarotCard as TarotCardData } from "@/norn/types";
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
