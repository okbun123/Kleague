import { describe, expect, it } from "vitest";
import { sortStandings, type StandingRow } from "../src/index.js";
import { fakeClub } from "./testData.js";

function row(id: string, overrides: Partial<StandingRow>): StandingRow {
  const goalsFor = overrides.goalsFor ?? 0;
  const goalsAgainst = overrides.goalsAgainst ?? 0;

  return {
    club: fakeClub(Number(id), "K_LEAGUE_1", { id }),
    played: 0,
    wins: 0,
    draws: 0,
    losses: 0,
    goalsFor,
    goalsAgainst,
    goalDifference: goalsFor - goalsAgainst,
    points: 0,
    penaltyPoints: 0,
    ...overrides
  };
}

describe("sortStandings", () => {
  it("sorts by points first", () => {
    expect(sortStandings([row("1", { points: 10 }), row("2", { points: 11 })])[0]!.club.id).toBe("2");
  });

  it("sorts goalsFor before goalDifference", () => {
    const sorted = sortStandings([
      row("1", { points: 10, goalsFor: 12, goalsAgainst: 10, wins: 1 }),
      row("2", { points: 10, goalsFor: 11, goalsAgainst: 0, wins: 9 })
    ]);

    expect(sorted[0]!.club.id).toBe("1");
  });

  it("sorts goalDifference before wins", () => {
    const sorted = sortStandings([
      row("1", { points: 10, goalsFor: 10, goalsAgainst: 4, wins: 1 }),
      row("2", { points: 10, goalsFor: 10, goalsAgainst: 6, wins: 9 })
    ]);

    expect(sorted[0]!.club.id).toBe("1");
  });

  it("uses lower penalty points after football tiebreakers", () => {
    const sorted = sortStandings([
      row("1", { points: 10, goalsFor: 10, goalsAgainst: 4, wins: 3, penaltyPoints: 5 }),
      row("2", { points: 10, goalsFor: 10, goalsAgainst: 4, wins: 3, penaltyPoints: 1 })
    ]);

    expect(sorted[0]!.club.id).toBe("2");
  });

  it("prevents Final B teams from ranking above Final A teams after the split", () => {
    const sorted = sortStandings([
      row("A", { points: 50, splitGroup: "FINAL_A" }),
      row("B", { points: 80, splitGroup: "FINAL_B" })
    ]);

    expect(sorted[0]!.splitGroup).toBe("FINAL_A");
    expect(sorted[0]!.position).toBe(1);
    expect(sorted[1]!.position).toBe(2);
  });
});
