import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { Link } from "@tanstack/react-router";
import { UserButton } from "@/lib/auth/gates";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { beginReading, finishReading, getSeekerMark, getTodayReading, listReadings, resetTodayReading } from "@/lib/readings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CardBack, CardDetail, CardFace, CardZoom } from "@/components/norn/TarotCard";
import { RuneGuide } from "@/components/norn/RuneGuide";
import { RuneBoard } from "@/components/norn/RuneBoard";
import { DECK, cardById } from "@/norn/cards";
import { runeById } from "@/norn/runes";
import { todayStamp } from "@/norn/seed";
import { localSummary } from "@/norn/weave";
import type { ReadingRecord } from "@/norn/types";

type Phase =
  | "boot"
  | "land"
  | "intent"
  | "wake"
  | "shuffle"
  | "seal"
  | "announce"
  | "spread"
  | "closing"
  | "done"
  | "archive";

const RITUAL: Phase[] = [
  "intent",
  "wake",
  "shuffle",
  "seal",
  "announce",
  "spread",
  "closing",
  "archive",
];

export function VeilApp() {
  const { user, isPending } = useCurrentUserState();
  const [phase, setPhase] = useState<Phase>("land");
  const [today, setToday] = useState<ReadingRecord | null>(null);
  const [archive, setArchive] = useState<ReadingRecord[]>([]);
  const [mark, setMark] = useState<{ birthDate: string | null; birthTime: string | null }>({
    birthDate: null,
    birthTime: null,
  });
  const [viewing, setViewing] = useState<ReadingRecord | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const phaseRef = useRef<Phase>("boot");
  phaseRef.current = phase;
  const userId = user?.id ?? null;

  useEffect(() => {
    if (isPending) return;
    if (!userId) {
      setToday(null);
      setArchive([]);
      setMark({ birthDate: null, birthTime: null });
      setPhase("land");
      return;
    }
    let alive = true;
    Promise.all([getTodayReading(), listReadings(), getSeekerMark()])
      .then(([now, past, natal]) => {
        if (!alive) return;
        setToday(now);
        setArchive(past);
        setMark(natal);
        const here = phaseRef.current;
        if (RITUAL.includes(here)) return;
        if (now?.complete) setPhase("done");
        else if (now) setPhase("wake");
        else setPhase("land");
      })
      .catch(() => {
        if (alive && !RITUAL.includes(phaseRef.current)) setPhase("land");
      });
    return () => {
      alive = false;
    };
  }, [userId, isPending]);

  const shown = viewing ?? today;

  function leaveWell() {
    setViewing(null);
    setError(null);
    setPhase("land");
  }

  async function unbindDay() {
    setBusy(true);
    setError(null);
    try {
      await resetTodayReading();
      setToday(null);
      setViewing(null);
      setPhase("land");
    } catch (e) {
      setError(e instanceof Error ? e.message : "The stave would not lift.");
    } finally {
      setBusy(false);
    }
  }

  function fallbackSummary(row: ReadingRecord): string {
    if ((row.summary ?? "").trim()) return row.summary;
    return localSummary(
      row.runeId,
      row.cards.map((c) => c.cardId),
      row.seeking,
    );
  }

  return (
    <div className="relative min-h-dvh bg-bg text-fg">
      <div className="veil-grain pointer-events-none absolute inset-0 opacity-[0.18]" />
      <header className="relative z-10 flex items-center justify-between gap-3 px-4 py-4 sm:px-8">
        <button type="button" className="text-left" onClick={leaveWell}>
          <p className="font-display text-lg font-semibold tracking-[0.22em]">NORNVEIL</p>
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted">One stave a day</p>
        </button>
        <nav className="flex flex-wrap items-center justify-end gap-2">
          {phase !== "land" && phase !== "boot" && (
            <Button variant="ghost" size="sm" onClick={leaveWell}>
              Leave the well
            </Button>
          )}
          {user ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => setPhase("archive")}>
                Past staves
              </Button>
              <UserButton />
            </>
          ) : isPending ? (
            <div className="h-8 w-8 animate-pulse rounded-full bg-surface-2" />
          ) : (
            <Link
              to="/login"
              className="inline-flex h-11 items-center rounded-[var(--radius-sm)] border border-border px-4 text-sm text-fg hover:bg-surface-2"
            >
              Sign in
            </Link>
          )}
        </nav>
      </header>

      <main className="relative z-10 mx-auto w-full max-w-5xl px-4 pb-16 sm:px-8">
        {phase === "land" && (
          <Landing
            userName={user?.displayName ?? null}
            pending={isPending}
            locked={Boolean(today?.complete)}
            drafted={Boolean(today && !today.complete)}
            busy={busy}
            onBegin={() => setPhase("intent")}
            onResume={() => setPhase("spread")}
            onOpenToday={() => setPhase("done")}
            onReset={unbindDay}
          />
        )}
        {phase === "intent" && (
          <IntentForm
            busy={busy}
            error={error}
            savedBirthDate={mark.birthDate ?? today?.birthDate ?? ""}
            savedBirthTime={mark.birthTime ?? today?.birthTime ?? ""}
            onBack={leaveWell}
            onSubmit={async (payload) => {
              setBusy(true);
              setError(null);
              try {
                const row = await beginReading({ data: payload });
                setToday(row);
                if (payload.birthDate || payload.birthTime) {
                  setMark({
                    birthDate: payload.birthDate ?? null,
                    birthTime: payload.birthTime ?? null,
                  });
                }
                setPhase("wake");
              } catch (e) {
                setError(e instanceof Error ? e.message : "The well refused the question.");
              } finally {
                setBusy(false);
              }
            }}
          />
        )}
        {(phase === "wake" || phase === "shuffle" || phase === "seal") && today && (
          <WaveRite
            phase={phase}
            runeId={today.runeId}
            onLeave={leaveWell}
            onWake={() => {
              setPhase("shuffle");
              window.setTimeout(() => setPhase("seal"), 1700);
            }}
            onSeal={() => setPhase("announce")}
          />
        )}
        {phase === "announce" && today && (
          <Announce reading={today} onDone={() => setPhase("spread")} onLeave={leaveWell} />
        )}
        {phase === "spread" && today && (
          <SpreadPlay
            reading={today}
            onLeave={leaveWell}
            onFinished={async () => {
              setBusy(true);
              setPhase("done");
              try {
                const done = await finishReading({ data: today.id });
                const sealed = { ...done, summary: fallbackSummary(done) };
                setToday(sealed);
                setArchive((prev) => [sealed, ...prev.filter((r) => r.id !== sealed.id)]);
              } catch (e) {
                try {
                  const again = await getTodayReading();
                  if (again) {
                    const sealed = { ...again, summary: fallbackSummary(again), complete: true };
                    setToday(sealed);
                    setArchive((prev) => [sealed, ...prev.filter((r) => r.id !== sealed.id)]);
                  } else {
                    setToday({ ...today, summary: fallbackSummary(today), complete: true });
                  }
                } catch {
                  setToday({ ...today, summary: fallbackSummary(today), complete: true });
                }
                setError(e instanceof Error ? e.message : "The norn fell silent.");
              } finally {
                setBusy(false);
              }
            }}
          />
        )}
        {phase === "done" && shown && (
          <ReadingDone
            reading={{ ...shown, summary: fallbackSummary(shown) }}
            weaving={busy}
            onLeave={leaveWell}
            onReset={unbindDay}
          />
        )}
        {phase === "archive" && (
          <Archive
            rows={archive}
            onBack={leaveWell}
            onOpen={(row) => {
              setViewing(row);
              setPhase("done");
            }}
          />
        )}
        {error && phase !== "intent" && <p className="mt-6 text-sm text-danger">{error}</p>}
      </main>
    </div>
  );
}

