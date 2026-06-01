import type { Club } from "../models/club.js";
import type { CompetitionRulePack } from "../models/competition.js";
import type { Lineup } from "../models/lineup.js";
import type { Fixture, MatchResult } from "../models/match.js";
import { SeededRandom } from "../random/seededRandom.js";
import { generateMatchEvents } from "./eventGenerator.js";
import { calculateTeamStrength } from "./teamStrength.js";

export interface MatchContext {
  weather?: "CLEAR" | "RAIN" | "SNOW" | "WIND";
  homeAdvantage?: number;
  homeFatigue?: number;
  awayFatigue?: number;
  homeMorale?: number;
  awayMorale?: number;
}

export interface SimulateMatchInput {
  fixture?: Fixture;
  home: Club;
  away: Club;
  homeLineup: Lineup;
  awayLineup: Lineup;
  rulePack: CompetitionRulePack;
  seed: string;
  context?: MatchContext;
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function round2(value: number): number {
  return Math.round(value * 100) / 100;
}

function samplePoisson(lambda: number, rng: SeededRandom): number {
  const threshold = Math.exp(-lambda);
  let product = 1;
  let goals = 0;

  do {
    goals += 1;
    product *= rng.next();
  } while (product > threshold);

  return Math.max(0, goals - 1);
}

function weatherXgMultiplier(weather: MatchContext["weather"]): number {
  switch (weather) {
    case "RAIN":
      return 0.94;
    case "SNOW":
      return 0.88;
    case "WIND":
      return 0.92;
    default:
      return 1;
  }
}

export function simulateMatch(input: SimulateMatchInput): MatchResult {
  const rng = new SeededRandom(input.seed);
  const homeStrength = calculateTeamStrength(input.homeLineup, input.home.strengthBias ?? 0);
  const awayStrength = calculateTeamStrength(input.awayLineup, input.away.strengthBias ?? 0);
  const context = input.context ?? {};
  const homeAdvantage = context.homeAdvantage ?? 4.5;
  const homeFatigue = context.homeFatigue ?? 0;
  const awayFatigue = context.awayFatigue ?? 0;
  const homeMorale = context.homeMorale ?? 0;
  const awayMorale = context.awayMorale ?? 0;
  const weatherMultiplier = weatherXgMultiplier(context.weather);

  const homeEdge =
    homeStrength.attack * 0.34 +
    homeStrength.chanceCreation * 0.3 +
    homeStrength.midfield * 0.18 +
    homeStrength.setPieceThreat * 0.08 +
    homeStrength.pressing * 0.1 -
    awayStrength.defense * 0.42 -
    awayStrength.goalkeeper * 0.1 +
    homeAdvantage +
    homeMorale -
    homeFatigue;
  const awayEdge =
    awayStrength.attack * 0.34 +
    awayStrength.chanceCreation * 0.3 +
    awayStrength.midfield * 0.18 +
    awayStrength.setPieceThreat * 0.08 +
    awayStrength.pressing * 0.1 -
    homeStrength.defense * 0.42 -
    homeStrength.goalkeeper * 0.1 +
    awayMorale -
    awayFatigue;

  const homeXg = clamp((1.2 + homeEdge / 35) * weatherMultiplier, 0.15, 4.8);
  const awayXg = clamp((1.05 + awayEdge / 35) * weatherMultiplier, 0.15, 4.8);
  const homeGoals = samplePoisson(homeXg, rng);
  const awayGoals = samplePoisson(awayXg, rng);
  const homeShots = Math.max(homeGoals, Math.round(homeXg * rng.nextFloat(5.2, 7.5)));
  const awayShots = Math.max(awayGoals, Math.round(awayXg * rng.nextFloat(5.2, 7.5)));
  const homeShotsOnTarget = clamp(Math.round(homeShots * rng.nextFloat(0.32, 0.48)), homeGoals, homeShots);
  const awayShotsOnTarget = clamp(Math.round(awayShots * rng.nextFloat(0.32, 0.48)), awayGoals, awayShots);
  const possessionBase = 50 + (homeStrength.midfield - awayStrength.midfield) * 0.32 + homeAdvantage * 0.25;
  const homePossession = Math.round(clamp(possessionBase + rng.nextFloat(-4, 4), 35, 65));
  const awayPossession = 100 - homePossession;
  const homeCards = rng.nextInt(0, homeStrength.pressing > 75 ? 4 : 3);
  const awayCards = rng.nextInt(0, awayStrength.pressing > 75 ? 4 : 3);
  const homeInjuries = rng.chance(0.08 + homeFatigue / 180) ? 1 : 0;
  const awayInjuries = rng.chance(0.08 + awayFatigue / 180) ? 1 : 0;
  const events = generateMatchEvents({
    home: input.home,
    away: input.away,
    homeGoals,
    awayGoals,
    homeShots,
    awayShots,
    homeCards,
    awayCards,
    homeInjuries,
    awayInjuries,
    rng
  });

  return {
    fixtureId: input.fixture?.id ?? `${input.rulePack.id}:${input.home.id}:${input.away.id}`,
    homeClubId: input.home.id,
    awayClubId: input.away.id,
    homeGoals,
    awayGoals,
    homeXg: round2(homeXg),
    awayXg: round2(awayXg),
    homeShots,
    awayShots,
    homeShotsOnTarget,
    awayShotsOnTarget,
    homePossession,
    awayPossession,
    homeCards,
    awayCards,
    homeInjuries,
    awayInjuries,
    events,
    seed: input.seed
  };
}
