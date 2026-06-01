import { describe, expect, it } from "vitest";
import {
  UnconfirmedRuleError,
  generateKLeague1_2026RegularSchedule,
  generateKLeague1_2026SplitSchedule,
  generateKLeague1_2027Schedule,
  generateKLeague2_2026Schedule,
  generateKLeague2_2027Schedule
} from "../src/index.js";
import { fakeClubs, standingRows } from "./testData.js";

function matchCountsByClub(fixtures: ReturnType<typeof generateKLeague1_2026RegularSchedule>): Map<string, number> {
  const counts = new Map<string, number>();

  for (const fixture of fixtures) {
    counts.set(fixture.homeClub.id, (counts.get(fixture.homeClub.id) ?? 0) + 1);
    counts.set(fixture.awayClub.id, (counts.get(fixture.awayClub.id) ?? 0) + 1);
  }

  return counts;
}

describe("scheduler", () => {
  it("creates the K League 1 2026 regular schedule", () => {
    const clubs = fakeClubs(12, "K_LEAGUE_1");
    const fixtures = generateKLeague1_2026RegularSchedule(clubs);
    const counts = matchCountsByClub(fixtures);

    expect(fixtures).toHaveLength(198);
    expect(new Set(fixtures.map((fixture) => fixture.round)).size).toBe(33);
    expect([...counts.values()]).toEqual(Array(12).fill(33));
  });

  it("creates the K League 1 2026 split schedule with isolated final groups", () => {
    const clubs = fakeClubs(12, "K_LEAGUE_1");
    const regularFixtures = generateKLeague1_2026RegularSchedule(clubs);
    const splitFixtures = generateKLeague1_2026SplitSchedule(standingRows(clubs), regularFixtures);
    const counts = matchCountsByClub(splitFixtures);

    expect(splitFixtures).toHaveLength(30);
    expect([...counts.values()]).toEqual(Array(12).fill(5));
    expect(splitFixtures.every((fixture) => fixture.phase === "FINAL_A" || fixture.phase === "FINAL_B")).toBe(true);
  });

  it("creates the K League 2 2026 odd-team schedule with byes", () => {
    const fixtures = generateKLeague2_2026Schedule(fakeClubs(17, "K_LEAGUE_2"));
    const counts = matchCountsByClub(fixtures);

    expect(fixtures).toHaveLength(272);
    expect(new Set(fixtures.map((fixture) => fixture.round)).size).toBe(34);
    expect([...counts.values()]).toEqual(Array(17).fill(32));
  });

  it("creates the fixed K League 1 2027 schedule", () => {
    const fixtures = generateKLeague1_2027Schedule(fakeClubs(14, "K_LEAGUE_1"));
    const counts = matchCountsByClub(fixtures);

    expect(fixtures).toHaveLength(273);
    expect(new Set(fixtures.map((fixture) => fixture.round)).size).toBe(39);
    expect([...counts.values()]).toEqual(Array(14).fill(39));
  });

  it("refuses to create an unconfigured K League 2 2027 schedule", () => {
    expect(() => generateKLeague2_2027Schedule(fakeClubs(16, "K_LEAGUE_2"))).toThrow(UnconfirmedRuleError);
  });
});
