export type Division = "K_LEAGUE_1" | "K_LEAGUE_2" | "K3";

export interface Club {
  id: string;
  name: string;
  division: Division;
  isGimcheonSangmu?: boolean;
  isMilitaryTeam?: boolean;
  strengthBias?: number;
}