function Landing({
  userName,
  pending,
  locked,
  drafted,
  busy,
  onBegin,
  onResume,
  onOpenToday,
  onReset,
}: {
  userName: string | null;
  pending: boolean;
  locked: boolean;
  drafted: boolean;
  busy: boolean;
  onBegin: () => void;
  onResume: () => void;
  onOpenToday: () => void;
  onReset: () => void;
}) {
  const [peek, setPeek] = useState<string | null>(null);
  const peekCard = peek ? cardById(peek) : null;
  const hallPlates = ["great-00", "great-01", "great-13", "great-21", "great-15", "great-24"];
  return (
    <section className="grid gap-10 pt-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-muted">Dark Norse stave-reading</p>
        <h1 className="mt-3 font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
          The Norns lay a rune.
          <span className="block text-muted">You do not choose the shape.</span>
        </h1>
        <p className="mt-5 max-w-xl text-base text-muted">
          Speak what you seek. Pass your hand over the veil. Eighty-one staves — three beyond the old count — fall
          into an Elder Futhark. One reading each day, bound to the signed name.
        </p>
        <p className="mt-3 text-sm text-subtle">
          Optional natal day and hour. Cards arrive slowly, in the rune's own shape.
        </p>
        <div className="mt-7 flex flex-wrap gap-3">
          {pending ? (
            <div className="h-12 w-48 animate-pulse rounded-[var(--radius-sm)] bg-surface-2" />
          ) : userName ? (
            locked ? (
              <>
                <Button onClick={onOpenToday}>Open today's stave</Button>
                <Button variant="ghost" onClick={onReset} disabled={busy}>
                  {busy ? "Lifting the stave…" : "Unbind this day"}
                </Button>
              </>
            ) : drafted ? (
              <>
                <Button onClick={onResume}>Return to the veil</Button>
                <Button variant="ghost" onClick={onReset} disabled={busy}>
                  {busy ? "Lifting the stave…" : "Unbind this day"}
                </Button>
              </>
            ) : (
              <Button onClick={onBegin}>Step to the well</Button>
            )
          ) : (
            <Link
              to="/login"
              className="inline-flex h-12 items-center rounded-[var(--radius-sm)] bg-accent px-6 text-sm font-medium text-accent-fg"
            >
              Sign in to be read
            </Link>
          )}
        </div>
      </div>
      <div>
        <div className="relative mx-auto h-64 w-full max-w-sm">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="absolute top-4 h-52 w-32 shadow-lg sm:h-56 sm:w-36"
              style={{
                left: `${18 + i * 18}%`,
                transform: `rotate(${(i - 1) * 9}deg)`,
              }}
            >
              <CardBack />
            </div>
          ))}
        </div>
        <ul className="mt-2 grid grid-cols-3 gap-2 sm:gap-3">
          {hallPlates.map((id) => (
            <li key={id} className="aspect-[2/3]">
              <button
                type="button"
                className="h-full w-full rounded-[10px] border-0 bg-transparent p-0 shadow-lg transition-transform duration-150 hover:scale-[1.03]"
                aria-label={`Open ${cardById(id).name}`}
                onClick={() => setPeek(id)}
              >
                <CardFace card={cardById(id)} />
              </button>
            </li>
          ))}
        </ul>
        {peekCard && <CardZoom card={peekCard} onClose={() => setPeek(null)} />}
      </div>
    </section>
  );
}

