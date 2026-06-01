import type { Club } from "../models/club.js";
import type { Fixture } from "../models/match.js";
import type { StandingRow } from "../models/season.js";
import { SeededRandom } from "../random/seededRandom.js";
import type { KLeague2027Config } from "../rules/rulePack.js";
import { UnconfirmedRuleError } from "../rules/rulePack.js";

type ClubOrBye = Club | null;

function assertTeamCount(clubs: Club[], expected: number, label: string): void {
  if (clubs.length !== expected) {
    throw new Error(`${label} requires ${expected} clubs; received ${clubs.length}.`);
  }
}

function rotateRoundRobinTeams(teams: ClubOrBye[]): ClubOrBye[] {
  const [fixed, ...rest] = teams;
  const last = rest[rest.length - 1];
  const middle = rest.slice(0, -1);
  return [fixed as ClubOrBye, last as ClubOrBye, ...middle];
}

function scheduleId(competitionId: string, season: number, round: number, home: Club, away: Club, leg: number): string {
  return `${competitionId}:${season}:R${round}:L${leg}:${home.id}-${away.id}`;
}

export function generateRoundRobinSchedule(
  clubs: Club[],
  legs: number,
  seed = "round-robin",
  competitionId = "ROUND_ROBIN",
  season = 0
): Fixture[] {
  if (clubs.length < 2) {
    throw new Error("Round-robin schedule requires at least two clubs.");
  }

  const rng = new SeededRandom(seed);
  const shuffled = rng.shuffle(clubs);
  const teams: ClubOrBye[] = shuffled.length % 2 === 0 ? shuffled : [...shuffled, null];
  const baseRoundCount = teams.length - 1;
  const fixtures: Fixture[] = [];

  for (let leg = 1; leg <= legs; leg += 1) {
    let rotating = [...teams];

    for (let roundIndex = 0; roundIndex < baseRoundCount; roundIndex += 1) {
      const round = (leg - 1) * baseRoundCount + roundIndex + 1;

      for (let pairIndex = 0; pairIndex < rotating.length / 2; pairIndex += 1) {
        const left = rotating[pairIndex];
        const right = rotating[rotating.length - 1 - pairIndex];

        if (left && right) {
          const baseFlip = (roundIndex + pairIndex) % 2 === 0;
          const legFlip = leg % 2 === 0;
          const home = baseFlip !== legFlip ? right : left;
          const away = baseFlip !== legFlip ? left : right;

          fixtures.push({
            id: scheduleId(competitionId, season, round, home, away, leg),
            competitionId,
            season,
            round,
            homeClub: home,
            awayClub: away,
            leg,
            phase: "REGULAR"
          });
        }
      }

      rotating = rotateRoundRobinTeams(rotating);
    }
  }

  return fixtures;
}

export function generateKLeague1_2026RegularSchedule(clubs: Club[]): Fixture[] {
  assertTeamCount(clubs, 12, "K League 1 2026 regular schedule");
  return generateRoundRobinSchedule(clubs, 3, "K_LEAGUE_1_2026", "K_LEAGUE_1_2026", 2026);
}

export function generateKLeague1_2026SplitSchedule(standingsAfter33: StandingRow[], regularFixtures: Fixture[]): Fixture[] {
  const ordered = [...standingsAfter33].sort((a, b) => (a.position ?? 0) - (b.position ?? 0));
  const finalA = ordered.slice(0, 6).map((row) => row.club);
  const finalB = ordered.slice(6, 12).map((row) => row.club);
  const maxRound = regularFixtures.reduce((highest, fixture) => Math.max(highest, fixture.round), 0);
  const finalAFixtures = generateRoundRobinSchedule(finalA, 1, "K_LEAGUE_1_2026_FINAL_A", "K_LEAGUE_1_2026", 2026).map(
    (fixture) => ({
      ...fixture,
      id: fixture.id.replace(":REGULAR:", ":FINAL_A:"),
      round: maxRound + fixture.round,
      phase: "FINAL_A" as const
    })
  );
  const finalBFixtures = generateRoundRobinSchedule(finalB, 1, "K_LEAGUE_1_2026_FINAL_B", "K_LEAGUE_1_2026", 2026).map(
    (fixture) => ({
      ...fixture,
      id: fixture.id.replace(":REGULAR:", ":FINAL_B:"),
      round: maxRound + fixture.round,
      phase: "FINAL_B" as const
    })
  );

  return [...finalAFixtures, ...finalBFixtures];
}

export function generateKLeague2_2026Schedule(clubs: Club[]): Fixture[] {
  assertTeamCount(clubs, 17, "K League 2 2026 schedule");
  return generateRoundRobinSchedule(clubs, 2, "K_LEAGUE_2_2026", "K_LEAGUE_2_2026", 2026);
}

export function generateKLeague1_2027Schedule(clubs: Club[]): Fixture[] {
  assertTeamCount(clubs, 14, "K League 1 2027 schedule");
  return generateRoundRobinSchedule(clubs, 3, "K_LEAGUE_1_2027", "K_LEAGUE_1_2027", 2027);
}

export function generateKLeague2_2027Schedule(clubs: Club[], config?: KLeague2027Config): Fixture[] {
  if (config?.kLeague2TeamCount === undefined || config.kLeague2RoundRobinLegs === undefined) {
    throw new UnconfirmedRuleError(
      "Cannot create a 2027 K League 2 schedule without explicit KLeague2027Config.kLeague2TeamCount and kLeague2RoundRobinLegs because the final format is unconfirmed."
    );
  }

  assertTeamCount(clubs, config.kLeague2TeamCount, "K League 2 2027 schedule");
  return generateRoundRobinSchedule(
    clubs,
    config.kLeague2RoundRobinLegs,
    `K_LEAGUE_2_2027:${config.kLeague2TeamCount}:${config.kLeague2RoundRobinLegs}`,
    "K_LEAGUE_2_2027",
    2027
  );
}
