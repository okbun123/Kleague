import type { CompetitionRulePack, LineupRuleConfig, SeasonRulePack } from "../models/competition.js";
import type { KLeague2027Config } from "./rulePack.js";
import { STANDARD_STANDINGS_TIEBREAKERS } from "./rulePack.js";

const tieBreakers = [...STANDARD_STANDINGS_TIEBREAKERS];

function createLineupRules(
  season: number,
  division: "K_LEAGUE_1" | "K_LEAGUE_2",
  maxForeignPlayersInMatchSquad: number,
  kLeague2U22SubstitutionPolicy = false
): LineupRuleConfig {
  return {
    season,
    division,
    maxSquadSize: 20,
    requiredSubstituteGoalkeepers: 1,
    maxForeignPlayersInMatchSquad,
    u22CutoffDate: `${season - 22}-01-01`,
    maxSubstitutions: 5,
    maxSubstitutionWindows: 3,
    substitutionWindowsIncludeHalftime: true,
    kLeague2U22SubstitutionPolicy
  };
}

export function createKLeague2026RulePack(): SeasonRulePack {
  const kLeague1: CompetitionRulePack = {
    id: "K_LEAGUE_1_2026",
    season: 2026,
    division: "K_LEAGUE_1",
    name: "K League 1 2026",
    teamCount: 12,
    regularRoundRobin: {
      legs: 3,
      rounds: 33,
      matchesPerClub: 33
    },
    split: {
      afterRound: 33,
      groupSize: 6,
      legs: 1
    },
    standingsTiebreakers: tieBreakers,
    lineupRules: createLineupRules(2026, "K_LEAGUE_1", 5)
  };

  const kLeague2: CompetitionRulePack = {
    id: "K_LEAGUE_2_2026",
    season: 2026,
    division: "K_LEAGUE_2",
    name: "K League 2 2026",
    teamCount: 17,
    regularRoundRobin: {
      legs: 2,
      rounds: 34,
      matchesPerClub: 32
    },
    hasPlayoffs: true,
    promotionSlots: 2,
    relegationPlayoffToK3: true,
    standingsTiebreakers: tieBreakers,
    lineupRules: createLineupRules(2026, "K_LEAGUE_2", 4, true)
  };

  return {
    season: 2026,
    competitions: {
      kLeague1,
      kLeague2
    }
  };
}

export function createKLeague2027RulePack(config: KLeague2027Config = {}): SeasonRulePack {
  const kLeague1: CompetitionRulePack = {
    id: "K_LEAGUE_1_2027",
    season: 2027,
    division: "K_LEAGUE_1",
    name: "K League 1 2027",
    teamCount: 14,
    regularRoundRobin: {
      legs: 3,
      rounds: 39,
      matchesPerClub: 39
    },
    standingsTiebreakers: tieBreakers,
    lineupRules: createLineupRules(2027, "K_LEAGUE_1", 5)
  };

  const kLeague2TeamCount = config.kLeague2TeamCount;
  const kLeague2RoundRobinLegs = config.kLeague2RoundRobinLegs;
  const hasExplicitScheduleConfig = kLeague2TeamCount !== undefined && kLeague2RoundRobinLegs !== undefined;

  const kLeague2: CompetitionRulePack = {
    id: "K_LEAGUE_2_2027",
    season: 2027,
    division: "K_LEAGUE_2",
    name: "K League 2 2027",
    standingsTiebreakers: tieBreakers,
    lineupRules: createLineupRules(2027, "K_LEAGUE_2", 4, true),
    ...(kLeague2TeamCount !== undefined ? { teamCount: kLeague2TeamCount } : {}),
    ...(hasExplicitScheduleConfig
      ? {
          unconfirmed: false,
          regularRoundRobin: {
            legs: kLeague2RoundRobinLegs,
            rounds: 0,
            matchesPerClub: 0
          }
        }
      : {
          unconfirmed: true,
          unconfirmedReason:
            "The 2027 K League 2 participant count and competition format are unconfirmed. Provide KLeague2027Config before creating a schedule."
        }),
    ...(config.kLeague2HasPlayoffs !== undefined ? { hasPlayoffs: config.kLeague2HasPlayoffs } : {}),
    ...(config.kLeague2PromotionSlots !== undefined ? { promotionSlots: config.kLeague2PromotionSlots } : {}),
    ...(config.kLeague2RelegationPlayoffToK3 !== undefined
      ? { relegationPlayoffToK3: config.kLeague2RelegationPlayoffToK3 }
      : {}),
    ...(config.additionalKLeague2Clubs !== undefined ? { additionalClubs: config.additionalKLeague2Clubs } : {})
  };

  return {
    season: 2027,
    competitions: {
      kLeague1,
      kLeague2
    }
  };
}
