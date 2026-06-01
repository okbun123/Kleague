import type { Lineup, Player, PlayerAttributes, Position, Tactic } from "@kleague-manager/engine";

export type DemoTacticKey = "balanced" | "press" | "counter" | "possession";

export const tacticOptions: Record<DemoTacticKey, Tactic> = {
  balanced: {
    formation: "4-2-3-1",
    mentality: "BALANCED",
    pressing: 55,
    tempo: 55,
    defensiveLine: 50,
    width: 50,
    buildUpRisk: 45
  },
  press: {
    formation: "4-3-3",
    mentality: "ATTACKING",
    pressing: 78,
    tempo: 70,
    defensiveLine: 68,
    width: 58,
    buildUpRisk: 60
  },
  counter: {
    formation: "5-3-2",
    mentality: "DEFENSIVE",
    pressing: 42,
    tempo: 64,
    defensiveLine: 38,
    width: 44,
    buildUpRisk: 32
  },
  possession: {
    formation: "4-1-4-1",
    mentality: "BALANCED",
    pressing: 60,
    tempo: 46,
    defensiveLine: 54,
    width: 62,
    buildUpRisk: 52
  }
};

const outfieldPositions: Position[] = ["DR", "DC", "DC", "DL", "DM", "MC", "MR", "ML", "AM", "ST"];

export interface DemoPlayerOptions {
  foreign?: boolean;
  isGoalkeeper?: boolean;
  isU22?: boolean;
  rating?: number;
}

export interface DemoLineupOptions {
  prefix: string;
  totalPlayers: number;
  u22Count: number;
  u22StarterCount?: number;
  foreignCount?: number;
  substituteGoalkeepers?: number;
  rating?: number;
  tactic?: Tactic;
}

export function attributes(rating: number): PlayerAttributes {
  return {
    finishing: rating,
    passing: rating,
    firstTouch: rating,
    dribbling: rating,
    crossing: rating,
    tackling: rating,
    marking: rating,
    heading: rating,
    pace: rating,
    stamina: rating,
    strength: rating,
    agility: rating,
    workRate: rating,
    vision: rating,
    composure: rating,
    concentration: rating,
    leadership: rating,
    pressureResistance: rating
  };
}

export function createDemoPlayer(id: string, index: number, options: DemoPlayerOptions = {}): Player {
  const isGoalkeeper = options.isGoalkeeper ?? false;
  const rating = options.rating ?? 60;
  const position = isGoalkeeper ? "GK" : outfieldPositions[index % outfieldPositions.length] ?? "MC";

  return {
    id,
    name: `Demo Player ${id}`,
    dateOfBirth: options.isU22 ? "2006-02-01" : "1998-06-15",
    nationalityType: options.foreign ? "FOREIGN" : "DOMESTIC",
    positions: [position],
    isGoalkeeper,
    isHomegrown: !options.foreign,
    attributes: attributes(rating)
  };
}

function assignForeignPlayers(
  playerMeta: Array<{ isGoalkeeper: boolean; isU22: boolean; foreign: boolean }>,
  foreignCount: number
) {
  let remainingForeign = foreignCount;
  for (let index = playerMeta.length - 1; index >= 0 && remainingForeign > 0; index -= 1) {
    const meta = playerMeta[index];
    if (meta && !meta.isU22) {
      meta.foreign = true;
      remainingForeign -= 1;
    }
  }
}

export function buildDemoLineup(options: DemoLineupOptions): { lineup: Lineup; registeredPlayers: Player[] } {
  const u22StarterCount = Math.min(options.u22StarterCount ?? Math.min(options.u22Count, 2), 10);
  const substituteGoalkeepers = options.substituteGoalkeepers ?? 1;
  const playerMeta: Array<{ isGoalkeeper: boolean; isU22: boolean; foreign: boolean }> = [];

  for (let index = 0; index < options.totalPlayers; index += 1) {
    const isStarter = index < 11;
    const substituteIndex = index - 11;
    playerMeta.push({
      isGoalkeeper: index === 0 || (!isStarter && substituteIndex < substituteGoalkeepers),
      isU22: false,
      foreign: false
    });
  }

  for (let index = 1; index < 11 && index <= u22StarterCount; index += 1) {
    const meta = playerMeta[index];
    if (meta) {
      meta.isU22 = true;
    }
  }

  let remainingU22 = Math.max(0, options.u22Count - u22StarterCount);
  for (let index = 11; index < playerMeta.length && remainingU22 > 0; index += 1) {
    const meta = playerMeta[index];
    if (meta && !meta.isGoalkeeper) {
      meta.isU22 = true;
      remainingU22 -= 1;
    }
  }

  assignForeignPlayers(playerMeta, options.foreignCount ?? 0);

  const registeredPlayers = playerMeta.map((meta, index) =>
    createDemoPlayer(`${options.prefix}_${index + 1}`, index, {
      foreign: meta.foreign,
      isGoalkeeper: meta.isGoalkeeper,
      isU22: meta.isU22,
      rating: Math.min(92, Math.max(42, (options.rating ?? 60) + (index % 5) - 2))
    })
  );

  return {
    lineup: {
      startingXI: registeredPlayers.slice(0, 11),
      substitutes: registeredPlayers.slice(11),
      tactic: options.tactic ?? tacticOptions.balanced
    },
    registeredPlayers
  };
}

export function createDemoSquad(prefix: string, rating = 60): Player[] {
  return buildDemoLineup({
    prefix,
    totalPlayers: 24,
    u22Count: 4,
    u22StarterCount: 2,
    foreignCount: 4,
    substituteGoalkeepers: 2,
    rating
  }).registeredPlayers;
}
