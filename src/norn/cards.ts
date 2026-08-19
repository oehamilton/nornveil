import type { Suit, TarotCard } from "./types";

export const SUIT_META: Record<
  Exclude<Suit, "great">,
  { name: string; epithet: string; realm: string }
> = {
  muspel: { name: "Muspel", epithet: "the fire worlds", realm: "will and making" },
  nifl: { name: "Nifl", epithet: "the rime worlds", realm: "mind and cutting" },
  aegir: { name: "Aegir", epithet: "the ale-sea", realm: "tide and longing" },
  jord: { name: "Jord", epithet: "the stone mother", realm: "body and keep" },
};

const GREAT: TarotCard[] = [
  {
    id: "great-00",
    suit: "great",
    rank: 0,
    name: "The Well",
    epithet: "Urðarbrunnr",
    keywords: ["origin", "risk", "unwritten"],
    upright:
      "You stand at the root-water before a name has been given. The next step is a vow, not a plan.",
  },
  {
    id: "great-01",
    suit: "great",
    rank: 1,
    name: "Odin",
    epithet: "Allfather",
    keywords: ["will", "cunning", "price"],
    upright:
      "Knowledge here is not free. Something must be hung, given, or blinded before the answer will speak.",
  },
  {
    id: "great-02",
    suit: "great",
    rank: 2,
    name: "Frigg",
    epithet: "who knows and does not say",
    keywords: ["foresight", "silence", "hearth"],
    upright:
      "The truth is already known in the hall and being kept. Listen for what is not spoken.",
  },
  {
    id: "great-03",
    suit: "great",
    rank: 3,
    name: "Freyja",
    epithet: "of the slain and the gold",
    keywords: ["desire", "sovereignty", "seiðr"],
    upright:
      "Want is not weakness if you name it. Claim the thing, or it will claim you from the side.",
  },
  {
    id: "great-04",
    suit: "great",
    rank: 4,
    name: "Týr",
    epithet: "one-handed",
    keywords: ["law", "sacrifice", "oath"],
    upright:
      "Order will hold only if someone pays. Decide what you will put in the wolf's mouth.",
  },
  {
    id: "great-05",
    suit: "great",
    rank: 5,
    name: "Mímir",
    epithet: "the talking head",
    keywords: ["counsel", "memory", "depth"],
    upright:
      "Old advice is still alive if you will carry the head. Ask the one who remembers the first version of this problem.",
  },
  {
    id: "great-06",
    suit: "great",
    rank: 6,
    name: "The Binding",
    epithet: "oath of two",
    keywords: ["union", "choice", "tie"],
    upright:
      "Two roads have become one rope. Stay and be bound, or cut and bleed — both are honest.",
  },
  {
    id: "great-07",
    suit: "great",
    rank: 7,
    name: "The Chariot",
    epithet: "Tanngrisnir's yoke",
    keywords: ["force", "motion", "control"],
    upright:
      "The goats will pull if the hand is sure. Direction first; speed is a cheap god.",
  },
  {
    id: "great-08",
    suit: "great",
    rank: 8,
    name: "The Goat Strength",
    epithet: "sinew of the hall",
    keywords: ["endurance", "body", "patience"],
    upright:
      "This is not a clever problem. It is a long pull. Strength here means returning tomorrow.",
  },
  {
    id: "great-09",
    suit: "great",
    rank: 9,
    name: "Vegtamr",
    epithet: "the wanderer",
    keywords: ["solitude", "search", "disguise"],
    upright:
      "Leave the fire and walk. The answer is not in this room, and it will not come if you wait dressed as yourself.",
  },
  {
    id: "great-10",
    suit: "great",
    rank: 10,
    name: "The Wheel of Worlds",
    epithet: "nine turning",
    keywords: ["cycle", "fate", "turn"],
    upright:
      "A season is ending whether you bless it or not. Step with the turn or be dragged by the rim.",
  },
  {
    id: "great-11",
    suit: "great",
    rank: 11,
    name: "Forseti",
    epithet: "the fair seat",
    keywords: ["judgment", "balance", "hearing"],
    upright:
      "Sit until both sides have spoken. A rushed verdict will rot the hall from the high seat down.",
  },
  {
    id: "great-12",
    suit: "great",
    rank: 12,
    name: "The Hanged God",
    epithet: "nine nights on the ash",
    keywords: ["surrender", "vision", "ordeal"],
    upright:
      "You cannot win this by gripping harder. Hang still long enough for the runes to come of their own.",
  },
  {
    id: "great-13",
    suit: "great",
    rank: 13,
    name: "Hel",
    epithet: "half-living",
    keywords: ["ending", "threshold", "truth"],
    upright:
      "Something is already dead and still being fed. Name the corpse so the living can eat.",
  },
  {
    id: "great-14",
    suit: "great",
    rank: 14,
    name: "Iðunn",
    epithet: "keeper of the apples",
    keywords: ["renewal", "care", "measure"],
    upright:
      "Youth returns by tending, not by seizing. Mix the bitter with the sweet or both will spoil.",
  },
  {
    id: "great-15",
    suit: "great",
    rank: 15,
    name: "Fenrir",
    epithet: "the bound jaw",
    keywords: ["appetite", "fear", "chain"],
    upright:
      "What you have tied in the yard is growing. Either feed it honestly or admit the fetter will fail.",
  },
  {
    id: "great-16",
    suit: "great",
    rank: 16,
    name: "The Shattering",
    epithet: "when the sky-wolf feeds",
    keywords: ["collapse", "rupture", "clearing"],
    upright:
      "A structure you trusted is going. Do not rebuild the same roof on the same lie.",
  },
  {
    id: "great-17",
    suit: "great",
    rank: 17,
    name: "Aurvandil",
    epithet: "the frozen toe, the star",
    keywords: ["hope", "sign", "distance"],
    upright:
      "A small light is enough if you keep walking toward it. Do not ask the star to come down.",
  },
  {
    id: "great-18",
    suit: "great",
    rank: 18,
    name: "Máni",
    epithet: "hunted night-sun",
    keywords: ["doubt", "dream", "pursuit"],
    upright:
      "The mind is being chased by its own wolves. What you fear in the dark is already half-known.",
  },
  {
    id: "great-19",
    suit: "great",
    rank: 19,
    name: "Sól",
    epithet: "the chased day",
    keywords: ["clarity", "heat", "witness"],
    upright:
      "Daylight does not negotiate. What can stand the open air should be brought out now.",
  },
  {
    id: "great-20",
    suit: "great",
    rank: 20,
    name: "Gjallarhorn",
    epithet: "Heimdallr's cry",
    keywords: ["summons", "reckoning", "wake"],
    upright:
      "The horn has already sounded in you. Answer as if the bridge were burning — because some part of it is.",
  },
  {
    id: "great-21",
    suit: "great",
    rank: 21,
    name: "Yggdrasil",
    epithet: "the carrying ash",
    keywords: ["wholeness", "worlds", "hold"],
    upright:
      "You are not one story. Tend the root, the trunk, and the high nest, or the whole tree lists.",
  },
  {
    id: "great-22",
    suit: "great",
    rank: 22,
    name: "The Hidden Root",
    epithet: "the third mouth of the ash",
    keywords: ["secret", "underworld", "source"],
    upright:
      "A third root drinks where you will not look. The missing cause is under the floor, not in the argument.",
  },
  {
    id: "great-23",
    suit: "great",
    rank: 23,
    name: "The Ninth Night",
    epithet: "after the hanging",
    keywords: ["threshold", "after", "received"],
    upright:
      "The ordeal is over; the teaching has not finished arriving. Stay awake one night longer than comfort allows.",
  },
  {
    id: "great-24",
    suit: "great",
    rank: 24,
    name: "The Unnamed Norn",
    epithet: "who was not Skuld, nor Verðandi, nor Urðr",
    keywords: ["wild fate", "unnamed", "aside"],
    upright:
      "A fourth hand is on the thread. What happens next is not in the usual three names — watch the side of the loom.",
  },
];

