import { describe, expect, it } from "vitest";
import { SeededRandom, createKLeague2026RulePack, simulateMatch } from "../src/index.js";
import { buildLineup, fakeClub } from "./testData.js";

describe("SeededRandom", () => {
  it("is reproducible for the same seed", () => {
    const first = new SeededRandom("same-seed");
    const second = new SeededRandom("same-seed");

    expect(Array.from({ length: 8 }, () => first.next())).toEqual(Array.from({ length: 8 }, () => second.next()));
  });
});

describe("simulateMatch", () => {
  const rulePack = createKLeague2026RulePack().competitions.kLeague1;

  it("returns the same result for the same input and seed", () => {
    const home = fakeClub(1, "K_LEAGUE_1");
    const away = fakeClub(2, "K_LEAGUE_1");
    const homeLineup = buildLineup({ prefix: "HOME", totalPlayers: 20, u22Count: 2, rating: 65 }).lineup;
    const awayLineup = buildLineup({ prefix: "AWAY", totalPlayers: 20, u22Count: 2, rating: 65 }).lineup;
    const input = {
      home,
      away,
      homeLineup,
      awayLineup,
      rulePack,
      seed: "fixed-match"
    };

    expect(simulateMatch(input)).toEqual(simulateMatch(input));
  });

  it("gives a stronger team a better win rate over many seeded simulations", () => {
    const strong = fakeClub(1, "K_LEAGUE_1", { strengthBias: 8 });
    const weak = fakeClub(2, "K_LEAGUE_1", { strengthBias: -8 });
    const strongLineup = buildLineup({ prefix: "STRONG", totalPlayers: 20, u22Count: 2, rating: 84 }).lineup;
    const weakLineup = buildLineup({ prefix: "WEAK", totalPlayers: 20, u22Count: 2, rating: 44 }).lineup;
    let strongWins = 0;
    let weakWins = 0;

    for (let index = 0; index < 160; index += 1) {
      const result = simulateMatch({
        home: strong,
        away: weak,
        homeLineup: strongLineup,
        awayLineup: weakLineup,
        rulePack,
        seed: `strength-${index}`
      });

      if (result.homeGoals > result.awayGoals) {
        strongWins += 1;
      } else if (result.awayGoals > result.homeGoals) {
        weakWins += 1;
      }
    }

    expect(strongWins).toBeGreaterThan(weakWins * 2);
  });
});
