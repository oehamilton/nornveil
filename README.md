# Nornveil

Dark Norse stave-reading. Speak what you seek. The Norns lay an Elder Futhark rune, then eighty-one staves — three beyond the old count — fall into that shape. One reading a day, bound to the signed name.

## The deck

- **25 Great Staves** — the Well, the gods, the ash, and the unnamed fourth Norn
- **Muspel** — fire worlds: will and making
- **Nifl** — rime worlds: mind and cutting
- **Aegir** — the ale-sea: tide and longing
- **Jord** — the stone mother: body and keep

Cards arrive slowly, in the rune's own shape. Optional natal day and hour.

## Run locally

```bash
npm install
npm run dev
```

Then open the app in your browser. Sign in with Google or X to take a reading.

```bash
npm run build
npm run typecheck
```

## Stack

React, TanStack Start, Tailwind, Postgres (Neon in production, PGLite in preview). Readings persist per signed-in user. When an xAI key is present, the closing weaving is spoken by Grok.

## License

Personal project. All rights reserved unless otherwise noted.