const RANK_TITLE = [
  "",
  "Ace",
  "Two",
  "Three",
  "Four",
  "Five",
  "Six",
  "Seven",
  "Eight",
  "Nine",
  "Ten",
  "Hersir",
  "Skald",
  "Valkyrie",
  "Jarl",
] as const;

const MINOR: Record<Exclude<Suit, "great">, { keywords: [string, string, string]; upright: string }[]> = {
  muspel: [
    { keywords: ["spark", "begin", "heat"], upright: "A first fire is already under the tinder. Shelter it or stamp it — leaving it half-lit will smoke the house." },
    { keywords: ["split", "choice", "forge"], upright: "Two works want the same coal. One must wait or both will be slag." },
    { keywords: ["craft", "trial", "skill"], upright: "The blade is on the third fold. Keep working the metal; praise is early." },
    { keywords: ["hearth", "hold", "order"], upright: "Build a ring around the fire. Uncontained will eats the roof beams." },
    { keywords: ["strife", "ash", "contest"], upright: "A quarrel has gone to cinder. Winning now may cost the hall you meant to keep." },
    { keywords: ["alliance", "shared coal", "pace"], upright: "Share the bellows. This blaze is too large for one pair of lungs." },
    { keywords: ["defense", "stand", "guard"], upright: "Hold the gate with heat, not speeches. Someone is testing whether you still burn." },
    { keywords: ["labor", "repeat", "temper"], upright: "Eight strikes, not one flourish. Temper is made in the boring part." },
    { keywords: ["vigil", "almost", "watch"], upright: "The work is nearly done and most dangerous. Do not leave the forge for applause." },
    { keywords: ["burden", "load", "carry"], upright: "You are carrying too many irons. Set two down or the tenth will drop itself." },
    { keywords: ["envoy", "errand", "spark"], upright: "A younger will arrives with a message from the fire. Send them; do not go yourself." },
    { keywords: ["song", "boast", "motion"], upright: "Speak the work into the hall. A quiet victory rusts; a true skald names the heat." },
    { keywords: ["chooser", "sever", "honor"], upright: "A chooser of the slain stands at your bench. What is finished must be taken off the field." },
    { keywords: ["command", "realm", "blaze"], upright: "Rule the fire or it rules the house. Authority here is the right to let something go cold." },
  ],
  nifl: [
    { keywords: ["edge", "first cut", "air"], upright: "A clean thought wants out. Say the sharp sentence once, then stop." },
    { keywords: ["stalemate", "mirror", "frost"], upright: "Two truths have frozen facing each other. Neither melts without a third weather." },
    { keywords: ["hurt", "words", "rift"], upright: "Something said cannot be unsaid. Tend the wound; do not argue with blood." },
    { keywords: ["rest", "truce", "pause"], upright: "Lay the blades down for a night. Ice can be walked if no one stamps." },
    { keywords: ["defeat", "humbling", "loss"], upright: "You lost a point you thought was honor. It was only pride in thin clothes." },
    { keywords: ["passage", "away", "leave"], upright: "The path out is colder than the fight. Take it. Staying is a slower freeze." },
    { keywords: ["cunning", "angle", "theft"], upright: "A side approach will do what the charge cannot. Think like rime under a door." },
    { keywords: ["bind", "trap", "cord"], upright: "You are tangled in your own cleverness. Cut one knot. Not all of them — one." },
    { keywords: ["vigil", "worry", "night"], upright: "The mind is walking the wall at the wrong hour. Name the real wolf and the rest are weather." },
    { keywords: ["overkill", "ruin", "end"], upright: "The argument has killed what it meant to save. Bury it before you call it principle." },
    { keywords: ["scout", "news", "blade"], upright: "A junior mind brings a fact you will not like. Thank them. Shoot the messenger and you go blind." },
    { keywords: ["verse", "travel", "wit"], upright: "A skald of ice: move, speak lightly, do not settle. Your next line is a road." },
    { keywords: ["judgment", "pick", "cold"], upright: "She will take the worthy and leave the rest. Be worthy in the small cut, not the speech." },
    { keywords: ["sovereign mind", "law", "frost"], upright: "Think like a winter king: few words, exact borders, no theatre." },
  ],
  aegir: [
    { keywords: ["wellspring", "feeling", "in"], upright: "A new tide is already at the threshold. Let it in a cup at a time." },
    { keywords: ["pair", "bond", "cup"], upright: "Two cups on one bench. Drink together or admit you are thirsty for different halls." },
    { keywords: ["feast", "share", "joy"], upright: "Hospitality is the working magic. Offer more than you can nicely spare." },
    { keywords: ["withdraw", "full", "apart"], upright: "The table is too loud for what you feel. Step back before you sour the ale." },
    { keywords: ["grief", "spill", "loss"], upright: "Something beloved has gone over the gunwale. Mourn in the open or the hull takes water." },
    { keywords: ["memory", "old tide", "return"], upright: "An old affection is coming back on the swell. See it as it is, not as it was." },
    { keywords: ["vision", "dream", "deep"], upright: "The sea is showing pictures. Write them down before daylight talks you out of them." },
    { keywords: ["leaving", "ebb", "walk"], upright: "You are done with this shore. Going is not cruelty if you do not pretend to stay." },
    { keywords: ["plenty", "wish", "full"], upright: "The cup is full and you are still asking. Want the next thing only after you taste this one." },
    { keywords: ["house", "kin", "hold"], upright: "The family sea is high. Tend the ones in the boat before you dive for glory." },
    { keywords: ["cupbearer", "offer", "youth"], upright: "A younger heart brings drink. Receive it without turning it into a debt." },
    { keywords: ["romance", "quest", "song"], upright: "Desire wants a journey, not a speech. Go toward the person, not the idea of them." },
    { keywords: ["chooser of hearts", "tide", "pick"], upright: "Someone is choosing who is kept. If it is you doing the choosing, be kind and final." },
    { keywords: ["host", "sea-king", "hold"], upright: "You set the weather of the room. Brew honestly; a false feast poisons later." },
  ],
  jord: [
    { keywords: ["seed", "start", "ground"], upright: "A first coin, a first plot, a first honest hour. Plant it where you can watch it." },
    { keywords: ["juggle", "two", "balance"], upright: "Two obligations are both real. Drop the third thing you added to look capable." },
    { keywords: ["craft", "work", "make"], upright: "The hands know. Stop asking the air and finish the object." },
    { keywords: ["keep", "hold", "close"], upright: "Guard what is already working. Expansion now is a hole in the fence." },
    { keywords: ["lack", "cut", "lean"], upright: "There is not enough. Cut the pretty expense before you cut the bone." },
    { keywords: ["gift", "fair", "exchange"], upright: "Pay what you owe and accept what is offered. Pride is a poor treasurer." },
    { keywords: ["patience", "grow", "wait"], upright: "The field is green, not gold. Visiting it every hour will not ripen it." },
    { keywords: ["skill", "trade", "steady"], upright: "Your craft is the coin. Practice in public; hiding it helps no one." },
    { keywords: ["garden", "alone", "plenty"], upright: "You have enough if you stop measuring against another yard. Tend your own row." },
    { keywords: ["estate", "weight", "old"], upright: "Inheritance — money, habit, name — is sitting on your chest. Keep the land, not the ghost." },
    { keywords: ["steward", "errand", "soil"], upright: "A younger keeper can carry the keys for a day. Trust is also a crop." },
    { keywords: ["builder", "road", "move"], upright: "Put your body where the work is. The skald of stone travels with tools, not wishes." },
    { keywords: ["keeper", "harvest", "queen"], upright: "She counts the stores without romance. Be that exact with your own keep." },
    { keywords: ["landholder", "rule", "earth"], upright: "Own the ground you stand on — title, body, hours. A jarl of Jord does not rent his spine." },
  ],
};

