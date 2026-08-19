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