function IntentForm({
  busy,
  error,
  savedBirthDate,
  savedBirthTime,
  onBack,
  onSubmit,
}: {
  busy: boolean;
  error: string | null;
  savedBirthDate: string;
  savedBirthTime: string;
  onBack: () => void;
  onSubmit: (data: { seeking: string; birthDate?: string; birthTime?: string; day: string }) => void;
}) {
  const [seeking, setSeeking] = useState("");
  const [birthDate, setBirthDate] = useState(savedBirthDate.slice(0, 10));
  const [birthTime, setBirthTime] = useState(savedBirthTime.slice(0, 5));

  useEffect(() => {
    if (!birthDate && savedBirthDate) setBirthDate(savedBirthDate.slice(0, 10));
    if (!birthTime && savedBirthTime) setBirthTime(savedBirthTime.slice(0, 5));
  }, [savedBirthDate, savedBirthTime, birthDate, birthTime]);
  return (
    <form
      className="mx-auto max-w-lg rounded-[var(--radius-xl)] border border-border bg-surface p-6"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          seeking,
          birthDate: birthDate || undefined,
          birthTime: birthTime || undefined,
          day: todayStamp(),
        });
      }}
    >
      <p className="text-xs uppercase tracking-[0.18em] text-muted">Before the well</p>
      <h2 className="mt-1 font-display text-3xl">What are you seeking?</h2>
      <p className="mt-2 text-sm text-muted">A brief, honest statement. The staves answer what is actually asked.</p>
      <div className="mt-5 space-y-4">
        <div>
          <Label htmlFor="seeking">The seeking</Label>
          <Textarea
            id="seeking"
            required
            minLength={8}
            maxLength={280}
            value={seeking}
            onChange={(e) => setSeeking(e.target.value)}
            placeholder="I need to know whether to leave the work I have, and what I owe the people still in it."
            className="mt-2"
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <Label htmlFor="bday">Birth day — optional</Label>
            <Input id="bday" type="date" value={birthDate} onChange={(e) => setBirthDate(e.target.value)} className="mt-2" />
          </div>
          <div>
            <Label htmlFor="btime">Birth hour — optional</Label>
            <Input id="btime" type="time" value={birthTime} onChange={(e) => setBirthTime(e.target.value)} className="mt-2" />
          </div>
        </div>
        <p className="text-xs text-subtle">
          {savedBirthDate || savedBirthTime
            ? "Kept with your signed name. Change it only if it must change."
            : "Natal hour steadies the stave if you know it. Once entered, it stays with your name."}
        </p>
      </div>
      {error && <p className="mt-4 text-sm text-danger">{error}</p>}
      <div className="mt-6 flex flex-col gap-2">
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? "The cup is turning…" : "Lay my name on the well"}
        </Button>
        <Button type="button" variant="ghost" className="w-full" onClick={onBack}>
          Leave the well
        </Button>
      </div>
    </form>
  );
}

