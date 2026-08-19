import { createFileRoute, Link } from "@tanstack/react-router";
import { GROK_PROVIDERS, authEnabled, signIn } from "@/lib/auth/client";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/login")({ component: Login });

function Login() {
  return (
    <main className="relative grid min-h-dvh place-items-center px-6">
      <div className="veil-grain pointer-events-none absolute inset-0 opacity-20" />
      <div className="relative w-full max-w-sm rounded-[var(--radius-xl)] border border-border bg-surface p-6">
        <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted">The hall door</p>
        <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight">Sign in</h1>
        <p className="mt-2 text-sm text-muted">
          One stave a day is bound to your name. The Norns do not read for a stranger twice.
        </p>
        <div className="mt-5 flex flex-col gap-2">
          {authEnabled ? (
            GROK_PROVIDERS.map((p) => (
              <Button key={p.providerId} variant="ghost" onClick={() => signIn(p.providerId, { callbackURL: "/" })}>
                Continue with {p.label}
              </Button>
            ))
          ) : (
            <p className="text-sm text-muted">Sign-in is disabled.</p>
          )}
        </div>
        <Link to="/" className="mt-5 block text-center text-sm text-muted hover:text-fg">
          Back to the veil
        </Link>
      </div>
    </main>
  );
}
