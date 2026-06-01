import { describe, expect, it } from "vitest";
import { simulateMatch } from "@kleague-manager/engine";
import { kLeague1_2026Clubs } from "../data/demoClubs";
import { tacticOptions } from "../data/demoPlayers";
import { createClubLineup } from "../data/demoSquads";
import { createSeasonState, resolveRulePackSelection, runSeasonToSplit } from "./demoSeason";

describe("web demo smoke", () => {
  it("surfaces an UnconfirmedRuleError for missing K League 2 2027 config", () => {
    const selection = resolveRulePackSelection("K_LEAGUE_2_2027_CONFIGURABLE", {});
    expect(selection.error?.name).toBe("UnconfirmedRuleError");
    expect(selection.rulePack).toBeUndefined();
  });

  it("accepts explicit K League 2 2027 config", () => {
    const selection = resolveRulePackSelection("K_LEAGUE_2_2027_CONFIGURABLE", {
      teamCount: 16,
      roundRobinLegs: 2,
      hasPlayoffs: true,
      promotionSlots: 2
    });

    expect(selection.error).toBeUndefined();
    expect(selection.rulePack?.teamCount).toBe(16);
    expect(selection.rulePack?.regularRoundRobin?.legs).toBe(2);
  });

  it("generates K League 1 2026 split groups", () => {
    const state = runSeasonToSplit(createSeasonState("K_LEAGUE_1_2026"));

    expect(state.currentRound).toBe(33);
    expect(state.splitGenerated).toBe(true);
    expect(state.ended).toBe(false);
    expect(state.finalAClubIds).toHaveLength(6);
    expect(state.finalBClubIds).toHaveLength(6);
  });

  it("keeps match simulation deterministic for the same seed", () => {
    const home = kLeague1_2026Clubs[0]!;
    const away = kLeague1_2026Clubs[1]!;
    const input = {
      home,
      away,
      homeLineup: createClubLineup(home, tacticOptions.balanced),
      awayLineup: createClubLineup(away, tacticOptions.counter),
      rulePack: resolveRulePackSelection("K_LEAGUE_1_2026").rulePack!,
      seed: "smoke-test-seed"
    };

    expect(simulateMatch(input)).toEqual(simulateMatch(input));
  });
});
