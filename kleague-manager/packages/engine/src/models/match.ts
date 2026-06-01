import type { Club } from "./club.js";

export type MatchEventType = "GOAL" | "SHOT" | "YELLOW_CARD" | "RED_CARD" | "INJURY";

export interface Fixture {
  id: string;
  competitionId: string;
  season: number;
  round: number;
  homeClub: Club;
  awayClub: Club;
  leg?: number;
  phase?: "REGULAR" | "FINAL_A" | "FINAL_B" | "PLAYOFF";
}

export interface MatchEvent {
  minute: number;
  type: MatchEventType;
  clubId: string;
  playerId?: string;
  description: string;
}

export interface MatchResult {
  fixtureId: string;
  homeClubId: string;
  awayClubId: string;
  homeGoals: number;
  awayGoals: number;
  homeXg: number;
  awayXg: number;
  homeShots: number;
  awayShots: number;
  homeShotsOnTarget: number;
  awayShotsOnTarget: number;
  homePossession: number;
  awayPossession: number;
  homeCards: number;
  awayCards: number;
  homeInjuries: number;
  awayInjuries: number;
  events: MatchEvent[];
  seed: string;
}