function roman(n: number): string {
  if (n === 0) return "0";
  const map: [number, string][] = [
    [10, "X"],
    [9, "IX"],
    [5, "V"],
    [4, "IV"],
    [1, "I"],
  ];
  let left = n;
  let out = "";
  for (const [v, s] of map) {
    while (left >= v) {
      out += s;
      left -= v;
    }
  }
  return out;
}

function minors(): TarotCard[] {
  const suits = ["muspel", "nifl", "aegir", "jord"] as const;
  const out: TarotCard[] = [];
  for (const suit of suits) {
    const meta = SUIT_META[suit];
    MINOR[suit].forEach((row, i) => {
      const rank = i + 1;
      const title = RANK_TITLE[rank] ?? String(rank);
      out.push({
        id: `${suit}-${String(rank).padStart(2, "0")}`,
        suit,
        rank,
        name: rank === 1 ? `Ace of ${meta.name}` : `${title} of ${meta.name}`,
        epithet: meta.epithet,
        keywords: row.keywords,
        upright: row.upright,
      });
    });
  }
  return out;
}

export const DECK: TarotCard[] = [...GREAT, ...minors()];

export function cardById(id: string): TarotCard {
  return DECK.find((c) => c.id === id) ?? DECK[0]!;
}

export function rankMark(card: TarotCard): string {
  if (card.suit === "great") return roman(card.rank);
  if (card.rank === 1) return "A";
  if (card.rank === 11) return "H";
  if (card.rank === 12) return "S";
  if (card.rank === 13) return "V";
  if (card.rank === 14) return "J";
  return String(card.rank);
}

export function suitTitle(suit: Suit): string {
  if (suit === "great") return "Great Stave";
  return SUIT_META[suit].name;
}
