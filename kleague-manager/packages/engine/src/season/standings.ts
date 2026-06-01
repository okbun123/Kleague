import type { Club } from "../models/club.js";
import type { MatchResult } from "../models/match.js";
import type { StandingRow } from "../models/season.js";

export function createInitialStandings(clubs: Club[]): StandingRow[] {
  return clubs.map((club, index) => ({
    club,
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    goalDifference: 0,
    points: 0,
    penaltyPoints: 0,
    position: index + 1
  }));
}

function updateRow(row: StandingRow, goalsFor: number, goalsAgainst: number): StandingRow {
  const win = goalsFor > goalsAgainst ? 1 : 0;
  const draw = goalsFor === goalsAgainst ? 1 : 0;
  const loss = goalsFor < goalsAgainst ? 1 : 0;

  return {
    ...row,
    played: row.played + 1,
    wins: row.wins + win,
    draws: row.draws + draw,
    losses: row.losses + loss,
    goalsFor: row.goalsFor + goalsFor,
    goalsAgainst: row.goalsAgainst + goalsAgainst,
    goalDifference: row.goalDifference + goalsFor - goalsAgainst,
    points: row.points + win * 3 + draw
  };
}

export function applyMatchResultToStandings(standings: StandingRow[], result: MatchResult): StandingRow[] {
  return standings.map((row) => {
    if (row.club.id === result.homeClubId) {
      return updateRow(row, result.homeGoals, result.awayGoals);
    }

    if (row.club.id === result.awayClubId) {
      return updateRow(row, result.awayGoals, result.homeGoals);
    }

    return row;
  });
}

function splitPriority(row: StandingRow): number {
  if (row.splitGroup === "FINAL_A") {
    return 0;
  }

  if (row.splitGroup === "FINAL_B") {
    return 1;
  }

  return 0;
}

function compareStandingRows(a: StandingRow, b: StandingRow): number {
  const splitDifference = splitPriority(a) - splitPriority(b);
  if (splitDifference !== 0) {
    return splitDifference;
  }

  return (
    b.points - a.points ||
    b.goalsFor - a.goalsFor ||
    b.goalDifference - a.goalDifference ||
    b.wins - a.wins ||
    a.penaltyPoints - b.penaltyPoints ||
    a.club.id.localeCompare(b.club.id)
  );
}

export function sortStandings(standings: StandingRow[]): StandingRow[] {
  return [...standings].sort(compareStandingRows).map((row, index) => ({
    ...row,
    position: index + 1
  }));
}
