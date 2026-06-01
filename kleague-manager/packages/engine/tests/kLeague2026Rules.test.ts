import { describe, expect, it } from "vitest";
import { createKLeague2026RulePack } from "../src/index.js";

describe("createKLeague2026RulePack", () => {
  it("defines the K League 1 fixed regular and split format", () => {
    const rulePack = createKLeague2026RulePack().competitions.kLeague1;

    expect(rulePack.teamCount).toBe(12);
    expect(rulePack.regularRoundRobin).toMatchObject({ legs: 3, rounds: 33, matchesPerClub: 33 });
    expect(rulePack.split).toMatchObject({ afterRound: 33, groupSize: 6, legs: 1 });
    expect(rulePack.lineupRules.maxForeignPlayersInMatchSquad).toBe(5);
  });

  it("defines the K League 2 fixed 2026 regular format and playoff flags", () => {
    const rulePack = createKLeague2026RulePack().competitions.kLeague2;

    expect(rulePack.teamCount).toBe(17);
    expect(rulePack.regularRoundRobin).toMatchObject({ legs: 2, rounds: 34, matchesPerClub: 32 });
    expect(rulePack.hasPlayoffs).toBe(true);
    expect(rulePack.promotionSlots).toBe(2);
    expect(rulePack.lineupRules.maxForeignPlayersInMatchSquad).toBe(4);
  });
});