function WaveRite({
  phase,
  runeId,
  onLeave,
  onWake,
  onSeal,
}: {
  phase: "wake" | "shuffle" | "seal";
  runeId: string;
  onLeave: () => void;
  onWake: () => void;
  onSeal: () => void;
}) {
  const [charge, setCharge] = useState(0);
  const last = useRef<{ x: number; y: number } | null>(null);
  const pointer = useRef({ x: 50, y: 50 });
  const [, tick] = useState(0);
  const done = useRef(false);

  useEffect(() => {
    setCharge(0);
    done.current = false;
    last.current = null;
  }, [phase]);

  const cards = useMemo(() => DECK.slice(0, 13), []);

  function onMove(e: PointerEvent<HTMLDivElement>) {
    if (phase === "shuffle") return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    pointer.current = { x, y };
    tick((n) => n + 1);
    if (last.current) {
      const dx = x - last.current.x;
      const dy = y - last.current.y;
      const dist = Math.hypot(dx, dy);
      if (dist > 0.2) {
        setCharge((c) => Math.min(1, c + Math.min(dist, 18) * 0.012));
      }
    }
    last.current = { x, y };
  }

  useEffect(() => {
    if (charge < 1 || done.current) return;
    done.current = true;
    if (phase === "wake") onWake();
    if (phase === "seal") onSeal();
  }, [charge, phase, onWake, onSeal]);

  const copy =
    phase === "wake"
      ? "Pass your hand over the staves until they wake."
      : phase === "shuffle"
        ? "The veil is mixing."
        : "Again — seal what was mixed.";

  return (
    <section>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.18em] text-muted">{phase === "seal" ? "Second pass" : "The veil"}</p>
          <h2 className="mt-1 font-display text-3xl">{copy}</h2>
        </div>
        <p className="font-display text-sm tabular-nums text-muted">{Math.round(charge * 100)}</p>
      </div>
      <div className="mt-4">
        <RuneGuide runeId={runeId} />
      </div>
      <div
        className="relative mt-6 h-[min(62vh,520px)] touch-none overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface"
        onPointerMove={onMove}
        onPointerLeave={() => {
          last.current = null;
        }}
      >
        <div className="absolute inset-x-8 top-5 h-1 rounded-full bg-border">
          <div className="h-full rounded-full bg-accent transition-[width] duration-150" style={{ width: `${charge * 100}%` }} />
        </div>
        {cards.map((card, i) => {
          const t = (i / (cards.length - 1)) * 2 - 1;
          const baseX = 50 + t * 38;
          const baseY = 58 + Math.abs(t) * 10;
          const rot = t * 16;
          const dx = pointer.current.x - baseX;
          const dy = pointer.current.y - baseY;
          const near = Math.max(0, 1 - Math.hypot(dx, dy) / 34);
          const shuffling = phase === "shuffle";
          return (
            <div
              key={card.id}
              className="absolute h-40 w-[6.4rem] sm:h-48 sm:w-32"
              style={{
                left: `${shuffling ? 50 : baseX + dx * near * 0.12}%`,
                top: `${shuffling ? 48 : baseY + dy * near * 0.08}%`,
                transform: `translate(-50%, -50%) rotate(${shuffling ? (i % 2 === 0 ? 18 : -22) : rot - dx * near * 0.08}deg) scale(${1 + near * 0.06})`,
                transition: shuffling
                  ? "left 700ms cubic-bezier(0.22,1,0.36,1), top 700ms cubic-bezier(0.22,1,0.36,1), transform 700ms cubic-bezier(0.22,1,0.36,1)"
                  : "transform 160ms ease-out",
                zIndex: 10 + i,
              }}
            >
              <CardBack />
            </div>
          );
        })}
      </div>
      <Button type="button" variant="ghost" className="mt-4" onClick={onLeave}>
        Leave the well
      </Button>
    </section>
  );
}

