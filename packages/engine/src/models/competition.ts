import type { Club, Division } from "./club.js";

export type StandingsTiebreaker =
  | "points"
  | "goalsFor"
  | "goalDifference"
  | "wins"
  | "headToHead"
  | "penaltyPoints"
  | "drawLots";

export interface RoundRobinFormat {
  legs: number;
  rounds: number;
  matchesPerClub: number;
}

export interface SplitFormat {
  afterRound: number;
  groupSize: number;
  legs: number;
}

export interface LineupRuleConfig {
  season: number;
  division: Division;
  maxSquadSize: number;
  requiredSubstituteGoalkeepers: number;
  maxForeignPlayersInMatchSquad: number;
  u22CutoffDate: string;
  maxSubstitutions: number;
  maxSubstitutionWindows: number;
  substitutionWindowsIncludeHalftime: boolean;
  kLeague2U22SubstitutionPolicy?: boolean;
}

export interface CompetitionRulePack {
  id: string;
  season: number;
  division: Division;
  name: string;
  teamCount?: number;
  regularRoundRobin?: RoundRobinFormat;
  split?: SplitFormat;
  hasPlayoffs?: boolean;
  promotionSlots?: number;
  relegationPlayoffToK3?: boolean;
  additionalClubs?: Club[];
  standingsTiebreakers: StandingsTiebreaker[];
  lineupRules: LineupRuleConfig;
  unconfirmed?: boolean;
  unconfirmedReason?: string;
}

export interface SeasonRulePack {
  season: number;
  competitions: {
    kLeague1: CompetitionRulePack;
    kLeague2: CompetitionRulePack;
  };
}
