import type { RunePos } from "./types";

const CARD_ASPECT = 2 / 3;
const GAP = 1.8;
const MARGIN = 2.2;

export type CardBox = { w: number; h: number };

function fits(positions: RunePos[], w: number, h: number): boolean {
  for (const p of positions) {
    if (p.x - w / 2 < MARGIN || p.x + w / 2 > 100 - MARGIN) return false;
    if (p.y - h / 2 < MARGIN || p.y + h / 2 > 100 - MARGIN) return false;
  }
  for (let i = 0; i < positions.length; i++) {
    for (let j = i + 1; j < positions.length; j++) {
      const dx = Math.abs(positions[i]!.x - positions[j]!.x);
      const dy = Math.abs(positions[i]!.y - positions[j]!.y);
      if (dx < w + GAP && dy < h + GAP) return false;
    }
  }
  return true;
}

export function cardBoxFor(positions: RunePos[]): CardBox {
  let lo = 7;
  let hi = 32;
  if (!fits(positions, lo * CARD_ASPECT, lo)) {
    return { w: lo * CARD_ASPECT, h: lo };
  }
  for (let i = 0; i < 20; i++) {
    const h = (lo + hi) / 2;
    if (fits(positions, h * CARD_ASPECT, h)) lo = h;
    else hi = h;
  }
  return { w: lo * CARD_ASPECT, h: lo };
}