function Announce({
  reading,
  onDone,
  onLeave,
}: {
  reading: ReadingRecord;
  onDone: () => void;
  onLeave: () => void;
}) {
  const rune = runeById(reading.runeId);
  return (
    <section className="mx-auto max-w-lg space-y-6 pt-4">
      <p className="text-center text-xs uppercase tracking-[0.2em] text-muted">Today's stave</p>
      <RuneGuide runeId={reading.runeId} />
      <div className="mx-auto h-56 w-44 text-fg">
        <div className="relative h-full w-full rounded-[var(--radius-lg)] border border-border bg-surface p-4">
          <span className="absolute left-1/2 top-3 -translate-x-1/2 font-display text-4xl text-fg/30">{rune.glyph}</span>
          <RuneDiagramLarge runeId={reading.runeId} />
        </div>
      </div>
      <p className="text-center text-sm text-muted">
        The cards will be laid in this shape — {rune.positions.length} places, the mark of {rune.name}.
      </p>
      <div className="flex flex-col gap-2">
        <Button className="w-full" onClick={onDone}>
          Lay the staves
        </Button>
        <Button variant="ghost" className="w-full" onClick={onLeave}>
          Leave the well
        </Button>
      </div>
    </section>
  );
}

function RuneDiagramLarge({ runeId }: { runeId: string }) {
  const rune = runeById(runeId);
  return (
    <svg viewBox="0 0 100 100" className="relative h-full w-full text-fg" aria-hidden>
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
            strokeWidth="2"
            strokeLinecap="square"
          />
        );
      })}
      {rune.positions.map((p, i) => (
        <rect
          key={i}
          x={p.x - 6}
          y={p.y - 8}
          width="12"
          height="16"
          rx="1.2"
          fill="var(--color-surface)"
          stroke="currentColor"
          strokeWidth="1.5"
        />
      ))}
    </svg>
  );
}

