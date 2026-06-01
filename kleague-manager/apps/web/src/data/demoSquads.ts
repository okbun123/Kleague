import {
  createKLeague2026RulePack,
  type Club,
  type CompetitionRulePack,
  type Lineup,
  type LineupValidationResult,
  type Player,
  validateLineup
} from "@kleague-manager/engine";
import { buildDemoLineup, createDemoSquad, tacticOptions } from "./demoPlayers";

export interface DemoLineupScenario {
  id: string;
  title: string;
  rulePack: CompetitionRulePack;
  lineup: Lineup;
  registeredPlayers: Player[];
  u22SubstituteAppearances?: number;
  expected: string;
}

const rules2026 = createKLeague2026RulePack();
const kLeague1Rules = rules2026.competitions.kLeague1;
const kLeague2Rules = rules2026.competitions.kLeague2;

function scenario(
  id: string,
  title: string,
  rulePack: CompetitionRulePack,
  lineupOptions: Parameters<typeof buildDemoLineup>[0],
  expected: string,
  u22SubstituteAppearances?: number
): DemoLineupScenario {
  const { lineup, registeredPlayers } = buildDemoLineup(lineupOptions);
  return {
    id,
    title,
    rulePack,
    lineup,
    registeredPlayers,
    expected,
    ...(u22SubstituteAppearances !== undefined ? { u22SubstituteAppearances } : {})
  };
}

export const lineupScenarios: DemoLineupScenario[] = [
  scenario(
    "k1-valid-20",
    "Valid K League 1 2026 20-player squad",
    kLeague1Rules,
    { prefix: "k1_valid", totalPlayers: 20, u22Count: 2, u22StarterCount: 2, foreignCount: 5, substituteGoalkeepers: 1 },
    "Valid with 2 domestic U22 players and 5 foreign players."
  ),
  scenario(
    "k1-invalid-foreign",
    "Invalid K League 1 2026: 6 foreign players",
    kLeague1Rules,
    { prefix: "k1_foreign", totalPlayers: 20, u22Count: 2, u22StarterCount: 2, foreignCount: 6, substituteGoalkeepers: 1 },
    "Invalid because K League 1 allows at most 5 foreign players in the match squad."
  ),
  scenario(
    "invalid-no-sub-gk",
    "Invalid squad: no substitute goalkeeper",
    kLeague1Rules,
    { prefix: "no_sub_gk", totalPlayers: 20, u22Count: 2, u22StarterCount: 2, foreignCount: 3, substituteGoalkeepers: 0 },
    "Invalid because every match squad needs a substitute goalkeeper."
  ),
  scenario(
    "k1-one-u22",
    "K League 1 U22 case: 1 U22 caps squad at 19",
    kLeague1Rules,
    { prefix: "k1_one_u22", totalPlayers: 20, u22Count: 1, u22StarterCount: 1, foreignCount: 4, substituteGoalkeepers: 1 },
    "Invalid at 20 players because only one domestic U22 makes the effective max 19."
  ),
  scenario(
    "k1-zero-u22",
    "K League 1 U22 case: 0 U22 caps squad at 18",
    kLeague1Rules,
    { prefix: "k1_zero_u22", totalPlayers: 19, u22Count: 0, u22StarterCount: 0, foreignCount: 4, substituteGoalkeepers: 1 },
    "Invalid at 19 players because no domestic U22 makes the effective max 18."
  ),
  scenario(
    "k2-valid-20",
    "Valid K League 2 2026 20-player squad",
    kLeague2Rules,
    { prefix: "k2_valid", totalPlayers: 20, u22Count: 2, u22StarterCount: 2, foreignCount: 4, substituteGoalkeepers: 1 },
    "Valid with 2 domestic U22 players and 4 foreign players."
  ),
  scenario(
    "k2-invalid-foreign",
    "Invalid K League 2 2026: 5 foreign players",
    kLeague2Rules,
    { prefix: "k2_foreign", totalPlayers: 20, u22Count: 2, u22StarterCount: 2, foreignCount: 5, substituteGoalkeepers: 1 },
    "Invalid because K League 2 allows at most 4 foreign players in the match squad."
  ),
  scenario(
    "k2-subs-two-starters",
    "K League 2 substitutions: 2 U22 starters",
    kLeague2Rules,
    { prefix: "k2_subs_two", totalPlayers: 20, u22Count: 2, u22StarterCount: 2, foreignCount: 3, substituteGoalkeepers: 1 },
    "Two U22 starters allow 5 substitutions.",
    0
  ),
  scenario(
    "k2-subs-one-starter-no-sub",
    "K League 2 substitutions: 1 U22 starter, no U22 sub appearance",
    kLeague2Rules,
    { prefix: "k2_subs_one", totalPlayers: 20, u22Count: 2, u22StarterCount: 1, foreignCount: 3, substituteGoalkeepers: 1 },
    "One U22 starter without a U22 substitute appearance allows 4 substitutions.",
    0
  ),
  scenario(
    "k2-subs-one-starter-one-sub",
    "K League 2 substitutions: 1 U22 starter, 1 U22 sub appearance",
    kLeague2Rules,
    { prefix: "k2_subs_one_plus", totalPlayers: 20, u22Count: 2, u22StarterCount: 1, foreignCount: 3, substituteGoalkeepers: 1 },
    "One U22 starter plus a U22 substitute appearance allows 5 substitutions.",
    1
  ),
  scenario(
    "k2-subs-zero-starters-one-sub",
    "K League 2 substitutions: 0 U22 starters, 1 U22 sub appearance",
    kLeague2Rules,
    { prefix: "k2_subs_zero_one", totalPlayers: 20, u22Count: 2, u22StarterCount: 0, foreignCount: 3, substituteGoalkeepers: 1 },
    "No U22 starter and only one U22 substitute appearance allows 3 substitutions.",
    1
  ),
  scenario(
    "k2-subs-zero-starters-two-subs",
    "K League 2 substitutions: 0 U22 starters, 2 U22 sub appearances",
    kLeague2Rules,
    { prefix: "k2_subs_zero_two", totalPlayers: 20, u22Count: 2, u22StarterCount: 0, foreignCount: 3, substituteGoalkeepers: 1 },
    "No U22 starter and two U22 substitute appearances allow 4 substitutions.",
    2
  )
];

export function validateDemoScenario(scenarioToValidate: DemoLineupScenario): LineupValidationResult {
  return validateLineup({
    lineup: scenarioToValidate.lineup,
    rulePack: scenarioToValidate.rulePack,
    registeredPlayers: scenarioToValidate.registeredPlayers,
    ...(scenarioToValidate.u22SubstituteAppearances !== undefined
      ? { u22SubstituteAppearances: scenarioToValidate.u22SubstituteAppearances }
      : {})
  });
}

export function createClubLineup(club: Club, tactic = tacticOptions.balanced): Lineup {
  const rating = Math.round(62 + (club.strengthBias ?? 0));
  return buildDemoLineup({
    prefix: club.id,
    totalPlayers: 20,
    u22Count: 3,
    u22StarterCount: 2,
    foreignCount: club.division === "K_LEAGUE_2" ? 4 : 5,
    substituteGoalkeepers: 1,
    rating,
    tactic
  }).lineup;
}

export function createSquadsByClub(clubs: Club[]): Record<string, Player[]> {
  return Object.fromEntries(clubs.map((club) => [club.id, createDemoSquad(club.id, Math.round(62 + (club.strengthBias ?? 0)))]));
}
