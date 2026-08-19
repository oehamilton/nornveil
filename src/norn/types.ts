export type Suit = "great" | "muspel" | "nifl" | "aegir" | "jord";

export type TarotCard = {
  id: string;
  suit: Suit;
  rank: number;
  name: string;
  epithet: string;
  keywords: [string, string, string];
  upright: string;
  plate?: string;
};

export type RunePos = { x: number; y: number };

export type RuneStave = {
  id: string;
  glyph: string;
  name: string;
  phonetic: string;
  meaning: string;
  positions: RunePos[];
  links: [number, number][];
};

export type DrawnCard = {
  cardId: string;
  meaning: string;
  weave: string | null;
};

export type ReadingRecord = {
  id: number;
  day: string;
  seeking: string;
  birthDate: string | null;
  birthTime: string | null;
  runeId: string;
  cards: DrawnCard[];
  summary: string;
  complete: boolean;
  createdAt: string;
};