function SpreadPlay({
  reading,
  onFinished,
  onLeave,
}: {
  reading: ReadingRecord;
  onFinished: () => void;
  onLeave: () => void;
}) {
  const rune = runeById(reading.runeId);
  const [dealt, setDealt] = useState(0);
  const [flipped, setFlipped] = useState(0);
  const [readyNext, setReadyNext] = useState(false);
  const [open, setOpen] = useState<number | null>(null);

  useEffect(() => {
    if (dealt !== 0) return;
    const t = window.setTimeout(() => setDealt(1), 420);
    return () => window.clearTimeout(t);
  }, [dealt]);

  useEffect(() => {
    if (dealt === 0 || flipped >= dealt) return;
    const t = window.setTimeout(() => {
      setFlipped(dealt);
      setReadyNext(true);
      setOpen(dealt - 1);
    }, 700);
    return () => window.clearTimeout(t);
  }, [dealt, flipped]);

  const last = flipped >= reading.cards.length && readyNext;
  const opened = open != null ? reading.cards[open] : null;
  const openedCard = opened ? cardById(opened.cardId) : null;

  return (
    <section className="space-y-5">
      <RuneGuide runeId={reading.runeId} />
      <RuneBoard
        rune={rune}
        cards={reading.cards}
        dealt={dealt}
        flipped={flipped}
        onOpen={setOpen}
      />
      <div className="mx-auto max-w-lg text-center">
        <p className="text-sm text-muted">
          {flipped === 0
            ? "The first stave is coming to its place."
            : "Touch a stave to open it."}
        </p>
        <p className="mt-1 text-xs tabular-nums text-subtle">
          {flipped} / {reading.cards.length}
        </p>
        {readyNext && !last && (
          <Button
            className="mt-5 w-full"
            onClick={() => {
              setReadyNext(false);
              setOpen(null);
              setDealt((n) => Math.min(reading.cards.length, Math.max(n, flipped) + 1));
            }}
          >
            Draw the next stave
          </Button>
        )}
        {last && (
          <Button className="mt-5 w-full" onClick={onFinished}>
            Close the well
          </Button>
        )}
        <Button variant="ghost" className="mt-2 w-full" onClick={onLeave}>
          Leave the well
        </Button>
      </div>
      {opened && openedCard && open != null && (
        <CardDetail
          card={openedCard}
          note={opened}
          index={open}
          total={reading.cards.length}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}

function ReadingDone({
  reading,
  weaving,
  onLeave,
  onReset,
}: {
  reading: ReadingRecord;
  weaving: boolean;
  onLeave: () => void;
  onReset: () => void;
}) {
  const rune = runeById(reading.runeId);
  const weavingText = reading.summary.trim();
  const [open, setOpen] = useState<number | null>(null);
  const opened = open != null ? reading.cards[open] : null;
  const openedCard = opened ? cardById(opened.cardId) : null;

  return (
    <section className="space-y-6">
      <RuneGuide runeId={reading.runeId} />
      <RuneBoard
        rune={rune}
        cards={reading.cards}
        dealt={reading.cards.length}
        flipped={reading.cards.length}
        onOpen={setOpen}
      />
      <p className="text-center text-sm text-muted">Touch a stave to open it.</p>
      <div className="mx-auto max-w-2xl">
        <p className="text-xs uppercase tracking-[0.16em] text-muted">
          {reading.day} · {rune.name} {rune.glyph}
        </p>
        <h2 className="mt-2 font-display text-3xl">The weaving</h2>
        <p className="mt-2 text-sm italic text-muted">&ldquo;{reading.seeking}&rdquo;</p>
        {weaving && !weavingText ? (
          <p className="mt-6 text-sm text-muted">The unnamed norn is still speaking…</p>
        ) : (
          <div className="mt-6 rounded-[var(--radius-lg)] border border-border bg-surface p-5">
            <p className="text-xs uppercase tracking-[0.16em] text-muted">Spoken at the well</p>
            <p className="mt-3 text-base leading-relaxed">{weavingText}</p>
          </div>
        )}
        <div className="mt-8 flex flex-col gap-2 sm:flex-row">
          <Button variant="ghost" onClick={onLeave}>
            Back to the hall
          </Button>
          <Button variant="ghost" onClick={onReset}>
            Ask the well again
          </Button>
        </div>
      </div>
      {opened && openedCard && open != null && (
        <CardDetail
          card={openedCard}
          note={opened}
          index={open}
          total={reading.cards.length}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}

function Archive({
  rows,
  onOpen,
  onBack,
}: {
  rows: ReadingRecord[];
  onOpen: (row: ReadingRecord) => void;
  onBack: () => void;
}) {
  if (rows.length === 0) {
    return (
      <section className="pt-10">
        <h2 className="font-display text-3xl">Past staves</h2>
        <p className="mt-3 text-sm text-muted">No finished readings yet. The well keeps what you complete.</p>
        <Button variant="ghost" className="mt-6" onClick={onBack}>
          Back to the hall
        </Button>
      </section>
    );
  }
  return (
    <section className="pt-4">
      <h2 className="font-display text-3xl">Past staves</h2>
      <ul className="mt-6 divide-y divide-border border-y border-border">
        {rows.map((row) => {
          const rune = runeById(row.runeId);
          return (
            <li key={row.id}>
              <button
                type="button"
                onClick={() => onOpen(row)}
                className="flex w-full items-start justify-between gap-4 py-4 text-left hover:bg-surface/80"
              >
                <span>
                  <span className="block text-xs uppercase tracking-[0.16em] text-muted">{row.day}</span>
                  <span className="mt-1 block font-display text-lg">
                    {rune.glyph} {rune.name}
                  </span>
                  <span className="mt-1 block text-sm text-muted">{row.seeking}</span>
                </span>
                <span className="text-xs tabular-nums text-subtle">{row.cards.length}</span>
              </button>
            </li>
          );
        })}
      </ul>
      <Button variant="ghost" className="mt-6" onClick={onBack}>
        Back to the hall
      </Button>
    </section>
  );
}
