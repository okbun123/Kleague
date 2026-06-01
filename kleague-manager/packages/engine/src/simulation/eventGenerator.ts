import type { Club } from "../models/club.js";
import type { MatchEvent } from "../models/match.js";
import type { SeededRandom } from "../random/seededRandom.js";

export interface GenerateEventsInput {
  home: Club;
  away: Club;
  homeGoals: number;
  awayGoals: number;
  homeShots: number;
  awayShots: number;
  homeCards: number;
  awayCards: number;
  homeInjuries: number;
  awayInjuries: number;
  rng: SeededRandom;
}

function minuteSort(a: MatchEvent, b: MatchEvent): number {
  return a.minute - b.minute;
}

function createEventsForClub(
  club: Club,
  counts: { goals: number; shots: number; cards: number; injuries: number },
  rng: SeededRandom
): MatchEvent[] {
  const events: MatchEvent[] = [];

  for (let index = 0; index < counts.goals; index += 1) {
    events.push({
      minute: rng.nextInt(1, 90),
      type: "GOAL",
      clubId: club.id,
      description: `${club.name} goal`
    });
  }

  for (let index = 0; index < Math.max(0, counts.shots - counts.goals); index += 1) {
    events.push({
      minute: rng.nextInt(1, 90),
      type: "SHOT",
      clubId: club.id,
      description: `${club.name} shot`
    });
  }

  for (let index = 0; index < counts.cards; index += 1) {
    events.push({
      minute: rng.nextInt(1, 90),
      type: rng.chance(0.08) ? "RED_CARD" : "YELLOW_CARD",
      clubId: club.id,
      description: `${club.name} card`
    });
  }

  for (let index = 0; index < counts.injuries; index += 1) {
    events.push({
      minute: rng.nextInt(1, 90),
      type: "INJURY",
      clubId: club.id,
      description: `${club.name} injury`
    });
  }

  return events;
}

export function generateMatchEvents(input: GenerateEventsInput): MatchEvent[] {
  return [
    ...createEventsForClub(
      input.home,
      {
        goals: input.homeGoals,
        shots: input.homeShots,
        cards: input.homeCards,
        injuries: input.homeInjuries
      },
      input.rng
    ),
    ...createEventsForClub(
      input.away,
      {
        goals: input.awayGoals,
        shots: input.awayShots,
        cards: input.awayCards,
        injuries: input.awayInjuries
      },
      input.rng
    )
  ].sort(minuteSort);
}
