import type { Club } from "../models/club.js";
import type { CompetitionRulePack } from "../models/competition.js";
import type { Lineup } from "../models/lineup.js";
import type { Fixture, MatchResult } from "../models/match.js";
import type { StandingRow } from "../models/season.js";
import { simulateMatch } from "../simulation/matchSimulator.js";
import { applyMatchResultToStandings, createInitialStandings, sortStandings } from "./standings.js";

export type LineupProvider = (club: Club, fixture: Fixture) => Lineup;

export interface RunFixtureInput {
  fixture: Fixture;
  rulePack: CompetitionRulePack;
  homeLineup: Lineup;
  awayLineup: Lineup;
  seed: string;
}

export function runFixture(input: RunFixtureInput): MatchResult {
  return simulateMatch({
    fixture: input.fixture,
    home: input.fixture.homeClub,
    away: input.fixture.awayClub,
    homeLineup: input.homeLineup,
    awayLineup: input.awayLineup,
    rulePack: input.rulePack,
    seed: input.seed
  });
}

export function runRound(
  fixtures: Fixture[],
  standings: StandingRow[],
  rulePack: CompetitionRulePack,
  lineupProvider: LineupProvider,
  seedPrefix: string
): { standings: StandingRow[]; results: MatchResult[] } {
  let nextStandings = standings;
  const results: MatchResult[] = [];

  for (const fixture of fixtures) {
    const result = runFixture({
      fixture,
      rulePack,
      homeLineup: lineupProvider(fixture.homeClub, fixture),
      awayLineup: lineupProvider(fixture.awayClub, fixture),
      seed: `${seedPrefix}:${fixture.id}`
    });
    results.push(result);
    nextStandings = applyMatchResultToStandings(nextStandings, result);
  }

  return {
    standings: sortStandings(nextStandings),
    results
  };
}

export function runSeasonUntilSplit(
  clubs: Club[],
  fixtures: Fixture[],
  rulePack: CompetitionRulePack,
  lineupProvider: LineupProvider,
  splitAfterRound: number,
  seedPrefix = "season"
): { standings: StandingRow[]; results: MatchResult[] } {
  return runSeasonToEnd(
    clubs,
    fixtures.filter((fixture) => fixture.round <= splitAfterRound),
    rulePack,
    lineupProvider,
    seedPrefix
  );
}

export function runSeasonToEnd(
  clubs: Club[],
  fixtures: Fixture[],
  rulePack: CompetitionRulePack,
  lineupProvider: LineupProvider,
  seedPrefix = "season"
): { standings: StandingRow[]; results: MatchResult[] } {
  let standings = createInitialStandings(clubs);
  const results: MatchResult[] = [];
  const rounds = [...new Set(fixtures.map((fixture) => fixture.round))].sort((a, b) => a - b);

  for (const round of rounds) {
    const roundResult = runRound(
      fixtures.filter((fixture) => fixture.round === round),
      standings,
      rulePack,
      lineupProvider,
      `${seedPrefix}:R${round}`
    );
    standings = roundResult.standings;
    results.push(...roundResult.results);
  }

  return {
    standings,
    results
  };
}
