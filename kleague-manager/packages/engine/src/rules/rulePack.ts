import type { Club } from "../models/club.js";

export class UnconfirmedRuleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UnconfirmedRuleError";
  }
}

export interface KLeague2027Config {
  kLeague2TeamCount?: number;
  kLeague2RoundRobinLegs?: number;
  kLeague2HasPlayoffs?: boolean;
  kLeague2PromotionSlots?: number;
  kLeague2RelegationPlayoffToK3?: boolean;
  additionalKLeague2Clubs?: Club[];
}

export const STANDARD_STANDINGS_TIEBREAKERS = [
  "points",
  "goalsFor",
  "goalDifference",
  "wins",
  "headToHead",
  "penaltyPoints",
  "drawLots"
] as const;
