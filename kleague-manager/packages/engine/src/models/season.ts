import type { Club } from "./club.js";

export type SplitGroup = "FINAL_A" | "FINAL_B";

export interface StandingRow {
  club: Club;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDifference: number;
  points: number;
  penaltyPoints: number;
  position?: number;
  splitGroup?: SplitGroup;
}

export interface PromotionRelegationOutcome {
  promotedToKLeague1: Club[];
  relegatedToKLeague2: Club[];
  retainedInKLeague1: Club[];
  retainedInKLeague2: Club[];
  promotionRelegationPlayoffScheduled: boolean;
  promotionRelegationPlayoff?: {
    kLeague1Club: Club;
    kLeague2Club: Club;
    winner?: Club;
  };
  kLeague1ParticipantCount2027: number;
}

export interface KLeague2K3TransitionOutcome {
  playoffScheduled: boolean;
  promotedToKLeague2?: Club;
  relegatedToK3?: Club;
  retainedInKLeague2?: Club;
  reason?: string;
}
