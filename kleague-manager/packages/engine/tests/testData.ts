import type { Club, Division, Lineup, Player, PlayerAttributes, Tactic } from "../src/index.js";

export const balancedTactic: Tactic = {
  formation: "4-2-3-1",
  mentality: "BALANCED",
  pressing: 55,
  tempo: 55,
  defensiveLine: 50,
  width: 50,
  buildUpRisk: 45
};

export function fakeClub(index: number, division: Division = "K_LEAGUE_1", overrides: Partial<Club> = {}): Club {
  return {
    id: overrides.id ?? `CLUB_${index}`,
    name: overrides.name ?? `Fake Club ${index}`,
    division,
    ...overrides
  };
}

export function fakeClubs(count: number, division: Division = "K_LEAGUE_1"): Club[] {
  return Array.from({ length: count }, (_, index) => fakeClub(index + 1, division));
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

export interface FakePlayerOptions {
  rating?: number;
  isGoalkeeper?: boolean;
  isU22?: boolean;
  foreign?: boolean;
  homegrown?: boolean;
}

export function fakePlayer(id: string, options: FakePlayerOptions = {}): Player {
  const isGoalkeeper = options.isGoalkeeper ?? false;

  return {
    id,
    name: `Player ${id}`,
    dateOfBirth: options.isU22 ? "2005-01-01" : "1997-01-01",
    nationalityType: options.foreign ? "FOREIGN" : "DOMESTIC",
    positions: [isGoalkeeper ? "GK" : "MC"],
    isGoalkeeper,
    isHomegrown: options.homegrown ?? false,
    attributes: attributes(options.rating ?? 60)
  };
}

export interface BuildLineupOptions {
  prefix: string;
  totalPlayers: number;
  u22Count: number;
  u22StarterCount?: number;
  foreignCount?: number;
  substituteGoalkeepers?: number;
  rating?: number;
}

export function buildLineup(options: BuildLineupOptions): { lineup: Lineup; registeredPlayers: Player[] } {
  const u22StarterCount = options.u22StarterCount ?? Math.min(options.u22Count, 2);
  const substituteGoalkeepers = options.substituteGoalkeepers ?? 1;
  const foreignCount = options.foreignCount ?? 0;
  const playerMeta: Array<{ isGoalkeeper: boolean; isU22: boolean; foreign: boolean }> = [];

  for (let index = 0; index < options.totalPlayers; index += 1) {
    const isStarter = index < 11;
    const substituteIndex = index - 11;
    const isStartingGoalkeeper = index === 0;
    const isSubstituteGoalkeeper = !isStarter && substituteIndex < substituteGoalkeepers;
    playerMeta.push({
      isGoalkeeper: isStartingGoalkeeper || isSubstituteGoalkeeper,
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

  let remainingForeign = foreignCount;
  for (let index = playerMeta.length - 1; index >= 0 && remainingForeign > 0; index -= 1) {
    const meta = playerMeta[index];
    if (meta && !meta.isU22) {
      meta.foreign = true;
      remainingForeign -= 1;
    }
  }

  const players = playerMeta.map((meta, index) =>
    fakePlayer(`${options.prefix}_${index + 1}`, {
      rating: options.rating ?? 60,
      isGoalkeeper: meta.isGoalkeeper,
      isU22: meta.isU22,
      foreign: meta.foreign
    })
  );

  return {
    lineup: {
      startingXI: players.slice(0, 11),
      substitutes: players.slice(11),
      tactic: balancedTactic
    },
    registeredPlayers: players
  };
}

export function standingRows(clubs: Club[]): import("../src/index.js").StandingRow[] {
  return clubs.map((club, index) => ({
    club,
    played: 38,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: clubs.length - index,
    penaltyPoints: 0,
    position: index + 1
  }));
}
