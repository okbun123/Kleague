import { describe, expect, it } from "vitest";
import { createKLeague2026RulePack, validateLineup } from "../src/index.js";
import { buildLineup, fakePlayer } from "./testData.js";

const rules2026 = createKLeague2026RulePack();

describe("K League 1 lineup validation", () => {
  const rulePack = rules2026.competitions.kLeague1;

  it("accepts a valid 20-man squad with 2 U22 and at most 5 foreign players", () => {
    const { lineup, registeredPlayers } = buildLineup({
      prefix: "KL1_VALID",
      totalPlayers: 20,
      u22Count: 2,
      foreignCount: 5
    });

    expect(validateLineup({ lineup, registeredPlayers, rulePack })).toMatchObject({
      valid: true,
      effectiveMaxSquadSize: 20,
      foreignCount: 5,
      u22Count: 2
    });
  });

  it("rejects a 20-man squad with only 1 U22, but accepts 19 players", () => {
    const twenty = buildLineup({
      prefix: "KL1_ONE_U22_20",
      totalPlayers: 20,
      u22Count: 1
    });
    const nineteen = buildLineup({
      prefix: "KL1_ONE_U22_19",
      totalPlayers: 19,
      u22Count: 1
    });

    expect(validateLineup({ ...twenty, rulePack }).valid).toBe(false);
    expect(validateLineup({ ...nineteen, rulePack }).valid).toBe(true);
    expect(validateLineup({ ...nineteen, rulePack }).effectiveMaxSquadSize).toBe(19);
  });

  it("rejects a 19-man squad with 0 U22, but accepts 18 players", () => {
    const nineteen = buildLineup({
      prefix: "KL1_ZERO_U22_19",
      totalPlayers: 19,
      u22Count: 0
    });
    const eighteen = buildLineup({
      prefix: "KL1_ZERO_U22_18",
      totalPlayers: 18,
      u22Count: 0
    });

    expect(validateLineup({ ...nineteen, rulePack }).valid).toBe(false);
    expect(validateLineup({ ...eighteen, rulePack }).valid).toBe(true);
    expect(validateLineup({ ...eighteen, rulePack }).effectiveMaxSquadSize).toBe(18);
  });

  it("rejects a squad without a substitute goalkeeper", () => {
    const squad = buildLineup({
      prefix: "KL1_NO_SUB_GK",
      totalPlayers: 20,
      u22Count: 2,
      substituteGoalkeepers: 0
    });

    expect(validateLineup({ ...squad, rulePack }).valid).toBe(false);
    expect(validateLineup({ ...squad, rulePack }).errors.join(" ")).toContain("goalkeeper");
  });

  it("rejects 6 foreign players", () => {
    const squad = buildLineup({
      prefix: "KL1_FOREIGN",
      totalPlayers: 20,
      u22Count: 2,
      foreignCount: 6
    });

    expect(validateLineup({ ...squad, rulePack }).valid).toBe(false);
  });

  it("rejects duplicate and unregistered players", () => {
    const squad = buildLineup({
      prefix: "KL1_DUPLICATE",
      totalPlayers: 20,
      u22Count: 2
    });
    squad.lineup.substitutes[1] = squad.lineup.startingXI[1]!;
    squad.registeredPlayers = squad.registeredPlayers.filter((player) => player.id !== squad.lineup.startingXI[2]!.id);

    const result = validateLineup({ ...squad, rulePack });

    expect(result.valid).toBe(false);
    expect(result.errors.join(" ")).toContain("duplicate");
    expect(result.errors.join(" ")).toContain("unregistered");
  });
});

describe("K League 2 lineup validation", () => {
  const rulePack = rules2026.competitions.kLeague2;

  it("accepts a valid 20-man squad with 2 U22 and at most 4 foreign players", () => {
    const squad = buildLineup({
      prefix: "KL2_VALID",
      totalPlayers: 20,
      u22Count: 2,
      foreignCount: 4
    });

    expect(validateLineup({ ...squad, rulePack })).toMatchObject({
      valid: true,
      effectiveMaxSquadSize: 20,
      foreignCount: 4,
      u22Count: 2
    });
  });

  it("rejects 5 foreign players", () => {
    const squad = buildLineup({
      prefix: "KL2_FOREIGN",
      totalPlayers: 20,
      u22Count: 2,
      foreignCount: 5
    });

    expect(validateLineup({ ...squad, rulePack }).valid).toBe(false);
  });

  it("changes effective squad size by U22 count", () => {
    const twoU22 = buildLineup({ prefix: "KL2_TWO", totalPlayers: 20, u22Count: 2 });
    const oneU22 = buildLineup({ prefix: "KL2_ONE", totalPlayers: 19, u22Count: 1 });
    const zeroU22 = buildLineup({ prefix: "KL2_ZERO", totalPlayers: 18, u22Count: 0 });

    expect(validateLineup({ ...twoU22, rulePack }).effectiveMaxSquadSize).toBe(20);
    expect(validateLineup({ ...oneU22, rulePack }).effectiveMaxSquadSize).toBe(19);
    expect(validateLineup({ ...zeroU22, rulePack }).effectiveMaxSquadSize).toBe(18);
  });

  it("uses U22 starters and substitute appearances for K League 2 substitution limits", () => {
    const squad = buildLineup({
      prefix: "KL2_SUBS",
      totalPlayers: 20,
      u22Count: 2,
      u22StarterCount: 1
    });

    expect(validateLineup({ ...squad, rulePack, u22SubstituteAppearances: 0 }).maxSubstitutions).toBe(4);
    expect(validateLineup({ ...squad, rulePack, u22SubstituteAppearances: 1 }).maxSubstitutions).toBe(5);
  });

  it("counts homegrown U22 as domestic U22", () => {
    const squad = buildLineup({ prefix: "KL2_HOMEGROWN", totalPlayers: 19, u22Count: 1 });
    squad.lineup.startingXI[1] = fakePlayer("HOMEGROWN_FOREIGN_U22", {
      isU22: true,
      foreign: true,
      homegrown: true
    });
    squad.registeredPlayers[1] = squad.lineup.startingXI[1]!;

    expect(validateLineup({ ...squad, rulePack }).u22Count).toBe(1);
  });
});
