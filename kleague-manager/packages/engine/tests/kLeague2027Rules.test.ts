import { describe, expect, it } from "vitest";
import {
  UnconfirmedRuleError,
  createKLeague2027RulePack,
  generateKLeague1_2027Schedule,
  generateKLeague2_2027Schedule
} from "../src/index.js";
import { fakeClubs } from "./testData.js";

describe("createKLeague2027RulePack", () => {
  it("keeps K League 1 fixed at 14 teams and 39 matches per club", () => {
    const rulePack = createKLeague2027RulePack();
    const kLeague1 = rulePack.competitions.kLeague1;
    const fixtures = generateKLeague1_2027Schedule(fakeClubs(14, "K_LEAGUE_1"));

    expect(kLeague1.teamCount).toBe(14);
    expect(kLeague1.regularRoundRobin).toMatchObject({ legs: 3, rounds: 39, matchesPerClub: 39 });
    expect(fixtures).toHaveLength(273);
  });

  it("marks K League 2 as unconfirmed without explicit format config", () => {
    const kLeague2 = createKLeague2027RulePack().competitions.kLeague2;

    expect(kLeague2.unconfirmed).toBe(true);
    expect(kLeague2.teamCount).toBeUndefined();
    expect(kLeague2.regularRoundRobin).toBeUndefined();
    expect(() => generateKLeague2_2027Schedule(fakeClubs(16, "K_LEAGUE_2"))).toThrow(UnconfirmedRuleError);
  });

  it("uses explicit K League 2 config without hardcoding a final format", () => {
    const config = {
      kLeague2TeamCount: 16,
      kLeague2RoundRobinLegs: 2,
      kLeague2HasPlayoffs: true,
      kLeague2PromotionSlots: 2,
      kLeague2RelegationPlayoffToK3: true
    };
    const kLeague2 = createKLeague2027RulePack(config).competitions.kLeague2;
    const fixtures = generateKLeague2_2027Schedule(fakeClubs(16, "K_LEAGUE_2"), config);

    expect(kLeague2.unconfirmed).toBe(false);
    expect(kLeague2.teamCount).toBe(16);
    expect(kLeague2.regularRoundRobin?.legs).toBe(2);
    expect(fixtures).toHaveLength(240);
  });
});
